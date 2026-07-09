/*
 * Regressions-Suite der Website (Playwright).
 * Start:  python3 -m http.server 8077 &   (im Repo-Root)
 *         NODE_PATH=<pfad-zu-node_modules-mit-playwright> node tests/suite.mjs
 * Env:    SITE_URL (Default http://127.0.0.1:8077) · SITE_ROOT · CHROME_BIN
 * Meldet nur Fehler; Exit-Code 1 bei Befunden. Deckt ab: alle Seiten × 5
 * Breiten (Fehler/Overflow/Bilder/h1), Gate, mobile Nav, FAQ+Suche,
 * Stadtteil-Checker, Buchungskalender, Formular+Prefill, Sprachumschalter
 * inkl. RTL, Back-to-Top, A+/A−, reduced-motion, EN-Automodus.
 */
// Vollständige Regressions-Suite. Meldet NUR Fehler. Exit-Code 1 bei Befunden.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const base = process.env.SITE_URL || 'http://127.0.0.1:8077';
const root = process.env.SITE_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(root).filter(f => f.endsWith('.html')).sort();
const bugs = [];
const bug = (m) => { bugs.push(m); console.log('BUG:', m); };
const b = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });

const unlock = () => { try { localStorage.setItem('medicare_gate_v1','1'); localStorage.setItem('medicare_cookie_ok','1'); localStorage.setItem('medicare_lang','de'); } catch(e){} };

// ---------- 1) Jede Seite × 5 Breiten: Fehler, Overflow, kaputte Bilder, h1 ----------
for (const w of [320, 390, 768, 1280, 1920]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(unlock);
  for (const pg of pages) {
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    p.on('requestfailed', r => { if (r.url().startsWith(base)) errs.push('reqfail: ' + r.url().slice(base.length)); });
    await p.goto(base + '/' + pg, { waitUntil: 'load' });
    await p.waitForTimeout(280);
    const r = await p.evaluate(() => ({
      ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      badImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && !i.closest('#mc-gate')).map(i => i.getAttribute('src')),
      h1: !!document.querySelector('main h1, body h1:not(#mc-gate h1)'),
    }));
    if (errs.length) bug(`${pg}@${w}: ${[...new Set(errs)].join(' | ')}`);
    if (r.ow) bug(`${pg}@${w}: horizontaler Overflow`);
    if (r.badImgs.length) bug(`${pg}@${w}: kaputte Bilder ${r.badImgs.join(',')}`);
    if (!r.h1) bug(`${pg}@${w}: keine h1`);
    await p.close();
  }
  await ctx.close();
}

// ---------- 2) Gate-Flow (frischer Besucher) ----------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(base + '/index.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  if (!(await p.$('#mc-gate'))) bug('Gate: erscheint nicht für neue Besucher');
  else {
    await p.fill('#mc-gate input', 'xx'); await p.click('#mc-gate button'); await p.waitForTimeout(250);
    if (!(await p.$eval('#mc-gate .mc-err', e => getComputedStyle(e).display !== 'none'))) bug('Gate: keine Fehlermeldung bei falschem Code');
    await p.fill('#mc-gate input', 'medicare'); await p.click('#mc-gate button'); await p.waitForTimeout(400);
    if (await p.$('#mc-gate')) bug('Gate: öffnet nicht bei korrektem Code (lowercase)');
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(300);
    if (await p.$('#mc-gate')) bug('Gate: nach Reload wieder gesperrt');
  }
  await ctx.close();
}

// ---------- 3) Mobile Navigation ----------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(unlock);
  const p = await ctx.newPage();
  await p.goto(base + '/index.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  await p.click('.nav-toggle'); await p.waitForTimeout(400);
  const open = await p.$eval('.nav-links', e => e.classList.contains('open'));
  if (!open) bug('MobileNav: Menü öffnet nicht');
  const visible = await p.$eval('.nav-links a[href="faq.html"]', e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0; });
  if (!visible) bug('MobileNav: Menüpunkte nicht sichtbar');
  await p.click('.nav-toggle'); await p.waitForTimeout(400);
  if (await p.$eval('.nav-links', e => e.classList.contains('open'))) bug('MobileNav: Menü schließt nicht');
  await ctx.close();
}

// ---------- 4) FAQ-Akkordeons + Suche ----------
{
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
  await ctx.addInitScript(unlock);
  for (const pg of ['faq.html', 'index.html', 'pflegeberatung.html']) {
    const p = await ctx.newPage();
    await p.goto(base + '/' + pg, { waitUntil: 'load' }); await p.waitForTimeout(300);
    const qs = await p.$$('.faq-item .faq-q');
    if (!qs.length) { bug(pg + ': keine FAQ-Items gefunden'); await p.close(); continue; }
    await qs[0].click(); await p.waitForTimeout(300);
    if ((await qs[0].getAttribute('aria-expanded')) !== 'true') bug(pg + ': FAQ öffnet nicht');
    if (qs[1]) {
      await qs[1].click(); await p.waitForTimeout(300);
      if ((await qs[0].getAttribute('aria-expanded')) !== 'false') bug(pg + ': FAQ-Exklusivität kaputt');
    }
    await qs[0].click(); await p.waitForTimeout(250);
    if (pg === 'faq.html') {
      await p.fill('#faqSearch', 'kassen'); await p.waitForTimeout(300);
      const shown = await p.$$eval('.faq-item', els => els.filter(e => getComputedStyle(e).display !== 'none').length);
      const total = (await p.$$('.faq-item')).length;
      if (shown === 0 || shown === total) bug('faq.html: Suche filtert nicht (sichtbar ' + shown + '/' + total + ')');
      await p.fill('#faqSearch', 'zzzzunfindbar'); await p.waitForTimeout(300);
      if (!(await p.$eval('#faqEmpty', e => getComputedStyle(e).display !== 'none'))) bug('faq.html: Leer-Hinweis fehlt bei 0 Treffern');
    }
    await p.close();
  }
  await ctx.close();
}

// ---------- 5) Stadtteil-Checker (gebiete + index) ----------
{
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
  await ctx.addInitScript(unlock);
  for (const pg of ['gebiete.html', 'index.html']) {
    const p = await ctx.newPage();
    await p.goto(base + '/' + pg, { waitUntil: 'load' }); await p.waitForTimeout(300);
    await p.$eval('#areaInput', e => e.scrollIntoView({ block: 'center' }));
    // Vorschläge + Tastatur
    await p.click('#areaInput'); await p.type('#areaInput', 'eiss', { delay: 20 }); await p.waitForTimeout(200);
    const sugg = await p.$$eval('#areaSuggest .ac-name', e => e.map(x => x.textContent));
    if (!sugg.includes('Eißendorf')) bug(pg + ': Umlaut-Suche findet Eißendorf nicht (' + JSON.stringify(sugg) + ')');
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    if ((await p.$eval('#areaInput', e => e.value)) !== 'Eißendorf') bug(pg + ': Tastatur-Auswahl übernimmt nicht');
    if (!(await p.$eval('#areaResult', e => e.className.includes('ok')))) bug(pg + ': Ergebnis nicht ok für echten Stadtteil');
    // Escape schließt
    await p.fill('#areaInput', ''); await p.type('#areaInput', 'ba', { delay: 20 }); await p.waitForTimeout(200);
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    if (!(await p.$eval('#areaSuggest', e => e.hidden))) bug(pg + ': Escape schließt Vorschläge nicht');
    // Leere Eingabe
    await p.fill('#areaInput', ''); await p.click('#areaForm button[type=submit]'); await p.waitForTimeout(200);
    if (!(await p.$eval('#areaResult', e => e.textContent.length > 5))) bug(pg + ': kein Hinweis bei leerer Eingabe');
    // Unbekannter Ort -> maybe
    await p.fill('#areaInput', 'Buxtehude'); await p.click('#areaForm button[type=submit]'); await p.waitForTimeout(200);
    if (!(await p.$eval('#areaResult', e => e.className.includes('maybe')))) bug(pg + ': unbekannter Ort nicht als "maybe"');
    await p.close();
  }
  await ctx.close();
}

// ---------- 6) Buchungskalender komplett ----------
{
  const ctx = await b.newContext({ viewport: { width: 1000, height: 1000 } });
  await ctx.addInitScript(unlock);
  const p = await ctx.newPage();
  await p.goto(base + '/pflegeberatung.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  if (await p.$eval('.bcal-nav[data-nav="-1"]', e => !e.disabled)) bug('Kalender: Zurück-Pfeil im aktuellen Monat nicht deaktiviert');
  const title0 = await p.$eval('.bcal-title', e => e.textContent);
  await p.click('.bcal-nav[data-nav="1"]'); await p.waitForTimeout(150);
  const title1 = await p.$eval('.bcal-title', e => e.textContent);
  if (title0 === title1) bug('Kalender: Monat-vor wechselt nicht');
  await p.click('.bcal-nav[data-nav="-1"]'); await p.waitForTimeout(150);
  if ((await p.$eval('.bcal-title', e => e.textContent)) !== title0) bug('Kalender: Monat-zurück wechselt nicht');
  // Sonntage deaktiviert (Spalte 7)
  const sundayEnabled = await p.$$eval('.bcal-days button', els => els.filter((e, i) => !e.disabled && new Date(2000,0,1) && e.getAttribute('aria-label') && e.getAttribute('aria-label').startsWith('Sonntag')).length);
  if (sundayEnabled > 0) bug('Kalender: Sonntage anklickbar');
  // Tag + Slot + Modus + Name
  const days = await p.$$('.bcal-days button:not([disabled])');
  await days[0].click(); await p.waitForTimeout(150);
  if (await p.$eval('.bcal-slots-wrap', e => e.hidden)) bug('Kalender: Slots erscheinen nicht');
  await (await p.$('.bcal-slots button')).click(); await p.waitForTimeout(200);
  let wa = await p.$eval('.bcal-wa', e => decodeURIComponent(e.href));
  if (!wa.includes('Per Videoanruf')) bug('Kalender: WA-Link ohne Standard-Modus');
  await p.click('.bcal-modes button[data-mode="Bei Ihnen vor Ort"]'); await p.waitForTimeout(200);
  wa = await p.$eval('.bcal-wa', e => decodeURIComponent(e.href));
  if (!wa.includes('Bei Ihnen vor Ort')) bug('Kalender: Moduswechsel aktualisiert WA-Link nicht');
  await p.fill('.bcal-name', 'Testperson Ü'); await p.waitForTimeout(150);
  wa = await p.$eval('.bcal-wa', e => decodeURIComponent(e.href));
  const mail = await p.$eval('.bcal-mail', e => decodeURIComponent(e.href));
  if (!wa.includes('Testperson Ü')) bug('Kalender: Name fehlt im WA-Link');
  if (!mail.includes('Testperson Ü') || !mail.startsWith('mailto:nnauroz@live.de')) bug('Kalender: Mail-Link fehlerhaft');
  await ctx.close();
}

// ---------- 7) Formular: Validierung, Fallback, Prefill ----------
{
  const ctx = await b.newContext({ viewport: { width: 1000, height: 1000 } });
  await ctx.addInitScript(unlock);
  let p = await ctx.newPage();
  await p.goto(base + '/kontakt.html', { waitUntil: 'load' }); await p.waitForTimeout(300);
  await p.click('#careForm button[type=submit]'); await p.waitForTimeout(300);
  if ((await p.$$eval('.field-error', els => els.filter(e => e.textContent.trim()).length)) < 2) bug('Formular: Pflichtfeld-Validierung fehlt');
  await p.fill('#email', 'keine-mail'); await p.$eval('#email', e => e.blur()); await p.waitForTimeout(250);
  const mailErr = await p.$eval('#email', e => (e.closest('.field').querySelector('.field-error') || {textContent:''}).textContent);
  if (!mailErr.trim()) bug('Formular: ungültige E-Mail nicht bemängelt');
  await p.fill('#email', ''); await p.fill('#name', 'Test'); await p.fill('#phone', '0176123456'); await p.check('.consent input');
  await p.click('#careForm button[type=submit]'); await p.waitForTimeout(400);
  if (!(await p.$('.form-fallback'))) bug('Formular: Fallback erscheint nicht (YOUR_FORM_ID)');
  await p.close();
  // Prefill-Deep-Links
  p = await ctx.newPage();
  await p.goto(base + '/kontakt.html?leistung=pflegeberatung&modus=video', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  if ((await p.$eval('#leistung', e => e.value)) !== 'Pflegeberatung § 37.3') bug('Prefill: Leistung nicht vorausgewählt');
  if ((await p.$eval('#modus', e => e.value)) !== 'Per Videoanruf') bug('Prefill: Video-Modus nicht vorausgewählt');
  await ctx.close();
}

// ---------- 8) Sprachumschalter über echte UI, RTL, zurück zu DE ----------
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(unlock);
  const p = await ctx.newPage();
  await p.goto(base + '/index.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(900);
  const pick = async (code, expectNav) => {
    await p.click('.lang-btn'); await p.waitForTimeout(250);
    await p.click(`.lang-opt[data-code="${code}"]`); await p.waitForTimeout(900);
    const nav = await p.$eval('.nav-links a[href="ueber-uns.html"]', e => e.textContent.trim());
    if (nav !== expectNav) bug(`Sprachwechsel ${code}: Nav "${nav}" statt "${expectNav}"`);
  };
  await pick('en', 'About us');
  await pick('fa', 'درباره ما');
  if ((await p.evaluate(() => document.documentElement.getAttribute('dir'))) !== 'rtl') bug('Sprachwechsel fa: dir!=rtl');
  const owRtl = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (owRtl) bug('Sprachwechsel fa: RTL erzeugt Overflow');
  await pick('de', 'Über uns');
  if ((await p.evaluate(() => document.documentElement.getAttribute('dir') || 'ltr')) === 'rtl') bug('Sprachwechsel de: dir bleibt rtl');
  await ctx.close();
}

// ---------- 9) Back-to-Top + Schriftgrößen-Buttons ----------
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(unlock);
  const p = await ctx.newPage();
  await p.goto(base + '/index.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, 1200)); await p.waitForTimeout(400);
  if (!(await p.$eval('.back-to-top', e => e.classList.contains('show')))) bug('BackToTop: erscheint nicht nach Scroll');
  await p.click('.back-to-top'); await p.waitForTimeout(700);
  if ((await p.evaluate(() => window.scrollY)) > 40) bug('BackToTop: scrollt nicht nach oben');
  const fs0 = await p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  await p.click('.a11y-btn[data-font="inc"]'); await p.waitForTimeout(200);
  const fs1 = await p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  if (!(fs1 > fs0)) bug('A11y: A+ vergrößert Schrift nicht');
  await p.click('.a11y-btn[data-font="dec"]'); await p.waitForTimeout(200);
  const ow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (ow) bug('A11y: Schriftgrößen-Änderung erzeugt Overflow');
  await ctx.close();
}

// ---------- 10) Reduced Motion: Inhalte sofort sichtbar ----------
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(unlock);
  const p = await ctx.newPage();
  await p.goto(base + '/index.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  const heroOp = await p.$eval('.hero h1', e => getComputedStyle(e).opacity);
  if (heroOp !== '1') bug('ReducedMotion: Hero unsichtbar (opacity ' + heroOp + ')');
  await ctx.close();
}

// ---------- 11) EN-Automodus: Fehler/Overflow-Spotcheck (echte EN-Besucher) ----------
{
  for (const w of [320, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('medicare_gate_v1','1'); localStorage.setItem('medicare_cookie_ok','1'); localStorage.setItem('medicare_lang','en'); } catch(e){} });
    for (const pg of ['index.html','kontakt.html','impressum.html','pflegeberatung.html']) {
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.goto(base + '/' + pg, { waitUntil: 'load' }); await p.waitForTimeout(900);
      const ow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (errs.length) bug(`EN ${pg}@${w}: ${errs[0]}`);
      if (ow) bug(`EN ${pg}@${w}: Overflow`);
      await p.close();
    }
    await ctx.close();
  }
  // Prefill in EN (übersetzte Option-Texte) muss weiter funktionieren
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('medicare_gate_v1','1'); localStorage.setItem('medicare_cookie_ok','1'); localStorage.setItem('medicare_lang','en'); } catch(e){} });
  const p = await ctx.newPage();
  await p.goto(base + '/kontakt.html?leistung=pflegeberatung&modus=video', { waitUntil: 'load' }); await p.waitForTimeout(1100);
  if ((await p.$eval('#leistung', e => e.value)) !== 'Pflegeberatung § 37.3') bug('EN-Prefill: Leistung nicht vorausgewählt');
  if ((await p.$eval('#modus', e => e.value)) !== 'Per Videoanruf') bug('EN-Prefill: Video-Modus nicht vorausgewählt');
  await ctx.close();
}

/* ---- 12) TOUCH-INTERAKTIONEN (iPhone-Emulation) ----
   Touch hat andere Event-Reihenfolgen als Maus (blur vor click!) –
   diese Sektion fängt Bugs wie den Autocomplete-Tap-Fehler ab. */
{
  console.log('\n[12] Touch-Interaktionen (hasTouch)…');
  const mkTouch = async (path, lang = 'de') => {
    const ctx = await b.newContext({
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    await ctx.addInitScript((l) => { try { localStorage.setItem('medicare_gate_v1','1'); localStorage.setItem('medicare_cookie_ok','1'); localStorage.setItem('medicare_lang', l); } catch(e){} }, lang);
    const p = await ctx.newPage();
    await p.goto(base + '/' + path, { waitUntil: 'load' }); await p.waitForTimeout(500);
    return { ctx, p };
  };
  // a) Stadtteil-Autocomplete: Vorschlag antippen übernimmt Wert + zeigt Ergebnis
  {
    const { ctx, p } = await mkTouch('gebiete.html');
    await p.evaluate(() => document.getElementById('areaInput').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    await p.tap('#areaInput');
    await p.type('#areaInput', 'Wilhelms', { delay: 40 });
    await p.waitForTimeout(350);
    await p.tap('#areaSuggest .ac-item');
    await p.waitForTimeout(500);
    const v = await p.$eval('#areaInput', e => e.value);
    const ok = await p.$eval('#areaResult', e => e.classList.contains('ok'));
    if (v !== 'Wilhelmsburg') bug('Touch: Autocomplete-Tap übernimmt Wert nicht (' + v + ')');
    if (!ok) bug('Touch: Autocomplete-Tap zeigt kein Ergebnis');
    await ctx.close();
  }
  // b) FAQ-Akkordeon öffnet per Tap
  {
    const { ctx, p } = await mkTouch('faq.html');
    await p.evaluate(() => document.querySelector('.faq-q').scrollIntoView({ block: 'center' }));
    await p.tap('.faq-q'); await p.waitForTimeout(500);
    if ((await p.$eval('.faq-q', e => e.getAttribute('aria-expanded'))) !== 'true') bug('Touch: FAQ öffnet nicht per Tap');
    await ctx.close();
  }
  // c) Buchungskalender: Tag + Slot per Tap → Anfrage-Links erscheinen
  {
    const { ctx, p } = await mkTouch('pflegeberatung.html');
    await p.evaluate(() => document.getElementById('booking-embed').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    const day = await p.$('.bcal-days button:not([disabled])');
    if (!day) bug('Touch: Kalender ohne aktivierbaren Tag');
    else {
      await day.tap(); await p.waitForTimeout(400);
      const slot = await p.$('.bcal-slots button');
      if (!slot) bug('Touch: nach Tag-Tap keine Slots');
      else {
        await slot.tap(); await p.waitForTimeout(400);
        const wa = await p.$('a[href*="wa.me/491607621876"]');
        if (!wa) bug('Touch: nach Slot-Tap kein WhatsApp-Anfrage-Link');
      }
    }
    await ctx.close();
  }
  // d) Mobile-Menü: öffnen + Sprachwechsel EN per Tap
  {
    const { ctx, p } = await mkTouch('index.html');
    await p.tap('.nav-toggle'); await p.waitForTimeout(400);
    if (!(await p.$eval('.nav-links', e => e.classList.contains('open')))) bug('Touch: Menü öffnet nicht');
    await p.tap('.lang-btn'); await p.waitForTimeout(400);
    await p.tap('.lang-opt[data-code="en"]'); await p.waitForTimeout(1400);
    if ((await p.evaluate(() => localStorage.getItem('medicare_lang'))) !== 'en') bug('Touch: Sprachwechsel per Tap wirkungslos');
    await ctx.close();
  }
}

await b.close();
console.log(bugs.length ? `\nSUITE: ${bugs.length} BUG(S)` : '\nSUITE: SAUBER – 0 Bugs');
process.exit(bugs.length ? 1 : 0);
