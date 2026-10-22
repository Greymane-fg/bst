export interface ApplicationInput {
  name: string;
  email: string;
  store_url: string;
}

export type FieldName = keyof ApplicationInput;
export type FieldErrors = Partial<Record<FieldName, string>>;

export type ValidationResult =
  | { valid: true; values: ApplicationInput; errors: FieldErrors }
  | { valid: false; errors: FieldErrors };

/** Accept a public store address with or without https://, never executable URLs. */
export function normalizeStoreUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048 || /\s/.test(trimmed)) return null;

  const withProtocol = trimmed.startsWith('//')
    ? `https:${trimmed}`
    : /^[a-z][a-z\d+.-]*:/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;

    const hostname = url.hostname;
    const labels = hostname.split('.');
    if (
      hostname.length > 253 ||
      labels.length < 2 ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost') ||
      !labels.every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export function validateApplication(input: ApplicationInput): ValidationResult {
  const name = input.name.trim().replace(/\s+/g, ' ');
  const email = input.email.trim();
  const storeUrl = normalizeStoreUrl(input.store_url);
  const errors: FieldErrors = {};

  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length < 2 || name.length > 100 || /[\u0000-\u001F\u007F]/.test(name)) {
    errors.name = 'Please enter a name between 2 and 100 characters.';
  }

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!input.store_url.trim()) {
    errors.store_url = 'Please enter your store URL.';
  } else if (!storeUrl) {
    errors.store_url = 'Enter a valid store URL, like yourstore.com.';
  }

  if (Object.keys(errors).length > 0 || !storeUrl) return { valid: false, errors };

  return { valid: true, values: { name, email, store_url: storeUrl }, errors: {} };
}
