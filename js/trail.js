/* ------------------------------------------------------------------
   Cursor trail — little outlined boxes light up on a grid as the mouse
   (or a finger) moves, then shrink and fade away. Very faint brand lime.
   Wakes up when Part 2 arrives (the page gets the class "trail-on").

   Tweak here:  PEAK = strongest line opacity · CELL = box size (Figma px)
   ------------------------------------------------------------------ */
(function () {
  var cv = document.getElementById("trail");
  if (!cv || !cv.getContext) return;
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var ctx = cv.getContext("2d");
  var RGB = "220,255,84";            // #dcff54
  var PEAK = 0.5;                    // line opacity at the brightest box (50%) — most boxes are fainter
  var CELL = 54;                     // box size in Figma pixels
  var RADIUS = 2.4;                  // how many boxes around the cursor light up
  var LIFE = 1.5;                    // seconds a box takes to fade out

  var cells = Object.create(null), count = 0, raf = 0, last = 0;
  var dpr = 1, W = 0, H = 0, cell = 54, lastX = null, lastY = null;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var fr = document.getElementById("frame");
    var px = fr ? fr.getBoundingClientRect().width / 1440 : W / 1440;
    cell = Math.max(26, Math.round(CELL * px));
  }

  function light(x, y) {
    var ci = Math.floor(x / cell), cj = Math.floor(y / cell), r = Math.ceil(RADIUS);
    for (var i = ci - r; i <= ci + r; i++) {
      for (var j = cj - r; j <= cj + r; j++) {
        var d = Math.hypot(i + 0.5 - x / cell, j + 0.5 - y / cell);
        if (d > RADIUS) continue;
        var v = 1 - d / (RADIUS + 0.4);
        var k = i + "," + j;
        if (!cells[k]) { cells[k] = { i: i, j: j, v: 0 }; count++; }
        if (v > cells[k].v) cells[k].v = v;
      }
    }
  }

  function move(x, y) {
    if (!root.classList.contains("trail-on")) return;
    if (lastX !== null) {                       // fill the gaps when the pointer moves fast
      var dx = x - lastX, dy = y - lastY, n = Math.ceil(Math.hypot(dx, dy) / (cell * 0.6));
      for (var s = 1; s < n; s++) light(lastX + dx * s / n, lastY + dy * s / n);
    }
    light(x, y);
    lastX = x; lastY = y;
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.25;
    for (var k in cells) {
      var c = cells[k], e = c.v * c.v * (3 - 2 * c.v);       // smooth
      var s = 0.55 + 0.45 * e, side = cell * s, off = (cell - side) / 2;
      var x = c.i * cell + off, y = c.j * cell + off;
      ctx.fillStyle = "rgba(" + RGB + "," + (0.07 * e).toFixed(3) + ")";
      ctx.fillRect(x, y, side, side);
      ctx.strokeStyle = "rgba(" + RGB + "," + (PEAK * e).toFixed(3) + ")";
      ctx.strokeRect(x + 0.5, y + 0.5, side - 1, side - 1);
    }
  }

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    for (var k in cells) {
      cells[k].v -= dt / LIFE;
      if (cells[k].v <= 0) { delete cells[k]; count--; }
    }
    draw();
    raf = count > 0 ? requestAnimationFrame(frame) : 0;
    if (!count) { lastX = lastY = null; }
  }

  window.addEventListener("pointermove", function (e) { move(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("pointerleave", function () { lastX = lastY = null; });
  window.addEventListener("resize", size);
  size();
  window.TellerTrail = { poke: function (x, y) { light(x, y); draw(); }, resize: size };   // for testing
})();
