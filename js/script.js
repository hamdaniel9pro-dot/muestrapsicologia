(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  var navBackdrop = document.getElementById("navBackdrop");

  function openNav() {
    siteNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navBackdrop.hidden = false;
  }
  function closeNav() {
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navBackdrop.hidden = true;
  }
  if (navToggle && siteNav && navBackdrop) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.contains("is-open");
      if (isOpen) { closeNav(); } else { openNav(); }
    });
    navBackdrop.addEventListener("click", closeNav);
    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeNav(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) { closeNav(); }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Hero parallax (ligero) ---------- */
  var heroDecor = document.getElementById("heroDecor");
  if (heroDecor && !prefersReducedMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        var offset = window.scrollY * 0.12;
        heroDecor.style.transform = "translateY(" + offset + "px)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- FAQ Accordion ---------- */
  var accordion = document.getElementById("accordion");
  if (accordion) {
    accordion.querySelectorAll(".accordion-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(btn.getAttribute("aria-controls"));

        accordion.querySelectorAll(".accordion-trigger").forEach(function (other) {
          if (other !== btn) {
            other.setAttribute("aria-expanded", "false");
            var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
            if (otherPanel) { otherPanel.hidden = true; }
          }
        });

        btn.setAttribute("aria-expanded", String(!expanded));
        if (panel) { panel.hidden = expanded; }
      });
    });
  }

})();
