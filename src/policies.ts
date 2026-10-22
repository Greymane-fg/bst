interface InformationPage {
  title: string;
  eyebrow: string;
  content: string;
}

export const informationPages: Record<string, InformationPage> = {
  privacy: {
    title: 'Your privacy matters.',
    eyebrow: 'PRIVACY POLICY',
    content: `
      <p>We use the information you submit only to review your application, contact you about your selected plan, and provide implementation and support.</p>
      <h3>What we collect</h3>
      <p>Your name, email address, store URL, selected plan, and submission reference and time. We do not request payment details or store credentials on this website.</p>
      <h3>How your details are handled</h3>
      <p>Applications are sent through EmailJS to the service team’s configured email inbox. EmailJS and the email provider process this information to deliver your application. Do not include passwords or other sensitive information.</p>
      <h3>Storage and your choices</h3>
      <p>This website does not save your application in browser storage and does not use advertising trackers or analytics. Unsubmitted details stay only in the current page. Submitted applications remain in the delivery providers’ systems and the team’s inbox as needed for your application and service delivery, subject to their retention settings and any legal obligations.</p>
      <p>To request access, correction, or deletion, reply to the team’s response to your application. If you do not wish to share your details, do not submit the form.</p>
    `,
  },
  terms: {
    title: 'Clear from the start.',
    eyebrow: 'TERMS OF SERVICE',
    content: `
      <p>Brand Schema Tag provides brand structured-data implementation services. By submitting an application, you ask the team to contact you about the plan you selected.</p>
      <h3>Applications, not payments</h3>
      <p>All displayed prices are in US dollars (USD). No payment is collected on this website. An application is not a completed purchase, a subscription, or an automatic renewal. Scope, availability, timelines, payment arrangements, and the terms of any ongoing support will be confirmed with you before work begins.</p>
      <h3>Accurate business information</h3>
      <p>Please supply accurate details for a store or business you are authorised to represent. Do not send passwords, payment information, or other sensitive credentials through this form.</p>
      <h3>Search results</h3>
      <p>Structured data helps describe your business to search engines. It does not guarantee rankings, indexing, rich results, sales, or any particular search-engine treatment. Brand Schema Tag is an independent service and is not affiliated with or endorsed by a search engine.</p>
      <h3>Questions and changes</h3>
      <p>The team will confirm your specific requirements and next steps by email. If you need to change an application, reply to that conversation before work begins.</p>
    `,
  },
  support: {
    title: 'A little help, right here.',
    eyebrow: 'APPLICATION SUPPORT',
    content: `
      <h3>How do I apply?</h3>
      <p>Choose a plan, enter your name, email address, and store URL, then select “Submit application”. You’ll see an on-screen confirmation when the application has been sent.</p>
      <h3>Will I be charged?</h3>
      <p>No. This website does not collect payments. The team will contact you to confirm the scope and next steps.</p>
      <h3>Can I change my plan?</h3>
      <p>Before submitting, close the form and choose another card. Your name, email, and store URL stay in the form while you remain on this page. After submitting, reply to the team’s email to discuss any changes.</p>
      <h3>My application didn’t send.</h3>
      <p>Check your internet connection and try again. Your entries stay in the form if sending fails. If the problem continues, try again later rather than submitting repeatedly.</p>
      <h3>What happens next?</h3>
      <p>The team will use the email address you provided to contact you. Check that address for a reply, including your spam folder. Keep the reference shown on the confirmation screen for your records.</p>
    `,
  },
};
