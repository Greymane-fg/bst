import './styles.css';
import { plans, getPlan, formatPrice } from './plans';
import { submitApplication, submissionErrorMessage } from './email';
import type { ApplicationReceipt } from './email';
import { validateApplication } from './validation';
import type { ApplicationInput, FieldErrors, FieldName } from './validation';
import { informationPages } from './policies';

function element<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing page element: ${selector}`);
  return found;
}

const planGrid = element<HTMLDivElement>('#plan-grid');
const applicationDialog = element<HTMLDialogElement>('#application-dialog');
const informationDialog = element<HTMLDialogElement>('#information-dialog');
const form = element<HTMLFormElement>('#application-form');
const fields = element<HTMLFieldSetElement>('#application-fields');
const formError = element<HTMLDivElement>('#form-error');
const submitButton = element<HTMLButtonElement>('#submit-application');
const submitLabel = element<HTMLSpanElement>('#submit-label');
const spinner = element<HTMLSpanElement>('.button-spinner');
const submitArrow = element<SVGSVGElement>('.submit-arrow');
const applicationPanel = element<HTMLDivElement>('#application-panel');
const successPanel = element<HTMLElement>('#success-panel');
const notification = element<HTMLDivElement>('#notification');
const inputs: Record<FieldName, HTMLInputElement> = {
  name: element<HTMLInputElement>('#full-name'),
  email: element<HTMLInputElement>('#email'),
  store_url: element<HTMLInputElement>('#store-url'),
};

let selectedPlanId: string | null = null;
let isSubmitting = false;
let hasSucceeded = false;
let notificationTimer: ReturnType<typeof setTimeout> | undefined;
let savedScrollY = 0;
const dialogTriggers = new WeakMap<HTMLDialogElement, HTMLElement>();

const checkIcon = '<svg viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 12 4 4.5L16.5 5" /></svg>';

// Only static, trusted catalogue content is rendered as HTML. User data always uses textContent/value.
planGrid.innerHTML = plans.map((plan) => `
  <article class="plan-card" aria-labelledby="title-${plan.id}">
    <div class="plan-card__topline"><span class="discount">DISCOUNT ${formatPrice(plan.originalPrice - plan.price)}</span></div>
    <h3 id="title-${plan.id}">${plan.name}</h3>
    <div class="plan-card__price">
      <del class="original-price"><span class="sr-only">Original price: </span>${formatPrice(plan.originalPrice)}</del>
      <strong class="current-price"><span class="sr-only">Plan price: </span>${formatPrice(plan.price)}<span class="sr-only"> US dollars</span></strong>
    </div>
    <ul class="features">${plan.features.map((feature) => `<li>${checkIcon}<span>${feature}</span></li>`).join('')}</ul>
    <button type="button" class="primary-button" data-plan="${plan.id}" aria-label="Select ${plan.years}-year plan for ${formatPrice(plan.price)}" aria-haspopup="dialog" aria-controls="application-dialog">SELECT</button>
  </article>
`).join('');

element<HTMLSpanElement>('#year').textContent = String(new Date().getFullYear());

function setStep(current: 1 | 2 | 3): void {
  document.querySelectorAll<HTMLElement>('[data-step]').forEach((step) => {
    const number = Number(step.dataset.step);
    step.classList.toggle('is-current', number === current);
    step.classList.toggle('is-complete', number < current);
    if (number === current) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
}

function dismissNotification(): void {
  clearTimeout(notificationTimer);
  notification.hidden = true;
  notification.textContent = '';
}

function notify(message: string): void {
  dismissNotification();
  notification.textContent = message;
  notification.hidden = false;
  notificationTimer = setTimeout(dismissNotification, 12_000);
}

function showDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) return;
  if (document.activeElement instanceof HTMLElement) {
    dialogTriggers.set(dialog, document.activeElement);
  }

  savedScrollY = window.scrollY;
  // Fixed positioning also prevents background scrolling in mobile Safari.
  Object.assign(document.body.style, {
    position: 'fixed',
    top: `-${savedScrollY}px`,
    left: '0',
    right: '0',
    width: '100%',
  });
  dialog.showModal();
  dialog.querySelector('.dialog__scroll')?.scrollTo(0, 0);
}

for (const dialog of [applicationDialog, informationDialog]) {
  dialog.querySelectorAll<HTMLButtonElement>('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  let pointerStartedOutside = false;
  const isOutside = (x: number, y: number): boolean => {
    const bounds = dialog.getBoundingClientRect();
    return x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom;
  };

  dialog.addEventListener('pointerdown', (event) => {
    pointerStartedOutside = event.target === dialog && isOutside(event.clientX, event.clientY);
  });
  dialog.addEventListener('click', (event) => {
    if (pointerStartedOutside && event.target === dialog && isOutside(event.clientX, event.clientY)) {
      dialog.close();
    }
    pointerStartedOutside = false;
  });

  dialog.addEventListener('close', () => {
    for (const property of ['position', 'top', 'left', 'right', 'width']) {
      document.body.style.removeProperty(property);
    }
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    dialogTriggers.get(dialog)?.focus({ preventScroll: true });

    if (dialog === applicationDialog) {
      if (isSubmitting) notify('Your application is still sending. You can keep browsing.');
      else if (!hasSucceeded) setStep(1);
    }
  });
}

function readInput(): ApplicationInput {
  return {
    name: inputs.name.value,
    email: inputs.email.value,
    store_url: inputs.store_url.value,
  };
}

function setFieldError(field: FieldName, message?: string): void {
  const input = inputs[field];
  const error = element<HTMLParagraphElement>(`#${field}-error`);
  error.textContent = message || '';
  error.hidden = !message;

  const descriptions: string[] = field === 'store_url' ? ['store-url-hint'] : [];
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    descriptions.push(error.id);
  } else {
    input.removeAttribute('aria-invalid');
  }

  if (descriptions.length) input.setAttribute('aria-describedby', descriptions.join(' '));
  else input.removeAttribute('aria-describedby');
}

function clearErrors(): void {
  (Object.keys(inputs) as FieldName[]).forEach((field) => setFieldError(field));
  formError.hidden = true;
  formError.textContent = '';
}

function showError(message: string): void {
  formError.textContent = message;
  formError.hidden = false;
}

function showValidationErrors(errors: FieldErrors): void {
  const names = Object.keys(inputs) as FieldName[];
  names.forEach((field) => setFieldError(field, errors[field]));
  showError('Please check the highlighted fields and try again.');
  const firstInvalid = names.find((field) => errors[field]);
  if (firstInvalid) inputs[firstInvalid].focus();
}

function openApplication(planId: string): void {
  const plan = getPlan(planId);
  if (!plan) return;
  dismissNotification();

  // Reopening during a request shows that request, never silently switches its plan.
  if (!isSubmitting) {
    if (hasSucceeded) form.reset();
    hasSucceeded = false;
    selectedPlanId = plan.id;
    clearErrors();
    successPanel.hidden = true;
    applicationPanel.hidden = false;
    applicationDialog.setAttribute('aria-labelledby', 'application-title');
    applicationDialog.setAttribute('aria-describedby', 'application-description');
    element<HTMLInputElement>('#selected-plan-name').value = plan.name;
    element<HTMLInputElement>('#selected-plan-price').value = formatPrice(plan.price);
    setStep(2);
  }

  showDialog(applicationDialog);
  if (!isSubmitting) inputs.name.focus({ preventScroll: true });
}

planGrid.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-plan]');
  if (button?.dataset.plan) openApplication(button.dataset.plan);
});

(Object.keys(inputs) as FieldName[]).forEach((field) => {
  inputs[field].addEventListener('input', () => {
    if (inputs[field].getAttribute('aria-invalid') === 'true') {
      const result = validateApplication(readInput());
      setFieldError(field, result.errors[field]);
    }
    formError.hidden = true;
  });
});

function setSending(sending: boolean): void {
  isSubmitting = sending;
  fields.disabled = sending;
  submitButton.disabled = sending;
  form.setAttribute('aria-busy', String(sending));
  spinner.hidden = !sending;
  submitArrow.toggleAttribute('hidden', sending);
  submitLabel.textContent = sending ? 'Sending application…' : 'Submit application';
  element<HTMLParagraphElement>('#sending-status').textContent = sending ? 'Sending your application. Please wait.' : '';
}

function showSuccess(receipt: ApplicationReceipt): void {
  hasSucceeded = true;
  element<HTMLElement>('#success-email').textContent = receipt.email;
  element<HTMLElement>('#success-plan').textContent = receipt.planName;
  element<HTMLElement>('#success-price').textContent = receipt.planPrice;
  element<HTMLElement>('#success-reference').textContent = receipt.reference;
  applicationPanel.hidden = true;
  successPanel.hidden = false;
  applicationDialog.setAttribute('aria-labelledby', 'success-title');
  applicationDialog.removeAttribute('aria-describedby');
  setStep(3);

  if (applicationDialog.open) {
    applicationDialog.querySelector('.dialog__scroll')?.scrollTo(0, 0);
    element<HTMLHeadingElement>('#success-title').focus({ preventScroll: true });
  } else {
    notify(`Application sent. Our team will contact ${receipt.email}. Your reference is ${receipt.reference}.`);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isSubmitting || !selectedPlanId) return;

  clearErrors();
  const result = validateApplication(readInput());
  if (!result.valid) {
    showValidationErrors(result.errors);
    return;
  }

  if (element<HTMLInputElement>('#company-website').value.trim()) {
    showError('We couldn’t submit this application. Please refresh the page and try again.');
    return;
  }

  if (!navigator.onLine) {
    showError(submissionErrorMessage(new Error('Offline')));
    return;
  }

  inputs.name.value = result.values.name;
  inputs.email.value = result.values.email;
  inputs.store_url.value = result.values.store_url;
  const requestPlanId = selectedPlanId;
  setSending(true);

  try {
    const receipt = await submitApplication(result.values, requestPlanId);
    dismissNotification();
    showSuccess(receipt);
  } catch (error: unknown) {
    const message = submissionErrorMessage(error);
    showError(message);
    if (!applicationDialog.open) {
      setStep(1);
      notify(message);
    }
  } finally {
    setSending(false);
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-information]').forEach((button) => {
  button.addEventListener('click', () => {
    const page = informationPages[button.dataset.information || ''];
    if (!page) return;
    dismissNotification();
    element<HTMLElement>('#information-eyebrow').textContent = page.eyebrow;
    element<HTMLElement>('#information-title').textContent = page.title;
    element<HTMLElement>('#information-content').innerHTML = page.content;
    showDialog(informationDialog);
    element<HTMLElement>('#information-title').focus({ preventScroll: true });
  });
});
