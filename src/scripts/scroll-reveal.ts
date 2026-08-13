import { prefersReducedMotion } from './utils/motion';
import { observeOnce } from './utils/observe';
import { onPageReady } from './utils/lifecycle';

declare global {
  interface Window {
    __pasReveal?: IntersectionObserver;
  }
}

function revealScrollSections() {
  const targets = document.querySelectorAll<HTMLElement>('main section:not([data-hero])');
  if (!targets.length) return;

  const revealAll = () => targets.forEach((el) => el.classList.add('is-revealed'));

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  window.__pasReveal?.disconnect();

  targets.forEach((el) => el.classList.add('reveal'));

  window.__pasReveal = observeOnce(targets, (el) => el.classList.add('is-revealed'), {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.05,
  });

  // Belt and braces: anything already on screen is revealed synchronously,
  // so a transition that arms the observer mid-layout can never strand
  // content at opacity 0.
  requestAnimationFrame(() => {
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-revealed');
      }
    });
  });
}

export function initScrollReveal(): void {
  onPageReady(revealScrollSections);
}
