/* Ground Zero Airsoft USA — spec mockup. Mechanical, weighty motion; rings sweep on once.
   Everything renders in its final state without JS or with reduced motion. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");

  // Year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile nav
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); }
    });
  }

  // Condensing header
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () { head.classList.toggle("is-condensed", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  // Count-up — verified figures only (2002, 65, 250, 24, 400, 500). Final value is in the HTML.
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(end) || reduce) return;
    var t0 = null, dur = 600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = end;
    }
    requestAnimationFrame(step);
  }

  // Chrono ticks illuminate left to right, 60ms apart, once
  function lightTicks(table) {
    if (reduce) return;
    var ticks = table.querySelectorAll(".ticks i");
    ticks.forEach(function (t) { t.style.transitionDelay = "0ms"; });
    var rows = table.querySelectorAll("tbody tr");
    var k = 0;
    rows.forEach(function (row) {
      row.querySelectorAll(".ticks i").forEach(function (t) { t.style.transitionDelay = (k++ * 60) + "ms"; });
    });
  }

  if (root.classList.contains("js-motion")) {
    document.querySelectorAll(".rv-stagger").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add("rv"); c.style.setProperty("--i", i); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains("chrono")) lightTicks(el);
        el.classList.add("is-in");
        el.querySelectorAll("[data-count]").forEach(countUp);
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  }

  // Selector (fields + game modes): instant state change, no slide, no crossfade
  document.querySelectorAll("[data-selector]").forEach(function (sel) {
    var tabs = Array.prototype.slice.call(sel.querySelectorAll('[role="tab"]'));
    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); activate(n, true); }
      });
    });
    var hash = location.hash && sel.querySelector('[data-hash="' + location.hash.slice(1) + '"]');
    activate(hash || sel.querySelector('[data-default]') || tabs[0]);
  });

  // Enquiry form — mockup only, not connected. Validation uses white + weight, never blue.
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var errId = f.id + "-err", err = document.getElementById(errId);
        var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) {
          ok = false;
          if (!err) {
            err = document.createElement("p"); err.className = "err"; err.id = errId;
            err.textContent = f.type === "email" ? "Enter a valid email address." : "This field is needed.";
            f.insertAdjacentElement("afterend", err);
            f.setAttribute("aria-describedby", errId);
          }
        } else if (err) { err.remove(); f.removeAttribute("aria-describedby"); }
      });
      var status = form.querySelector(".form-status");
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      status.hidden = false;
      status.textContent = "Mockup only — this form is not connected, nothing was sent. [FORM HANDLER + RECIPIENT EMAIL — CONFIRM]";
      status.focus();
    });
  });
})();
