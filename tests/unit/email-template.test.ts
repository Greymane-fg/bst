import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTemplateParams } from '../../src/email';

const html = readFileSync(new URL('../../email-template.html', import.meta.url), 'utf8');
const guide = readFileSync(new URL('../../reafme.md', import.meta.url), 'utf8');

describe('requested email template documentation', () => {
  it('keeps the full HTML in reafme.md identical to the standalone template', () => {
    const documentedHtml = guide.split('```html\n')[1]?.split('```')[0];
    expect(documentedHtml).toBe(html);
  });

  it('uses exact variables supplied by the app and includes every requested contact/plan field', () => {
    const params = buildTemplateParams(
      { name: 'Ada Okafor', email: 'ada@example.com', store_url: 'https://example.com/' },
      '1-year', 'BST-TEST', new Date('2026-10-22T20:00:00.000Z'),
    );
    const variables = [...new Set([...html.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]))];
    expect(variables).toEqual(expect.arrayContaining(['name', 'email', 'store_url', 'plan_name', 'plan_price']));
    expect(variables.every((variable) => variable in params)).toBe(true);
    expect(html).not.toContain('{{{');
    expect(html).not.toContain('<script');
  });
});
