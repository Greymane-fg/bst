# Brand Schema Tag

A complete, mobile-first single-page website recreated from the supplied screenshots. Built with **Vite, TypeScript, plain HTML/CSS, and the official EmailJS browser SDK** — no framework, backend, database, external font service, or payment integration required.

## What’s included

- Green gradient header, three-step progress indicator, and all four reference plan cards.
- Single-column mobile layout, two-column tablet layout, and four-column desktop layout.
- Accessible application popup (mobile bottom sheet / desktop modal) requesting **name, email, and store URL**.
- **Read-only plan name and plan price**, populated from the card selected. Email payload prices come from the immutable plan catalogue, never the form fields.
- URL normalisation, inline validation, sending state, duplicate-submit protection, failure/retry, and an on-screen success reference.
- Keyboard/Escape/backdrop dismissal, focus restoration, mobile scroll locking, safe-area spacing, reduced-motion support, and touch-friendly controls.
- Working Privacy Policy, Terms of Service, and Support dialogs.
- Locally bundled Inter font, SVG favicon, SEO metadata, production security headers for Netlify, automated checks, and optional GitHub Pages deployment.

| Plan | Original price | Discount | Final price (USD) |
| --- | ---: | ---: | ---: |
| 1 YEAR PLAN | $250 | $50 | **$200** |
| 3 YEARS PLAN | $350 | $100 | **$250** |
| 5 YEARS PLAN | $500 | $150 | **$350** |
| 10 YEARS PLAN | $700 | $200 | **$500** |

## Run locally

Requires **Node.js 22.12+** and npm. `.nvmrc` selects Node 22.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The dev server binds to `0.0.0.0` and permits Arena’s `.e2b.app` preview hosts. The website itself never sends browser requests to a local backend.

```bash
npm run build       # Type-check and build into dist/
npm run preview     # Preview the production build on port 4173
```

Publish the **contents of `dist/`**, not the source directory. Use HTTPS in production. Do not open `index.html` directly with `file://`; this is a Vite source project.

## EmailJS — one dashboard check before launch

The supplied public browser settings are already configured in `src/email.ts`:

```text
Service ID:  service_bst001
Template ID: template_o2jsmvp
Public key:  DsZtpo1OyFI88CFGz
```

**[`reafme.md`](./reafme.md) contains the full HTML email template, exact variable names, recipient/Reply To settings, and live-delivery checklist.** A copy-ready standalone version is in [`email-template.html`](./email-template.html).

Save that HTML in your existing `template_o2jsmvp` template, set its **To Email** to your team’s real receiving address, set **Reply To** to `{{reply_to}}`, and verify the service is authorised and your deployment origin is allowed. Template/recipient settings cannot be changed from this frontend repository. The visitor receives an on-screen confirmation; an automatic customer email is not configured.

The app sends `name`, `email`, `reply_to`, `store_url`, `plan_name`, `plan_price`, `original_price`, `discount`, `currency`, `application_id`, and `submitted_at`. See `reafme.md` for the complete mapping.

No `.env` file is needed to use the supplied values. To override them, copy `.env.example` to `.env` and rebuild. Every `VITE_` value is public browser code: **never put private keys or email-provider passwords in it**.

### Delivery and security notes

- All automated email delivery is mocked; no real emails are sent by tests. Perform the documented live inbox test after configuring the dashboard.
- Keep the recipient fixed in the template, use EmailJS origin restrictions and provider-side abuse controls, and monitor quota. The honeypot and disabled submit button are convenience protections, not a complete anti-spam system. If you enable a provider CAPTCHA, integrate and test its client challenge before requiring it.
- The catalogue and read-only fields prevent accidental UI edits and DOM-field price substitution. A public browser client cannot enforce server-side price authenticity. Confirm applications with the customer; do not treat email as a payment or binding checkout.
- Application drafts are kept only in the current page, not in local/session storage. Submitted information is processed by EmailJS and your connected email provider. Review the included informational policies for your actual business practices before publishing.

## Deploy

### Netlify (ready to import)

1. Import this GitHub repository and choose the branch containing this implementation.
2. `netlify.toml` supplies the build command (`npm run build`), publish directory (`dist`), Node version, SPA fallback, cache rules, and security headers.
3. No environment variables are required unless you are overriding the supplied public EmailJS settings.
4. Add the deployed HTTPS origin to your EmailJS allowed-origin settings and perform a live delivery test.

For another static host, use `npm ci && npm run build`, upload `dist/`, and allow `https://api.emailjs.com` in any Content Security Policy’s `connect-src`.

### GitHub Pages (optional)

An opt-in deployment workflow is included at `.github/workflows/deploy-pages.yml`; deployment is not triggered just by pushing code.

1. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
2. Make sure the workflow file is on the repository’s default branch so GitHub displays its **Run workflow** button. Then run **Deploy to GitHub Pages** from the implementation branch. If the Pages environment restricts deployments to specific branches, permit that branch or deploy after merging it into the allowed default branch.
3. Add your published Pages origin to EmailJS’s allowed-origin settings.

Vite builds relative asset paths, so deployment under the repository subpath `/bst/` works without changing the configuration. The site uses dialogs rather than client-side URL routes, so Pages does not need a custom 404 redirect.

## Checks

```bash
npm run typecheck
npm test                         # Unit tests: catalogue, validation, EmailJS payload/errors
npx playwright install chromium  # First-time browser setup
npm run test:e2e                  # Browser, responsive, interaction, and axe accessibility tests
npm run check                    # Type-check, unit tests, production build
```

On Linux, Playwright may need system libraries: use `npx playwright install --with-deps chromium`. For an already-installed compatible Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its full path. Browser tests intercept EmailJS network requests and never send real mail.

The CI workflow runs type-checking, unit tests, the production build, and browser tests on pushes and pull requests. The browser suite runs in desktop Chromium and touch-enabled Pixel 7 emulation. Responsive tests cover 320, 390, 494, 768, and 1440 px widths, plus a short 320 × 480 viewport. Axe checks cover the page, form, success screen, and all information dialogs.

## Project map

```text
index.html                      Semantic page and dialog markup
src/main.ts                     Rendering, accessible dialogs, application state
src/styles.css                  Responsive design and motion/accessibility rules
src/plans.ts                    Single source of truth for all plans and prices
src/validation.ts               Name/email validation and safe URL normalisation
src/email.ts                    EmailJS configuration and catalogue-derived payload
src/policies.ts                 Privacy, terms, and support dialog content
public/favicon.svg              Local brand favicon
reafme.md                       Requested HTML email template and setup guide
email-template.html             Standalone copy of the same email template
netlify.toml                    Production build, headers, caching, and SPA fallback
.github/workflows/              CI and optional GitHub Pages deployment
```

To update pricing or features, edit **only `src/plans.ts`**, then update the corresponding assertions/docs and run the checks. Generated builds, dependencies, browser reports, and local environment files are intentionally excluded from Git.
