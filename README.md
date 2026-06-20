# Medicare – Nadim Nauroz & Farhad Ramazani

Statische Website (HTML/CSS/JS, ohne Build-Tools) für das gemeinsame Pflegeangebot
von **Nadim Nauroz** & **Farhad Ramazani** innerhalb von **Medicare Hamburg**
(MBD Medicare Brigitte Dornia GmbH & Co. KG). „Wir"-Ansprache, echte Medicare-CI,
seniorenfreundlich, barrierearm (WCAG-AA-Kontraste), DSGVO-bewusst.

## ⚠️ Wartungsmodus aktiv (vor Go-Live entfernen!)
Alle Inhaltsseiten sind aktuell durch ein **Zugangs-Gate** geschützt.
**Code: `MEDICARE`** (Eingabe wird im Browser gemerkt). Impressum & Datenschutz
bleiben frei erreichbar. Das Gate ist ein Inline-Script im `<head>` jeder Seite.
**Zum Live-Gang muss es entfernt werden** (sage Bescheid – ich entferne es per Skript).

## Mehrsprachige Lese-Ansicht (Sprach-Umschalter)
Im Header gibt es einen **Sprach-Umschalter** (Globus-Symbol). Verfügbar:
**Deutsch (Standard) · English · Türkçe · Русский · فارسی (Persisch/Dari, rechts-nach-links).**
- Technik: `i18n.js` übersetzt zur Laufzeit Textknoten und Attribute (Platzhalter,
  `aria-label`, `alt`, `title`, Seitentitel, Meta-Description) anhand des deutschen
  Quelltextes. Schlüssel = normalisierter deutscher String → Übersetzung in `i18n/<code>.json`.
- **Fehlt eine Übersetzung, bleibt automatisch der deutsche Text stehen** (kein Bruch).
- Markennamen, Eigennamen, Orte, Telefon/E-Mail bleiben unübersetzt.
- Persisch schaltet das Layout per `dir="rtl"` auf rechts-nach-links.
- Auswahl wird im Browser gemerkt (`localStorage` `medicare_lang`); Erstbesucher
  bekommen – falls passend – ihre Browsersprache vorgeschlagen, sonst Deutsch.
- **Rechtstexte (Impressum/Datenschutz) bleiben bewusst deutsch** (rechtlich verbindlich).
- **Übersetzungen pflegen/erweitern:** deutsche Strings stehen in `i18n/_strings.de.json`,
  die Übersetzungen index-gleich in `i18n/<code>.array.json`. Nach Änderungen
  `python3 i18n/_build.py` ausführen – das erzeugt die geladenen `i18n/<code>.json`.

## Markenfarben (exakt aus dem Logo)
- **Teal `#00afb9`** – „Medi", Anker, Header/Hero, Akzente
- **„care"-Blau `#0a6ca9`** – Bänder (Counter/Wechsel), Footer, Icon-Kacheln, Zwischentitel
- CTA-Teal `#0d9488` (solide) · Icon-Kacheln laufen Teal→Blau wie der Schriftzug

## Seiten (Tabs)
- `index.html` – Start: Hero · Empathie · Wechsel · „Was uns unterscheidet" · Leistungen ·
  Über-uns-Teaser · Gebiet · Kennzahlen · Qualität & Sicherheit · Ablauf · Versprechen · FAQ-Teaser · CTA
- `ueber-uns.html` – Intro · Profile · „Auf einen Blick" · Pflegekonzepte/Fachstandards · Werte · Kennzahlen
- `leistungen.html` – Leistungen · Versorgungssicherheit · „So arbeiten wir" · Spektrum ·
  Pflegegeld/Sachleistung · Pflegegrade 2026 · Rechte
- `gebiete.html` – Stadtteil-Checker · „Mitten in Hamburg" · Schwerpunkte (Wilhelmsburg/Harburg)
- `praevention.html` – Vorbeugung laienverständlich (Sturz, Schmerz, Dekubitus, Pneumonie, Kinästhetik, Kontrakturen)
- `faq.html` – Häufige Fragen mit Live-Suche (+ FAQPage-Schema)
- `kontakt.html` – Kontaktformular (Formspree) + Direktkontakt/vCards
- `danke.html` – Bestätigung nach Versand
- `pflegepolitik.html`, `digitalisierung.html` – Themenseiten
- `impressum.html`, `datenschutz.html` – Rechtstexte · `404.html` – Fehlerseite

## Funktionen (script.js)
Mobile-Navigation · FAQ-Akkordeon + Live-Suche · statische Kennzahlen · Scroll-Reveal
(mit Sichtbarkeits-Fallback) · Back-to-Top · Cookie/DSGVO-Hinweis · Anruf-Auswahl
(Nadim/Farhad) · WhatsApp-Auswahl · Stadtteil-Checker · Schriftgrößen-Schalter A+/A−
(gespeichert) · Live-Formularvalidierung · **Formular-Fallback** (leitet auf Telefon/
WhatsApp, solange Formspree nicht eingerichtet ist) · CTA-Bestätigungszeile.
**Sprach-Umschalter** (`i18n.js`, DE/EN/TR/RU/FA, inkl. RTL) – siehe oben.

## Assets
- `logo-white.png` (Header, optimiert), `favicon.svg`, `apple-touch-icon.png`
- `og-image.jpg` – Vorschaubild fürs Teilen (1200×630, ohne Bewertungs-Angabe)
- `foto-team.jpg` (Hero), `IMG_7363.jpeg` (Nadim), `IMG_0631.jpeg` (Farhad) – optimiert
- `i18n/` – Wörterbücher (`en/tr/ru/fa.json`), Quell-Strings & Build-Skript (`_build.py`)
- `fonts/inter-latin.woff2` – selbst gehostete Schrift (DSGVO, kein Google-CDN)
- `nadim-nauroz.vcf`, `farhad-ramazani.vcf` – Visitenkarten zum Speichern
- `IMG_0376–0381`, `logo-color.png`, `logo-white-full.png` – Referenzdateien (nicht eingebunden;
  können vor Go-Live aus dem Repo entfernt werden)

## ✅ Go-Live-Checkliste (nur ihr / GF könnt das)
1. **Wartungsmodus entfernen** (Gate aus allen Seiten) – sonst sieht niemand die Inhalte.
2. **Formspree-ID:** in `kontakt.html` `YOUR_FORM_ID` durch die echte ID ersetzen
   (formspree.io, Ziel-E-Mail `nnauroz@live.de`). Danach submittet das Formular normal.
3. **Impressum/Datenschutz:** durch die GF freigeben; `[BITTE ERGÄNZEN]`-Felder ausfüllen
   (USt-IdNr.; ggf. Datenschutzbeauftragte/r).
4. **Domain:** sobald final, in `canonical`, `og:url`, Schema.org, Sitemap & robots.txt
   die echte absolute Adresse eintragen (aktuell GitHub-Pages-Platzhalter).
5. **Echte Google-Bewertungen (optional, stärkster Vertrauenshebel):** Rezensionen
   sammeln und als Bewertungs-Sektion einbinden lassen.

## Inhalt pflegen (Beträge 2026 – aus euren Unterlagen)
Pflegegeld/Sachleistung: PG2 347/796 · PG3 599/1.497 · PG4 800/1.859 · PG5 990/2.299 €.
Gemeinsamer Jahresbetrag (Verhinderungs-/Kurzzeitpflege): bis 3.539 €.
Bei Gesetzesänderungen die Werte in `leistungen.html` und `pflegepolitik.html` anpassen.

## Hosting
Deploy via Vercel (Push auf den Branch). Rein statisch, keine Server-Logik.
`vercel.json` setzt `Cache-Control: must-revalidate` → Änderungen erscheinen nach
jedem Deploy sofort (kein manuelles Cache-Busting nötig). `.nojekyll` ist gesetzt.
