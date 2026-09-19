(function () {
  "use strict";

  var KEY = "frcgrants_theme";

  function apply(theme) {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");

    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var sun = btn.querySelector(".icon-sun");
    var moon = btn.querySelector(".icon-moon");
    if (sun) sun.hidden = theme === "dark";
    if (moon) moon.hidden = theme !== "dark";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  function current() {
    try {
      return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function setTheme(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* ignore */ }
    apply(theme);
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(current());
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        setTheme(current() === "dark" ? "light" : "dark");
      });
    }
  });
})();
