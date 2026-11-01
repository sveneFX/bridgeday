// Findet Brückentage: Zeiträume, in denen wenige Urlaubstage viele freie Tage ergeben.
import { holidays, addDays, iso, isWeekend } from './holidays.js';

const MAX_VACATION = 9; // mehr Urlaubstage sind kein "Brückentag" mehr
const MAX_SPAN = 23;
const MAX_OPTIONS_PER_GROUP = 3;

function holidayMap(year, stateCode) {
  const map = new Map();
  for (const y of [year - 1, year, year + 1]) {
    for (const h of holidays(y, stateCode)) {
      if (h.counted) map.set(iso(h.date), h.name);
    }
  }
  return map;
}

// Liefert die Brückentage-Chancen eines Jahres, gruppiert nach Feiertag.
// Jede Gruppe enthält bis zu 3 Optionen: mehr Urlaubstage ergeben jeweils deutlich mehr freie Tage.
export function findBridges(year, stateCode) {
  const hol = holidayMap(year, stateCode);
  const isFree = (d) => isWeekend(d) || hol.has(iso(d));
  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);

  const windows = [];
  for (let s = new Date(yearStart - 20 * 864e5); s.getTime() <= yearEnd; s = addDays(s, 1)) {
    // Ein Zeitraum beginnt an einem freien Tag direkt nach einem Arbeitstag.
    if (!isFree(s) || isFree(addDays(s, -1))) continue;
    let vac = 0;
    const vacationDays = [];
    for (let len = 1; len <= MAX_SPAN; len++) {
      const e = addDays(s, len - 1);
      if (!isFree(e)) {
        vac++;
        vacationDays.push(e);
        if (vac > MAX_VACATION) break;
        continue;
      }
      // ... und endet an einem freien Tag direkt vor einem Arbeitstag.
      if (isFree(addDays(e, 1))) continue;
      const weekdayHolidays = [];
      for (let i = 0; i < len; i++) {
        const d = addDays(s, i);
        const t = d.getTime();
        if (t >= yearStart && t <= yearEnd && !isWeekend(d) && hol.has(iso(d))) {
          weekdayHolidays.push({ date: d, name: hol.get(iso(d)) });
        }
      }
      if (weekdayHolidays.length === 0) continue;
      windows.push({
        start: s,
        end: e,
        freeDays: len,
        vacationDays: vac,
        vacationDates: [...vacationDays],
        holidays: weekdayHolidays,
      });
    }
  }

  // Gruppieren nach dem ersten Feiertag im Zeitraum.
  const groups = new Map();
  for (const w of windows) {
    const key = iso(w.holidays[0].date);
    if (!groups.has(key)) groups.set(key, { anchor: w.holidays[0], windows: [] });
    groups.get(key).windows.push(w);
  }

  const result = [];
  for (const g of groups.values()) {
    // Pro Anzahl Urlaubstage nur die längste Option, dann nur echte Verbesserungen behalten.
    const byVac = new Map();
    for (const w of g.windows) {
      const best = byVac.get(w.vacationDays);
      if (!best || w.freeDays > best.freeDays || (w.freeDays === best.freeDays && w.start < best.start)) {
        byVac.set(w.vacationDays, w);
      }
    }
    const options = [];
    let lastFree = 0;
    for (const vac of [...byVac.keys()].sort((a, b) => a - b)) {
      const w = byVac.get(vac);
      if (w.freeDays <= lastFree) continue;
      // Ein einzelner Feiertag ohne Wochenende ist keine Brückentage-Chance.
      if (w.vacationDays === 0 && w.freeDays < 3) continue;
      // Eine zusätzliche Option muss pro extra Urlaubstag mindestens 1,5 freie Tage bringen.
      if (options.length > 0) {
        const prev = options[options.length - 1];
        const gain = (w.freeDays - prev.freeDays) / (w.vacationDays - prev.vacationDays);
        if (gain < 1.5) continue;
      }
      options.push(w);
      lastFree = w.freeDays;
      if (options.length >= MAX_OPTIONS_PER_GROUP) break;
    }
    if (options.length) result.push({ anchor: g.anchor, options });
  }
  return result.sort((a, b) => a.anchor.date - b.anchor.date);
}

// Effizienz: freie Tage pro Urlaubstag (nur Optionen mit Urlaub).
export const efficiency = (o) => (o.vacationDays === 0 ? Infinity : o.freeDays / o.vacationDays);

export function topTips(groups, n = 5) {
  return groups
    .flatMap((g) => g.options)
    .filter((o) => o.vacationDays > 0)
    .sort((a, b) => efficiency(b) - efficiency(a) || b.freeDays - a.freeDays || a.start - b.start)
    .slice(0, n);
}
