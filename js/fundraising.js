(function () {
  "use strict";

  var US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
    "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    "District of Columbia",
  ];

  // These aren't tied to a physical, visitable location (a gift-matching
  // program, a platform that aggregates other restaurants, an online
  // ordering/ship-to-you fundraiser, or a request-a-gift-card form) --
  // a "find near you" map search wouldn't mean anything for them.
  var NOT_LOCATABLE = {
    "GE": true,
    "Target": true,
    "MLB Ticket Fundraiser": true,
    "Groupraise": true,
    "Butter Braid": true,
    "Krispy Kreme": true,
    "Double Good Popcorn": true,
    "Barnes and Nobles": true,
  };

  var state = "";
  var items = [];

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

  function mapSearchUrl(name, stateName) {
    var q = encodeURIComponent(name + " near " + stateName);
    return "https://www.google.com/maps/search/?api=1&query=" + q;
  }

  function render() {
    var grid = document.getElementById("fundraising-grid");
    grid.innerHTML = "";
    items.forEach(function (item) {
      var children = [
        el("span", { class: "badge" }, [item.type || "Fundraiser"]),
        el("a", { class: "title-link", href: item.link || "#", target: "_blank", rel: "noopener" }, [item.name]),
        item.notes ? el("p", {}, [item.notes]) : null,
      ];
      if (state && !NOT_LOCATABLE[item.name]) {
        children.push(el("a", {
          class: "card-locate-link",
          href: mapSearchUrl(item.name, state),
          target: "_blank",
          rel: "noopener",
        }, ["Find near " + state + " →"]));
      }
      grid.appendChild(el("div", { class: "simple-card" }, children));
    });
  }

  var locateSelect = document.getElementById("locate-select");
  US_STATES.forEach(function (s) {
    locateSelect.appendChild(el("option", { value: s }, [s]));
  });
  locateSelect.addEventListener("change", function (e) {
    state = e.target.value;
    render();
  });

  fetch("data/fundraising.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      items = data;
      render();
    })
    .catch(function (err) { console.error(err); });
})();
