interface ObserveOnceOptions<T extends Element> extends IntersectionObserverInit {
  /** Called for every target when IntersectionObserver isn't available. */
  onUnsupported?: (target: T) => void;
}

// Observes each target and fires `onIntersect` the first time it enters the
// viewport, then stops observing it. Falls back to calling `onIntersect` (or
// `onUnsupported`, if provided) for every target immediately when
// IntersectionObserver isn't available. Returns the created observer (so
// callers that need to disconnect a stale one on re-run can do so), or
// `undefined` when the unsupported fallback path was taken instead.
export function observeOnce<T extends Element>(
  targets: T[] | NodeListOf<T>,
  onIntersect: (target: T) => void,
  { onUnsupported, ...init }: ObserveOnceOptions<T> = {}
): IntersectionObserver | undefined {
  const list = Array.from(targets);
  if (!list.length) return undefined;

  if (!('IntersectionObserver' in window)) {
    list.forEach((target) => (onUnsupported ?? onIntersect)(target));
    return undefined;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      onIntersect(entry.target as T);
      obs.unobserve(entry.target);
    }
  }, init);

  list.forEach((target) => observer.observe(target));
  return observer;
}
