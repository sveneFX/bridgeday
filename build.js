// Erzeugt die statische Website in ./dist
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { config } from './src/config.js';
import {
  STATES, statePage, yearPage, homePage, imprintPage, privacyPage, notFoundPage,
} from './src/pages.js';

const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
if (existsSync('public')) cpSync('public', OUT, { recursive: true });

// Interne Links um den Unterordner ergänzen (z. B. /bridgeday auf github.io).
const base = config.basePath;
const withBase = (html) => (base
  ? html.replace(/(href|src)="\//g, `$1="${base}/`).replace(/location\.href='\//g, `location.href='${base}/`)
  : html);

const sitemap = [];
function writePage({ path, html }, { inSitemap = true, priority = '0.6' } = {}) {
  const file = path === '/404' ? join(OUT, '404.html') : join(OUT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, withBase(html));
  if (inSitemap) sitemap.push({ path, priority });
}

writePage(homePage(), { priority: '1.0' });
for (const year of config.years) {
  writePage(yearPage(year), { priority: year === config.focusYear ? '0.9' : '0.7' });
  for (const state of STATES) {
    const page = statePage(year, state);
    writePage(page, { priority: year === config.focusYear ? '0.8' : '0.6' });
    writeFileSync(join(OUT, page.path, `feiertage-${year}-${state.slug}.ics`), page.ics);
  }
}
writePage(imprintPage(), { inSitemap: false });
writePage(privacyPage(), { inSitemap: false });
writePage(notFoundPage(), { inSitemap: false });

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((p) => `  <url><loc>${config.siteUrl}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
if (config.adsense.enabled) {
  const pub = config.adsense.client.replace('ca-', '');
  writeFileSync(join(OUT, 'ads.txt'), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
}

const todos = Object.values(config.imprint).filter((v) => v.startsWith('TODO')).length;
console.log(`Fertig: ${sitemap.length} Seiten in ./${OUT}`);
if (todos) console.warn(`WARNUNG: ${todos} Impressumsangaben in src/config.js fehlen noch.`);
