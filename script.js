/* =========================================================
   Medicare — Nadim Nauroz
   Globales Skript: Navigation, FAQ, Zähler, Reveal,
   Back-to-Top, Cookie-Banner
   ========================================================= */
(function () {
  "use strict";

  // Markiert, dass JS aktiv ist – erst dann werden Reveal-Elemente versteckt
  document.documentElement.classList.add("js");

  // Jede Init isoliert ausführen: ein Fehler in EINEM Modul darf die anderen
  // niemals stoppen (sonst blieben z. B. Reveal-Inhalte unsichtbar = leere Boxen).
  function safe(name, fn) {
    try {
      fn();
    } catch (e) {
      if (window.console && console.warn) {
        console.warn("Medicare: Modul '" + name + "' übersprungen –", e && e.message);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe("MobileNav", initMobileNav);
    safe("FAQ", initFAQ);
    safe("FaqSearch", initFaqSearch);
    safe("AreaChecker", initAreaChecker);
    safe("Counters", initCounters);
    safe("Reveal", initReveal);
    safe("BackToTop", initBackToTop);
    safe("CookieBanner", initCookieBanner);
    safe("AvatarFallback", initAvatarFallback);
    safe("WhatsAppChooser", initWhatsAppChooser);
    safe("CallChooser", initCallChooser);
    safe("ScrollProgress", initScrollProgress);
    safe("FontControl", initFontControl);
    safe("FormPrefill", initFormPrefill);
    safe("FormValidation", initFormValidation);
    safe("CtaReassure", initCtaReassure);
    safe("ScrollableTables", initScrollableTables);
    // 3D-Tilt bewusst deaktiviert: ruhiger & seniorenfreundlicher
    safe("Year", setYear);
  });

  /* ---- Horizontal scrollbare Tabellen per Tastatur bedienbar (WCAG 2.1.1) ---- */
  function initScrollableTables() {
    document.querySelectorAll(".table-wrap").forEach(function (el) {
      if (el.scrollWidth <= el.clientWidth) return; // nur wenn wirklich scrollbar
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "region");
      if (!el.getAttribute("aria-label")) {
        var cap = el.querySelector("caption, th");
        el.setAttribute("aria-label", (cap ? cap.textContent.trim() + " – " : "") + "Tabelle, horizontal scrollbar");
      }
    });
  }

  /* ---- Reibung senken: kurze Bestätigung direkt unter den CTA-Buttons ---- */
  function initCtaReassure() {
    var ctas = document.querySelectorAll(".cta-band .hero-cta");
    if (!ctas.length) return;
    ctas.forEach(function (cta) {
      if (cta.parentNode.querySelector(".cta-reassure")) return;
      var p = document.createElement("p");
      p.className = "cta-reassure";
      p.textContent = "Kostenlos · unverbindlich · meist Antwort am selben Tag";
      cta.parentNode.insertBefore(p, cta.nextSibling);
    });
  }

  /* ---- Seniorenfreundlich: Schriftgröße A- / A+ (gespeichert) ---- */
  function initFontControl() {
    var btns = document.querySelectorAll("[data-font]");
    if (!btns.length) return;
    var steps = [100, 112, 125, 138]; // Prozent der Grundschrift
    var KEY = "medicare_fontstep";
    var idx = 0;
    try { idx = parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) {}
    idx = Math.max(0, Math.min(steps.length - 1, idx));

    var apply = function () {
      document.documentElement.style.fontSize = steps[idx] + "%";
      btns.forEach(function (b) {
        var dir = b.getAttribute("data-font");
        var disabled = (dir === "dec" && idx === 0) || (dir === "inc" && idx === steps.length - 1);
        b.setAttribute("aria-disabled", disabled ? "true" : "false");
      });
    };
    apply();

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        idx += b.getAttribute("data-font") === "inc" ? 1 : -1;
        idx = Math.max(0, Math.min(steps.length - 1, idx));
        try { localStorage.setItem(KEY, idx); } catch (e) {}
        apply();
      });
    });
  }

  /* ---- Scroll-Fortschrittsleiste oben ---- */
  function initScrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- Anrufen: erst Person wählen (Nadim/Farhad), dann Nummer wählen ---- */
  function initCallChooser() {
    // Alle generischen "Anrufen"-Buttons (Standardnummer) öffnen die Auswahl.
    // Explizite Personen-Links sind mit data-direct ausgenommen und wählen direkt.
    var triggers = document.querySelectorAll('a[href="tel:+491607621876"]:not([data-direct])');
    if (!triggers.length) return;

    var people = [
      { name: "Nadim Nauroz", disp: "0160 762 18 76", tel: "+491607621876" },
      { name: "Farhad Ramazani", disp: "0176 317 308 27", tel: "+4917631730827" }
    ];

    var ov = document.createElement("div");
    ov.className = "call-modal";
    ov.innerHTML =
      '<div class="call-card" role="dialog" aria-modal="true" aria-label="Anrufen – Person wählen">' +
        '<button class="call-close" aria-label="Schließen">&times;</button>' +
        '<div class="call-title">Wen möchten Sie anrufen?</div>' +
        people.map(function (p) {
          return '<a class="call-opt" href="tel:' + p.tel + '">' +
            '<span class="call-opt-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>' +
            '<span class="call-opt-txt"><strong>' + p.name + '</strong><span>' + p.disp + '</span></span></a>';
        }).join("") +
      '</div>';
    document.body.appendChild(ov);

    var setOpen = function (v) { ov.classList.toggle("show", v); };
    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) { e.preventDefault(); setOpen(true); });
    });
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.classList.contains("call-close")) setOpen(false);
    });
    ov.querySelectorAll(".call-opt").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---- WhatsApp: erst Person wählen (Nadim/Farhad), dann Chat öffnen ---- */
  function initWhatsAppChooser() {
    var float = document.querySelector(".whatsapp-float");
    if (!float) return;

    var people = [
      { name: "Nadim Nauroz", area: "Team Leiter Eilbek, Harburg und Wilhelmsburg", num: "491607621876" },
      { name: "Farhad Ramazani", area: "Wilhelmsburg, Harburg & ganz Hamburg", num: "4917631730827" }
    ];

    var pop = document.createElement("div");
    pop.className = "wa-pop";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", "WhatsApp – Ansprechpartner wählen");
    pop.innerHTML =
      '<div class="wa-pop-head">Wen möchten Sie anschreiben?</div>' +
      people.map(function (p) {
        return '<a class="wa-pop-item" href="https://wa.me/' + p.num +
          '" target="_blank" rel="noopener">' +
          '<span class="wa-pop-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z"/></svg></span>' +
          '<span class="wa-pop-txt"><strong>' + p.name + '</strong><span>' + p.area + '</span></span></a>';
      }).join("") ;
    document.body.appendChild(pop);

    var open = false;
    var setOpen = function (v) {
      open = v;
      pop.classList.toggle("show", v);
      float.setAttribute("aria-expanded", v ? "true" : "false");
    };

    float.setAttribute("role", "button");
    float.setAttribute("aria-haspopup", "dialog");
    float.addEventListener("click", function (e) {
      e.preventDefault();
      setOpen(!open);
    });
    pop.querySelectorAll(".wa-pop-item").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("click", function (e) {
      if (open && !pop.contains(e.target) && !float.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) setOpen(false);
    });
  }

  /* ---- Portrait-Fallback: zeigt Initialen, falls Foto fehlt ---- */
  function initAvatarFallback() {
    document.querySelectorAll("img[data-initials]").forEach(function (img) {
      img.addEventListener("error", function handle() {
        img.removeEventListener("error", handle);
        var letters = (img.getAttribute("data-initials") || "?").trim();
        var svg =
          "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
          "<rect width='160' height='160' rx='80' fill='%233a94a6'/>" +
          "<text x='80' y='104' font-size='58' font-weight='700' fill='%23ffffff' " +
          "text-anchor='middle' font-family='Segoe UI, Arial, sans-serif'>" + letters + "</text></svg>";
        img.src = "data:image/svg+xml;utf8," + svg.replace(/ /g, "%20");
      });
    });
  }

  /* ---- Mobile Navigation ---- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Gebiets-Checker (Stadtteil eingeben) ---- */
  function initAreaChecker() {
    var form = document.getElementById("areaForm");
    var input = document.getElementById("areaInput");
    var out = document.getElementById("areaResult");
    if (!form || !input || !out) return;

    var core = ["eilbek", "hohenfelde", "barmbek", "wandsbek", "marienthal", "wilhelmsburg", "harburg"];

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim().toLowerCase();
      out.classList.remove("ok", "maybe");
      if (!q) {
        out.classList.add("maybe");
        out.innerHTML = "Bitte geben Sie kurz Ihren Stadtteil ein.";
        return;
      }
      var hit = core.some(function (c) { return q.indexOf(c) !== -1 || c.indexOf(q) !== -1; });
      var hamburg = q.indexOf("hamburg") !== -1;
      if (hit) {
        out.classList.add("ok");
        out.innerHTML = "✓ Wunderbar – hier sind wir regelmäßig für Sie unterwegs. <a href='kontakt.html'>Jetzt anfragen</a> oder <a href='tel:+491607621876'>anrufen</a>.";
      } else if (hamburg) {
        out.classList.add("ok");
        out.innerHTML = "✓ Wir sind in ganz Hamburg aktiv – sehr wahrscheinlich auch bei Ihnen. <a href='tel:+491607621876'>Kurz anrufen</a>, dann ist es sicher.";
      } else {
        out.classList.add("maybe");
        out.innerHTML = "Wir sind in ganz Hamburg und Umgebung aktiv. <a href='tel:+491607621876'>Rufen Sie kurz an</a> – wir finden fast immer eine Lösung.";
      }
    });
  }

  /* ---- FAQ Suche/Filter ---- */
  function initFaqSearch() {
    var input = document.getElementById("faqSearch");
    var list = document.getElementById("faqList");
    if (!input || !list) return;
    var items = list.querySelectorAll(".faq-item");
    var empty = document.getElementById("faqEmpty");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var hits = 0;
      items.forEach(function (it) {
        var match = it.textContent.toLowerCase().indexOf(q) !== -1;
        it.style.display = match ? "" : "none";
        if (match) hits++;
      });
      if (empty) empty.hidden = hits !== 0;
    });
  }

  /* ---- FAQ Accordion ---- */
  function initFAQ() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var btn = item.querySelector(".faq-q");
      var ans = item.querySelector(".faq-a");
      if (!btn || !ans) return;

      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        // close others
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            var oa = other.querySelector(".faq-a");
            var ob = other.querySelector(".faq-q");
            if (oa) oa.style.maxHeight = null;
            if (ob) ob.setAttribute("aria-expanded", "false");
          }
        });

        if (isOpen) {
          item.classList.remove("open");
          ans.style.maxHeight = null;
          btn.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("open");
          ans.style.maxHeight = ans.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---- Counters (statisch & souverän – keine hochzählende Animation) ---- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    counters.forEach(function (el) {
      var t = parseFloat(el.getAttribute("data-counter"));
      el.textContent = (el.getAttribute("data-prefix") || "") + t + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---- Reveal on scroll ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }

    var revealAll = function () {
      els.forEach(function (el) { el.classList.add("visible"); });
    };

    // Sicherheitsnetz ZUERST registrieren: spätestens beim Laden / nach 1,5 s
    // wird alles sichtbar – so bleibt nie etwas unsichtbar, selbst wenn die
    // Observer-Erstellung unten fehlschlägt (kein Inhalt = keine leere Box).
    if (document.readyState === "complete") setTimeout(revealAll, 200);
    else window.addEventListener("load", function () { setTimeout(revealAll, 200); });
    setTimeout(revealAll, 1500);

    try {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

      els.forEach(function (el) { obs.observe(el); });
    } catch (e) {
      revealAll();
    }
  }

  /* ---- Back to top ---- */
  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 480);
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Cookie / DSGVO banner ---- */
  function initCookieBanner() {
    var banner = document.querySelector(".cookie-banner");
    if (!banner) return;

    var KEY = "medicare_cookie_ok";
    var accepted;
    try { accepted = localStorage.getItem(KEY); } catch (e) { accepted = "1"; }

    if (!accepted) {
      setTimeout(function () { banner.classList.add("show"); }, 700);
    }

    var btn = banner.querySelector("[data-cookie-accept]");
    if (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem(KEY, "1"); } catch (e) {}
        banner.classList.remove("show");
      });
    }
  }

  /* ---- Kontaktformular: Vorbelegung per URL (z. B. § 37.3 Videoanruf) ----
     Deep-Links wie kontakt.html?leistung=pflegeberatung&modus=video wählen
     die passende Leistung und die Beratungsart automatisch aus. */
  function initFormPrefill() {
    var form = document.getElementById("careForm");
    if (!form || !window.URLSearchParams) return;
    var params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    // Wählt in einem <select> die Option, deren Text den Suchbegriff enthält
    var selectByText = function (id, needle) {
      var sel = document.getElementById(id);
      if (!sel || !needle) return;
      var want = needle.toLowerCase();
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.toLowerCase().indexOf(want) !== -1) { sel.selectedIndex = i; break; }
      }
    };

    var leistung = (params.get("leistung") || "").toLowerCase();
    if (leistung.indexOf("pfleg") !== -1 || leistung.indexOf("37") !== -1) {
      selectByText("leistung", "37.3");
    } else if (leistung) {
      selectByText("leistung", leistung);
    }

    var modus = (params.get("modus") || "").toLowerCase();
    if (modus === "video" || modus.indexOf("video") !== -1) selectByText("modus", "videoanruf");
    else if (modus === "vorort" || modus.indexOf("ort") !== -1) selectByText("modus", "vor ort");

    // Formular sanft in den Blick rücken (falls kein #-Anker greift)
    if ((leistung || modus) && !window.location.hash) {
      try { form.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
    }
  }

  /* ---- Kontaktformular: freundliche Live-Validierung ---- */
  function initFormValidation() {
    var form = document.getElementById("careForm");
    if (!form) return;

    var setError = function (field, msg) {
      var wrap = field.closest(".field") || field.parentNode;
      wrap.classList.add("invalid");
      var el = wrap.querySelector(".field-error");
      if (!el) {
        el = document.createElement("span");
        el.className = "field-error";
        el.setAttribute("aria-live", "polite");
        wrap.appendChild(el);
      }
      el.textContent = msg;
      field.setAttribute("aria-invalid", "true");
    };
    var clearError = function (field) {
      var wrap = field.closest(".field") || field.parentNode;
      wrap.classList.remove("invalid");
      var el = wrap.querySelector(".field-error");
      if (el) el.textContent = "";
      field.removeAttribute("aria-invalid");
    };

    var validateField = function (field) {
      var val = (field.value || "").trim();
      if (field.type === "checkbox") {
        if (field.required && !field.checked) { setError(field, "Bitte bestätigen Sie diesen Punkt."); return false; }
        clearError(field); return true;
      }
      if (field.required && !val) { setError(field, "Bitte ausfüllen."); return false; }
      if (field.type === "email" && val) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { setError(field, "Bitte eine gültige E-Mail-Adresse eingeben."); return false; }
      }
      if (field.id === "phone" && val) {
        if (!/[0-9]{4,}/.test(val.replace(/[^0-9]/g, ""))) { setError(field, "Bitte eine erreichbare Telefonnummer angeben."); return false; }
      }
      clearError(field); return true;
    };

    var fields = form.querySelectorAll("input[required], input#phone, input[type=email], input[type=checkbox]");
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { validateField(f); });
      f.addEventListener("input", function () { if (f.closest(".field, .consent").classList.contains("invalid")) validateField(f); });
      f.addEventListener("change", function () { validateField(f); });
    });

    // Fallback, falls das Formspree-Formular noch nicht eingerichtet ist:
    // keine Anfrage ins Leere/auf eine Fehlerseite schicken.
    var showFallback = function () {
      var btn = form.querySelector('button[type="submit"]');
      var box = form.querySelector(".form-fallback");
      if (!box) {
        box = document.createElement("div");
        box.className = "form-fallback";
        box.setAttribute("role", "alert");
        box.innerHTML =
          '<strong>Fast geschafft!</strong> Unser Online-Formular wird gerade eingerichtet. ' +
          'Am schnellsten erreichen Sie uns direkt – wir sind rund um die Uhr für Sie da:' +
          '<div class="form-fallback-actions">' +
            '<a class="btn btn-cta" href="tel:+491607621876" data-direct>Jetzt anrufen</a>' +
            '<a class="btn btn-outline" href="https://wa.me/491607621876" target="_blank" rel="noopener">WhatsApp schreiben</a>' +
          '</div>';
        if (btn) btn.parentNode.insertBefore(box, btn.nextSibling);
        else form.appendChild(box);
      }
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    form.addEventListener("submit", function (e) {
      var ok = true, first = null;
      fields.forEach(function (f) {
        if (!validateField(f)) { ok = false; if (!first) first = f; }
      });
      if (!ok) {
        e.preventDefault();
        if (first && first.focus) first.focus();
        return;
      }
      var action = form.getAttribute("action") || "";

      // Platzhalter noch aktiv: keine Anfrage ins Leere – freundlicher Fallback.
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        showFallback();
        return;
      }

      // Echtes Endpoint: per fetch absenden. Ein Fehler (Formspree/Netz down)
      // endet so NIE auf einer Browser-Fehlerseite, sondern im Fallback.
      if (window.fetch && window.FormData) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var label = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "Wird gesendet…"; } // Doppelklick-Schutz
        fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          var nextEl = form.querySelector('input[name="_next"]');
          window.location.href = (nextEl && nextEl.value) || "danke.html";
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          showFallback();
        });
      }
      // Ältere Browser ohne fetch: nativer POST greift unverändert.
    });
  }

  /* ---- Current year in footer ---- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
