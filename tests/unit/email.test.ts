import { beforeEach, describe, expect, it, vi } from 'vitest';
import emailjs from '@emailjs/browser';
import { buildTemplateParams, emailConfig, submissionErrorMessage, submitApplication } from '../../src/email';

vi.mock('@emailjs/browser', () => ({ default: { send: vi.fn() } }));
const input = { name: 'Ada Okafor', email: 'ada@example.com', store_url: 'https://ada.myshopify.com/' };
const date = new Date('2026-10-22T20:00:00.000Z');

beforeEach(() => {
  vi.mocked(emailjs.send).mockReset();
});

describe('EmailJS integration', () => {
  it('uses the supplied service, template, and public key', () => {
    expect(emailConfig).toEqual({
      serviceId: 'service_bst001', templateId: 'template_o2jsmvp', publicKey: 'DsZtpo1OyFI88CFGz',
    });
  });

  it('builds all documented template fields from the selected catalogue plan', () => {
    expect(buildTemplateParams(input, '5-years', 'BST-TEST', date)).toEqual({
      name: 'Ada Okafor', email: 'ada@example.com', reply_to: 'ada@example.com',
      store_url: 'https://ada.myshopify.com/', plan_name: '5 YEARS PLAN', plan_price: '$350',
      original_price: '$500', discount: '$150', currency: 'USD',
      application_id: 'BST-TEST', submitted_at: '2026-10-22T20:00:00.000Z',
    });
  });

  it('refuses a plan that does not exist', () => {
    expect(() => buildTemplateParams(input, 'not-real', 'BST-TEST', date)).toThrow('Please select');
  });

  it('only resolves success after EmailJS accepts the request', async () => {
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' });
    const receipt = await submitApplication(input, '10-years');
    expect(emailjs.send).toHaveBeenCalledOnce();
    expect(emailjs.send).toHaveBeenCalledWith(
      'service_bst001', 'template_o2jsmvp',
      expect.objectContaining({ name: input.name, plan_name: '10 YEARS PLAN', plan_price: '$500' }),
      { publicKey: 'DsZtpo1OyFI88CFGz' },
    );
    expect(receipt).toMatchObject({ email: input.email, planName: '10 YEARS PLAN', planPrice: '$500' });
    expect(receipt.reference).toMatch(/^BST-[A-F0-9]{12}$/);
  });

  it('does not claim success on a failed delivery', async () => {
    vi.mocked(emailjs.send).mockRejectedValue({ status: 500, text: 'Unavailable' });
    await expect(submitApplication(input, '1-year')).rejects.toMatchObject({ status: 500 });
  });

  it('gives a helpful rate-limit error without exposing raw provider output', () => {
    expect(submissionErrorMessage({ status: 429, text: '<script>untrusted</script>' })).toContain('wait a minute');
    expect(submissionErrorMessage(new Error('secret provider details'))).not.toContain('secret');
    expect(submissionErrorMessage(null)).toContain('Your details are still here');
  });
});
