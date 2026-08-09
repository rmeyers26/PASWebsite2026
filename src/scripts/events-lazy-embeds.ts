import { observeOnce } from './utils/observe';
import { onPageReady } from './utils/lifecycle';

// All three third-party embeds (the Bookwhen calendar iframe, its two
// Google Maps neighbors, and the Bookwhen resizer script that makes the
// calendar iframe auto-height) are deferred behind IntersectionObserver
// rather than the browser's native loading="lazy" — native lazy-loading
// uses a large "near viewport" heuristic (traditionally over 1000px) that
// this page's embeds, sitting close to the top of a mostly-text page,
// clear almost immediately after load anyway. The resizer <script> in
// particular had no equivalent at all before this: loading="lazy" only
// applies to iframes/images, and a plain <script src> with neither defer
// nor async blocks HTML parsing at that point in the document until it
// finishes downloading and executing — a classic render-blocking
// third-party request, and the one piece of this page an audit would
// actually flag.
let resizerRequested = false;

function loadBookwhenResizer() {
  if (resizerRequested) return;
  resizerRequested = true;
  const script = document.createElement('script');
  script.src = 'https://cdn.bookwhen.com/js/iframe_resizer.js';
  document.body.appendChild(script);
}

function activate(iframe: HTMLIFrameElement) {
  if (iframe.src) return; // already activated — astro:page-load can re-run this
  const src = iframe.dataset.embedSrc;
  if (!src) return;
  iframe.src = src;
  if (iframe.dataset.embedGroup === 'bookwhen') loadBookwhenResizer();
}

function bindLazyEmbeds() {
  const targets = document.querySelectorAll<HTMLIFrameElement>('iframe[data-embed-src]');
  observeOnce(targets, activate, { rootMargin: '300px 0px', onUnsupported: activate });
}

export function initLazyEmbeds(): void {
  onPageReady(bindLazyEmbeds);
}
