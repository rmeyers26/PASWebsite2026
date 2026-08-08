import { prefersReducedMotion } from './utils/motion';
import { onPageReady } from './utils/lifecycle';

// Both buttons are swapped out with the rest of the DOM on every
// view-transition navigation, so visibility + click handling needs
// rebinding each time. window survives navigations, so its scroll
// listener is registered once and re-queries the current buttons on
// every scroll — the same split NavBar.astro uses for its document-level
// listeners.
function updateVisibility() {
  const isVisible = window.scrollY > 600;
  document.getElementById('back-to-top')?.classList.toggle('is-visible', isVisible);
  document.getElementById('back-home')?.classList.toggle('is-visible', isVisible);
}

function bindBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  updateVisibility();
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}

let scrollListenerBound = false;

export function initBackToTop(): void {
  if (!scrollListenerBound) {
    scrollListenerBound = true;
    window.addEventListener('scroll', updateVisibility, { passive: true });
  }
  onPageReady(bindBackToTop);
}
