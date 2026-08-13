import { onPageReady } from './utils/lifecycle';

// Progressive enhancement: the page above is already a complete,
// year-grouped archive with no JS required. This script re-renders
// #newsletter-list from the embedded #newsletter-data JSON whenever the
// search box or sort dropdown changes, building nodes with the DOM API
// (not innerHTML) since titles/summaries come from CMS-edited content and
// shouldn't be parsed as markup. Mirrors scripts/lecture-search.ts.
type Issue = {
  date: string;
  title?: string;
  summary?: string;
  file: string;
  size?: string;
  displayDate: string;
  year: string;
};

function bindNewsletterSearch() {
  const dataEl = document.getElementById('newsletter-data');
  const searchInput = document.getElementById('newsletter-search') as HTMLInputElement | null;
  const sortSelect = document.getElementById('newsletter-sort') as HTMLSelectElement | null;
  const list = document.getElementById('newsletter-list');
  const emptyMessage = document.getElementById('newsletter-empty');
  const countEl = document.getElementById('newsletter-count');
  if (!dataEl || !searchInput || !sortSelect || !list || !emptyMessage || !countEl) return;
  if (searchInput.dataset.enhanced === 'true') return; // astro:page-load can re-run this
  searchInput.dataset.enhanced = 'true';

  const issues: Issue[] = JSON.parse(dataEl.textContent ?? '[]');

  function buildItem(issue: Issue): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'border-b border-subtle pb-4';

    const titleRow = document.createElement('div');
    titleRow.className = 'flex flex-wrap items-baseline gap-x-3 gap-y-1';

    // Same-origin document, so no new tab and no ↗ — this site reserves
    // both for links that leave it.
    const a = document.createElement('a');
    a.href = issue.file;
    a.type = 'application/pdf';
    a.className = 'font-semibold text-ink-primary hover:text-nebula-teal';
    if (issue.title) {
      a.textContent = issue.title;
    } else {
      const time = document.createElement('time');
      time.dateTime = issue.date;
      time.textContent = issue.displayDate;
      a.appendChild(time);
    }
    titleRow.appendChild(a);

    const sizeSpan = document.createElement('span');
    sizeSpan.className = 'text-sm text-ink-muted';
    sizeSpan.textContent = `PDF${issue.size ? ` · ${issue.size}` : ''}`;
    titleRow.appendChild(sizeSpan);
    li.appendChild(titleRow);

    // Only a second line when the link text is the headline — otherwise
    // the date would be printed twice.
    if (issue.title) {
      const time = document.createElement('time');
      time.dateTime = issue.date;
      time.className = 'mt-1 block text-sm text-nebula-teal';
      time.textContent = issue.displayDate;
      li.appendChild(time);
    }

    if (issue.summary) {
      const summary = document.createElement('p');
      summary.className = 'mt-2 text-ink-muted';
      summary.textContent = issue.summary;
      li.appendChild(summary);
    }

    return li;
  }

  function buildYearGroup(year: string, entries: Issue[]): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.className = 'newsletter-year';
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-semibold text-ink-primary';
    heading.textContent = year;
    wrap.appendChild(heading);
    const ul = document.createElement('ul');
    ul.className = 'mt-6 space-y-4';
    entries.forEach((issue) => ul.appendChild(buildItem(issue)));
    wrap.appendChild(ul);
    return wrap;
  }

  function render() {
    const query = searchInput!.value.trim().toLowerCase();
    const sortBy = sortSelect!.value;

    let filtered = issues.filter(
      (i) => !query || `${i.title ?? ''} ${i.summary ?? ''}`.toLowerCase().includes(query),
    );

    if (sortBy === 'oldest') filtered = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    else if (sortBy === 'title')
      filtered = [...filtered].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    else filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    countEl!.textContent = `${filtered.length} issue${filtered.length === 1 ? '' : 's'}`;
    list!.textContent = '';

    if (filtered.length === 0) {
      emptyMessage!.hidden = false;
      return;
    }
    emptyMessage!.hidden = true;

    // Date sorts keep the year groupings (they're already date-ordered
    // within and across groups); the title sort cuts across years, so it
    // renders as one flat list instead of a grouping that would no longer
    // make sense.
    if (sortBy === 'newest' || sortBy === 'oldest') {
      const groups = new Map<string, Issue[]>();
      for (const issue of filtered) {
        groups.set(issue.year, [...(groups.get(issue.year) ?? []), issue]);
      }
      for (const [year, entries] of groups) {
        list!.appendChild(buildYearGroup(year, entries));
      }
    } else {
      const ul = document.createElement('ul');
      ul.className = 'space-y-4';
      filtered.forEach((issue) => ul.appendChild(buildItem(issue)));
      list!.appendChild(ul);
    }
  }

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
}

export function initNewsletterSearch(): void {
  onPageReady(bindNewsletterSearch);
}
