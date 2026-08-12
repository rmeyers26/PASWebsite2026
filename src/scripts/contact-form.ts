import { onPageReady } from './utils/lifecycle';

// Progressive enhancement only: the <form> already works via a plain POST +
// the hidden "redirect" field (see contact.astro) if this script never runs.
// When it does run, it submits the same FormData over fetch so the page
// never navigates away, and shows Web3Forms' own success/error message
// inline instead.
function bindContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-form-status');
  if (!(form instanceof HTMLFormElement) || !status) return;

  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    // The hCaptcha widget (web3forms.com/client/script.js) writes its token
    // into this hidden textarea once solved; it isn't a real form field, so
    // browser validation can't require it for us.
    const captchaResponse = form.querySelector<HTMLTextAreaElement>('textarea[name="h-captcha-response"]');
    if (!captchaResponse?.value) {
      status.classList.remove('hidden', 'text-nebula-teal');
      status.classList.add('text-nebula-red');
      status.textContent = 'Please complete the captcha before sending.';
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    status.classList.remove('hidden', 'text-nebula-teal', 'text-nebula-red');
    status.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        status.textContent = "Thanks — your message has been sent. We'll be in touch soon.";
        status.classList.add('text-nebula-teal');
      } else {
        status.textContent = result.message || 'Something went wrong. Please try again.';
        status.classList.add('text-nebula-red');
      }
    } catch {
      status.textContent = 'Something went wrong. Please check your connection and try again.';
      status.classList.add('text-nebula-red');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

export function initContactForm(): void {
  onPageReady(bindContactForm);
}
