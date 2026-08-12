import { observeOnce } from './utils/observe';
import { onPageReady } from './utils/lifecycle';

let embedRequested = false;

function loadPaperformEmbed() {
  if (embedRequested) return;
  embedRequested = true;
  const script = document.createElement('script');
  script.src = 'https://paperform.co/__embed.min.js';
  document.body.appendChild(script);
}

function bindPaperformEmbed() {
  const targets = document.querySelectorAll<HTMLElement>('[data-paperform-id]');
  observeOnce(targets, loadPaperformEmbed, { rootMargin: '300px 0px', onUnsupported: loadPaperformEmbed });
}

export function initJoinPaperformEmbed(): void {
  onPageReady(bindPaperformEmbed);
}
