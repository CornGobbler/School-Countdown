/* =========================================================
   POLISH  (loads after script.js, uses its globals)
   - category filter buttons
   - "Next up" marker on the next event card
   - cards stop re-animating on the once-a-minute refresh
   - metric notes count up on load
   - hero digits pop when they change
   - tab title shows the live countdown
========================================================= */
(function () {
  var grid = document.getElementById("events-grid");
  if (!grid || typeof parsedEvents === "undefined") return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Filter legend ---------- */
  var CATS = [
    ["all", "All", ""],
    ["milestone", "Milestones", "pin--red"],
    ["recess", "Recesses", "pin--teal"],
    ["holiday", "Holidays", "pin--gold"],
    ["nonstudent", "Non-student", "pin--slate"],
  ];
  var filter = "all";

  var legend = document.createElement("div");
  legend.className = "legend";
  legend.setAttribute("role", "group");
  legend.setAttribute("aria-label", "Filter events by type");
  legend.innerHTML = CATS.map(function (c) {
    return (
      '<button type="button" class="legend__btn" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === "all") + '">' +
      (c[2] ? '<span class="pin ' + c[2] + '" aria-hidden="true"></span>' : "") +
      c[1] + "</button>"
    );
  }).join("");
  grid.parentNode.insertBefore(legend, grid);

  legend.addEventListener("click", function (e) {
    var btn = e.target.closest(".legend__btn");
    if (!btn) return;
    filter = btn.getAttribute("data-cat");
    legend.querySelectorAll(".legend__btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    decorate();
  });

  /* ---------- Tag cards: filter, next-up, no re-animation ---------- */
  var hasRendered = false;

  function decorate() {
    var cards = Array.prototype.slice.call(grid.children);
    var nextFound = false;
    cards.forEach(function (card, i) {
      var ev = parsedEvents[i];
      if (!ev) return;
      card.hidden = filter !== "all" && ev.category !== filter;
      var isNext = !nextFound && !card.classList.contains("card--done");
      if (isNext) nextFound = true;
      card.classList.toggle("card--next", isNext);
      if (hasRendered) card.classList.add("card--static");
    });
    if (cards.length) hasRendered = true;
  }

  decorate();
  // script.js re-renders the cards every minute; re-apply our tags each time
  new MutationObserver(decorate).observe(grid, { childList: true });

  /* ---------- Metrics count up (first load only) ---------- */
  if (!reduce) {
    document.querySelectorAll(".metric__value").forEach(function (el) {
      var m = el.textContent.match(/^(\d+)(%?)$/);
      if (!m) return;
      var end = Number(m[1]), suffix = m[2], t0 = performance.now();
      (function step() {
        var p = Math.min((performance.now() - t0) / 900, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })();
    });
  }

  /* ---------- Hero digits pop on change ---------- */
  document.querySelectorAll(".clock__num").forEach(function (el) {
    var last = el.textContent;
    new MutationObserver(function () {
      if (el.textContent === last) return;
      last = el.textContent;
      el.classList.remove("pop");
      void el.offsetWidth; // restart the animation
      el.classList.add("pop");
    }).observe(el, { childList: true });
  });

  /* ---------- Live countdown in the browser tab ---------- */
  function text(id) { return document.getElementById(id).textContent; }
  setInterval(function () {
    var title = text("hero-title");
    if (title === "\u2014" || title === "That's a wrap!") return;
    var verb = text("hero-eyebrow") === "happening now" ? "Now" : "Next";
    document.title = verb + ": " + title + " \u00B7 " + Number(text("clock-days")) + "d " + Number(text("clock-hours")) + "h";
  }, 1000);
})();
