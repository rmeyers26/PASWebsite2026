// Minimal RFC 5545 (iCalendar) helpers for parsing a Bookwhen-style public
// .ics feed at build time. Pulled out of asig.astro so the fiddly
// unfolding/unescaping/timezone logic is isolated and easy to reason about
// in one place, without pulling in a full ICS library for a static site
// that only ever reads one feed.
//
// DTEND is intentionally not parsed — AsigMeeting has no field for it and
// asig.astro never displays an end time.

export interface AsigMeeting {
  summary: string;
  start: Date;
  allDay: boolean;
  location?: string;
}

export function unfoldIcs(raw: string): string {
  // RFC 5545 line folding: a line starting with a space/tab continues the
  // previous line. Must be undone before any field can be parsed reliably.
  // Bare '\r' (old Mac line endings) is normalized alongside '\r\n' so
  // folding is detected correctly regardless of the feed's line endings.
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');
}

// Bounded at the matching END:VEVENT so a block can never include fields
// from a later event — a plain `split('BEGIN:VEVENT')` runs each block to
// EOF, which only "works" because each field regex grabs the first match.
export function splitVEvents(text: string): string[] {
  return text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
}

// RFC 5545 TEXT escaping: \\ \; \, and \n/\N. A single-pass regex avoids the
// classic order-dependency bug of unescaping with sequential .replace() calls
// (e.g. unescaping \\, before \\ would turn a literal "\\," into ",").
export function unescapeIcsText(value: string): string {
  return value.replace(/\\(n|N|;|,|\\)/g, (_, ch: string) => (ch === 'n' || ch === 'N' ? '\n' : ch));
}

// `params` is the raw property-parameter fragment between the property name
// and the value, e.g. ";TZID=America/Phoenix" or ";VALUE=DATE" — pass the
// text between "DTSTART" and the first ":" on the line.
export function parseIcsDate(value: string, params: string, allDay: boolean): Date {
  const y = Number(value.slice(0, 4));
  const mo = Number(value.slice(4, 6)) - 1;
  const d = Number(value.slice(6, 8));

  const isUtc = value.endsWith('Z') || /TZID=UTC/i.test(params);
  const tzidMatch = params.match(/TZID=([^;:]+)/i);
  const isPhoenix = !tzidMatch || /America\/Phoenix/i.test(tzidMatch[1]);

  if (!isUtc && !isPhoenix) {
    console.warn(`ics: unrecognized TZID "${tzidMatch?.[1]}", treating as America/Phoenix`);
  }

  // Arizona doesn't observe DST, so America/Phoenix is a fixed UTC-7 — no
  // timezone database needed to convert this correctly. Both branches build
  // an absolute UTC instant that represents Phoenix wall-clock time, so
  // display code can always format with timeZone: 'America/Phoenix' and get
  // the right y/mo/d back, regardless of which branch produced the Date —
  // an earlier version constructed the all-day branch in the *build
  // server's* local time instead, which silently displayed the wrong day
  // whenever the build ran outside America/Phoenix.
  const offsetHours = isUtc ? 0 : 7;

  if (allDay) return new Date(Date.UTC(y, mo, d, offsetHours, 0, 0));
  const h = Number(value.slice(9, 11));
  const mi = Number(value.slice(11, 13));
  const s = Number(value.slice(13, 15));
  return new Date(Date.UTC(y, mo, d, h + offsetHours, mi, s));
}

export function parseAsigMeetingsFromIcs(icsText: string, opts: { summaryPrefix: RegExp }): AsigMeeting[] {
  const text = unfoldIcs(icsText);
  const meetings: AsigMeeting[] = [];

  for (const block of splitVEvents(text)) {
    const summaryMatch = block.match(/^SUMMARY:(.+)$/m);
    const summary = summaryMatch ? unescapeIcsText(summaryMatch[1].trim()) : undefined;
    if (!summary || !opts.summaryPrefix.test(summary)) continue;

    const dtstartMatch = block.match(/^DTSTART([^:]*):(\d{8}(?:T\d{6})?Z?)/m);
    if (!dtstartMatch) continue;
    const [, params, value] = dtstartMatch;
    const allDay = !value.includes('T');
    const start = parseIcsDate(value, params, allDay);

    const locationMatch = block.match(/^LOCATION:(.+)$/m);
    meetings.push({
      summary: summary.replace(/^ASIG\s*/i, '').trim(),
      start,
      allDay,
      location: locationMatch ? unescapeIcsText(locationMatch[1].trim()) : undefined,
    });
  }

  return meetings;
}
