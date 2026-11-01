// Gesetzliche Feiertage in Deutschland, berechnet pro Jahr und Bundesland.
// Alle Datumswerte sind UTC-Mitternacht, damit Zeitzonen keine Rolle spielen.

export const STATES = [
  { code: 'BW', name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  { code: 'BY', name: 'Bayern', slug: 'bayern' },
  { code: 'BE', name: 'Berlin', slug: 'berlin' },
  { code: 'BB', name: 'Brandenburg', slug: 'brandenburg' },
  { code: 'HB', name: 'Bremen', slug: 'bremen' },
  { code: 'HH', name: 'Hamburg', slug: 'hamburg' },
  { code: 'HE', name: 'Hessen', slug: 'hessen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern', slug: 'mecklenburg-vorpommern' },
  { code: 'NI', name: 'Niedersachsen', slug: 'niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen', slug: 'nordrhein-westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz', slug: 'rheinland-pfalz' },
  { code: 'SL', name: 'Saarland', slug: 'saarland' },
  { code: 'SN', name: 'Sachsen', slug: 'sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt', slug: 'sachsen-anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein', slug: 'schleswig-holstein' },
  { code: 'TH', name: 'Thüringen', slug: 'thueringen' },
];

// Pseudo-Bundesland für "nur bundesweite Feiertage".
export const NATIONWIDE = { code: 'DE', name: 'Deutschland (bundesweit)', slug: 'deutschland' };

const DAY = 864e5;
export const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
export const addDays = (date, n) => new Date(date.getTime() + n * DAY);
export const iso = (date) => date.toISOString().slice(0, 10);

// Ostersonntag nach der anonymen gregorianischen Osterformel (Meeus/Jones/Butcher).
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

// Buß- und Bettag: der letzte Mittwoch vor dem 23. November.
export function repentanceDay(year) {
  let d = utc(year, 11, 22);
  while (d.getUTCDay() !== 3) d = addDays(d, -1);
  return d;
}

const ALL = null; // gilt in allen Bundesländern

// counted: fließt in die Brückentage-Berechnung ein.
// note: Hinweis, der auf der Seite angezeigt wird.
function definitions(year) {
  const easter = easterSunday(year);
  return [
    { name: 'Neujahr', date: utc(year, 1, 1), states: ALL },
    { name: 'Heilige Drei Könige', date: utc(year, 1, 6), states: ['BW', 'BY', 'ST'] },
    { name: 'Internationaler Frauentag', date: utc(year, 3, 8), states: ['BE', 'MV'] },
    { name: 'Karfreitag', date: addDays(easter, -2), states: ALL },
    { name: 'Ostermontag', date: addDays(easter, 1), states: ALL },
    { name: 'Tag der Arbeit', date: utc(year, 5, 1), states: ALL },
    { name: 'Christi Himmelfahrt', date: addDays(easter, 39), states: ALL },
    { name: 'Pfingstmontag', date: addDays(easter, 50), states: ALL },
    { name: 'Fronleichnam', date: addDays(easter, 60), states: ['BW', 'BY', 'HE', 'NW', 'RP', 'SL'] },
    {
      name: 'Fronleichnam', date: addDays(easter, 60), states: ['SN', 'TH'], counted: false,
      note: 'nur in einzelnen Gemeinden, nicht landesweit',
    },
    { name: 'Mariä Himmelfahrt', date: utc(year, 8, 15), states: ['SL'] },
    {
      name: 'Mariä Himmelfahrt', date: utc(year, 8, 15), states: ['BY'],
      note: 'in Gemeinden mit überwiegend katholischer Bevölkerung',
    },
    { name: 'Weltkindertag', date: utc(year, 9, 20), states: ['TH'] },
    { name: 'Tag der Deutschen Einheit', date: utc(year, 10, 3), states: ALL },
    {
      name: 'Reformationstag', date: utc(year, 10, 31),
      states: ['BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH'],
    },
    { name: 'Allerheiligen', date: utc(year, 11, 1), states: ['BW', 'BY', 'NW', 'RP', 'SL'] },
    { name: 'Buß- und Bettag', date: repentanceDay(year), states: ['SN'] },
    { name: '1. Weihnachtstag', date: utc(year, 12, 25), states: ALL },
    { name: '2. Weihnachtstag', date: utc(year, 12, 26), states: ALL },
  ];
}

// Alle Feiertage eines Jahres für ein Bundesland ('DE' = nur bundesweite).
export function holidays(year, stateCode) {
  return definitions(year)
    .filter((h) => (stateCode === 'DE' ? h.states === ALL : h.states === ALL || h.states.includes(stateCode)))
    .map((h) => ({ name: h.name, date: h.date, counted: h.counted !== false, note: h.note || null }))
    .sort((a, b) => a.date - b.date);
}

export const isWeekend = (date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
