import { onPageReady } from './utils/lifecycle';

function parsePrice(value: string | undefined): number {
  return Number((value ?? '').replace(/[^0-9.]/g, '')) || 0;
}

function bindJoinPaypalTest() {
  const form = document.getElementById('membership-form') as HTMLFormElement | null;
  const modal = document.getElementById('paypal-test-modal');
  const nameField = document.getElementById('paypal-test-name');
  const addressField = document.getElementById('paypal-test-address');
  const phoneField = document.getElementById('paypal-test-phone');
  const tierLabel = document.getElementById('paypal-test-tier');
  const addonsLabel = document.getElementById('paypal-test-addons');
  const priceLabel = document.getElementById('paypal-test-price');
  const result = document.getElementById('paypal-test-result');
  const simulateBtn = document.getElementById('paypal-test-simulate');
  const cancelBtn = document.getElementById('paypal-test-cancel');

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!modal || !nameField || !addressField || !phoneField || !tierLabel || !addonsLabel || !priceLabel || !result) {
      return;
    }

    const data = new FormData(form);
    const firstName = String(data.get('firstName') ?? '');
    const lastName = String(data.get('lastName') ?? '');
    const address1 = String(data.get('address1') ?? '');
    const address2 = String(data.get('address2') ?? '');
    const city = String(data.get('city') ?? '');
    const state = String(data.get('state') ?? '');
    const zip = String(data.get('zip') ?? '');
    const phone = String(data.get('phone') ?? '');

    const tierInput = form.querySelector<HTMLInputElement>('input[name="tier"]:checked');
    const addonInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="addon"]:checked'));

    const tierPrice = parsePrice(tierInput?.dataset.price);
    const addonsTotal = addonInputs.reduce((sum, input) => sum + parsePrice(input.dataset.price), 0);

    nameField.textContent = `${firstName} ${lastName}`.trim() || '—';
    addressField.textContent = [address1, address2, `${city}, ${state} ${zip}`.trim()]
      .filter(Boolean)
      .join(', ');
    phoneField.textContent = phone || '—';
    tierLabel.textContent = tierInput?.value ?? '—';
    addonsLabel.textContent = addonInputs.length ? addonInputs.map((input) => input.value).join(', ') : 'None';
    priceLabel.textContent = `$${(tierPrice + addonsTotal).toFixed(2)}`;

    result.classList.add('hidden');
    result.textContent = '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  simulateBtn?.addEventListener('click', () => {
    if (!result) return;
    result.textContent = 'Simulated payment successful. (No real transaction occurred.)';
    result.classList.remove('hidden');
  });
}

export function initJoinPaypalTest(): void {
  onPageReady(bindJoinPaypalTest);
}
