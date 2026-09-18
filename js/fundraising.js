(function () {
  "use strict";

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  fetch("data/fundraising.json")
    .then(function (r) { return r.json(); })
    .then(function (items) {
      var grid = document.getElementById("fundraising-grid");
      grid.innerHTML = "";
      items.forEach(function (item) {
        grid.appendChild(el("div", { class: "simple-card" }, [
          el("span", { class: "badge" }, [item.type || "Fundraiser"]),
          el("a", { class: "title-link", href: item.link || "#", target: "_blank", rel: "noopener" }, [item.name]),
          item.notes ? el("p", {}, [item.notes]) : null,
        ]));
      });
    })
    .catch(function (err) { console.error(err); });
})();
