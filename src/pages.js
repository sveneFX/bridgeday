import { config } from './config.js';
import { STATES, NATIONWIDE, holidays, isWeekend, iso } from './holidays.js';
import { findBridges, topTips } from './bridges.js';
import { fmtDate, fmtRange, fmtVacation, plural, esc, weekdayLong } from './format.js';
import { layout, breadcrumbLd, faqLd } from './layout.js';

export const statePath = (year, state) => `/${year}/${state.slug}/`;

function optionText(o) {
  if (o.vacationDays === 0) return `<strong>${o.freeDays} Tage frei ohne Urlaub</strong>`;
  return `<strong>${plural(o.vacationDays, 'Urlaubstag', 'Urlaubstage')} → ${o.freeDays} Tage frei</strong>`;
}

function tipCard(o) {
  const hol = o.holidays.map((h) => esc(h.name)).join(', ');
  return `<li class="tip">
  <div class="tip-ratio">${o.vacationDays} <span>→</span> ${o.freeDays}</div>
  <div>
    ${optionText(o)}<br>
    <span class="muted">Frei: ${fmtRange(o.start, o.end)}</span><br>
    Urlaub nehmen: ${fmtVacation(o.vacationDates)}<br>
    <span class="tag">${hol}</span>
  </div>
</li>`;
}

function bridgeList(groups) {
  if (groups.length === 0) return '<p>In diesem Jahr gibt es keine Feiertage an Werktagen, die sich verlängern lassen.</p>';
  return groups.map((g) => `<section class="bridge">
  <h3>${esc(g.anchor.name)} <span class="muted">· ${fmtDate(g.anchor.date)}</span></h3>
  <ul>${g.options.map((o) => `<li>${optionText(o)}: ${fmtRange(o.start, o.end)}<br><span class="muted">Urlaub: ${fmtVacation(o.vacationDates)}</span></li>`).join('')}</ul>
</section>`).join('\n');
}

function holidayTable(list) {
  const rows = list.map((h) => `<tr class="${isWeekend(h.date) ? 'weekend' : ''}">
  <td>${fmtDate(h.date)}</td><td>${esc(h.name)}${h.note ? `<br><span class="muted">${esc(h.note)}</span>` : ''}</td><td>${weekdayLong(h.date)}</td></tr>`).join('');
  return `<table class="holidays"><thead><tr><th>Datum</th><th>Feiertag</th><th>Wochentag</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function stats(year, code) {
  const list = holidays(year, code);
  const counted = list.filter((h) => h.counted);
  const weekdays = counted.filter((h) => !isWeekend(h.date));
  const groups = findBridges(year, code);
  const tips = topTips(groups, 5);
  return { list, counted, weekdays, groups, tips };
}

function jumpForm(selectedYear) {
  const years = config.years.map((y) => `<option value="${y}"${y === selectedYear ? ' selected' : ''}>${y}</option>`).join('');
  const states = STATES.map((s) => `<option value="${s.slug}">${esc(s.name)}</option>`).join('');
  return `<form class="jump" onsubmit="location.href='/'+this.y.value+'/'+this.s.value+'/';return false;">
  <label>Bundesland <select name="s">${states}</select></label>
  <label>Jahr <select name="y">${years}</select></label>
  <button type="submit">Brückentage anzeigen</button>
</form>`;
}

// ---------- Bundesland-Seite ----------
export function statePage(year, state) {
  const { list, counted, weekdays, groups, tips } = stats(year, state.code);
  const best = tips[0];
  const path = statePath(year, state);
  const bestText = best
    ? `Der beste Tipp: mit ${plural(best.vacationDays, 'Urlaubstag', 'Urlaubstagen')} ${best.freeDays} Tage am Stück frei (${fmtRange(best.start, best.end)}).`
    : '';
  const title = `Brückentage ${year} in ${state.name}: alle Tipps & Feiertage`;
  const description = `Brückentage ${year} in ${state.name}: ${counted.length} Feiertage, davon ${weekdays.length} an Werktagen. ${bestText}`.slice(0, 160);

  const faq = [
    {
      q: `Wie viele Feiertage hat ${state.name} ${year}?`,
      a: `${state.name} hat ${year} ${counted.length} landesweite gesetzliche Feiertage, davon fallen ${weekdays.length} auf einen Werktag (Montag bis Freitag).`,
    },
  ];
  if (best) {
    faq.push({
      q: `Welcher Brückentag lohnt sich ${year} in ${state.name} am meisten?`,
      a: `Mit ${plural(best.vacationDays, 'Urlaubstag', 'Urlaubstagen')} (${fmtVacation(best.vacationDates)}) haben Sie ${best.freeDays} Tage am Stück frei, von ${fmtRange(best.start, best.end)}.`,
    });
  }
  const totalVac = tips.reduce((n, o) => n + o.vacationDays, 0);
  const totalFree = tips.reduce((n, o) => n + o.freeDays, 0);
  if (tips.length > 1) {
    faq.push({
      q: `Wie viele freie Tage bringen die Brückentage ${year} in ${state.name}?`,
      a: `Die ${tips.length} besten Brückentage-Tipps ergeben zusammen ${totalFree} freie Tage für ${totalVac} Urlaubstage.`,
    });
  }

  const otherYears = config.years.filter((y) => y !== year)
    .map((y) => `<a href="${statePath(y, state)}">Brückentage ${y} ${esc(state.name)}</a>`).join(' · ');
  const otherStates = STATES.filter((s) => s.code !== state.code)
    .map((s) => `<a href="${statePath(year, s)}">${esc(s.name)}</a>`).join(' · ');

  const body = `
<nav class="crumbs"><a href="/">Start</a> › <a href="/${year}/">${year}</a> › ${esc(state.name)}</nav>
<h1>Brückentage ${year} in ${esc(state.name)}</h1>
<p class="lead">${esc(state.name)} hat ${year} ${counted.length} gesetzliche Feiertage, ${weekdays.length} davon an Werktagen. ${bestText}</p>

<h2>Die besten Tipps ${year}</h2>
${tips.length ? `<ol class="tips">${tips.map(tipCard).join('')}</ol>` : '<p>Keine Tipps für dieses Jahr.</p>'}

<h2>Alle Brückentage ${year} in ${esc(state.name)}</h2>
<p class="muted">Pro Feiertag bis zu drei Varianten: mehr Urlaubstage bringen jeweils deutlich mehr freie Tage.</p>
${bridgeList(groups)}

<h2>Feiertage ${year} in ${esc(state.name)}</h2>
${holidayTable(list)}
<p><a class="button" href="${path}feiertage-${year}-${state.slug}.ics" download>Feiertage in den Kalender (.ics)</a></p>

<h2>Häufige Fragen</h2>
${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n')}

<h2>Weitere Bundesländer und Jahre</h2>
<p>${otherYears}</p>
<p class="links">${otherStates}</p>
`;
  return {
    path,
    html: layout({
      title, description, path, body,
      jsonLd: [
        breadcrumbLd([{ name: 'Start', path: '/' }, { name: String(year), path: `/${year}/` }, { name: state.name, path }]),
        faqLd(faq),
      ],
    }),
    ics: icsFile(year, state, list),
  };
}

// ---------- Jahres-Übersicht ----------
export function yearPage(year) {
  const path = `/${year}/`;
  const de = stats(year, 'DE');
  const rows = STATES.map((s) => {
    const st = stats(year, s.code);
    const b = st.tips[0];
    return `<tr><td><a href="${statePath(year, s)}">${esc(s.name)}</a></td><td>${st.counted.length}</td><td>${st.weekdays.length}</td>
<td>${b ? `${b.vacationDays} → ${b.freeDays} Tage (${fmtDate(b.start)})` : '–'}</td></tr>`;
  }).join('');
  const body = `
<nav class="crumbs"><a href="/">Start</a> › ${year}</nav>
<h1>Brückentage ${year} in Deutschland</h1>
<p class="lead">Alle Bundesländer im Vergleich: Feiertage ${year}, wie viele davon auf Werktage fallen und der jeweils beste Brückentag.</p>
${jumpForm(year)}
<h2>Bundesweite Tipps ${year}</h2>
<p class="muted">Diese Brückentage gelten in allen Bundesländern.</p>
${de.tips.length ? `<ol class="tips">${de.tips.map(tipCard).join('')}</ol>` : ''}
<h2>Alle Bundesländer ${year}</h2>
<div class="table-scroll"><table><thead><tr><th>Bundesland</th><th>Feiertage</th><th>an Werktagen</th><th>Bester Tipp</th></tr></thead><tbody>${rows}</tbody></table></div>
`;
  return {
    path,
    html: layout({
      title: `Brückentage ${year}: alle Bundesländer im Überblick`,
      description: `Brückentage ${year} in Deutschland: Feiertage pro Bundesland, die besten Tipps und wie Sie mit wenig Urlaub viele freie Tage bekommen.`,
      path, body,
      jsonLd: [breadcrumbLd([{ name: 'Start', path: '/' }, { name: String(year), path }])],
    }),
  };
}

// ---------- Startseite ----------
export function homePage() {
  const year = config.focusYear;
  const de = stats(year, 'DE');
  const grid = STATES.map((s) => `<li><span>${esc(s.name)}</span> ${config.years.map((y) => `<a href="${statePath(y, s)}">${y}</a>`).join(' ')}</li>`).join('');
  const faq = [
    { q: 'Was ist ein Brückentag?', a: 'Ein Brückentag ist ein Arbeitstag zwischen einem Feiertag und dem Wochenende. Wer an diesem Tag Urlaub nimmt, bekommt mit wenig Urlaub mehrere freie Tage am Stück.' },
    { q: 'Wie werden die Tipps berechnet?', a: 'Für jedes Bundesland werden alle gesetzlichen Feiertage berechnet und die Zeiträume gesucht, in denen ein bis neun Urlaubstage möglichst viele zusammenhängende freie Tage ergeben. Samstage zählen als arbeitsfrei.' },
    { q: 'Gelten die Feiertage überall im Bundesland?', a: 'Die Berechnung nutzt landesweite Feiertage. Regionale Feiertage, etwa Fronleichnam in einzelnen Gemeinden in Sachsen und Thüringen oder das Augsburger Friedensfest, sind nicht eingerechnet.' },
  ];
  const body = `
<h1>Brückentage ${year}: mit wenig Urlaub viele freie Tage</h1>
<p class="lead">Wählen Sie Ihr Bundesland und sehen Sie sofort, an welchen Tagen sich Urlaub ${year} am meisten lohnt: mit Datum, Anzahl Urlaubstage und freien Tagen am Stück.</p>
${jumpForm(year)}
<h2>Die besten Brückentage ${year} in ganz Deutschland</h2>
${de.tips.length ? `<ol class="tips">${de.tips.map(tipCard).join('')}</ol>` : ''}
<p><a href="/${year}/">Alle Bundesländer ${year} im Vergleich →</a></p>
<h2>Brückentage nach Bundesland</h2>
<ul class="state-grid">${grid}</ul>
<h2>Häufige Fragen</h2>
${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n')}
`;
  return {
    path: '/',
    html: layout({
      title: `Brückentage ${year} – Urlaub clever planen | ${config.siteName}`,
      description: `Brückentage ${year} für alle 16 Bundesländer: mit wenig Urlaubstagen möglichst viele freie Tage. Alle Feiertage, Tipps und Kalender-Download.`,
      path: '/', body,
      jsonLd: [faqLd(faq), { '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.siteUrl }],
    }),
  };
}

// ---------- Rechtliches ----------
export function imprintPage() {
  const i = config.imprint;
  const body = `<h1>Impressum</h1>
<p>Angaben gemäß § 5 DDG</p>
<p>${esc(i.name)}<br>${esc(i.street)}<br>${esc(i.city)}</p>
<p>E-Mail: ${esc(i.email)}</p>
<h2>Haftung für Inhalte</h2>
<p>Die Feiertage und Brückentage werden automatisch berechnet und sorgfältig geprüft. Eine Gewähr für Richtigkeit und Vollständigkeit wird nicht übernommen.</p>`;
  return { path: '/impressum/', html: layout({ title: 'Impressum', description: 'Impressum', path: '/impressum/', body, noindex: true }) };
}

export function privacyPage() {
  const i = config.imprint;
  const body = `<h1>Datenschutzerklärung</h1>
<h2>Verantwortlicher</h2>
<p>${esc(i.name)}, ${esc(i.street)}, ${esc(i.city)}, ${esc(i.email)}</p>
<h2>Hosting</h2>
<p>Diese Website wird bei Cloudflare, Inc. gehostet. Beim Aufruf der Seiten verarbeitet Cloudflare technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit des Abrufs, um die Seite auszuliefern und vor Angriffen zu schützen (Art. 6 Abs. 1 lit. f DSGVO).</p>
<h2>Werbung mit Google AdSense</h2>
<p>Diese Website zeigt Werbung von Google AdSense (Google Ireland Limited). Google kann dabei Cookies setzen und Daten verarbeiten, um Anzeigen auszuliefern und zu messen. Personalisierte Werbung und Cookies werden nur nach Ihrer Einwilligung über das Einwilligungsbanner genutzt (Art. 6 Abs. 1 lit. a DSGVO, § 25 TDDDG). Ihre Einwilligung können Sie jederzeit über den Link zu den Datenschutzeinstellungen im Banner widerrufen.</p>
<h2>Einwilligungsverwaltung</h2>
<p>Für die Einholung der Einwilligung nutzen wir die Einwilligungslösung von Google (Google Ireland Limited).</p>
${config.analyticsId ? '<h2>Google Analytics</h2><p>Mit Ihrer Einwilligung nutzen wir Google Analytics, um die Nutzung der Website statistisch auszuwerten.</p>' : ''}
<h2>Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde.</p>`;
  return { path: '/datenschutz/', html: layout({ title: 'Datenschutz', description: 'Datenschutzerklärung', path: '/datenschutz/', body, noindex: true }) };
}

export function notFoundPage() {
  const body = `<h1>Seite nicht gefunden</h1><p>Diese Seite gibt es nicht. Zur <a href="/">Startseite</a> oder zu den <a href="/${config.focusYear}/">Brückentagen ${config.focusYear}</a>.</p>`;
  return { path: '/404', html: layout({ title: 'Seite nicht gefunden', description: 'Seite nicht gefunden', path: '/404', body, noindex: true }) };
}

// ---------- Kalender-Datei ----------
function icsFile(year, state, list) {
  const host = new URL(config.siteUrl).host;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const events = list.map((h) => {
    const start = iso(h.date).replace(/-/g, '');
    const next = new Date(h.date.getTime() + 864e5);
    const end = iso(next).replace(/-/g, '');
    const summary = h.note ? `${h.name} (${h.note})` : h.name;
    return ['BEGIN:VEVENT', `UID:${start}-${state.code}-${h.name.replace(/\W/g, '')}@${host}`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${summary}`, 'TRANSP:TRANSPARENT', 'END:VEVENT'].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${config.siteName}//DE`, 'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:Feiertage ${year} ${state.name}`, ...events, 'END:VCALENDAR', ''].join('\r\n');
}

export { STATES, NATIONWIDE };
