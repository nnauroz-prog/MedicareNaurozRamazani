# Medicare – Nadim Nauroz & Farhad Ramazani

Statische Website (HTML/CSS/JS, ohne Build-Tools) für das gemeinsame Pflege­angebot
von **Nadim Nauroz** & **Farhad Ramazani** innerhalb von **Medicare Hamburg**
(MBD Medicare …). „Wir"-Ansprache, CI von medicare-hamburg.de (Anker-Logo, Teal + Navy),
seniorenfreundlich, DSGVO-bewusst.

## Seiten (Tabs)
- `index.html` – Start (Hero, Wechsel, „Das macht den Unterschied", Leistungen,
  Über-uns-Teaser, Gebiet, Counter, Ablauf, Google-Bewertung, FAQ-Teaser, Tipps, CTA)
- `ueber-uns.html` – Profile, Pflegekonzepte & Fachstandards, Werte, Counter
- `leistungen.html` – Leistungen, Pflegegeld/Sachleistung/Kombination, Pflegegrade 2026, Rechte
- `gebiete.html` – Einsatzgebiete + Stadtteil-Checker (Schwerpunkt Wilhelmsburg/Harburg)
- `praevention.html` – Prävention/Pflege-Tipps (inkl. Kinästhetik, Kontrakturen)
- `faq.html` – Häufige Fragen mit Live-Suche (+ FAQPage-Schema)
- `kontakt.html` – Kontaktformular (Formspree) + Direktkontakt/vCards
- `danke.html` – Bestätigung nach Versand
- `pflegepolitik.html`, `digitalisierung.html` – Themenseiten
- `impressum.html`, `datenschutz.html` – Rechtstexte · `404.html` – Fehlerseite

## Funktionen (script.js)
Mobile-Navigation · FAQ-Akkordeon + Live-Suche · animierte Zähler · Scroll-Reveal
(mit Sichtbarkeits-Fallback) · Back-to-Top · Cookie/DSGVO-Hinweis · Anruf-Auswahl
(Nadim/Farhad) · WhatsApp-Auswahl · Stadtteil-Checker · Schriftgrößen-Schalter A+/A−
(gespeichert) · Live-Formularvalidierung · Scroll-Fortschrittsleiste.

## Assets
- `logo-white.png` (Header), `favicon.svg`, `apple-touch-icon.png`
- `og-image.jpg` – Vorschaubild fürs Teilen (1200×630)
- `foto-team.jpg` (Hero), `IMG_7363.jpeg` (Nadim), `IMG_0631.jpeg` (Farhad) – auf Anzeigegröße optimiert
- `fonts/inter-latin.woff2` – selbst gehostete Schrift (DSGVO, kein Google-CDN)
- `nadim-nauroz.vcf`, `farhad-ramazani.vcf` – Visitenkarten zum Speichern
- `IMG_0376–0381`, `logo-color.png`, `logo-white-full.png` – Marken-/Referenzdateien (nicht eingebunden)

## VOR DEM LIVE-GANG (nur ihr könnt das)
1. **Formspree-ID:** in `kontakt.html` `YOUR_FORM_ID` durch die echte ID ersetzen
   (auf formspree.io ein Formular mit Ziel-E-Mail `nnauroz@live.de` anlegen).
2. **Impressum/Datenschutz:** durch die Geschäftsführung freigeben; die mit
   `[BITTE ERGÄNZEN]` markierten Felder ausfüllen (USt-IdNr.; ggf. Datenschutzbeauftragte/r).
3. **Domain (optional):** sobald final, in `canonical`, `og:url`, Schema.org und
   `og:image`/Sitemap die echte absolute Adresse eintragen (aktuell relativ).
4. **Echte Bewertungen (optional):** Zitate für eine „Stimmen"-Sektion liefern.

## Inhalt pflegen (Beträge 2026 – aus euren Unterlagen)
Pflegegeld/Sachleistung: PG2 347/796 · PG3 599/1.497 · PG4 800/1.859 · PG5 990/2.299 €.
Gemeinsamer Jahresbetrag (Verhinderungs-/Kurzzeitpflege): bis 3.539 €.
Bei Gesetzesänderungen die Werte in `leistungen.html` und `pflegepolitik.html` anpassen.

## Hosting
Deploy via Vercel (Push auf den Branch). `.nojekyll` ist gesetzt.
Keine Server-Logik nötig – rein statisch.
