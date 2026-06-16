/* =========================================================================
   MOSAIC SYSTEMS — motion & experience layer
   ========================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var docEl = document.documentElement;
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- nav scrolled state + progress + scroll velocity --------------- */
  var nav = qs("#nav");
  var prog = qs("#progress");
  var gridBg = qs(".hero-grid-bg");
  var lastY = window.scrollY;
  var scrollVel = 0;
  function onScroll() {
    var y = window.scrollY;
    scrollVel = Math.min(60, Math.abs(y - lastY));
    lastY = y;
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (prog) {
      var total = docEl.scrollHeight - docEl.clientHeight;
      prog.style.transform = "scaleX(" + (total > 0 ? Math.min(1, y / total) : 0) + ")";
    }
    if (gridBg && !reduce && !document.body.classList.contains("no-motion") && y < window.innerHeight) {
      gridBg.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---- split headline into animatable words -------------------------- */
  var hl = qs("#heroHeadline");
  if (hl && !reduce) {
    var tmp = document.createElement("div");
    tmp.innerHTML = hl.innerHTML;
    var out = [];
    Array.prototype.forEach.call(tmp.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (/^\s+$/.test(tok)) out.push(" ");
          else if (tok.length) out.push('<span class="word"><span>' + tok + "</span></span>");
        });
      } else {
        out.push('<span class="word"><span>' + node.outerHTML + "</span></span> ");
      }
    });
    hl.innerHTML = out.join("");
    qsa(".word > span", hl).forEach(function (w, i) {
      w.style.animationDelay = (0.1 + i * 0.07) + "s";
    });
  }

  /* ---- hero entrance (called once, after the intro clears) ----------- */
  var heroStarted = false;
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    var heroMark = qs("#heroMark");
    if (heroMark) {
      requestAnimationFrame(function () {
        heroMark.classList.add("go");
        setTimeout(function () { heroMark.classList.add("live"); }, 1400);
      });
    }
    if (hl) hl.classList.add("reveal-words");
    setTimeout(function () { var s = qs("#heroSub"); if (s) s.classList.add("in"); }, reduce ? 0 : 240);
    setTimeout(function () { var a = qs("#heroActions"); if (a) a.classList.add("in"); }, reduce ? 0 : 380);
    var rail = qs("#rail"); if (rail) setTimeout(function () { rail.classList.add("show"); }, reduce ? 0 : 600);
  }

  /* ---- intro: brand mark assembles, then the panel wipes up ---------- */
  (function runIntro() {
    var intro = qs("#intro");
    var introMark = qs("#introMark");
    if (!intro) { startHero(); return; }
    var seen = false;
    try { seen = sessionStorage.getItem("ms_intro") === "1"; } catch (e) {}
    if (reduce || seen) {
      intro.classList.add("hidden");
      startHero();
      return;
    }
    try { sessionStorage.setItem("ms_intro", "1"); } catch (e) {}
    docEl.classList.add("intro-lock");
    requestAnimationFrame(function () {
      if (introMark) introMark.classList.add("go");
      setTimeout(function () { intro.classList.add("show-wm"); }, 650);
      setTimeout(function () {
        intro.classList.add("wipe");
        docEl.classList.remove("intro-lock");
        startHero();
      }, 1850);
      setTimeout(function () { intro.classList.add("hidden"); }, 2900);
    });
    /* safety: never trap the user behind the intro */
    setTimeout(function () {
      docEl.classList.remove("intro-lock");
      intro.classList.add("hidden");
      startHero();
    }, 4200);
  })();

  /* ---- duplicate marquee, then drive it (velocity-reactive) ---------- */
  var mqEl = qs("#marquee");
  if (mqEl) {
    mqEl.innerHTML += mqEl.innerHTML;
    if (!reduce) {
      mqEl.classList.add("js-driven");
      var mqPos = 0, mqHover = false, lastT = performance.now();
      var wrap = mqEl.parentElement;
      wrap.addEventListener("mouseenter", function () { mqHover = true; });
      wrap.addEventListener("mouseleave", function () { mqHover = false; });
      var mqLoop = function (now) {
        var dt = Math.min(48, now - lastT); lastT = now;
        if (!mqHover) {
          var speed = 0.045 + scrollVel * 0.018;       // px per ms
          mqPos -= speed * dt;
          var half = mqEl.scrollWidth / 2;
          if (half > 0 && -mqPos >= half) mqPos += half;
          mqEl.style.transform = "translate3d(" + mqPos.toFixed(2) + "px,0,0)";
        }
        scrollVel *= 0.9;
        requestAnimationFrame(mqLoop);
      };
      requestAnimationFrame(mqLoop);
    }
  }


  /* ---- magnetic targets ---------------------------------------------- */
  if (fine && !reduce) {
    qsa("[data-magnetic]").forEach(function (el) {
      var strength = 0.32;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform 0s";
        el.style.transform = "translate(" + (dx * strength).toFixed(1) + "px," + (dy * strength).toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .45s cubic-bezier(.22,.7,.25,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 480);
      });
    });
  }

  /* ---- hero mark mouse parallax -------------------------------------- */
  if (fine && !reduce) {
    var heroSec = qs("#hero"), hMark = qs("#heroMark");
    if (heroSec && hMark) {
      heroSec.addEventListener("mousemove", function (e) {
        var r = heroSec.getBoundingClientRect();
        var px = (e.clientX - r.width / 2) / r.width;
        var py = (e.clientY - r.top - r.height / 2) / r.height;
        hMark.style.transform = "translate(" + (px * 20).toFixed(1) + "px," + (py * 20).toFixed(1) + "px)";
      }, { passive: true });
      heroSec.addEventListener("mouseleave", function () { hMark.style.transform = ""; });
    }
  }

  /* ---- generic scroll reveals ---------------------------------------- */
  var reveals = qsa(".reveal");
  function show(el) { el.classList.add("in"); }
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -7% 0px" });
    var vh = window.innerHeight || 800;
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) show(el);
      else io.observe(el);
    });
    setTimeout(function () { reveals.forEach(show); }, 3200);
  }

  /* ---- approach: draw timeline + stagger steps ----------------------- */
  var apSteps = qs("#apSteps");
  if (apSteps) {
    if (reduce || !("IntersectionObserver" in window)) {
      apSteps.classList.add("drawn");
    } else {
      var draw = function () { apSteps.classList.add("drawn"); };
      var aio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { draw(); aio.unobserve(e.target); } });
      }, { threshold: 0.25 });
      if (apSteps.getBoundingClientRect().top < (window.innerHeight || 800) * 0.9) draw();
      else aio.observe(apSteps);
      setTimeout(draw, 3600);
    }
  }

  /* ---- active section: nav links + section rail ---------------------- */
  var navLinks = qsa("#navlinks a");
  var railLinks = qsa("#rail a");
  var sections = ["hero", "solutions", "approach", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  function setActive(id) {
    navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
    railLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-target") === id); });
  }
  if ("IntersectionObserver" in window && sections.length) {
    var current = null;
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { current = e.target.id; setActive(current); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { sio.observe(s); });
  }
})();
