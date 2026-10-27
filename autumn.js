/* =========================================================
   AUTUMN EFFECTS  (loads after script.js)
   - drifting leaves across the page
   - a leaf pile along the bottom of the board
   - click the hero countdown for a gust of leaves
   Does nothing unless <html data-season="fall">.
========================================================= */
(function () {
  if (document.documentElement.getAttribute("data-season") !== "fall") return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COLORS = ["#c8431f", "#e07b1a", "#e9a825", "#9b2d20", "#b5651d", "#7d8a2e", "#d4602a"];

  // Three leaf silhouettes: maple, round oak, heart-shaped aspen
  var SHAPES = [
    "M12 2L14 7L18 5L17 10L22 10L19 14L21 18L15 17L13 22H11L9 17L3 18L5 14L2 10L7 10L6 5L10 7Z",
    "M12 1C17 5 20 12 12 22C4 12 7 5 12 1Z",
    "M12 21C4 15 3 8 8 5C10 4 11.5 5 12 7C12.5 5 14 4 16 5C21 8 20 15 12 21Z",
  ];

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function leafSVG() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="' + pick(SHAPES) + '" fill="' + pick(COLORS) + '"/>' +
      '<path d="M12 5V23" stroke="rgba(60,20,5,0.35)" stroke-width="0.9" stroke-linecap="round" fill="none"/>' +
      "</svg>"
    );
  }

  /* ---------- Drifting leaves ---------- */
  var field = document.getElementById("leaf-field");
  if (field && !reduceMotion) {
    var count = window.innerWidth < 560 ? 12 : 22;
    var html = "";
    for (var i = 0; i < count; i++) {
      var dur = rand(11, 22);
      html +=
        '<div class="leaf" style="' +
        "--x:" + rand(-2, 100).toFixed(1) + "vw;" +
        "--size:" + Math.round(rand(16, 34)) + "px;" +
        "--dur:" + dur.toFixed(1) + "s;" +
        "--delay:-" + rand(0, dur).toFixed(1) + "s;" +
        "--sway:" + rand(1.6, 3.4).toFixed(1) + "s;" +
        "--drift:" + Math.round(rand(-120, 160)) + "px;" +
        "--spin:" + Math.round(rand(180, 540)) + "deg" +
        '">' + leafSVG() + "</div>";
    }
    field.innerHTML = html;
  }

  /* ---------- Leaf pile ---------- */
  var pile = document.getElementById("leaf-pile");
  if (pile) {
    var pileHtml = "";
    var n = Math.round(window.innerWidth / 26);
    for (var j = 0; j < n; j++) {
      var size = Math.round(rand(34, 62));
      pileHtml +=
        '<div class="leaf-pile__leaf" style="' +
        "--l:" + rand(-2, 98).toFixed(1) + "%;" +
        "--b:" + Math.round(rand(-22, 14)) + "px;" +
        "--size:" + size + "px;" +
        "--r:" + Math.round(rand(-180, 180)) + 'deg">' + leafSVG() + "</div>";
    }
    pile.innerHTML = pileHtml;
  }

  /* ---------- Gust of leaves on hero click ---------- */
  var hero = document.getElementById("hero");
  if (hero && !reduceMotion && hero.animate) {
    hero.addEventListener("click", function (e) {
      for (var k = 0; k < 16; k++) {
        var el = document.createElement("div");
        el.className = "leaf--burst";
        el.style.setProperty("--size", Math.round(rand(18, 36)) + "px");
        el.innerHTML = leafSVG();
        document.body.appendChild(el);

        var dx = rand(-260, 260);
        var up = rand(80, 220);
        var spin = rand(-540, 540);
        var x = e.clientX, y = e.clientY;

        el.animate(
          [
            { transform: "translate(" + x + "px," + y + "px) rotate(0deg)", opacity: 1 },
            { transform: "translate(" + (x + dx * 0.6) + "px," + (y - up) + "px) rotate(" + spin * 0.4 + "deg)", opacity: 1, offset: 0.3 },
            { transform: "translate(" + (x + dx * 1.2) + "px," + (y + window.innerHeight * 0.7) + "px) rotate(" + spin + "deg)", opacity: 0.9 },
          ],
          { duration: rand(1800, 3000), easing: "cubic-bezier(.3,.6,.4,1)" }
        ).onfinish = (function (node) {
          return function () { node.remove(); };
        })(el);
      }
    });
  }
})();
