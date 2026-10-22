import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const endpoint = 'https://api.emailjs.com/api/v1.0/email/send';
const catalogue = [
  { years: 1, name: '1 YEAR PLAN', price: '$200' },
  { years: 3, name: '3 YEARS PLAN', price: '$250' },
  { years: 5, name: '5 YEARS PLAN', price: '$350' },
  { years: 10, name: '10 YEARS PLAN', price: '$500' },
];

async function choosePlan(page: Page, years = 1): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^Select ${years}-year plan`) }).click();
  await expect(page.getByRole('dialog', { name: 'Business details' })).toBeVisible();
}

async function fillApplication(page: Page): Promise<void> {
  await page.getByLabel('Full name', { exact: true }).fill('Ada Okafor');
  await page.getByLabel('Email address', { exact: true }).fill('ada@example.com');
  await page.getByLabel('Store URL', { exact: true }).fill('ada.myshopify.com');
}

test.beforeEach(async ({ page }) => {
  // A test must explicitly mock delivery; NEVER send real email during a test run.
  await page.route('https://api.emailjs.com/**', (route) => route.abort());
  await page.goto('/');
});

test('matches all four reference plans and their features', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('BRAND SCHEMA TAG');
  await expect(page.getByRole('article')).toHaveCount(4);
  for (const plan of catalogue) {
    const card = page.getByRole('article', { name: plan.name, exact: true });
    await expect(card).toContainText(plan.price);
    await expect(card.getByRole('listitem')).toHaveCount(4);
    await expect(card.getByRole('button', { name: `Select ${plan.years}-year plan for ${plan.price}` })).toBeVisible();
  }
  await expect(page.getByText('Maximum implementation support', { exact: true })).toBeVisible();
});

for (const width of [320, 390, 494, 768, 1440]) {
  test(`has no horizontal overflow at ${width}px and a usable modal`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await choosePlan(page, 5);
    await expect(page.getByLabel('Plan name', { exact: true })).toHaveValue('5 YEARS PLAN');
    await expect(page.getByRole('button', { name: 'Submit application', exact: true })).toBeInViewport();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('locks the correct plan and price for each card and retains contact drafts when switching', async ({ page }) => {
  for (const plan of catalogue) {
    await choosePlan(page, plan.years);
    await expect(page.getByLabel('Plan name', { exact: true })).toHaveValue(plan.name);
    await expect(page.getByLabel('Plan price', { exact: true })).toHaveValue(plan.price);
    await expect(page.getByLabel('Plan name', { exact: true })).toHaveAttribute('readonly', '');
    await expect(page.getByLabel('Plan price', { exact: true })).toHaveAttribute('readonly', '');
    await page.getByLabel('Full name', { exact: true }).fill('Ada Okafor');
    await page.getByRole('button', { name: 'Close application form' }).click();
  }
  await choosePlan(page, 1);
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Ada Okafor');
});

test('validates required fields without making an EmailJS request', async ({ page }) => {
  let requests = 0;
  await page.route(endpoint, (route) => { requests++; return route.abort(); });
  await choosePlan(page);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByText('Please enter your name.', { exact: true })).toBeVisible();
  await expect(page.getByText('Please enter your email address.', { exact: true })).toBeVisible();
  await expect(page.getByText('Please enter your store URL.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Full name', { exact: true })).toBeFocused();
  await page.getByLabel('Full name', { exact: true }).fill('Ada');
  await page.getByLabel('Email address', { exact: true }).fill('not-an-email');
  await page.getByLabel('Store URL', { exact: true }).fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByText('Please enter a valid email address.', { exact: true })).toBeVisible();
  await expect(page.getByText('Enter a valid store URL, like yourstore.com.', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('sends all contact details with the trusted selected plan, not altered DOM fields', async ({ page }) => {
  let payload: Record<string, unknown> = {};
  await page.route(endpoint, async (route) => {
    payload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
  });
  await choosePlan(page, 10);
  await fillApplication(page);
  // Read-only UI is not the source of truth, even if someone alters the DOM.
  await page.getByLabel('Plan name', { exact: true }).evaluate((input: HTMLInputElement) => { input.value = 'FAKE PLAN'; });
  await page.getByLabel('Plan price', { exact: true }).evaluate((input: HTMLInputElement) => { input.value = '$1'; });
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  expect(payload).toMatchObject({
    service_id: 'service_bst001', template_id: 'template_o2jsmvp', user_id: 'DsZtpo1OyFI88CFGz',
    template_params: {
      name: 'Ada Okafor', email: 'ada@example.com', reply_to: 'ada@example.com',
      store_url: 'https://ada.myshopify.com/', plan_name: '10 YEARS PLAN', plan_price: '$500',
      original_price: '$700', discount: '$200', currency: 'USD',
      application_id: expect.stringMatching(/^BST-[A-F0-9]{12}$/),
      submitted_at: expect.any(String),
    },
  });
  await expect(page.locator('#success-plan')).toHaveText('10 YEARS PLAN');
  await expect(page.locator('#success-price')).toHaveText('$500');
  await expect(page.locator('#success-email')).toHaveText('ada@example.com');
  await page.getByRole('button', { name: 'Back to plans', exact: true }).click();
  await choosePlan(page, 3);
  await expect(page.getByLabel('Full name', { exact: true })).toBeEmpty();
});

test('prevents duplicate submission while sending', async ({ page }) => {
  let requests = 0;
  let finishRequest: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => { finishRequest = resolve; });
  await page.route(endpoint, async (route) => {
    requests++;
    await pending;
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
  });
  await choosePlan(page);
  await fillApplication(page);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sending application…' })).toBeDisabled();
  await expect(page.getByLabel('Full name', { exact: true })).toBeDisabled();
  await page.locator('#application-form').evaluate((form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await expect.poll(() => requests).toBe(1);
  finishRequest?.();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  expect(requests).toBe(1);
});

test('retains form values after an error and allows a successful retry', async ({ page }) => {
  let requests = 0;
  await page.route(endpoint, async (route) => {
    requests++;
    await route.fulfill({ status: requests === 1 ? 500 : 200, contentType: 'text/plain', body: requests === 1 ? 'Unavailable' : 'OK' });
  });
  await choosePlan(page, 3);
  await fillApplication(page);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('We couldn’t send your application');
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Ada Okafor');
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('ada@example.com');
  await expect(page.getByLabel('Store URL', { exact: true })).toHaveValue('https://ada.myshopify.com/');
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  expect(requests).toBe(2);
});

test('shows a useful offline error without sending', async ({ page, context }) => {
  await choosePlan(page);
  await fillApplication(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('You appear to be offline');
  await expect(page.getByRole('button', { name: 'Submit application', exact: true })).toBeEnabled();
  await context.setOffline(false);
});

test('supports keyboard dismissal, restores focus and scroll, and allows backdrop dismissal', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Select 10-year plan for $500' });
  await button.scrollIntoViewIfNeeded();
  const scrollY = await page.evaluate(() => window.scrollY);
  await button.click();
  await expect(page.getByLabel('Full name', { exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#application-dialog')).not.toBeVisible();
  await expect(button).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
  await button.click();
  await page.mouse.click(5, 5);
  await expect(page.locator('#application-dialog')).not.toBeVisible();
});

test('keeps keyboard focus inside the native modal', async ({ page }) => {
  await choosePlan(page);
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    const focusInside = await page.evaluate(() => {
      const dialog = document.querySelector('#application-dialog');
      return dialog?.contains(document.activeElement) || document.activeElement === document.body;
    });
    expect(focusInside).toBe(true);
  }
});

test('finishes an in-flight request even if the visitor closes the popup', async ({ page }) => {
  let finishRequest: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => { finishRequest = resolve; });
  await page.route(endpoint, async (route) => {
    await pending;
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
  });
  await choosePlan(page, 5);
  await fillApplication(page);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sending application…' })).toBeDisabled();
  await page.getByRole('button', { name: 'Close application form' }).click();
  await expect(page.locator('#notification')).toContainText('still sending');
  finishRequest?.();
  await expect(page.locator('#notification')).toContainText('Application sent');
  await expect(page.locator('#application-dialog')).not.toBeVisible();
});

for (const [button, title] of [
  ['Privacy Policy', 'Your privacy matters.'],
  ['Terms of Service', 'Clear from the start.'],
  ['Support', 'A little help, right here.'],
]) {
  test(`opens a real ${button} information dialog`, async ({ page }) => {
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('dialog', { name: title })).toBeVisible();
    await page.getByRole('button', { name: 'Back to plans', exact: true }).click();
    await expect(page.locator('#information-dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: button, exact: true })).toBeFocused();
  });
}

for (const plan of catalogue) {
  test(`submits the ${plan.years}-year plan with its exact catalogue price`, async ({ page }) => {
    let sentPlan: Record<string, string> = {};
    await page.route(endpoint, async (route) => {
      sentPlan = route.request().postDataJSON().template_params as Record<string, string>;
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
    });
    await choosePlan(page, plan.years);
    await fillApplication(page);
    await page.getByRole('button', { name: 'Submit application', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
    expect(sentPlan.plan_name).toBe(plan.name);
    expect(sentPlan.plan_price).toBe(plan.price);
  });
}

test('does not send honeypot submissions', async ({ page }) => {
  let requests = 0;
  await page.route(endpoint, (route) => { requests++; return route.abort(); });
  await choosePlan(page);
  await fillApplication(page);
  await page.locator('#company-website').evaluate((input: HTMLInputElement) => { input.value = 'bot-value'; });
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('refresh the page');
  expect(requests).toBe(0);
});

test('keeps the form scrollable in a short mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.route(endpoint, (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' }));
  await choosePlan(page, 3);
  await fillApplication(page);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to plans', exact: true }).click();
  await expect(page.locator('#application-dialog')).not.toBeVisible();
});

test('has no WCAG-tagged axe violations on the page, form, success, or information dialogs', async ({ page }) => {
  const pageResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(pageResults.violations).toEqual([]);
  await choosePlan(page);
  const formResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(formResults.violations).toEqual([]);
  await page.route(endpoint, (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' }));
  await fillApplication(page);
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  const successResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(successResults.violations).toEqual([]);
  await page.getByRole('button', { name: 'Back to plans', exact: true }).click();
  for (const label of ['Privacy Policy', 'Terms of Service', 'Support']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    const informationResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(informationResults.violations).toEqual([]);
    await page.getByRole('button', { name: 'Back to plans', exact: true }).click();
  }
});
