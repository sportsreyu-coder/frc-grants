(function () {
  "use strict";

  var STORAGE_KEY = "frcgrants_season_progress_v1";
  var MS_PER_DAY = 24 * 60 * 60 * 1000;

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

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function firstSaturdayOfJanuary(year) {
    var d = new Date(year, 0, 1);
    var day = d.getDay(); // 0 = Sunday .. 6 = Saturday
    var delta = (6 - day + 7) % 7;
    return startOfDay(new Date(year, 0, 1 + delta));
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * MS_PER_DAY);
  }

  function daysBetween(a, b) {
    return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveProgress(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) { /* ignore -- private browsing etc. */ }
  }

  function formatDate(d) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // Figure out which Kickoff this moment in the yearly cycle is anchored
  // to. If we're within the ~18-week preseason window before the next
  // Kickoff, anchor to that upcoming one (offsets read as "days to go").
  // Otherwise anchor to the most recent past Kickoff (build season onward).
  function resolveAnchor(today) {
    var year = today.getFullYear();
    var kickoffThisYear = firstSaturdayOfJanuary(year);
    var nextKickoff = today <= kickoffThisYear ? kickoffThisYear : firstSaturdayOfJanuary(year + 1);
    var prevKickoff = firstSaturdayOfJanuary(nextKickoff.getFullYear() - 1);

    var daysToNext = daysBetween(today, nextKickoff);
    if (daysToNext <= 126) return nextKickoff;
    return prevKickoff;
  }

  var expandedIds = new Set();

  var today = startOfDay(new Date());
  var anchor = resolveAnchor(today);
  var milestones = (window.SEASON_MILESTONES || []).map(function (m) {
    return Object.assign({}, m, { date: addDays(anchor, m.offset) });
  });
  var progress = loadProgress();

  function isDone(m) { return !!progress[m.id]; }

  function render() {
    document.getElementById("kickoff-date").textContent = formatDate(anchor);
    renderPace();
    renderProgressBar();
    renderPhases();
  }

  function renderPace() {
    var card = document.getElementById("pace-card");
    card.innerHTML = "";

    var completed = milestones.filter(isDone);
    if (completed.length === 0) {
      card.appendChild(el("div", { class: "pace-neutral" }, [
        el("div", { class: "pace-eyebrow" }, ["Pace"]),
        el("div", { class: "pace-headline" }, ["Check off your first milestone to get started"]),
        el("p", {}, ["We'll compare it to when it was recommended and tell you if you're ahead or behind."]),
      ]));
      return;
    }

    var furthest = completed.reduce(function (a, b) { return b.offset > a.offset ? b : a; });
    var pace = daysBetween(today, furthest.date); // positive = date is in the future = ahead

    var tone, headline, sub;
    if (pace > 0) {
      tone = "ahead";
      headline = pace + (pace === 1 ? " day ahead of schedule" : " days ahead of schedule");
      sub = "You've already finished “" + furthest.label + "”, which wasn't due until " + formatDate(furthest.date) + ".";
    } else if (pace < 0) {
      tone = "behind";
      var behind = Math.abs(pace);
      headline = behind + (behind === 1 ? " day behind schedule" : " days behind schedule");
      sub = "Your furthest completed milestone, “" + furthest.label + "”, was recommended for " + formatDate(furthest.date) + ".";
    } else {
      tone = "even";
      headline = "Right on schedule";
      sub = "“" + furthest.label + "” was due today.";
    }

    card.appendChild(el("div", { class: "pace-box pace-" + tone }, [
      el("div", { class: "pace-eyebrow" }, ["Pace"]),
      el("div", { class: "pace-headline" }, [headline]),
      el("p", {}, [sub]),
    ]));
  }

  function renderProgressBar() {
    var done = milestones.filter(isDone).length;
    document.getElementById("progress-label").textContent = done + " of " + milestones.length + " milestones complete";
    var pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
    document.getElementById("progress-fill").style.width = pct + "%";
  }

  function renderPhases() {
    var order = ["Preseason", "Build Season", "Competition Season", "Postseason"];
    var container = document.getElementById("phase-list");
    container.innerHTML = "";

    order.forEach(function (phase) {
      var items = milestones.filter(function (m) { return m.phase === phase; });
      if (!items.length) return;

      var doneCount = items.filter(isDone).length;
      var section = el("section", { class: "phase-section" }, [
        el("div", { class: "phase-head" }, [
          el("h2", {}, [phase]),
          el("span", { class: "phase-count" }, [doneCount + " / " + items.length]),
        ]),
      ]);

      var list = el("div", { class: "milestone-list" });
      items.forEach(function (m) {
        var done = isDone(m);
        var overdue = !done && daysBetween(today, m.date) < 0;
        var statusLabel = done ? "Done" : overdue ? "Overdue" : "Upcoming";
        var statusClass = done ? "ms-done" : overdue ? "ms-overdue" : "ms-upcoming";

        var checkbox = el("input", { type: "checkbox", id: "chk-" + m.id, "aria-label": m.label });
        checkbox.checked = done;
        checkbox.addEventListener("change", function () {
          if (checkbox.checked) progress[m.id] = today.toISOString();
          else delete progress[m.id];
          saveProgress(progress);
          render();
        });

        var isOpen = expandedIds.has(m.id);
        function toggleExpand() {
          if (expandedIds.has(m.id)) expandedIds.delete(m.id);
          else expandedIds.add(m.id);
          render();
        }

        var toggleBtn = el("button", { type: "button", class: "ms-expand-toggle" }, [isOpen ? "Show less ▴" : "More detail ▾"]);
        toggleBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleExpand();
        });

        var bodyChildren = [
          el("div", { class: "ms-top" }, [
            el("span", { class: "ms-label" }, [m.label]),
            el("span", { class: "pill " + statusClass }, [statusLabel]),
          ]),
          el("p", { class: "ms-detail" }, [m.detail]),
        ];
        if (isOpen && m.expanded) {
          bodyChildren.push(el("p", { class: "ms-expanded" }, [m.expanded]));
        }
        bodyChildren.push(el("div", { class: "ms-meta-row" }, [
          el("span", { class: "ms-date" }, ["Recommended: " + formatDate(m.date)]),
          toggleBtn,
        ]));

        var body = el("div", { class: "ms-body", tabindex: "0", role: "button", "aria-expanded": isOpen ? "true" : "false" }, bodyChildren);
        body.addEventListener("click", toggleExpand);
        body.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpand();
          }
        });

        var row = el("div", { class: "milestone-row" }, [checkbox, body]);
        list.appendChild(row);
      });

      section.appendChild(list);
      container.appendChild(section);
    });
  }

  document.getElementById("season-reset").addEventListener("click", function () {
    if (!confirm("Clear all season progress saved in this browser?")) return;
    progress = {};
    saveProgress(progress);
    render();
  });

  render();
})();
