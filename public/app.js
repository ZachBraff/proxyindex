// Фильтры общего рейтинга: строка видна, если у сервиса подтверждены все выбранные условия
(function () {
  var chips = document.querySelectorAll(".chip[data-f]");
  if (!chips.length) return;
  var rows = document.querySelectorAll("table.rating tbody tr");
  var shown = document.querySelector(".filters .shown");
  function apply() {
    var on = [];
    chips.forEach(function (c) { if (c.getAttribute("aria-pressed") === "true") on.push(c.dataset.f); });
    var n = 0;
    rows.forEach(function (r) {
      var ok = on.every(function (k) { return r.getAttribute("data-" + k) === "1"; });
      r.hidden = !ok;
      if (ok) n++;
    });
    if (shown) shown.textContent = on.length ? "Показано: " + n + " из " + rows.length : "";
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
      apply();
    });
  });
})();
