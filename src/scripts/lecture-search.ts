import { onPageReady } from './utils/lifecycle';

// Progressive enhancement: the page above is already a complete,
// season-grouped list with no JS required. This script re-renders
// #lecture-list from the embedded #lecture-data JSON whenever the
// search box or sort dropdown changes, building nodes with the DOM API
// (not innerHTML) since lecture titles/speakers come from CMS-edited
// content and shouldn't be parsed as markup.
type Lecture = {
  date: string;
  title: string;
  speaker: string;
  affiliation?: string;
  summary?: string;
  videoUrl?: string;
  displayDate: string;
  season: string;
};

function bindLectureSearch() {
  const dataEl = document.getElementById('lecture-data');
  const searchInput = document.getElementById('lecture-search') as HTMLInputElement | null;
  const sortSelect = document.getElementById('lecture-sort') as HTMLSelectElement | null;
  const list = document.getElementById('lecture-list');
  const emptyMessage = document.getElementById('lecture-empty');
  const countEl = document.getElementById('lecture-count');
  if (!dataEl || !searchInput || !sortSelect || !list || !emptyMessage || !countEl) return;
  if (searchInput.dataset.enhanced === 'true') return; // astro:page-load can re-run this
  searchInput.dataset.enhanced = 'true';

  const lectures: Lecture[] = JSON.parse(dataEl.textContent ?? '[]');

  function buildItem(lecture: Lecture): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'border-b border-subtle pb-6';

    const titleRow = document.createElement('div');
    titleRow.className = 'flex flex-wrap items-baseline gap-x-3 gap-y-1';
    if (lecture.videoUrl) {
      const a = document.createElement('a');
      a.href = lecture.videoUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'font-semibold text-ink-primary hover:text-nebula-teal';
      a.textContent = `${lecture.title} ↗`;
      titleRow.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'font-semibold text-ink-primary';
      span.textContent = lecture.title;
      titleRow.appendChild(span);
    }
    li.appendChild(titleRow);

    const meta = document.createElement('p');
    meta.className = 'mt-1 text-sm text-ink-muted';
    meta.append(`${lecture.speaker}${lecture.affiliation ? `, ${lecture.affiliation}` : ''} · `);
    const time = document.createElement('time');
    time.dateTime = lecture.date;
    time.textContent = lecture.displayDate;
    meta.appendChild(time);
    li.appendChild(meta);

    if (lecture.summary) {
      const summary = document.createElement('p');
      summary.className = 'mt-2 text-ink-muted';
      summary.textContent = lecture.summary;
      li.appendChild(summary);
    }

    if (!lecture.videoUrl) {
      const note = document.createElement('p');
      note.className = 'mt-2 text-sm italic text-ink-muted';
      note.textContent = 'Recording link coming soon.';
      li.appendChild(note);
    }

    return li;
  }

  function buildSeasonGroup(season: string, entries: Lecture[]): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.className = 'lecture-season';
    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = season;
    wrap.appendChild(heading);
    const ul = document.createElement('ul');
    ul.className = 'mt-6 space-y-6';
    entries.forEach((lecture) => ul.appendChild(buildItem(lecture)));
    wrap.appendChild(ul);
    return wrap;
  }

  function render() {
    const query = searchInput!.value.trim().toLowerCase();
    const sortBy = sortSelect!.value;

    let filtered = lectures.filter(
      (l) => !query || `${l.title} ${l.speaker} ${l.affiliation ?? ''}`.toLowerCase().includes(query),
    );

    if (sortBy === 'oldest') filtered = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    else if (sortBy === 'speaker') filtered = [...filtered].sort((a, b) => a.speaker.localeCompare(b.speaker));
    else if (sortBy === 'title') filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    else filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    countEl!.textContent = `${filtered.length} lecture${filtered.length === 1 ? '' : 's'}`;
    list!.textContent = '';

    if (filtered.length === 0) {
      emptyMessage!.hidden = false;
      return;
    }
    emptyMessage!.hidden = true;

    // Date sorts keep the season groupings (they're already date-ordered
    // within and across groups); name sorts cut across seasons, so they
    // render as one flat list instead of a grouping that would no longer
    // make sense.
    if (sortBy === 'newest' || sortBy === 'oldest') {
      const groups = new Map<string, Lecture[]>();
      for (const lecture of filtered) {
        groups.set(lecture.season, [...(groups.get(lecture.season) ?? []), lecture]);
      }
      for (const [season, entries] of groups) {
        list!.appendChild(buildSeasonGroup(season, entries));
      }
    } else {
      const ul = document.createElement('ul');
      ul.className = 'space-y-6';
      filtered.forEach((lecture) => ul.appendChild(buildItem(lecture)));
      list!.appendChild(ul);
    }
  }

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
}

export function initLectureSearch(): void {
  onPageReady(bindLectureSearch);
}
