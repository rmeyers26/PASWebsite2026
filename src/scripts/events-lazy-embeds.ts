import { observeOnce } from './utils/observe';
import { onPageReady } from './utils/lifecycle';

// The Google Maps embeds on this page are deferred behind
// IntersectionObserver rather than the browser's native loading="lazy" —
// native lazy-loading uses a large "near viewport" heuristic (traditionally
// over 1000px) that this page's embeds, sitting close to the top of a
// mostly-text page, clear almost immediately after load anyway.
function activate(iframe: HTMLIFrameElement) {
  if (iframe.src) return; // already activated — astro:page-load can re-run this
  const src = iframe.dataset.embedSrc;
  if (!src) return;
  iframe.src = src;
}

function bindLazyEmbeds() {
  const targets = document.querySelectorAll<HTMLIFrameElement>('iframe[data-embed-src]');
  observeOnce(targets, activate, { rootMargin: '300px 0px', onUnsupported: activate });
}

export function initLazyEmbeds(): void {
  onPageReady(bindLazyEmbeds);
}
