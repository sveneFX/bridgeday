# Brückentage-Planer

Statische Website mit Brückentage-Tipps und Feiertagen für alle 16 Bundesländer, 2026 bis 2028.
Keine Abhängigkeiten, kein Server: `node build.js` erzeugt fertiges HTML in `dist/`.

## Befehle

```bash
npm run build   # Seiten nach dist/ erzeugen
npm test        # Feiertags- und Brückentage-Berechnung prüfen
```

## Hosting auf GitHub Pages

Der Workflow `.github/workflows/pages.yml` testet, baut und veröffentlicht bei jedem Push auf `main`
(und monatlich automatisch). Einmalig einschalten: Settings → Pages → Source: **GitHub Actions**.

Adresse und Unterordner (`SITE_URL`, `BASE_PATH`) setzt der Workflow selbst. Mit eigener Domain
(Settings → Pages → Custom domain) liegt die Seite im Hauptverzeichnis, das passt sich automatisch an.

## Vor dem Livegang

1. Impressumsangaben in `src/config.js` ausfüllen (sonst warnt der Build).
2. Datenschutzerklärung prüfen (`src/pages.js`, `privacyPage`); sie ist ein Entwurf, keine Rechtsberatung.
3. In AdSense die Website hinzufügen und die Mitteilung für EU-Vorschriften auch für diese Domain veröffentlichen.
4. Sitemap in der Google Search Console einreichen.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `src/holidays.js` | Feiertage pro Jahr und Bundesland (Osterformel, Buß- und Bettag) |
| `src/bridges.js` | Suche nach Brückentagen und Top-Tipps |
| `src/pages.js` | Startseite, Jahresübersicht, Bundesland-Seiten, Rechtliches, .ics-Kalender |
| `src/layout.js` | HTML-Gerüst, Consent-Standard, AdSense, strukturierte Daten |
| `src/config.js` | Domain, Jahre, AdSense, Impressum |
| `build.js` | Erzeugt `dist/` inkl. Sitemap, robots.txt, ads.txt |

Neues Jahr ergänzen: in `src/config.js` bei `years` anhängen und `focusYear` anpassen.
