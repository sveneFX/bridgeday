import { config } from './config.js';
import { esc } from './format.js';

// Consent-Standard nur dort "abgelehnt", wo Googles Banner erscheint (EWR, UK, CH).
const CONSENT_REGIONS = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IS',
  'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'GB', 'CH'];

function headScripts() {
  const parts = [`<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(CONSENT_REGIONS)}});
gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});
</script>`];
  if (config.adsense.enabled) {
    parts.push(`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsense.client}" crossorigin="anonymous"></script>`);
  }
  if (config.analyticsId) {
    parts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}"></script>
<script>gtag('js', new Date()); gtag('config', '${config.analyticsId}');</script>`);
  }
  return parts.join('\n');
}

export function layout({ title, description, path, body, jsonLd = [], noindex = false }) {
  const url = config.siteUrl + path;
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const yearLinks = config.years.map((y) => `<a href="/${y}/">${y}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
${headScripts()}
${ld}
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/"><span class="logo" aria-hidden="true">🌉</span> ${esc(config.siteName)}</a>
    <nav class="years" aria-label="Jahre">${yearLinks}</nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p>Alle Angaben ohne Gewähr. Regionale Feiertage können je nach Gemeinde abweichen.</p>
    <p><a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></p>
  </div>
</footer>
</body>
</html>
`;
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: config.siteUrl + it.path,
    })),
  };
}

export function faqLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
