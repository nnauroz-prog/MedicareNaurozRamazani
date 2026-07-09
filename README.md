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

## Design-System & Markenfarben (zentrale Tokens in `style.css :root`)
**Original-CI wie medicare-hamburg.de** (Block „v14“ am Ende von `style.css`):
Teal-Header mit **weißem Logo**, Teal-Heros mit zentriertem weißem Text,
Outline-Buttons in Versalien, **Wellen-Übergang** zum weißen Inhalt, Teal-Footer.
Akzente exakt aus dem Logo, als **CSS-Custom-Properties zentral gepflegt** –
eine Quelle der Wahrheit, Markenfarbe ändern = nur hier:
- `--brand-teal: #16A3B4` – Logo-Türkis · große Headlines, Zahlen, Icons, Dekor (Großtext/UI ≥ 3:1)
- `--brand-blue: #0068A7` – Logo-Blau · Text, Links, Buttons (WCAG-AA 5,94:1)
- `--brand-blue-hover: #00527f` – Hover/aktiv (Blau)

> Hinweis CI ↔ Barrierefreiheit: Das **pixelgenaue** Logo-Türkis `#00A8B9` erreicht
> nur 2,88:1 und ist für Text **nicht** WCAG-AA-konform; `#16A3B4` ist der
> nächstliegende lesbare Ton. `#0068A7` ist das pixelgenaue Logo-Blau (AA-tauglich).

Die Theme-/Light-Regeln liegen als dokumentierter Override-Block am Ende von
`style.css` und nutzen durchgängig die obigen Tokens.

## Seiten (Tabs)
- `index.html` – Start: Hero · Empathie · Wechsel · „Was uns unterscheidet" · Leistungen ·
  Über-uns-Teaser · Gebiet · Kennzahlen · Qualität & Sicherheit · Ablauf · Versprechen · FAQ-Teaser · CTA
- `ueber-uns.html` – Intro · Profile · „Auf einen Blick" · Pflegekonzepte/Fachstandards · Werte · Kennzahlen
- `leistungen.html` – Leistungen · Versorgungssicherheit · „So arbeiten wir" · Spektrum ·
  Pflegegeld/Sachleistung · Pflegegrade 2026 · Rechte (Karten verlinken auf die Detailseiten)
- **Leistungs-Detailseiten** (Aufbau: Hero · Intro · Sub-Leistungs-Karten · „Zur Beratung" ·
  Box „Leistungen im Überblick" + Foto · CTA; je Service-/BreadcrumbList-Schema):
  `grundpflege.html` · `behandlungspflege.html` · `hauswirtschaft.html` ·
  `verhinderungspflege.html` · `beratung.html` · `pflegeberatung.html`.
  Erreichbar über die Startseiten-Karten („Mehr erfahren →"), die Leistungsseite und die
  Footer-Spalte „Dienstleistungen". Neue Service generativ aus der Vorlage (eine `.card`-Struktur).
  **`pflegeberatung.html` ist zusätzlich eine vollwertige § 37.3-Landingpage:**
  Kopf mit Termin-CTAs · Trust-Leiste · Angebotsblock (Video/vor Ort) · Wichtig-Hinweis
  (1. Einsatz vor Ort, ab dem 2. jeder zweite per Video, befristet 31.03.2027) ·
  Häufigkeit nach Pflegegrad · 4-Schritte-Ablauf · **Buchungskalender** (`#termin`) ·
  eigene FAQ (+ FAQPage-Schema).
- `wilhelmsburg.html` · `harburg.html` – **lokale SEO-Landingpages** für die
  Schwerpunkt-Suchbegriffe („Pflegedienst Wilhelmsburg/Harburg"), verlinkt aus
  Start-/Gebiete-Seite, mit Service-Schema (`areaServed`).
- `gebiete.html` – Stadtteil-Checker (mit **Autocomplete aller 104 Hamburger
  Stadtteile**, umlaut-tolerant, Tastatur-bedienbar) · „Mitten in Hamburg" ·
  Schwerpunkte (Chips verlinken auf die Stadtteil-Seiten). Der Checker steht
  zusätzlich auf der Startseite („Wir kommen zu Ihnen").
- `praevention.html` – Vorbeugung laienverständlich (Sturz, Schmerz, Dekubitus, Pneumonie, Kinästhetik, Kontrakturen)
- `faq.html` – Häufige Fragen mit Live-Suche (+ FAQPage-Schema)
- `kontakt.html` – Kontaktformular (Formspree) + Direktkontakt/vCards
- `danke.html` – Bestätigung nach Versand
- `pflegepolitik.html`, `digitalisierung.html` – Themenseiten
- `impressum.html`, `datenschutz.html`, `barrierefreiheit.html` – Rechtstexte · `404.html` – Fehlerseite

## Funktionen (script.js)
Mobile-Navigation · FAQ-Akkordeon + Live-Suche · statische Kennzahlen · Scroll-Reveal
(mit Sichtbarkeits-Fallback) · Back-to-Top · Cookie/DSGVO-Hinweis · Anruf-Auswahl
(Nadim/Farhad) · WhatsApp-Auswahl · **Stadtteil-Checker mit Autocomplete** (alle 104
HH-Stadtteile, ARIA-Combobox) · Schriftgrößen-Schalter A+/A− (gespeichert) ·
Live-Formularvalidierung · **Formular-Fallback** (leitet auf Telefon/WhatsApp,
solange Formspree nicht eingerichtet ist) · **Formular-Vorbelegung per URL**
(`kontakt.html?leistung=pflegeberatung&modus=video|vorort` – sprachfest über feste
`option`-values) · **Buchungskalender** (`initBooking`: eigener Monats-/Slot-Kalender,
Anfrage per WhatsApp/E-Mail mit vorformulierter Nachricht; sobald in
`pflegeberatung.html` unter `data-booking-url` ein Cal.com-/Calendly-Link steht,
lädt stattdessen dieser echte Kalender per Click-to-load) · CTA-Bestätigungszeile.
**Sprach-Umschalter** (`i18n.js`, DE/EN/TR/RU/FA, inkl. RTL) – siehe oben.
**Auto-Dark-Schutz:** `color-scheme: only light` (CSS + Meta) verhindert, dass
Browser mit automatischem Dunkelmodus das helle Design schwarz umfärben.

**Fehlertoleranz (Hardening):** Jedes Modul läuft isoliert (`safe()`-Wrapper) –
ein Fehler in einem Modul stoppt die anderen nicht (keine dauerhaft unsichtbaren
Inhalte/„leeren Boxen"). `initReveal` registriert seine Sichtbarkeits-Failsafes
zuerst. Formularversand per `fetch` mit Graceful-Fallback (nie eine Fehlerseite)
und Doppelklick-Schutz. Defekte Bilder: `<picture>`-WebP/JPEG-Fallback +
Initialen-Fallback für Portraits.

## Assets
- `logo-white.png` (schlankes Header-Logo auf Teal) · `logo-white-full.png` (Footer-Logo mit Claim) · `favicon.svg`, `apple-touch-icon.png` · (`logo-color-header.png` aktuell ungenutzt, als Variante behalten)
- `og-image.jpg` – Vorschaubild fürs Teilen (1200×630, ohne Bewertungs-Angabe)
- `foto-team.jpg` (Hero), `IMG_7363.jpeg` (Nadim), `IMG_0631.jpeg` (Farhad) – optimiert
- `i18n/` – Wörterbücher (`en/tr/ru/fa.json`), Quell-Strings & Build-Skript (`_build.py`)
- `fonts/open-sans-latin-*.woff2` (300/400/600/700, Original-Schrift) + `inter-latin.woff2` (Fallback) – selbst gehostet (DSGVO, kein Google-CDN)
- `nadim-nauroz.vcf`, `farhad-ramazani.vcf` – Visitenkarten zum Speichern
- `IMG_0376–0381`, `logo-color.png` – Referenzdateien (nicht eingebunden;
  können vor Go-Live aus dem Repo entfernt werden)

## 🧪 Qualitätssicherung (`tests/suite.mjs`)
Automatisierte Regressions-Suite (Playwright) – prüft alle Seiten × 5 Breiten
(320–1920 px) auf JS-Fehler/Overflow/kaputte Bilder, sämtliche Interaktionen
sowie **Touch-Bedienung per iPhone-Emulation** (Autocomplete-Tap, FAQ,
Buchungskalender, Menü + Sprachwechsel – Touch hat andere Event-Reihenfolgen
als die Maus)
(Gate, Nav, FAQ, Checker, Kalender, Formular+Prefill, Sprachumschalter inkl. RTL,
reduced-motion, EN-Automodus). **Nach jeder Änderung laufen lassen:**
```bash
python3 -m http.server 8077 &            # im Repo-Root
NODE_PATH=<node_modules-mit-playwright> CHROME_BIN=<chromium> node tests/suite.mjs
```
Meldet nur Fehler; „SUITE: SAUBER – 0 Bugs" = alles grün.

**Cache-Konvention:** Bei Änderungen an `style.css` / `script.js` / `i18n.js` die
`?v=`-Nummer in **allen** HTML-Dateien bumpen (`sed -i 's/v=ALT/v=NEU/g' *.html`);
bei Wörterbuch-Änderungen zusätzlich `VER` in `i18n.js`.

## ✅ Go-Live-Checkliste (nur ihr / GF könnt das)
1. **Wartungsmodus entfernen** (Gate aus allen Seiten) – sonst sieht niemand die
   Inhalte **und Google kann nicht indexieren**.
2. **Formspree-ID:** in `kontakt.html` `YOUR_FORM_ID` durch die echte ID ersetzen
   (formspree.io, Ziel-E-Mail `nnauroz@live.de`). Danach submittet das Formular normal.
2b. **Cal.com-/Calendly-Link (optional, echtes Online-Booking):** Konto anlegen
   (Termin „Beratungsbesuch § 37.3", 30 Min) und den Buchungslink in
   `pflegeberatung.html` bei `data-booking-url=""` eintragen – der eingebaute
   Kalender wird dann automatisch durch den echten Live-Kalender ersetzt.
3. **Impressum/Datenschutz:** durch die GF freigeben; `[BITTE ERGÄNZEN]`-Felder ausfüllen
   (USt-IdNr.; ggf. Datenschutzbeauftragte/r).
4. **Domain:** sobald final, in `canonical`, `og:url`, Schema.org, Sitemap & robots.txt
   die echte absolute Adresse eintragen (aktuell: Vercel-Domain
   `medicare-nauroz-ramazani.vercel.app` – per Suchen&Ersetzen austauschbar).
5. **Echte Google-Bewertungen (optional, stärkster Vertrauenshebel):** Rezensionen
   sammeln und als Bewertungs-Sektion einbinden lassen.

## Marken-Kennzahlen (Medicare-Band, Startseite + Über uns)
Quelle ist der **MD-Transparenzbericht vom 24.04.2024** (Träger: MBD Medicare
Brigitte Dornia GmbH & Co. KG, Heidhorst 4): Gesamtnote **1,1 „sehr gut“**
(Landesdurchschnitt 1,4), Befragung der Versorgten **1,0**, **419** versorgte
Menschen. Nach der nächsten MD-Prüfung in `index.html` (`#medicare-familie`,
Siegel + Kacheln), `pflegeberatung.html` (Trust-Badge) und `ueber-uns.html`
aktualisieren – Übersetzungen in `i18n/` mitziehen.

## Original-CI (Design wie medicare-hamburg.de)
Der Block „v14 · ORIGINAL-CI“ am Ende von `style.css` bildet die Hauptseite
nach: flaches Marken-Teal (#00a8b8) für Header/Heros/Footer, weißes Logo
(`logo-white-full.png`), zentrierte Hero-Texte, Outline-Buttons in Versalien,
Wellen-Übergang (SVG in `::after`). Bewusste Marken-Entscheidung: weißer
Nav-Text auf #00a8b8 liegt wie beim Original unter 4,5:1 (WCAG-AA-Kontrast) –
wer AA strikt braucht, dunkelt die Header-Fläche auf ~#007a87 ab.

## Inhalt pflegen (Beträge 2026 – aus euren Unterlagen)
Pflegegeld/Sachleistung: PG2 347/796 · PG3 599/1.497 · PG4 800/1.859 · PG5 990/2.299 €.
Gemeinsamer Jahresbetrag (Verhinderungs-/Kurzzeitpflege): bis 3.539 €.
Bei Gesetzesänderungen die Werte in `leistungen.html` und `pflegepolitik.html` anpassen.

## Hosting
Deploy via Vercel (Push auf den Branch). Rein statisch, keine Server-Logik.
`vercel.json` setzt `Cache-Control: must-revalidate` → Änderungen erscheinen nach
jedem Deploy sofort (kein manuelles Cache-Busting nötig). `.nojekyll` ist gesetzt.
