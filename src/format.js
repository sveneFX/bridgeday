const WEEKDAYS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export const weekday = (d) => WEEKDAYS[d.getUTCDay()];
export const weekdayLong = (d) => WEEKDAYS_LONG[d.getUTCDay()];

// "Fr., 7. Mai" bzw. mit Jahr "Fr., 7. Mai 2027"
export function fmtDate(d, withYear = false) {
  const s = `${weekday(d)}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
  return withYear ? `${s} ${d.getUTCFullYear()}` : s;
}

export function fmtRange(a, b) {
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  return `${fmtDate(a, !sameYear)} – ${fmtDate(b, true)}`;
}

// Urlaubstage kompakt: aufeinanderfolgende Tage als "Mo., 3. – Fr., 7. Mai"
export function fmtVacation(dates) {
  if (dates.length === 0) return 'kein Urlaubstag nötig';
  const runs = [];
  let run = [dates[0]];
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] - dates[i - 1] === 864e5) run.push(dates[i]);
    else { runs.push(run); run = [dates[i]]; }
  }
  runs.push(run);
  return runs
    .map((r) => (r.length === 1 ? fmtDate(r[0]) : `${fmtDate(r[0])} bis ${fmtDate(r[r.length - 1])}`))
    .join(' und ');
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
