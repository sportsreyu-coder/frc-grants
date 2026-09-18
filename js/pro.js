(function () {
  "use strict";

  var PLACEHOLDER_PRICE = "TBD";
  document.querySelectorAll("#pro-price, #plan-pro-price").forEach(function (node) {
    if (node.id === "pro-price") node.textContent = PLACEHOLDER_PRICE;
    if (node.id === "plan-pro-price") node.firstChild.textContent = PLACEHOLDER_PRICE;
  });

  var form = document.getElementById("waitlist-form");
  var success = document.getElementById("form-success");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    try {
      var entry = {
        team: document.getElementById("team-number").value.trim(),
        email: document.getElementById("team-email").value.trim(),
        at: new Date().toISOString(),
      };
      var existing = JSON.parse(localStorage.getItem("frcgrants_waitlist") || "[]");
      existing.push(entry);
      localStorage.setItem("frcgrants_waitlist", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save waitlist entry locally", err);
    }
    form.reset();
    success.style.display = "block";
  });
})();
