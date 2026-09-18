(function () {
  "use strict";

  var MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

  function dayOfYear(str) {
    if (!str) return 9999;
    var m = String(str).toLowerCase().match(/([a-z]+)\s*(\d+)?/);
    if (!m) return 9999;
    var mi = -1;
    for (var i = 0; i < MONTHS.length; i++) {
      if (MONTHS[i].indexOf(m[1].slice(0, 3)) === 0) { mi = i; break; }
    }
    if (mi < 0) return 9999;
    return mi * 31 + (parseInt(m[2] || "1", 10) || 1);
  }

  function untilNext(str) {
    var d = dayOfYear(str);
    if (d === 9999) return 9999;
    var today = new Date();
    var todayIdx = today.getMonth() * 31 + today.getDate();
    return d >= todayIdx ? d - todayIdx : d - todayIdx + 372;
  }

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

  function pillClass(status) {
    if (status === "open") return { cls: "pill-open", label: "Open" };
    if (status === "closed") return { cls: "pill-closed", label: "Closed" };
    return { cls: "pill-unsure", label: "Unsure" };
  }

  function dateRow(dcodeText, nameNode, subText, pill) {
    return el("div", { class: "dates-row" }, [
      el("span", { class: "dcode" }, [dcodeText]),
      el("span", {}, [
        nameNode,
        el("span", { class: "dsub" }, [subText]),
      ]),
      el("span", { class: "pill " + pill.cls }, [pill.label]),
    ]);
  }

  fetch("data/grants.json")
    .then(function (r) { return r.json(); })
    .then(function (grants) {
      var withDates = grants
        .filter(function (g) { return g.closeDate; })
        .sort(function (a, b) { return untilNext(a.closeDate) - untilNext(b.closeDate); });

      var table = document.getElementById("all-dates-table");
      table.innerHTML = "";
      if (withDates.length === 0) {
        table.appendChild(el("div", { class: "dates-row" }, [el("span", {}, ["No published deadlines yet."])]));
        return;
      }
      withDates.forEach(function (g) {
        var p = pillClass(g.status);
        var sub = g.notes || (g.tags.indexOf("no-geo-restrictions") !== -1 ? "No location restrictions" : "See grantor site for criteria");
        var nameLink = el("a", { class: "dname", href: g.link || "#", target: "_blank", rel: "noopener", style: "color:inherit;" }, [g.name]);
        table.appendChild(dateRow(g.closeDate, nameLink, sub, p));
      });
    })
    .catch(function (err) {
      console.error(err);
      document.getElementById("all-dates-table").innerHTML = "";
    });

  var RECOMMENDED = [
    { when: "JUNE", title: "Set next season's fundraising goal", sub: "Lock in a budget target and list which sponsors/grants to renew before the new season starts." },
    { when: "JULY", title: "Send sponsor renewal outreach", sub: "Re-engage last year's sponsors early — most decide renewal budgets over the summer." },
    { when: "AUG–SEPT", title: "Submit fall-cycle grant applications", sub: "A large share of this database's deadlines fall in September and October — start drafting in August." },
    { when: "OCTOBER", title: "Follow up on pending applications", sub: "Check in on anything submitted in August/September that hasn't responded yet." },
    { when: "NOV–DEC", title: "Finish winter-cycle applications", sub: "Cover registration and early-build costs — several grants close in November and December." },
    { when: "DECEMBER", title: "Lock in your Kickoff budget", sub: "Confirm registration and travel costs are funded before Kickoff in January." },
    { when: "JANUARY", title: "Kickoff outreach", sub: "Send this year's game/theme to sponsors; apply to rookie and early-bird grants." },
    { when: "FEBRUARY", title: "Keep sponsors updated during build", sub: "Share build photos/progress — it strengthens next year's renewal conversation." },
    { when: "MAR–APR", title: "Send thank-you & impact reports", sub: "Report results back to every sponsor and grantor while the season is fresh." },
    { when: "MAY", title: "Season wrap-up", sub: "Archive what worked, note who to follow up with, and start the cycle again in June." },
  ];

  var recTable = document.getElementById("recommended-table");
  RECOMMENDED.forEach(function (row) {
    recTable.appendChild(dateRow(
      row.when,
      el("span", { class: "dname" }, [row.title]),
      row.sub,
      { cls: "pill-suggested", label: "Suggested" }
    ));
  });
})();
