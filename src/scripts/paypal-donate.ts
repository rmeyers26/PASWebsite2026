import { onPageReady } from './utils/lifecycle';

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (options: { hostedButtonId: string }) => {
        render: (selector: string) => void;
      };
    };
  }
}

const SDK_SCRIPT_ID = 'paypal-hosted-buttons-sdk';
// disable-funding=venmo,card restricts checkout to the PayPal option only,
// hiding the Venmo button and the guest credit/debit card form.
const SDK_URL =
  'https://www.paypal.com/sdk/js?client-id=BAAyOmGTuZ-xFbzinY-hW7YmZWW5fNliU8fhCDG2_aQvp-3j0TPPvALzmwOfaJBEQrAieCo74_mJ-VoLPM&components=hosted-buttons&disable-funding=venmo,card&currency=USD';
const CONTAINER_ID = 'paypal-container-VUTK32FET2578';
const HOSTED_BUTTON_ID = 'VUTK32FET2578';

function renderDonateButton() {
  if (!document.getElementById(CONTAINER_ID) || !window.paypal) return;
  window.paypal.HostedButtons({ hostedButtonId: HOSTED_BUTTON_ID }).render(`#${CONTAINER_ID}`);
}

// View transitions swap the container back in on every visit to this page,
// but the SDK script tag (and window.paypal) persists across navigations —
// only fetch it once, then just re-render into whichever container is
// currently in the DOM.
function loadSdkThenRender() {
  if (!document.getElementById(CONTAINER_ID)) return;

  if (window.paypal) {
    renderDonateButton();
    return;
  }

  let script = document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = SDK_URL;
    document.head.appendChild(script);
  }
  script.addEventListener('load', renderDonateButton, { once: true });
}

export function initPaypalDonate(): void {
  onPageReady(loadSdkThenRender);
}
