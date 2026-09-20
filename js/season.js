(function () {
  "use strict";

  var Core = window.SeasonCore;
  var daysBetween = Core.daysBetween;
  var formatDate = Core.formatDate;
  var saveProgress = Core.saveProgress;
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var CUSTOM_KEY = "frcgrants_season_custom_events_v1";
  var OA_KEY = "frcgrants_season_oa_enabled_v1";
  var ROSTER_KEY = "frcgrants_season_team_sizes_v1";
  var DEFAULT_TEAM_SIZES = { mechanical: 6, electrical: 3, programming: 4, design: 4, business: 5 };

  var TEAM_LABELS = {
    design: "Design",
    mechanical: "Mechanical",
    electrical: "Electrical",
    programming: "Programming",
    business: "Business/Outreach",
    "cross-team": "Cross-team",
    custom: "Your custom events",
  };

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

  function loadCustomEvents() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveCustomEvents(list) {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  function loadOAEnabled() {
    try { return localStorage.getItem(OA_KEY) === "1"; } catch (e) { return false; }
  }
  function saveOAEnabled(v) {
    try { localStorage.setItem(OA_KEY, v ? "1" : "0"); } catch (e) { /* ignore */ }
  }
  function loadTeamSizes() {
    try {
      var stored = JSON.parse(localStorage.getItem(ROSTER_KEY) || "{}");
      return Object.assign({}, DEFAULT_TEAM_SIZES, stored);
    } catch (e) {
      return Object.assign({}, DEFAULT_TEAM_SIZES);
    }
  }
  function saveTeamSizes(sizes) {
    try { localStorage.setItem(ROSTER_KEY, JSON.stringify(sizes)); } catch (e) { /* ignore */ }
  }

  var expandedIds = new Set();
  var viewMode = "checklist"; // or "calendar"

  var today = Core.startOfDay(new Date());
  var anchor = Core.resolveAnchor(today);
  var milestones = Core.getMilestonesWithDates();
  var progress = Core.loadProgress();
  var calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  var customEvents = loadCustomEvents();
  var oaEnabled = loadOAEnabled();
  var teamSizes = loadTeamSizes();

  function isDone(m) { return !!progress[m.id]; }
  function subtaskKey(m, idx) { return m.id + "::sub" + idx; }
  function isSubtaskDone(m, idx) { return !!progress[subtaskKey(m, idx)]; }

  function toggleMilestone(m) {
    if (progress[m.id]) delete progress[m.id];
    else progress[m.id] = today.toISOString();
    saveProgress(progress);
    render();
  }

  function toggleSubtask(m, idx) {
    var key = subtaskKey(m, idx);
    if (progress[key]) delete progress[key];
    else progress[key] = today.toISOString();

    // Auto-complete the parent once every subtask is checked -- but never
    // auto-uncheck it, in case a team confirmed it done despite one
    // subtask not applying to them.
    if (m.subtasks && m.subtasks.length && !progress[m.id]) {
      var allDone = m.subtasks.every(function (_, i) { return isSubtaskDone(m, i); });
      if (allDone) progress[m.id] = today.toISOString();
    }
    saveProgress(progress);
    render();
  }

  function toggleGeneric(id) {
    if (progress[id]) delete progress[id];
    else progress[id] = today.toISOString();
    saveProgress(progress);
    render();
  }

  function removeCustomEvent(id) {
    customEvents = customEvents.filter(function (ce) { return ce.id !== id; });
    saveCustomEvents(customEvents);
    delete progress["custom-" + id];
    saveProgress(progress);
    render();
  }

  function render() {
    document.getElementById("kickoff-date").textContent = formatDate(anchor);
    renderPace();
    renderProgressBar();
    renderPhases();
    renderCalendar();
    renderSettings();
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

  function statusOf(done, date) {
    var overdue = !done && daysBetween(today, date) < 0;
    return {
      done: done,
      overdue: overdue,
      label: done ? "Done" : overdue ? "Overdue" : "Upcoming",
      cls: done ? "ms-done" : overdue ? "ms-overdue" : "ms-upcoming",
    };
  }

  function renderPhases() {
    var container = document.getElementById("phase-list");
    container.hidden = viewMode !== "checklist";
    if (viewMode !== "checklist") return;

    var order = ["Preseason", "Build Season", "Competition Season", "Postseason"];
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
        var status = statusOf(isDone(m), m.date);

        var checkbox = el("input", { type: "checkbox", id: "chk-" + m.id, "aria-label": m.label });
        checkbox.checked = status.done;
        checkbox.addEventListener("change", function () { toggleMilestone(m); });

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

        var msTeam = m.team || "cross-team";
        var bodyChildren = [
          el("div", { class: "ms-top" }, [
            el("div", { class: "ms-title-group" }, [
              el("span", { class: "ms-label" }, [m.label]),
              el("span", { class: "team-badge" }, [
                el("span", { class: "team-dot team-" + msTeam }),
                TEAM_LABELS[msTeam] || msTeam,
              ]),
            ]),
            el("span", { class: "pill " + status.cls }, [status.label]),
          ]),
          el("p", { class: "ms-detail" }, [m.detail]),
        ];

        if (isOpen) {
          if (m.expanded) bodyChildren.push(el("p", { class: "ms-expanded" }, [m.expanded]));

          if (m.subtasks && m.subtasks.length) {
            var subList = el("div", { class: "ms-subtasks" });
            subList.addEventListener("click", function (e) { e.stopPropagation(); });

            m.subtasks.forEach(function (sub, idx) {
              var subDone = isSubtaskDone(m, idx);
              var subId = "chk-" + m.id + "-sub" + idx;
              var subTeam = sub.team || m.team || "cross-team";
              var subChk = el("input", { type: "checkbox", id: subId });
              subChk.checked = subDone;
              subChk.addEventListener("change", function () { toggleSubtask(m, idx); });

              subList.appendChild(el("label", { class: "ms-subtask-row", for: subId }, [
                subChk,
                el("span", { class: "team-dot team-" + subTeam }),
                el("span", { class: "team-tag" }, [TEAM_LABELS[subTeam] || subTeam]),
                el("span", { class: subDone ? "ms-subtask-text ms-subtask-done" : "ms-subtask-text" }, [sub.label]),
              ]));
            });
            bodyChildren.push(subList);
          }
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

        var row = el("div", { class: "milestone-row team-edge team-edge-" + (m.team || "cross-team") }, [checkbox, body]);
        list.appendChild(row);
      });

      section.appendChild(list);
      container.appendChild(section);
    });
  }

  // ---- Unified calendar item list: milestones + subtasks + fine-grained
  // daily/weekly goals + Open Alliance reminders + team custom events. ----
  function buildCalendarItems() {
    var items = [];

    items.push({
      date: anchor, team: "cross-team", kind: "kickoff", big: true,
      short: "🚀 KICKOFF", title: "Kickoff — the season officially begins",
      isDone: function () { return today >= anchor; },
      toggle: function () {},
    });

    milestones.forEach(function (m) {
      items.push({
        date: m.date, team: m.team || "cross-team", kind: "milestone",
        short: m.short || m.label, title: m.label,
        isDone: function () { return isDone(m); },
        toggle: function () { toggleMilestone(m); },
      });
      (m.subtasks || []).forEach(function (sub, idx) {
        items.push({
          date: m.date, team: sub.team || m.team || "cross-team", kind: "subtask",
          short: sub.label, title: sub.label + "  (part of “" + m.label + "”)",
          isDone: function () { return isSubtaskDone(m, idx); },
          toggle: function () { toggleSubtask(m, idx); },
        });
      });
    });

    var fineGoals = (window.SEASON_FINE_GOALS || []);
    if (window.buildCompetitionSeasonGoals) {
      fineGoals = fineGoals.concat(window.buildCompetitionSeasonGoals(teamSizes, TEAM_LABELS));
    }

    fineGoals.forEach(function (g) {
      var gDate = Core.addDays(anchor, g.offset);
      items.push({
        date: gDate, team: g.team, kind: g.granularity,
        short: g.short, title: g.label,
        isDone: function () { return !!progress[g.id]; },
        toggle: function () { toggleGeneric(g.id); },
      });
    });

    if (oaEnabled) {
      (window.SEASON_OA_OFFSETS || []).forEach(function (off, idx) {
        var oaId = "oa-update-" + idx;
        var oaDate = Core.addDays(anchor, off);
        items.push({
          date: oaDate, team: "business", kind: "oa",
          short: "📹 Post OA Update", title: "Open Alliance: post this week's progress update video",
          isDone: function () { return !!progress[oaId]; },
          toggle: function () { toggleGeneric(oaId); },
        });
      });
    }

    customEvents.forEach(function (ce) {
      var ceId = "custom-" + ce.id;
      items.push({
        date: new Date(ce.date + "T00:00:00"), team: "custom", kind: "custom",
        short: ce.label, title: ce.label + " (your custom event)",
        isDone: function () { return !!progress[ceId]; },
        toggle: function () { toggleGeneric(ceId); },
      });
    });

    return items;
  }

  function renderCalendar() {
    var container = document.getElementById("calendar-view");
    var legend = document.getElementById("cal-legend");
    container.hidden = viewMode !== "calendar";
    legend.hidden = viewMode !== "calendar";
    if (viewMode !== "calendar") return;

    container.innerHTML = "";

    var monthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    var prevBtn = el("button", { type: "button", class: "cal-nav", "aria-label": "Previous month" }, ["←"]);
    var nextBtn = el("button", { type: "button", class: "cal-nav", "aria-label": "Next month" }, ["→"]);
    prevBtn.addEventListener("click", function () {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
      renderCalendar();
    });
    nextBtn.addEventListener("click", function () {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
      renderCalendar();
    });

    var todayBtn = el("button", { type: "button", class: "cal-today-btn" }, ["Today"]);
    todayBtn.addEventListener("click", function () {
      calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      renderCalendar();
    });

    container.appendChild(el("div", { class: "cal-header" }, [
      prevBtn,
      el("div", { class: "cal-month-label" }, [monthLabel]),
      nextBtn,
      todayBtn,
    ]));

    var grid = el("div", { class: "cal-grid" });
    DOW.forEach(function (d) { grid.appendChild(el("div", { class: "cal-dow" }, [d])); });

    var firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    var startDow = firstOfMonth.getDay();
    var daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();

    var items = buildCalendarItems();
    var byDay = {};
    items.forEach(function (item) {
      if (item.date.getFullYear() === calendarMonth.getFullYear() && item.date.getMonth() === calendarMonth.getMonth()) {
        var d = item.date.getDate();
        (byDay[d] = byDay[d] || []).push(item);
      }
    });

    for (var i = 0; i < startDow; i++) grid.appendChild(el("div", { class: "cal-cell cal-empty" }));

    for (var day = 1; day <= daysInMonth; day++) {
      var cellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      var isToday = daysBetween(today, cellDate) === 0;
      var cell = el("div", { class: "cal-cell" + (isToday ? " cal-today" : "") }, [
        el("div", { class: "cal-daynum" }, [String(day)]),
      ]);

      (byDay[day] || []).forEach(function (item) {
        if (item.big) {
          var bigChip = el("div", {
            class: "cal-chip cal-chip-big",
            title: item.title,
          }, [item.short]);
          cell.appendChild(bigChip);
          return;
        }

        var done = item.isDone();
        var status = statusOf(done, item.date);
        var chip = el("button", {
          type: "button",
          class: "cal-chip " + status.cls + " team-edge team-edge-" + item.team,
          title: item.title + " -- click to mark " + (done ? "not done" : "done"),
        }, [item.short]);
        chip.addEventListener("click", item.toggle);
        cell.appendChild(chip);
      });

      grid.appendChild(cell);
    }

    container.appendChild(grid);
    renderLegend();
  }

  function renderLegend() {
    var legend = document.getElementById("cal-legend");
    legend.innerHTML = "";
    ["design", "mechanical", "electrical", "programming", "business", "cross-team", "custom"].forEach(function (team) {
      legend.appendChild(el("span", { class: "legend-item" }, [
        el("span", { class: "team-dot team-" + team }),
        TEAM_LABELS[team],
      ]));
    });
  }

  var ROSTER_TEAMS = ["mechanical", "electrical", "programming", "design", "business"];

  function renderSettings() {
    document.getElementById("oa-checkbox").checked = oaEnabled;

    ROSTER_TEAMS.forEach(function (team) {
      var input = document.getElementById("roster-" + team);
      if (input && document.activeElement !== input) input.value = teamSizes[team];
    });

    var list = document.getElementById("custom-event-list");
    list.innerHTML = "";
    if (!customEvents.length) return;

    customEvents
      .slice()
      .sort(function (a, b) { return a.date.localeCompare(b.date); })
      .forEach(function (ce) {
        var row = el("div", { class: "custom-event-item" }, [
          el("span", {}, [ce.label + " — " + formatDate(new Date(ce.date + "T00:00:00"))]),
        ]);
        var removeBtn = el("button", { type: "button", class: "custom-event-remove", "aria-label": "Remove" }, ["×"]);
        removeBtn.addEventListener("click", function () { removeCustomEvent(ce.id); });
        row.appendChild(removeBtn);
        list.appendChild(row);
      });
  }

  document.getElementById("season-reset").addEventListener("click", function () {
    if (!confirm("Clear all season progress saved in this browser?")) return;
    progress = {};
    saveProgress(progress);
    render();
  });

  document.getElementById("view-tab-checklist").addEventListener("click", function () {
    viewMode = "checklist";
    document.getElementById("view-tab-checklist").classList.add("active");
    document.getElementById("view-tab-calendar").classList.remove("active");
    render();
  });
  document.getElementById("view-tab-calendar").addEventListener("click", function () {
    viewMode = "calendar";
    document.getElementById("view-tab-calendar").classList.add("active");
    document.getElementById("view-tab-checklist").classList.remove("active");
    render();
  });

  document.getElementById("goto-kickoff").addEventListener("click", function () {
    viewMode = "calendar";
    document.getElementById("view-tab-calendar").classList.add("active");
    document.getElementById("view-tab-checklist").classList.remove("active");
    calendarMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    render();
  });

  document.getElementById("settings-toggle").addEventListener("click", function () {
    var panel = document.getElementById("team-settings");
    panel.hidden = !panel.hidden;
  });

  document.getElementById("oa-checkbox").addEventListener("change", function (e) {
    oaEnabled = e.target.checked;
    saveOAEnabled(oaEnabled);
    render();
  });

  ROSTER_TEAMS.forEach(function (team) {
    var input = document.getElementById("roster-" + team);
    if (!input) return;
    input.addEventListener("change", function (e) {
      var n = parseInt(e.target.value, 10);
      teamSizes[team] = isNaN(n) || n < 0 ? 0 : n;
      saveTeamSizes(teamSizes);
      render();
    });
  });

  document.getElementById("custom-event-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var labelInput = document.getElementById("custom-event-label");
    var dateInput = document.getElementById("custom-event-date");
    if (!labelInput.value.trim() || !dateInput.value) return;

    customEvents.push({
      id: "ce" + Date.now() + Math.floor(Math.random() * 1000),
      label: labelInput.value.trim(),
      date: dateInput.value,
    });
    saveCustomEvents(customEvents);
    labelInput.value = "";
    dateInput.value = "";
    render();
  });

  document.getElementById("quick-add-reveal").addEventListener("click", function () {
    document.getElementById("custom-event-label").value = "Robot Reveal";
    document.getElementById("custom-event-date").focus();
  });

  render();
})();
