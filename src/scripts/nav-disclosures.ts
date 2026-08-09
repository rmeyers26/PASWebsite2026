import { onPageReady } from './utils/lifecycle';

function close(details: HTMLDetailsElement) {
  details.open = false;
  details.querySelector('summary')?.setAttribute('aria-expanded', 'false');
}

const currentDisclosures = () => [...document.querySelectorAll<HTMLDetailsElement>('.nav-disclosure')];

// Per-element wiring has to be redone whenever the header is swapped in.
function bindDisclosures() {
  for (const details of currentDisclosures()) {
    const summary = details.querySelector('summary');

    details.addEventListener('toggle', () => {
      summary?.setAttribute('aria-expanded', String(details.open));
      // Only one menu open at a time, so panels never overlap.
      if (details.open) {
        for (const other of currentDisclosures()) {
          if (other !== details) close(other);
        }
      }
    });

    // Navigating away should not leave the panel open behind the new page.
    for (const link of details.querySelectorAll('a')) {
      link.addEventListener('click', () => close(details));
    }
  }
}

let documentListenersBound = false;

// Document-level listeners survive view transitions, so they are registered
// once and re-query the DOM on each event rather than closing over elements.
function bindDocumentListeners() {
  if (documentListenersBound) return;
  documentListenersBound = true;

  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Node;
    for (const details of currentDisclosures()) {
      if (details.open && !details.contains(target)) close(details);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const details of currentDisclosures()) {
      if (!details.open) continue;
      close(details);
      details.querySelector('summary')?.focus();
    }
  });
}

export function initNavDisclosures(): void {
  bindDocumentListeners();
  onPageReady(bindDisclosures);
}
