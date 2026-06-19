/* =========================================================
   Medicare — Nadim Nauroz
   Globales Skript: Navigation, FAQ, Zähler, Reveal,
   Back-to-Top, Cookie-Banner
   ========================================================= */
(function () {
  "use strict";

  // Markiert, dass JS aktiv ist – erst dann werden Reveal-Elemente versteckt
  document.documentElement.classList.add("js");

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initFAQ();
    initFaqSearch();
    initAreaChecker();
    initCounters();
    initReveal();
    initBackToTop();
    initCookieBanner();
    initAvatarFallback();
    initWhatsAppChooser();
    initCallChooser();
    initScrollProgress();
    initTilt();
    setYear();
  });

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

  /* ---- 3D-Tilt auf Karten (nur Desktop, nicht bei reduzierter Bewegung) ---- */
  function initTilt() {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    } catch (e) { return; }

    var els = document.querySelectorAll(".card, .member, .tip, .team-card, .reason, .switch-step, .step, .contact-pill");
    els.forEach(function (el) {
      el.style.transformStyle = "preserve-3d";
      el.style.willChange = "transform";
      var raf = null;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transition = "transform .08s ease-out";
          el.style.transform = "perspective(820px) rotateY(" + (px * 6).toFixed(2) +
            "deg) rotateX(" + (-py * 6).toFixed(2) + "deg) translateY(-6px)";
        });
      });
      el.addEventListener("mouseleave", function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transition = "transform .35s ease";
        el.style.transform = "";
      });
    });
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
      { name: "Nadim Nauroz", area: "Eilbek & Umgebung", num: "491607621876" },
      { name: "Farhad Ramazani", area: "Wilhelmsburg, Harburg & Umgebung", num: "4917631730827" }
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

  /* ---- Animated Counters ---- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var duration = 1600;
      var start = null;

      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        var display = Number.isInteger(target) ? Math.round(value) : value.toFixed(0);
        el.textContent = prefix + display + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (c) { obs.observe(c); });
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

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    els.forEach(function (el) { obs.observe(el); });

    // Sicherheitsnetz: spätestens wenn die Seite fertig geladen ist, wird alles
    // sichtbar – so bleibt nie etwas unsichtbar (z. B. ohne Scrollen / Screenshots)
    if (document.readyState === "complete") setTimeout(revealAll, 200);
    else window.addEventListener("load", function () { setTimeout(revealAll, 200); });
    setTimeout(revealAll, 1500);
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

  /* ---- Current year in footer ---- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
