import emailjs from '@emailjs/browser';
import { formatPrice, getPlan } from './plans';
import type { ApplicationInput } from './validation';

export const emailConfig = Object.freeze({
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_bst001',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_o2jsmvp',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'DsZtpo1OyFI88CFGz',
});

export interface ApplicationReceipt {
  reference: string;
  email: string;
  planName: string;
  planPrice: string;
}

export function buildTemplateParams(
  input: ApplicationInput,
  planId: string,
  reference: string,
  submittedAt: Date,
): Record<string, string> {
  // Intentionally never read the price/name from editable DOM or form data.
  const plan = getPlan(planId);
  if (!plan) throw new Error('Please select one of the available plans.');

  return {
    name: input.name,
    email: input.email,
    reply_to: input.email,
    store_url: input.store_url,
    plan_name: plan.name,
    plan_price: formatPrice(plan.price),
    original_price: formatPrice(plan.originalPrice),
    discount: formatPrice(plan.originalPrice - plan.price),
    currency: 'USD',
    application_id: reference,
    submitted_at: submittedAt.toISOString(),
  };
}

export async function submitApplication(
  input: ApplicationInput,
  planId: string,
): Promise<ApplicationReceipt> {
  const reference = `BST-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const params = buildTemplateParams(input, planId, reference, new Date());

  await emailjs.send(emailConfig.serviceId, emailConfig.templateId, params, {
    publicKey: emailConfig.publicKey,
  });

  return {
    reference,
    email: input.email,
    planName: params.plan_name,
    planPrice: params.plan_price,
  };
}

export function submissionErrorMessage(error: unknown): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Connect to the internet and try again. Your details are still here.';
  }

  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 429) {
    return 'Too many requests. Please wait a minute before trying again. Your details are still here.';
  }

  return 'We couldn’t send your application. Your details are still here — please try again in a moment.';
}
