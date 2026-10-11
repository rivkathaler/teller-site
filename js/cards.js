/* ------------------------------------------------------------------
   Project cards on top of the headline — a deck of cards.
   The top card flicks up and off the screen, the next one slides into its place,
   a fresh one is dealt in underneath. Automatic — no clicking, no scrolling.
   TellerCards.create() → { enter: <gsap timeline>, start(), stop() }
   ------------------------------------------------------------------ */
(function () {
  var HOLD = 2.1;                                   // seconds each card stays on top
  var M = document.documentElement.classList.contains("m");
  var POSE = M ? {                                  // phone (Figma iPhone 17): the next card sits tilted 12.98° right behind the top one
    top:   { rotation: 0,      xPercent: 0,   yPercent: 0, scale: 1 },
    next:  { rotation: 12.98,  xPercent: 1.2, yPercent: 0, scale: 0.996 },
    spare: { rotation: -8,     xPercent: -2,  yPercent: 3, scale: 0.95 }
  } : {                                             // desktop resting positions in the deck
    top:   { rotation: -3,  xPercent: 0,  yPercent: 0, scale: 1 },
    next:  { rotation: 6,   xPercent: 5,  yPercent: 3, scale: 0.95 },
    spare: { rotation: -10, xPercent: -4, yPercent: 6, scale: 0.9 }
  };

  function create() {
    var items = window.TELLER_PROJECTS || [];
    var n = items.length;
    // load every picture up front so cards never pop in half-loaded
    items.forEach(function (it) { if (it.src) { var im = new Image(); im.src = it.src; } });

    var wrap = document.getElementById("cards");
    var back1 = wrap.querySelector(".cd--back1");
    var back2 = wrap.querySelector(".cd--back2");
    var T = document.getElementById("cardA");       // top of the deck
    var N = document.getElementById("cardB");       // next card, peeking out
    var S = document.getElementById("cardC");       // spare, waiting to be dealt

    function fill(el, item) {
      var label = (item && item.label) || "";
      el.innerHTML = '<div class="face">' +
        '<img class="art" src="' + item.src + '" alt="' + label + '">' +
        '<span class="tag"><i></i>' + label + "</span></div>";
    }

    var cur = 0, timer = null, running = false, lastStep = null;
    if (n) { fill(T, items[0]); fill(N, items[1 % n]); fill(S, items[2 % n]); }
    gsap.set(T, Object.assign({ zIndex: 3 }, POSE.top));
    gsap.set(N, { zIndex: 2 });
    gsap.set(S, { zIndex: 1, opacity: 0 });
    gsap.set(N, POSE.next);
    gsap.set(S, POSE.spare);
    gsap.set(N.querySelector(".tag"), { opacity: 0 });
    gsap.set(back1, { rotation: 10, xPercent: -3, yPercent: 4 });
    gsap.set(back2, { rotation: -9, xPercent: 3, yPercent: 5 });

    // entrance: the deck is dealt in from below
    var enter = gsap.timeline({ paused: true });
    enter.set(wrap, { opacity: 1 })
      .from(back2, { yPercent: 130, rotation: -30, opacity: 0, duration: 0.8, ease: "power3.out" }, 0)
      .from(back1, { yPercent: 130, rotation: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, 0.08)
      .from(N, { yPercent: 130, rotation: 24, opacity: 0, duration: 0.85, ease: "power3.out" }, 0.16)
      .from(T, { yPercent: 130, rotation: -26, opacity: 0, duration: 0.9, ease: "power3.out" }, 0.26);

    function step() {
      if (!running || n < 2) return;
      fill(S, items[(cur + 2) % n]);
      gsap.set(S, Object.assign({ opacity: 0, zIndex: 1 }, POSE.spare));
      gsap.set(S.querySelector(".tag"), { opacity: 0 });

      var top = T, nxt = N, sp = S;
      var dir = cur % 2 ? -1 : 1;
      lastStep = gsap.timeline({
        onComplete: function () {
          T = nxt; N = sp; S = top;
          gsap.set(S, { y: 0, xPercent: 0, yPercent: 0, rotation: 0, opacity: 0, zIndex: 1 });
          gsap.set(T, { zIndex: 3 }); gsap.set(N, { zIndex: 2 });
          cur = (cur + 1) % n;
          timer = gsap.delayedCall(HOLD, step);
        }
      })
      // the top card is flicked up, spinning, and off the screen
      .set(top, { zIndex: 5 }, 0)
      .to(top, { y: function () { return -window.innerHeight * 1.2; }, xPercent: 22 * dir, rotation: 24 * dir, scale: 1.08,
                 duration: 0.85, ease: "power2.in" }, 0)
      // the next card takes its place on top of the deck
      .to(nxt, Object.assign({ duration: 0.8, ease: "power3.out" }, POSE.top), 0.1)
      .to(nxt.querySelector(".tag"), { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.45)
      // a new card is dealt in underneath
      .to(sp, Object.assign({ opacity: 1, duration: 0.7, ease: "power3.out" }, POSE.next), 0.3)
      // the coloured cards behind shuffle
      .to(back1, { rotation: dir > 0 ? -7 : 10, xPercent: dir > 0 ? 4 : -3, duration: 0.9, ease: "power3.inOut" }, 0)
      .to(back2, { rotation: dir > 0 ? 8 : -9, xPercent: dir > 0 ? -3 : 3, duration: 0.9, ease: "power3.inOut" }, 0.05);
    }

    return {
      enter: enter,
      start: function () { if (running) return; running = true; timer = gsap.delayedCall(HOLD, step); },
      stop: function () { running = false; if (timer) timer.kill(); },
      step: function () { return lastStep; }          // debug: freeze the flick with .pause().progress(0.4)
    };
  }

  window.TellerCards = { create: create };
})();
