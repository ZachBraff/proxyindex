// Общий рейтинг: фильтры по условиям + поиск по названию. Строка видна, если подходит под всё сразу.
(function () {
  var chips = document.querySelectorAll(".chip[data-f]");
  var find = document.querySelector(".filters .find");
  if (!chips.length && !find) return;
  var rows = document.querySelectorAll("table.rating tbody tr");
  var shown = document.querySelector(".filters .shown");
  function apply() {
    var on = [];
    chips.forEach(function (c) { if (c.getAttribute("aria-pressed") === "true") on.push(c.dataset.f); });
    var q = find ? find.value.trim().toLowerCase() : "";
    var n = 0;
    rows.forEach(function (r) {
      var ok = on.every(function (k) { return r.getAttribute("data-" + k) === "1"; }) &&
        (!q || (r.getAttribute("data-name") || "").indexOf(q) !== -1);
      r.hidden = !ok;
      if (ok) n++;
    });
    if (shown) shown.textContent = (on.length || q) ? "Показано: " + n + " из " + rows.length : "";
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
      apply();
    });
  });
  if (find) find.addEventListener("input", apply);
})();
