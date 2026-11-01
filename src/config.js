// Zentrale Einstellungen. Vor dem Livegang die TODO-Felder ausfüllen.
export const config = {
  siteName: 'Brückentage-Planer',
  // Volle Adresse ohne abschließenden Schrägstrich. Auf GitHub Pages setzt der Workflow
  // SITE_URL und BASE_PATH automatisch (mit eigener Domain ist BASE_PATH leer).
  siteUrl: (process.env.SITE_URL || 'https://svenefx.github.io/bridgeday').replace(/\/$/, ''),
  basePath: (process.env.BASE_PATH || '').replace(/\/$/, ''),
  years: [2026, 2027, 2028],
  focusYear: 2027,

  adsense: {
    enabled: true,
    client: 'ca-pub-6284350776113755',
  },
  analyticsId: '', // z. B. 'G-XXXXXXX', leer = kein Google Analytics

  // Pflichtangaben für das Impressum (§ 5 DDG). Ohne diese Angaben nicht live schalten.
  imprint: {
    name: 'TODO: Vor- und Nachname',
    street: 'TODO: Straße und Hausnummer',
    city: 'TODO: PLZ und Ort',
    email: 'TODO: E-Mail-Adresse',
  },
};
