# Brand Schema Tag — EmailJS template

This is the requested `reafme.md` file. It contains the complete HTML email template and the exact variable names sent by the SPA. The same HTML is also available in [`email-template.html`](./email-template.html) for easy copying.

## 1. Configure the existing EmailJS template

In your EmailJS dashboard, open **Email Templates → `template_o2jsmvp`** and save the following settings:

| Setting | Value |
| --- | --- |
| Email service | `service_bst001` |
| Template ID | `template_o2jsmvp` |
| Public key used by the website | `DsZtpo1OyFI88CFGz` |
| To Email | **Your team’s real receiving email address**, set directly in EmailJS |
| From Name | `Brand Schema Tag` |
| From Email | Use the default/verified address from your connected service |
| Reply To | `{{reply_to}}` |
| Subject | `New {{plan_name}} application — {{name}}` |
| Content | The HTML below, pasted into the template’s HTML/code editor |

**Do not set To Email to `{{email}}`.** This template is the notification to your team; `{{email}}` is the applicant. A customer auto-reply is not included. If you want one later, configure it separately in EmailJS.

Verify that the service is connected and authorised, the fixed recipient is correct, and the account has sending quota. Allow your actual production origin in EmailJS’s domain/origin security settings (and the exact preview/local origin when testing). Never add private email-provider credentials or an EmailJS private key to frontend environment variables.

## 2. Template variables

| Variable | Captured value / example |
| --- | --- |
| `{{name}}` | Applicant name, e.g. `Ada Okafor` |
| `{{email}}` | Applicant email, e.g. `ada@example.com` |
| `{{reply_to}}` | The same validated applicant email; use in the Reply To setting |
| `{{store_url}}` | Normalised HTTP(S) store URL, e.g. `https://ada.myshopify.com/` |
| `{{plan_name}}` | Selected catalogue plan, e.g. `5 YEARS PLAN` |
| `{{plan_price}}` | Selected discounted USD price, e.g. `$350` |
| `{{original_price}}` | Original USD price, e.g. `$500` |
| `{{discount}}` | Savings, e.g. `$150` |
| `{{currency}}` | `USD` |
| `{{application_id}}` | Reference shown to the applicant, e.g. `BST-ABC123DEF456` |
| `{{submitted_at}}` | ISO 8601 timestamp in UTC |

Use these **exact, case-sensitive names**. Use double-brace substitutions (`{{name}}`), not unescaped triple-brace HTML. Treat all submitted information as untrusted input. Store URLs are deliberately displayed as text in the email.

Plan name and price are read-only in the form. The request payload is generated from the selected entry in `src/plans.ts`, **not** from those inputs. As with every frontend-only application, this is a UI integrity guarantee, not server-side tamper protection; never use a browser email as an authority for charging a customer.

## 3. Complete HTML email template

Copy the entire code block into EmailJS’s HTML editor. The template uses inline styles and email-friendly tables, with no external images, scripts, or fonts.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Brand Schema Tag application</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f2f7f3;font-family:Arial,Helvetica,sans-serif;color:#21392b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{name}} applied for {{plan_name}} at {{plan_price}} USD.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f7f3;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:30px 28px;background-color:#087c45;border-radius:20px 20px 0 0;">
                <p style="margin:0 0 9px;color:#dff8e9;font-size:11px;font-weight:bold;letter-spacing:2px;">BRAND SCHEMA TAG</p>
                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.3;">New plan application</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 22px;font-size:15px;line-height:1.7;">A new application has been submitted through the website. Review the business details below and reply to the applicant to confirm the next steps.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#edf7f0;border:1px solid #dcece2;border-radius:12px;">
                  <tr>
                    <td style="padding:18px 20px 4px;color:#567461;font-size:11px;font-weight:bold;letter-spacing:1px;">SELECTED PLAN</td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 18px;color:#096d3d;font-size:22px;font-weight:bold;line-height:1.4;">{{plan_name}} &nbsp;·&nbsp; {{plan_price}} <span style="font-size:12px;">USD</span></td>
                  </tr>
                </table>
                <h2 style="margin:26px 0 8px;font-size:17px;line-height:1.5;">Business details</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:14px;line-height:1.7;table-layout:fixed;">
                  <tr>
                    <td width="36%" valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Name</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;font-weight:bold;overflow-wrap:anywhere;word-break:break-word;">{{name}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Email address</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;overflow-wrap:anywhere;word-break:break-word;">{{email}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Store URL</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;overflow-wrap:anywhere;word-break:break-word;">{{store_url}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Plan name</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;font-weight:bold;">{{plan_name}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Plan price</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;color:#087c45;font-weight:bold;">{{plan_price}} {{currency}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Original price</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;">{{original_price}} {{currency}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Discount</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;">{{discount}} {{currency}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;border-bottom:1px solid #e8eee9;color:#64766a;">Reference</td>
                    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e8eee9;overflow-wrap:anywhere;word-break:break-word;">{{application_id}}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:12px 8px 12px 0;color:#64766a;">Submitted (UTC)</td>
                    <td valign="top" style="padding:12px 0;overflow-wrap:anywhere;word-break:break-word;">{{submitted_at}}</td>
                  </tr>
                </table>
                <p style="margin:22px 0 0;padding:13px 15px;background-color:#f5f8f5;border-radius:8px;color:#5e7465;font-size:12px;line-height:1.7;">This is an application, not a payment receipt. No payment was collected on the website. Confirm the scope, availability, and next steps directly with the applicant.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:19px 28px;background-color:#06271b;border-radius:0 0 20px 20px;color:#ccddd2;font-size:11px;line-height:1.8;text-align:center;">Brand Schema Tag · Website application<br />This email contains business contact information. Handle it securely.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 4. End-to-end delivery check

1. Save the template above and confirm the fixed **To Email** recipient.
2. Deploy the site over HTTPS, or run `npm run dev` locally. Add that exact origin to your EmailJS allowed-origin settings if restrictions are enabled.
3. Select each plan and check its locked values: **1 year $200**, **3 years $250**, **5 years $350**, **10 years $500**.
4. With an email address and store URL you control, submit one application.
5. Confirm the on-screen success, the EmailJS delivery history, and the received email (including spam). Check the name, email, store URL, selected plan and price, reference, and timestamp. Use Reply to verify the reply address.
6. If delivery fails, inspect the service authorisation, template ID, origin restrictions, quota, and recipient in EmailJS. The website preserves form entries and allows retry; HTTP 429 asks the visitor to wait.

The automated tests intercept/mock EmailJS and **do not send real mail**. They verify the request payload, locked plan values, validation, duplicate prevention, success, failure, and retry. A live inbox check requires the owner’s EmailJS service and recipient settings and is not implied by passing tests.
