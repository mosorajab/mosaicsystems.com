/* =========================================================================
   MOSAIC SYSTEMS — motion
   ========================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- nav scrolled state -------------------------------------------- */
  var nav = document.getElementById("nav");
  var prog = document.getElementById("progress");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 12);
    if (prog) {
      var doc = document.documentElement;
      var scrolled = window.scrollY;
      var total = doc.scrollHeight - doc.clientHeight;
      prog.style.transform = "scaleX(" + (total > 0 ? scrolled / total : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- duplicate marquee for seamless loop --------------------------- */
  var mq = document.getElementById("marquee");
  if (mq) { mq.innerHTML += mq.innerHTML; }

  /* ---- split headline into animatable words -------------------------- */
  var hl = document.getElementById("heroHeadline");
  if (hl && !reduce) {
    var html = hl.innerHTML;
    // wrap each top-level word (keeping <em> intact) in .word > span
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    var out = [];
    Array.prototype.forEach.call(tmp.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (/^\s+$/.test(tok)) { out.push(" "); }
          else if (tok.length) { out.push('<span class="word"><span>' + tok + "</span></span>"); }
        });
      } else {
        // element (e.g. <em>) — wrap the whole thing as one word unit
        out.push('<span class="word"><span>' + node.outerHTML + "</span></span> ");
      }
    });
    hl.innerHTML = out.join("");
    // stagger the word reveals
    var words = hl.querySelectorAll(".word > span");
    Array.prototype.forEach.call(words, function (w, i) {
      w.style.animationDelay = (0.35 + i * 0.07) + "s";
    });
  }

  /* ---- orchestrate hero entrance ------------------------------------- */
  function start() {
    var heroMark = document.getElementById("heroMark");
    if (heroMark) {
      requestAnimationFrame(function () {
        heroMark.classList.add("go");
        setTimeout(function () { heroMark.classList.add("live"); }, 1400);
      });
    }
    if (hl) hl.classList.add("reveal-words");
    setTimeout(function () {
      var s = document.getElementById("heroSub"); if (s) s.classList.add("in");
    }, reduce ? 0 : 700);
    setTimeout(function () {
      var a = document.getElementById("heroActions"); if (a) a.classList.add("in");
    }, reduce ? 0 : 850);
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
  // fallback if load is slow
  setTimeout(start, 400);

  /* ---- scroll reveals ------------------------------------------------ */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
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
    setTimeout(function () { reveals.forEach(show); }, 3000);
  }

  /* ---- active section in nav ----------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("#navlinks a"));
  var map = {}; links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (document.getElementById(id)) map[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var current = null;
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          if (current && map[current]) map[current].classList.remove("active");
          if (map[id]) { map[id].classList.add("active"); current = id; }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { navIO.observe(document.getElementById(id)); });
  }
})();
