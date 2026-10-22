import { describe, expect, it } from 'vitest';
import { normalizeStoreUrl, validateApplication } from '../../src/validation';

const validInput = { name: 'Ada Okafor', email: 'ada@example.com', store_url: 'https://example.com' };

describe('store URL normalization', () => {
  it.each([
    ['example.com', 'https://example.com/'],
    ['  example.myshopify.com  ', 'https://example.myshopify.com/'],
    ['https://example.com/shop?currency=USD', 'https://example.com/shop?currency=USD'],
    ['http://example.com', 'http://example.com/'],
    ['//example.com', 'https://example.com/'],
    ['https://münchen.de', 'https://xn--mnchen-3ya.de/'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeStoreUrl(input)).toBe(expected);
  });

  it.each([
    '', 'not a store', 'localhost', 'example', 'https://store.local', 'https://foo.localhost',
    'javascript:alert(1)', 'data:text/html,test', 'ftp://example.com',
    'https://user:password@example.com', 'https://example..com', 'https://-example.com',
    'https://', 'https://example.com/with a space', 'x'.repeat(2049),
  ])('rejects unsafe or invalid address %s', (input) => {
    expect(normalizeStoreUrl(input)).toBeNull();
  });
});

describe('application validation', () => {
  it('requires all three contact fields', () => {
    const result = validateApplication({ name: '', email: '', store_url: '' });
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors)).toEqual(['name', 'email', 'store_url']);
  });

  it('trims entries, preserves email case, and supports international names', () => {
    const result = validateApplication({
      name: '  Adé   Okafor  ', email: '  Ade@Example.com ', store_url: 'example.com',
    });
    expect(result).toEqual({
      valid: true,
      values: { name: 'Adé Okafor', email: 'Ade@Example.com', store_url: 'https://example.com/' },
      errors: {},
    });
  });

  it.each(['a', 'x'.repeat(101), 'Ada\u0000Name'])('rejects an invalid name', (name) => {
    expect(validateApplication({ ...validInput, name }).errors.name).toBeTruthy();
  });

  it.each(['hello', 'name@', 'a@@example.com', 'a b@example.com', 'name@example', `${'a'.repeat(250)}@example.com`])('rejects invalid email %s', (email) => {
    expect(validateApplication({ ...validInput, email }).errors.email).toBeTruthy();
  });

  it('normalizes a valid complete application', () => {
    expect(validateApplication(validInput)).toEqual({
      valid: true, values: { ...validInput, store_url: 'https://example.com/' }, errors: {},
    });
  });
});
