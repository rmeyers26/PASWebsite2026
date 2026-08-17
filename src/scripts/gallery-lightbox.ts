import { onPageReady } from './utils/lifecycle';

// Prev/next walks the page in visual order — Member Images then Club Events
// as one continuous sequence — rather than treating the two sections as
// separate loops. Simpler, and nothing about the UI suggests they're
// different collections once you're browsing full-size.
let triggers: HTMLButtonElement[] = [];
let currentIndex = -1;

function captionText(figure: Element, role: string): string {
  return figure.querySelector(`[data-lightbox="${role}"]`)?.textContent?.trim() ?? '';
}

function openAt(index: number, dialog: HTMLDialogElement) {
  const trigger = triggers[index];
  const sourceImg = trigger?.querySelector('img');
  const figure = trigger?.closest('figure');
  if (!trigger || !sourceImg || !figure) return;

  currentIndex = index;

  const lightboxImg = dialog.querySelector<HTMLImageElement>('#gallery-lightbox-image');
  if (lightboxImg) {
    // Reuses whatever Astro already generated for the thumbnail — copying
    // srcset (rather than computing a new "full size" URL) means the
    // browser just picks the largest already-built variant (up to 1600w)
    // now that sizes is uncapped. Plain CMS uploads have no srcset, so this
    // falls back to their single unoptimized src (same tradeoff already
    // documented where these <img> tags are rendered).
    const srcset = sourceImg.getAttribute('srcset');
    if (srcset) {
      lightboxImg.srcset = srcset;
      lightboxImg.sizes = '100vw';
    } else {
      lightboxImg.removeAttribute('srcset');
    }
    lightboxImg.src = sourceImg.currentSrc || sourceImg.src;
    lightboxImg.alt = sourceImg.alt;
  }

  const subjectEl = dialog.querySelector('#gallery-lightbox-subject');
  const noteEl = dialog.querySelector('#gallery-lightbox-note');
  const photographerEl = dialog.querySelector('#gallery-lightbox-photographer');
  if (subjectEl) subjectEl.textContent = captionText(figure, 'subject');
  if (noteEl) noteEl.textContent = captionText(figure, 'note');
  if (photographerEl) photographerEl.textContent = captionText(figure, 'photographer');

  if (!dialog.open) dialog.showModal();
}

function bindGalleryLightbox() {
  const dialog = document.getElementById('gallery-lightbox');
  const image = document.getElementById('gallery-lightbox-image');
  const closeBtn = document.getElementById('gallery-lightbox-close');
  const prevBtn = document.getElementById('gallery-lightbox-prev');
  const nextBtn = document.getElementById('gallery-lightbox-next');
  triggers = Array.from(document.querySelectorAll('.gallery-photo-trigger'));

  if (
    !(dialog instanceof HTMLDialogElement) ||
    !image ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !(prevBtn instanceof HTMLButtonElement) ||
    !(nextBtn instanceof HTMLButtonElement) ||
    triggers.length === 0
  ) {
    return;
  }

  const step = (delta: number) => {
    if (currentIndex < 0) return;
    openAt((currentIndex + delta + triggers.length) % triggers.length, dialog);
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => openAt(index, dialog));
  });

  closeBtn.addEventListener('click', () => dialog.close());
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
  });

  dialog.addEventListener('close', () => {
    triggers[currentIndex]?.focus();
  });

  let touchStartX = 0;
  image.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.touches[0]?.clientX ?? 0;
    },
    { passive: true }
  );
  image.addEventListener(
    'touchend',
    (event) => {
      const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) < 40) return;
      step(delta > 0 ? -1 : 1);
    },
    { passive: true }
  );
}

export function initGalleryLightbox(): void {
  onPageReady(bindGalleryLightbox);
}
