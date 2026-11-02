// ПроксиИндекс · движение и интерактив. Без этого файла сайт полностью работает и всё видно.
(function () {
  window.__motion = true;
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // ── появление при прокрутке, шкалы, счётчики ──────────────────────
  var REVEAL = ".tile, .rating tbody tr, .how-grid > div, .grp, .qa, .art-card, .near, .sect-head, .faq > h2, .how > h2, " +
    "#reiting > h2, .filters, .tbl-wrap, .checks, .two-col > *, .art-body > h2, .art-body .tbl-wrap, .tldr, .side-box, .inside li, .method";
  var GROUPS = [".tiles", ".rating tbody", ".how-grid", ".checks", ".faq", ".art-list", ".nears", ".inside"];

  // ступенчатая задержка внутри групп: соседи появляются один за другим
  GROUPS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (box) {
      var kids = box.children, step = sel === ".rating tbody" ? 0.035 : 0.07;
      for (var i = 0; i < kids.length; i++) kids[i].style.setProperty("--d", Math.min(i * step, 0.6) + "s");
    });
  });

  // счётчик: в тексте страницы всегда настоящее число (для поисковиков), бегущие цифры рисует CSS поверх
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    if (!canCount) return;
    el.style.setProperty("--tn", parseInt(el.dataset.count, 10) || 0);
    requestAnimationFrame(function () { el.classList.add("go"); });
  }
  // класс .cnt ставим только там, где @property точно есть, иначе на экране застрял бы «0»
  var canCount = !reduce && !!(window.CSS && CSS.registerProperty);
  if (canCount) document.querySelectorAll("[data-count]").forEach(function (el) { el.classList.add("cnt"); });

  function show(el) {
    el.classList.add("in");
    if (el.matches("[data-count]")) countUp(el);
    el.querySelectorAll && el.querySelectorAll("[data-count]").forEach(countUp);
  }

  var watched = document.querySelectorAll(REVEAL + ", .segbar, .bar, .ring, [data-count]");
  if (!hasIO || reduce) {
    watched.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    watched.forEach(function (el) { io.observe(el); });
  }

  // ── шапка: тень после начала прокрутки ────────────────────────────
  var top = document.querySelector(".top"), heroHome = document.querySelector(".hero-home");
  function onScroll() {
    if (!top) return;
    top.classList.toggle("scrolled", window.scrollY > 8);
    if (heroHome) top.classList.toggle("past", heroHome.getBoundingClientRect().bottom < top.offsetHeight + 4);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── мобильное меню ──────────────────────────────────────────────
  var burger = document.querySelector(".burger"), menu = document.getElementById("menu");
  if (burger && menu) {
    var setOpen = function (v) { burger.setAttribute("aria-expanded", v ? "true" : "false"); menu.classList.toggle("open", v);
      burger.setAttribute("aria-label", v ? "Закрыть меню" : "Открыть меню"); };
    burger.addEventListener("click", function () { setOpen(burger.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".top")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  // ── мягкий отсвет за курсором на карточках ───────────────────────
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".tile, .grp, .art-card, .near");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  // ── фильтры и поиск общего рейтинга ──────────────────────────────
  var chips = document.querySelectorAll(".chip[data-f]");
  var find = document.querySelector(".filters .find");
  if (chips.length || find) {
    var rows = document.querySelectorAll("table.rating tbody tr");
    var shown = document.querySelector(".filters .shown");
    var apply = function () {
      var on = [];
      chips.forEach(function (c) { if (c.getAttribute("aria-pressed") === "true") on.push(c.dataset.f); });
      var q = find ? find.value.trim().toLowerCase() : "";
      var n = 0;
      rows.forEach(function (r) {
        var ok = on.every(function (k) { return r.getAttribute("data-" + k) === "1"; }) &&
          (!q || (r.getAttribute("data-name") || "").indexOf(q) !== -1);
        if (ok && r.hidden) { r.hidden = false; r.classList.add("in"); r.animate && !reduce &&
          r.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" }); }
        if (!ok) r.hidden = true;
        if (ok) n++;
      });
      if (shown) shown.textContent = (on.length || q) ? "Показано: " + n + " из " + rows.length : "";
    };
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
        apply();
      });
    });
    if (find) find.addEventListener("input", apply);
  }

  // ── статья: прогресс чтения и текущий раздел в оглавлении ─────────
  var body = document.querySelector(".art-body");
  if (body) {
    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var prog = function () {
      var r = body.getBoundingClientRect(), h = r.height - window.innerHeight * 0.6;
      var k = h > 0 ? Math.min(1, Math.max(0, -r.top / h)) : 0;
      bar.style.transform = "scaleX(" + k + ")";
    };
    window.addEventListener("scroll", prog, { passive: true });
    prog();
    var links = document.querySelectorAll(".toc-side a, .art > .toc a");
    var heads = body.querySelectorAll("h2[id]");
    if (hasIO && links.length && heads.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.id;
          links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); });
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      heads.forEach(function (h) { spy.observe(h); });
    }
  }
})();
