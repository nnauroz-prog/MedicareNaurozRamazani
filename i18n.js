/*  Medicare – mehrsprachige Lese-Ansicht (ohne Build-Tools)
 *  -------------------------------------------------------------
 *  Übersetzt zur Laufzeit Textknoten und ausgewählte Attribute anhand des
 *  deutschen Quelltextes (Schlüssel = normalisierter deutscher String).
 *  Fehlt eine Übersetzung, bleibt automatisch der deutsche Text stehen.
 *  Wörterbücher liegen als i18n/<code>.json vor. Deutsch ist das Original.
 */
(function () {
  "use strict";

  var STORE = "medicare_lang";
  var BASE = "i18n/";
  var VER = "10";

  // Reihenfolge = Reihenfolge im Sprachmenü
  var LANGS = [
    { code: "de", native: "Deutsch",  dir: "ltr" },
    { code: "en", native: "English",  dir: "ltr" },
    { code: "tr", native: "Türkçe",   dir: "ltr" },
    { code: "ru", native: "Русский",  dir: "ltr" },
    { code: "fa", native: "فارسی",     dir: "rtl" }
  ];
  var BY_CODE = {};
  LANGS.forEach(function (l) { BY_CODE[l.code] = l; });

  var dicts = { de: {} };     // code -> { normalisierterDE: Übersetzung }
  var registry = null;        // gesammelte übersetzbare Stellen
  var current = "de";

  /* ---------- Helfer ---------- */
  function normalize(s) { return (s || "").replace(/\s+/g, " ").trim(); }

  function getSaved() {
    try { return localStorage.getItem(STORE); } catch (e) { return null; }
  }
  function save(code) {
    try { localStorage.setItem(STORE, code); } catch (e) {}
  }

  // Erstbesucher: Browsersprache vorschlagen, sonst Deutsch
  function detect() {
    var saved = getSaved();
    if (saved && BY_CODE[saved]) return saved;
    try {
      var navs = navigator.languages || [navigator.language || "de"];
      for (var i = 0; i < navs.length; i++) {
        var code = String(navs[i]).slice(0, 2).toLowerCase();
        if (code === "fa" || code === "prs") return "fa"; // Persisch/Dari
        if (BY_CODE[code]) return code;
      }
    } catch (e) {}
    return "de";
  }

  /* ---------- Übersetzbare Stellen einsammeln ---------- */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1 };
  // Strings, die nie übersetzt werden (Markenname, Nummern, E-Mail …)
  var KEEP = /^[\s\d.,:/+()·–—@%–—-]*$/;

  function skipEl(el) {
    if (!el) return true;
    if (SKIP_TAGS[el.tagName]) return true;
    if (el.closest && el.closest("[data-no-i18n], #mc-gate, .lang-switch, .skip-link")) return true;
    return false;
  }

  function collect() {
    var list = [];

    // 1) Textknoten
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !normalize(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (KEEP.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (skipEl(n.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      var lead = raw.match(/^\s*/)[0];
      var trail = raw.match(/\s*$/)[0];
      list.push({ type: "text", node: node, key: normalize(raw), lead: lead, trail: trail });
    }

    // 2) Attribute
    var ATTRS = ["placeholder", "aria-label", "alt", "title"];
    document.querySelectorAll("[placeholder],[aria-label],[alt],[title]").forEach(function (el) {
      if (skipEl(el)) return;
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var v = el.getAttribute(a);
        if (!normalize(v) || KEEP.test(v)) return;
        list.push({ type: "attr", node: el, attr: a, key: normalize(v) });
      });
    });

    // 3) <title> + Meta-Description
    if (document.title && !KEEP.test(document.title)) {
      list.push({ type: "title", key: normalize(document.title) });
    }
    var md = document.querySelector('meta[name="description"]');
    if (md && md.content && !KEEP.test(md.content)) {
      list.push({ type: "meta", node: md, key: normalize(md.content) });
    }
    return list;
  }

  /* ---------- Übersetzung anwenden ---------- */
  function tr(code, key) {
    if (code === "de") return key;
    var d = dicts[code];
    return (d && d[key]) ? d[key] : key; // Fallback: Deutsch
  }

  function apply(code) {
    if (!registry) registry = collect();
    registry.forEach(function (e) {
      var t = tr(code, e.key);
      if (e.type === "text") {
        e.node.nodeValue = e.lead + t + e.trail;
      } else if (e.type === "attr") {
        e.node.setAttribute(e.attr, t);
      } else if (e.type === "title") {
        document.title = t;
      } else if (e.type === "meta") {
        e.node.setAttribute("content", t);
      }
    });
    var meta = BY_CODE[code] || BY_CODE.de;
    document.documentElement.setAttribute("lang", code);
    document.documentElement.setAttribute("dir", meta.dir);
    current = code;
    updateSwitchUI();
  }

  function load(code, cb) {
    if (code === "de" || dicts[code]) { cb(); return; }
    fetch(BASE + code + ".json?v=" + VER, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (json) { dicts[code] = json || {}; cb(); })
      .catch(function () { dicts[code] = {}; cb(); });
  }

  function setLang(code) {
    if (!BY_CODE[code]) code = "de";
    save(code);
    load(code, function () { apply(code); });
  }

  /* ---------- Sprach-Umschalter (im Header) ---------- */
  var switchEl = null;

  function buildSwitch() {
    var nav = document.querySelector(".nav-links");
    if (!nav || document.querySelector(".lang-switch")) return;

    var li = document.createElement("li");
    li.className = "nav-lang";

    var wrap = document.createElement("div");
    wrap.className = "lang-switch";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Sprache wählen / Choose language");
    btn.innerHTML =
      '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>' +
      '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
      '<span class="lang-cur">DE</span>';

    var menu = document.createElement("ul");
    menu.className = "lang-menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Sprache / Language");
    LANGS.forEach(function (l) {
      var item = document.createElement("li");
      var a = document.createElement("button");
      a.type = "button";
      a.className = "lang-opt";
      a.setAttribute("role", "option");
      a.setAttribute("data-code", l.code);
      a.setAttribute("lang", l.code);
      if (l.dir === "rtl") a.setAttribute("dir", "rtl");
      a.innerHTML = '<span class="lang-code">' + l.code.toUpperCase() + '</span><span class="lang-name">' + l.native + '</span>';
      a.addEventListener("click", function () {
        setLang(l.code);
        setOpen(false);
        btn.focus();
      });
      item.appendChild(a);
      menu.appendChild(item);
    });

    function opts() { return Array.prototype.slice.call(menu.querySelectorAll(".lang-opt")); }
    function focusOpt(i) {
      var o = opts();
      if (!o.length) return;
      i = (i + o.length) % o.length;
      o[i].focus();
    }
    function setOpen(v, focusList) {
      wrap.classList.toggle("open", v);
      btn.setAttribute("aria-expanded", v ? "true" : "false");
      if (v && focusList) {
        // Fokus auf aktuell gewählte Option (ARIA-Listbox-Muster);
        // rAF, damit visibility:visible vor focus() angewandt ist
        requestAnimationFrame(function () {
          var o = opts();
          var sel = o.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0];
          (sel || o[0]) && (sel || o[0]).focus();
        });
      }
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!wrap.classList.contains("open"));
    });
    // Tastatur: Pfeiltasten öffnen Menü & fokussieren Optionen
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        if (!wrap.classList.contains("open")) { e.preventDefault(); setOpen(true, true); }
      }
    });
    // Tastatur-Navigation innerhalb der Listbox
    menu.addEventListener("keydown", function (e) {
      var o = opts(), idx = o.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); focusOpt(idx + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); focusOpt(idx - 1); }
      else if (e.key === "Home") { e.preventDefault(); focusOpt(0); }
      else if (e.key === "End") { e.preventDefault(); focusOpt(o.length - 1); }
      else if (e.key === "Tab") { setOpen(false); }
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && wrap.classList.contains("open")) { setOpen(false); btn.focus(); }
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    li.appendChild(wrap);

    var cta = nav.querySelector(".nav-cta");
    if (cta) nav.insertBefore(li, cta); else nav.appendChild(li);
    switchEl = wrap;
  }

  function updateSwitchUI() {
    if (!switchEl) return;
    var cur = switchEl.querySelector(".lang-cur");
    if (cur) cur.textContent = current.toUpperCase();
    switchEl.querySelectorAll(".lang-opt").forEach(function (o) {
      o.setAttribute("aria-selected", o.getAttribute("data-code") === current ? "true" : "false");
    });
  }

  /* ---------- Start ---------- */
  function init() {
    buildSwitch();
    var code = detect();
    if (code === "de") { apply("de"); }   // Original – nur lang/dir + UI setzen
    else setLang(code);
  }

  // i18n.js wird mit "defer" geladen und läuft daher in der Phase "interactive"
  // – also VOR DOMContentLoaded. script.js (ohne defer) registriert seinen
  // DOMContentLoaded-Handler bereits beim Parsen, also vor uns. Wir warten
  // deshalb ebenfalls auf DOMContentLoaded: so existieren die per JS erzeugten
  // Elemente (Anruf-/WhatsApp-Auswahl) bereits, wenn wir sie einsammeln.
  if (document.readyState === "complete") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }

  // Für die Wörterbuch-Erzeugung (Build/QA) nutzbar:
  window.__mcI18n = {
    collectKeys: function () {
      return Array.from(new Set(collect().map(function (e) { return e.key; })));
    },
    setLang: setLang,
    langs: LANGS
  };
})();
