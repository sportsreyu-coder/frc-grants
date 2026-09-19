(function () {
  "use strict";

  var Core = window.SeasonCore;
  var daysBetween = Core.daysBetween;
  var formatDate = Core.formatDate;
  var saveProgress = Core.saveProgress;
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  var expandedIds = new Set();
  var viewMode = "checklist"; // or "calendar"

  var today = Core.startOfDay(new Date());
  var anchor = Core.resolveAnchor(today);
  var milestones = Core.getMilestonesWithDates();
  var progress = Core.loadProgress();
  var calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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

  function render() {
    document.getElementById("kickoff-date").textContent = formatDate(anchor);
    renderPace();
    renderProgressBar();
    renderPhases();
    renderCalendar();
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

  function statusOf(m) {
    var done = isDone(m);
    var overdue = !done && daysBetween(today, m.date) < 0;
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
        var status = statusOf(m);

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

        var bodyChildren = [
          el("div", { class: "ms-top" }, [
            el("span", { class: "ms-label" }, [m.label]),
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
              var subChk = el("input", { type: "checkbox", id: subId });
              subChk.checked = subDone;
              subChk.addEventListener("change", function () { toggleSubtask(m, idx); });

              subList.appendChild(el("label", { class: "ms-subtask-row", for: subId }, [
                subChk,
                el("span", { class: subDone ? "ms-subtask-text ms-subtask-done" : "ms-subtask-text" }, [sub]),
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

        var row = el("div", { class: "milestone-row" }, [checkbox, body]);
        list.appendChild(row);
      });

      section.appendChild(list);
      container.appendChild(section);
    });
  }

  function renderCalendar() {
    var container = document.getElementById("calendar-view");
    container.hidden = viewMode !== "calendar";
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

    var byDay = {};
    milestones.forEach(function (m) {
      if (m.date.getFullYear() === calendarMonth.getFullYear() && m.date.getMonth() === calendarMonth.getMonth()) {
        var d = m.date.getDate();
        (byDay[d] = byDay[d] || []).push(m);
      }
    });

    for (var i = 0; i < startDow; i++) grid.appendChild(el("div", { class: "cal-cell cal-empty" }));

    for (var day = 1; day <= daysInMonth; day++) {
      var cellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      var isToday = daysBetween(today, cellDate) === 0;
      var cell = el("div", { class: "cal-cell" + (isToday ? " cal-today" : "") }, [
        el("div", { class: "cal-daynum" }, [String(day)]),
      ]);

      (byDay[day] || []).forEach(function (m) {
        var status = statusOf(m);
        var chip = el("button", {
          type: "button",
          class: "cal-chip " + status.cls,
          title: m.label + " (" + m.phase + ") -- click to mark " + (status.done ? "not done" : "done"),
        }, [m.label]);
        chip.addEventListener("click", function () { toggleMilestone(m); });
        cell.appendChild(chip);
      });

      grid.appendChild(cell);
    }

    container.appendChild(grid);
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

  render();
})();
