/* ------------------------------------------------------------------
   Headline fit — "COMING SOON" runs edge to edge across the WHOLE screen
   (like the Figma, where the letters bleed past both sides), at any size.
   It also tells the project cards where the gap between the two words is.
   ------------------------------------------------------------------ */
(function () {
  var BLEED = 1.07;                 // text is 7% wider than the screen → a little crop each side, as in Figma
  var CAP_CENTER = 0.736;           // Polin: centre of the capital letters, as a fraction of font-size below the box top
  var frame = document.getElementById("frame");
  var headline = document.getElementById("headline");
  var root = document.documentElement;

  var M = root.classList.contains("m");

  function applyPhone() {
    // Figma "iPhone 17": 101px Medium, two lines, left edge at x −19 (bleeds off the left AND right of the screen)
    var fr = frame.getBoundingClientRect();
    var px = fr.width / 402;
    var fs = 101 * px;
    headline.style.fontSize = fs + "px";
    frame.style.setProperty("--fs", fs + "px");
    frame.style.setProperty("--hy", (237 * px) + "px");
    frame.style.setProperty("--hx", (-19 * px - (window.innerWidth - fr.width) / 2) + "px");
  }

  function apply() {
    if (M) { applyPhone(); return; }
    var letters = headline.querySelectorAll(".ch");
    if (!letters.length) return;
    var fs0 = parseFloat(getComputedStyle(headline).fontSize);
    var a = letters[0].getBoundingClientRect(), z = letters[letters.length - 1].getBoundingClientRect();
    var em = (z.right - a.left) / fs0;                              // text width in "font-sizes"
    var fs = Math.min((window.innerWidth * BLEED) / em, window.innerHeight * 0.45);
    headline.style.fontSize = fs + "px";

    var fr = frame.getBoundingClientRect();
    var px = fr.width / 1440;                                       // one Figma pixel, in screen pixels
    var cy = 492 * px;                                              // centre of the capitals (Figma: y 492)
    var txt = headline.getAttribute("data-text") || "";
    var i0 = txt.indexOf(" "), i1 = txt.lastIndexOf(" ");
    var gx = fr.width / 2;
    if (i0 > 0 && i1 > i0 && i1 < letters.length - 1) {
      var g = letters[i0 - 1].getBoundingClientRect(), s = letters[i1 + 1].getBoundingClientRect();
      gx = (g.right + s.left) / 2 - fr.left;                        // middle of the gap between the words
    }
    frame.style.setProperty("--fs", fs + "px");
    frame.style.setProperty("--hy", (cy - CAP_CENTER * fs) + "px");
    frame.style.setProperty("--cy", cy + "px");
    frame.style.setProperty("--gx", gx + "px");
  }

  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(apply, 80); });
  window.TellerFit = { apply: apply };
})();
