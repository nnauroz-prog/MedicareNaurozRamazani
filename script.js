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
    initCounters();
    initReveal();
    initBackToTop();
    initCookieBanner();
    initAvatarFallback();
    initWhatsAppChooser();
    setYear();
  });

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

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    els.forEach(function (el) { obs.observe(el); });

    // Sicherheitsnetz: nichts darf dauerhaft unsichtbar bleiben
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add("visible"); });
    }, 2200);
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
