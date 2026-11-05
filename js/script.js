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

  /* ---------- Booking form ---------- */
  var form = document.getElementById("bookingForm");
  if (form) {
    var fields = {
      nombre: document.getElementById("f-nombre"),
      telefono: document.getElementById("f-telefono"),
      correo: document.getElementById("f-correo"),
      modalidad: document.getElementById("f-modalidad"),
      dia: document.getElementById("f-dia"),
      hora: document.getElementById("f-hora"),
      privacidad: document.getElementById("f-privacidad")
    };
    var confirmation = document.getElementById("formConfirmation");

    var openDays = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    var dayKeyMap = {
      lunes: "days.monday", martes: "days.tuesday", miercoles: "days.wednesday",
      jueves: "days.thursday", viernes: "days.friday", sabado: "days.saturday", domingo: "days.sunday"
    };

    function buildSlots() {
      var slots = [];
      [["10:00", "14:00"], ["16:00", "20:00"]].forEach(function (range) {
        var start = range[0], end = range[1];
        var cur = toMinutes(start);
        var limit = toMinutes(end);
        while (cur < limit) {
          slots.push(fromMinutes(cur));
          cur += 30;
        }
      });
      return slots;
    }
    function toMinutes(hhmm) {
      var p = hhmm.split(":");
      return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    }
    function fromMinutes(mins) {
      var h = Math.floor(mins / 60);
      var m = mins % 60;
      return (h < 10 ? "0" + h : h) + ":" + (m === 0 ? "00" : m);
    }

    var timeSlots = buildSlots();

    function t(key) {
      return (window.claraI18n && window.claraI18n.t(key)) || key;
    }

    function renderHoraOptions() {
      var dia = fields.dia.value;
      var select = fields.hora;
      var previousValue = select.value;
      select.innerHTML = "";

      if (!dia) {
        select.disabled = true;
        addOption(select, "", t("booking.timeSelectFirst"));
        return;
      }

      if (openDays.indexOf(dia) === -1) {
        select.disabled = true;
        addOption(select, "", t("booking.closed"));
        return;
      }

      select.disabled = false;
      addOption(select, "", t("booking.timeSelect"));
      timeSlots.forEach(function (slot) {
        addOption(select, slot, slot);
      });

      if (timeSlots.indexOf(previousValue) !== -1) {
        select.value = previousValue;
      }
    }

    function addOption(select, value, label) {
      var opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    }

    fields.dia.addEventListener("change", function () {
      renderHoraOptions();
      clearError("hora");
      validateField("dia");
    });

    document.addEventListener("langchange", function () {
      renderHoraOptions();
    });

    renderHoraOptions();

    function setError(name, message) {
      var errorEl = document.getElementById("err-" + name);
      var field = fields[name];
      if (errorEl) { errorEl.textContent = message || ""; }
      if (field) {
        var wrapper = field.closest(".field");
        if (wrapper) { wrapper.classList.toggle("is-invalid", Boolean(message)); }
      }
    }
    function clearError(name) { setError(name, ""); }

    function validateField(name) {
      var value;
      switch (name) {
        case "nombre":
          value = fields.nombre.value.trim();
          if (value.length < 2) { setError("nombre", t("errors.nombre")); return false; }
          clearError("nombre"); return true;

        case "telefono":
          value = fields.telefono.value.trim();
          var digits = value.replace(/[^0-9]/g, "");
          if (digits.length < 9) { setError("telefono", t("errors.telefono")); return false; }
          clearError("telefono"); return true;

        case "correo":
          value = fields.correo.value.trim();
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) { setError("correo", t("errors.correo")); return false; }
          clearError("correo"); return true;

        case "modalidad":
          if (!fields.modalidad.value) { setError("modalidad", t("errors.modalidad")); return false; }
          clearError("modalidad"); return true;

        case "dia":
          if (!fields.dia.value) { setError("dia", t("errors.dia")); return false; }
          if (openDays.indexOf(fields.dia.value) === -1) { setError("dia", t("errors.diaClosed")); return false; }
          clearError("dia"); return true;

        case "hora":
          if (!fields.hora.value) { setError("hora", t("errors.hora")); return false; }
          clearError("hora"); return true;

        case "privacidad":
          if (!fields.privacidad.checked) { setError("privacidad", t("errors.privacidad")); return false; }
          clearError("privacidad"); return true;

        default:
          return true;
      }
    }

    ["nombre", "telefono", "correo", "modalidad", "dia", "hora"].forEach(function (name) {
      fields[name].addEventListener("blur", function () { validateField(name); });
    });
    fields.privacidad.addEventListener("change", function () { validateField("privacidad"); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      /* SIMULACIÓN: no se realiza ninguna petición de red; solo se valida localmente. */

      var names = ["nombre", "telefono", "correo", "modalidad", "dia", "hora", "privacidad"];
      var allValid = true;
      names.forEach(function (name) {
        if (!validateField(name)) { allValid = false; }
      });

      if (!allValid) {
        confirmation.hidden = true;
        var firstInvalid = form.querySelector(".is-invalid input, .is-invalid select");
        if (firstInvalid) { firstInvalid.focus(); }
        return;
      }

      var dayLabel = t(dayKeyMap[fields.dia.value]);
      var modalityLabel = fields.modalidad.value === "presencial"
        ? t("booking.modalityInPerson")
        : t("booking.modalityOnline");

      var message = t("booking.confirmation")
        .replace("{nombre}", fields.nombre.value.trim())
        .replace("{dia}", dayLabel)
        .replace("{hora}", fields.hora.value)
        .replace("{modalidad}", modalityLabel);

      confirmation.textContent = message;
      confirmation.hidden = false;

      form.reset();
      renderHoraOptions();
      names.forEach(clearError);
    });
  }
})();
