/* ------------------------------------------------------------------
   TELLER — intro animation (Part 1)

   Figma screens → timeline labels
     1  pills            →  "s1"
     2  circles + arrows →  "s2"
     3  row of 4 circles →  "s3"
     4  wordmark lockup  →  "s4"

   All numbers are Figma pixels. Elements read them from the CSS custom
   properties --x / --y / --w, so GSAP animates the *design values* and
   the stylesheet scales them with the screen.

   Two layouts share this one timeline: desktop (1440 × 1024) and phone
   (html.m, 402 × 874). Their Figma numbers live in the LAYOUT table below.

   Debug: index.html?at=s2 freezes the timeline on a Figma screen
          (s1, s2, s3, conv, s4). ?t=2.9 freezes on a time (seconds).
          ?speed=0.5 slows it down.
   ------------------------------------------------------------------ */
(function () {
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };

  var A = $("chipA"), B = $("chipB"), C = $("chipC"), D = $("logo");
  var arrowA = $("arrowA"), arrowALime = $("arrowALime"), arrowB = $("arrowB"), arrowC = $("arrowC");
  var labelB = $("labelB"), labelC = $("labelC");
  var ringC = C.querySelector(".ring");
  var grid = $("grid"), wordmark = $("wordmark"), wordmarkDark = $("wordmarkDark"), tagline = $("tagline");
  var headline = $("headline"), intro = $("intro"), signup = $("signup"), phone = $("phone");

  var M = root.classList.contains("m");            // phone layout?

  // Every number below is a Figma pixel from the matching artboard.
  var LAYOUT = {
    d: {
      k: 1, labelDx: 4.5, labelDy: 0, labelBdx: 0, arrowB: [-1, 0, 0, 0], arrowC: [-1, 1, 0, -1],
      s1: { A: [442, 396], B: [555, 396, 213], C: [621, 512, 264], D: [901, 512] },
      s2: { A: [470, 396], B: [583, 396, 98],  C: [815, 512, 98],  D: [929, 512] },
      s3: { A: [494, 462], B: [612, 462],      C: [730, 462],      D: [848, 463] },
      gather: [671, 462],
      grid: [510, 402, 271.17, 187.71], wm: [529, 478, 190.65, 68.5], tg: [728.64, 509.71, 158.39, 35.29],
      Dll: [574, 467],
      wm2: [629.77, 46.85, 101.504, 36.842], tg2: [735.97, 63.96, 83.98, 18.71], er: 0,
      Dpop: [662, 49, 37], Dcorner: [71, 43]
    },
    m: {
      k: 0.5, labelDx: 1.25, labelDy: -1, labelBdx: -1, arrowB: [-0.5, 0, 0, 0], arrowC: [-0.5, 0.5, 0, -0.5],
      s1: { A: [62, 330],  B: [118.5, 330, 106.5], C: [151.5, 388, 132], D: [291.5, 388] },
      s2: { A: [62, 347],  B: [118.5, 347, 49],    C: [234.5, 404, 49],  D: [291.5, 405] },
      s3: { A: [88, 387],  B: [147, 387],          C: [206, 387],        D: [265, 387.5] },
      gather: [176.5, 387],
      grid: [107, 359.04, 135.585, 93.855], wm: [116.5, 397, 95.325, 34.25], tg: [216.32, 412.9, 79.195, 17.645],
      Dll: [139, 391.5],
      wm2: [236.94, 40.33, 72.068, 26.158], tg2: [312.35, 52.34, 59.67, 13.3], er: 1,
      Dpop: [251.1, 33.4, 43], Dcorner: [25, 26]
    }
  };
  var L = M ? LAYOUT.m : LAYOUT.d;

  // Split the headline into letters (each in its own mask) so they can rise in one by one.
  // Desktop: one line "COMING  SOON". Phone: two lines "COMING" / "SOON".
  var headlineText = M ? "COMING\nSOON" : (headline.getAttribute("data-text") || "");
  headline.innerHTML = headlineText.split("\n").map(function (line) {
    return '<span class="hl">' + line.split("").map(function (c) {
      return '<span class="ch" aria-hidden="true"><span class="ci">' + (c === " " ? " " : c) + "</span></span>";
    }).join("") + "</span>";
  }).join("");
  var letters = headline.querySelectorAll(".ci");
  var introLines = intro.querySelectorAll(".ln-i");
  var signupBits = signup.querySelectorAll(".field, .btn, .status");

  var params = new URLSearchParams(location.search);
  var at = params.get("at");
  var speed = parseFloat(params.get("speed")) || 1;
  var frozen = !!(at || params.get("t"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LIME = "#dcff54", WHITE = "#ffffff", CREAM = "#fffaf3";

  function build() {
    /* ---- Figma screen 1: pills ------------------------------------ */
    gsap.set(A, { "--x": L.s1.A[0], "--y": L.s1.A[1] });
    gsap.set(B, { "--x": L.s1.B[0], "--y": L.s1.B[1], "--w": L.s1.B[2] });
    gsap.set(C, { "--x": L.s1.C[0], "--y": L.s1.C[1], "--w": L.s1.C[2] });
    gsap.set(D, { "--x": L.s1.D[0], "--y": L.s1.D[1] });
    gsap.set(labelC, { "--dx": L.labelDx, "--dy": L.labelDy });
    gsap.set(labelB, { "--dx": L.labelBdx });
    gsap.set(grid, { "--x": L.grid[0], "--y": L.grid[1], "--w": L.grid[2], "--h": L.grid[3] });
    gsap.set(wordmark, { "--x": L.wm[0], "--y": L.wm[1], "--w": L.wm[2], "--h": L.wm[3] });
    gsap.set(wordmarkDark, { "--x": L.wm[0], "--y": L.wm[1], "--w": L.wm[2], "--h": L.wm[3] });
    gsap.set(tagline, { "--x": L.tg[0], "--y": L.tg[1], "--w": L.tg[2], "--h": L.tg[3] });

    gsap.set([A, B, C, D], { opacity: 0, scale: 0.55 });
    gsap.set([labelB, labelC], { opacity: 0 });
    gsap.set(arrowALime, { opacity: 0 });
    gsap.set(arrowB, { rotation: -90, opacity: 0, "--ax": L.arrowB[0], "--ay": L.arrowB[1] });
    gsap.set(arrowC, { rotation: -270, opacity: 0, "--ax": L.arrowC[0], "--ay": L.arrowC[1] });
    gsap.set(grid, { clipPath: "inset(0% 50% 0% 50%)", opacity: 0 });
    gsap.set(wordmark, { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 });
    gsap.set(tagline, { y: 14, opacity: 0 });
    gsap.set(wordmarkDark, { opacity: 0 });
    gsap.set(phone, { opacity: 0, y: -10 });
    gsap.set(letters, { yPercent: 125 });
    gsap.set(introLines, { yPercent: 115 });
    gsap.set(signupBits, { y: 18, opacity: 0 });

    var tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, paused: true });

    /* ---- enter: pieces pop in (fast) ------------------------------ */
    tl.to([A, B, C, D], {
      opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.5)",
      stagger: { each: 0.04, from: "start" }
    }, 0)
    .to([labelB, labelC], { opacity: 1, duration: 0.2, ease: "power2.out", stagger: 0.03 }, 0.12)
    .addLabel("s1", 0.42);

    /* ---- screen 1 → 2: pills collapse into circles ---------------- */
    tl.addLabel("collapse", 0.5)
    .to([labelB, labelC], { opacity: 0, duration: 0.12, ease: "power2.in" }, "collapse")
    .to(B, { "--x": L.s2.B[0], "--y": L.s2.B[1], "--w": L.s2.B[2], duration: 0.4 }, "collapse")
    .to(C, { "--x": L.s2.C[0], "--y": L.s2.C[1], "--w": L.s2.C[2], duration: 0.4 }, "collapse+=0.02")
    .to(A, { "--x": L.s2.A[0], "--y": L.s2.A[1], duration: 0.4 }, "collapse")
    .to(D, { "--x": L.s2.D[0], "--y": L.s2.D[1], duration: 0.4 }, "collapse+=0.02")
    .to(arrowB, { opacity: 1, rotation: 90, duration: 0.35, ease: "power3.out" }, "collapse+=0.2")
    .to(arrowC, { opacity: 1, rotation: -90, duration: 0.35, ease: "power3.out" }, "collapse+=0.24")
    .addLabel("s2", "collapse+=0.5");

    /* ---- screen 2 → 3: circles line up in one row ----------------- */
    tl.addLabel("row", "s2")
    .to(A, { "--x": L.s3.A[0], "--y": L.s3.A[1], duration: 0.4 }, "row")
    .to(B, { "--x": L.s3.B[0], "--y": L.s3.B[1], duration: 0.4 }, "row+=0.02")
    .to(C, { "--x": L.s3.C[0], "--y": L.s3.C[1], duration: 0.4 }, "row+=0.04")
    .to(D, { "--x": L.s3.D[0], "--y": L.s3.D[1], duration: 0.4 }, "row+=0.06")
    .to(C, { backgroundColor: CREAM, duration: 0.25, ease: "power2.out" }, "row+=0.15")
    .to(ringC, { opacity: 1, duration: 0.25, ease: "power2.out" }, "row+=0.15")
    .to(arrowA, { opacity: 0, duration: 0.2, ease: "power2.out" }, "row+=0.08")
    .to(arrowALime, { opacity: 1, duration: 0.2, ease: "power2.out" }, "row+=0.08")
    .to(arrowB, { rotation: 180, "--ax": L.arrowB[2], "--ay": L.arrowB[3], duration: 0.4, ease: "power3.inOut" }, "row+=0.02")
    .to(arrowC, { rotation: 0, "--ax": L.arrowC[2], "--ay": L.arrowC[3], duration: 0.4, ease: "power3.inOut" }, "row+=0.04")
    .addLabel("s3", "row+=0.45");

    /* ---- circles converge into the logo --------------------------- */
    tl.addLabel("gather", "s3")
    .to([A, B, C], { "--x": L.gather[0], "--y": L.gather[1], scale: 0.45, duration: 0.4, ease: "expo.inOut" }, "gather")
    .to(D, { "--x": L.gather[0], "--y": L.gather[1], duration: 0.4, ease: "expo.inOut" }, "gather")
    .to([A, B, C], { opacity: 0, duration: 0.12, ease: "power1.in" }, "gather+=0.26")
    .to(D, { scale: 1.1, duration: 0.1, ease: "power2.out" }, "gather+=0.36")
    .to(D, { scale: 1, duration: 0.18, ease: "power2.inOut" }, "gather+=0.46")
    .addLabel("conv", "gather+=0.45");

    /* ---- screen 4: the loop settles into the wordmark ------------- */
    tl.addLabel("lockup", "conv")
    .to(grid, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.45, ease: "power3.inOut" }, "lockup")
    .to(D, { "--x": L.Dll[0], "--y": L.Dll[1], duration: 0.42, ease: "power3.inOut" }, "lockup")
    .set(wordmark, { opacity: 1 }, "lockup+=0.05")
    .to(wordmark, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut" }, "lockup+=0.05")
    .to(D, { opacity: 0, scale: 1.18, duration: 0.25, ease: "power2.in" }, "lockup+=0.3")
    .to(tagline, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, "lockup+=0.4")
    .addLabel("s4", "lockup+=0.8");

    /* ---- Part 2 · hand-off (automatic — no scrolling needed) ------ */
    // The lockup shrinks up to the header (and slides to the very top of the screen),
    // the loop pops out and flies to the top-left corner, then the headline, the
    // intro, the form and the project cards come in.
    var cards = window.TellerCards ? window.TellerCards.create() : null;
    tl.addLabel("to2", "s4+=0.2")
    .to(grid, { clipPath: "inset(0% 50% 0% 50%)", opacity: 0, duration: 0.45, ease: "power3.inOut" }, "to2")
    .to(wordmark, { "--x": L.wm2[0], "--y": L.wm2[1], "--w": L.wm2[2], "--h": L.wm2[3], "--eb": 1, "--er": L.er, duration: 0.75, ease: "expo.inOut" }, "to2")
    .to(wordmarkDark, { "--x": L.wm2[0], "--y": L.wm2[1], "--w": L.wm2[2], "--h": L.wm2[3], "--eb": 1, "--er": L.er, duration: 0.75, ease: "expo.inOut" }, "to2")
    .to(wordmarkDark, { opacity: 1, duration: 0.2, ease: "none" }, "to2+=0.5")
    .set(wordmark, { opacity: 0 }, "to2+=0.7")
    .to(tagline, { "--x": L.tg2[0], "--y": L.tg2[1], "--w": L.tg2[2], "--h": L.tg2[3], "--eb": 1, "--er": L.er, y: 0, duration: 0.75, ease: "expo.inOut" }, "to2")
    .set(D, { "--x": L.Dpop[0], "--y": L.Dpop[1], "--w": L.Dpop[2], scale: 0, opacity: 1, "--er": 0 }, "to2+=0.5")
    .to(D, { scale: 1, duration: 0.3, ease: "back.out(2)" }, "to2+=0.5")
    .to(D, { "--x": L.Dcorner[0], "--y": L.Dcorner[1], "--ea": 1, "--eb": 1, duration: 0.7, ease: "expo.inOut" }, "to2+=0.8")
    .to(phone, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "to2+=1.3")
    .to(letters, { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.035 }, "to2+=0.45")
    .to(introLines, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, "to2+=1.0")
    .to(signupBits, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.06 }, "to2+=1.1");
    if (cards) tl.add(cards.enter.paused(false), "to2+=1.15");
    tl.addLabel("s5", "to2+=2.3");
    tl.call(function () { root.classList.add("trail-on"); }, null, "to2+=1.4");   // cursor boxes wake up with the cards
    window.__cardsRef = cards;
    if (cards) tl.call(function () { if (!frozen) cards.start(); }, null, "s5");

    return tl;
  }

  function start() {
    if (window.TellerFit) window.TellerFit.apply();   // size the headline to the screen before anything plays
    var tl = build();
    window.__tl = tl; window.__cards = window.__cardsRef;
    tl.timeScale(speed);
    root.classList.add("ready");

    if (frozen) root.classList.add("trail-on");
    if (reduced) { tl.progress(1); return; }
    if (at && tl.labels[at] !== undefined) { tl.seek(at, false); tl.pause(); return; }
    if (params.get("t")) { tl.seek(parseFloat(params.get("t")), false); tl.pause(); return; }
    tl.play();
  }

  var fontsReady = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('26px "Polin"'), document.fonts.ready]).catch(function () {})
    : Promise.resolve();
  var timeout = new Promise(function (r) { setTimeout(r, 2500); });
  Promise.race([fontsReady, timeout]).then(start);
})();
