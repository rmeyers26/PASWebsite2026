// Bundled module scripts only execute once per document, but Astro's view
// transitions swap the DOM without a full reload — so anything that binds to
// elements has to be re-run after every navigation. This runs `fn` once now,
// then again on every `astro:page-load`.
export function onPageReady(fn: () => void): void {
  fn();
  document.addEventListener('astro:page-load', fn);
}
