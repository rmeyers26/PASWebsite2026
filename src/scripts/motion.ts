import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Kill all previously-registered ScrollTriggers before a page re-init (view transitions swap the DOM). */
export function resetScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

/** Reveal any [data-animate] element as it scrolls into view, staggered by [data-animate-group]. */
export function initScrollReveals(root: ParentNode = document) {
  if (prefersReducedMotion()) return;

  const groups = new Map<string, HTMLElement[]>();
  root.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
    const key = el.dataset.animateGroup ?? el.dataset.animate ?? 'default';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(el);
  });

  groups.forEach((elements) => {
    ScrollTrigger.batch(elements, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        const scale = elements[0]?.dataset.animate === 'fade-scale' ? 0.94 : 1;
        gsap.fromTo(
          batch,
          { opacity: 0, y: 28, scale },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
        );
      },
    });
  });
}

/** Shrink/blur the nav bar once the page scrolls past the hero. */
export function initNavShrink() {
  const nav = document.querySelector<HTMLElement>('[data-navbar]');
  if (!nav) return;
  if (prefersReducedMotion()) return;

  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: { targets: nav, className: 'nav-scrolled' },
  });
}

/** Stagger the hero's heading/subtitle/CTA in on load. */
export function initHeroEntrance(root: ParentNode = document) {
  const items = root.querySelectorAll<HTMLElement>('[data-hero-item]');
  if (!items.length) return;

  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    items,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.1 }
  );
}

/** Draw each [data-timeline] container's [data-timeline-line] in as the user scrolls it. */
export function initTimelineLines(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-timeline]').forEach((container) => {
    const line = container.querySelector<HTMLElement>('[data-timeline-line]');
    if (!line) return;

    if (prefersReducedMotion()) {
      gsap.set(line, { scaleY: 1 });
      return;
    }

    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.5,
        },
      }
    );
  });
}

/** Gentle scroll-tied parallax for the ambient nebula orbs behind the starfield. */
export function initParallax(root: ParentNode = document) {
  if (prefersReducedMotion()) return;

  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const depth = Number(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      yPercent: 30 * depth,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  });
}
