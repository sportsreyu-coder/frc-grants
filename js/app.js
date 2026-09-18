(function () {
  "use strict";

  const state = {
    search: "",
    statusOpen: false,
    profileTags: new Set(),
    c3: null,
    geoNoRestrict: false,
    category: "all",
    sort: "status",
  };

  let grants = [];

  const TAG_LABELS = {
    "corporate-employee": "Employee/mentor connection helps",
    "rookie-friendly": "Rookie-friendly",
    "demographics": "Diversity & outreach focus",
    "sustainability": "Sustainability focus",
    "501c3-required": "501(c)(3) required",
    "school-or-501c3": "School or 501(c)(3) OK",
    "no-501c3-required": "No 501(c)(3) required",
    "no-geo-restrictions": "No location restrictions",
    "geo-restricted": "Location restricted",
  };

  const VISIBLE_TAG_ORDER = [
    "no-geo-restrictions",
    "geo-restricted",
    "corporate-employee",
    "rookie-friendly",
    "demographics",
    "sustainability",
    "501c3-required",
    "school-or-501c3",
    "no-501c3-required",
  ];

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach((c) => {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function fetchJSON(path) {
    return fetch(path).then((r) => {
      if (!r.ok) throw new Error("Failed to load " + path);
      return r.json();
    });
  }

  function renderStats() {
    const total = grants.length;
    const open = grants.filter((g) => g.status === "open").length;
    const noRestrict = grants.filter((g) => g.tags.includes("no-geo-restrictions")).length;
    const no501 = grants.filter((g) => g.tags.includes("no-501c3-required")).length;
    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-open").textContent = open;
    document.getElementById("stat-norestrict").textContent = noRestrict;
    document.getElementById("stat-no501c3").textContent = no501;
  }

  function matchesGrant(g) {
    if (state.search) {
      const hay = (g.name + " " + g.notes).toLowerCase();
      if (!hay.includes(state.search)) return false;
    }
    if (state.statusOpen && g.status !== "open") return false;
    for (const tag of state.profileTags) {
      if (!g.tags.includes(tag)) return false;
    }
    if (state.c3 && g.require501c3 !== c3TagToValue(state.c3)) {
      if (!(state.c3 === "school-or-501c3" && g.require501c3 === "school-or-501c3")) return false;
    }
    if (state.geoNoRestrict && !g.tags.includes("no-geo-restrictions")) return false;
    if (state.category !== "all" && !g.tags.includes(state.category)) return false;
    return true;
  }

  function c3TagToValue(tag) {
    if (tag === "no-501c3-required") return "not-required";
    if (tag === "501c3-required") return "required";
    if (tag === "school-or-501c3") return "school-or-501c3";
    return null;
  }

  function sortGrants(list) {
    const copy = list.slice();
    if (state.sort === "az") {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sort === "deadline") {
      const rank = (g) => (g.closeDate ? 0 : 1);
      copy.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    } else {
      const rank = { open: 0, unsure: 1, closed: 2 };
      copy.sort((a, b) => (rank[a.status] - rank[b.status]) || a.name.localeCompare(b.name));
    }
    return copy;
  }

  function statusLabel(s) {
    if (s === "open") return "Open";
    if (s === "closed") return "Closed";
    return "Unsure";
  }

  function grantCard(g) {
    const dateBits = [];
    if (g.openDate) dateBits.push(`Opens ${g.openDate}`);
    if (g.closeDate) dateBits.push(`Closes ${g.closeDate}`);

    const visibleTags = VISIBLE_TAG_ORDER.filter((t) => g.tags.includes(t));

    const card = el("article", { class: "grant-card" }, [
      el("div", { class: "gc-top" }, [
        el("h3", { class: "gc-name" }, [g.name]),
        el("span", { class: `status-pill status-${g.status}` }, [statusLabel(g.status)]),
      ]),
      dateBits.length ? el("div", { class: "gc-dates" }, [el("span", {}, [dateBits.join(" · ")])]) : null,
      el("p", { class: "gc-notes" }, [g.notes || "No additional notes provided."]),
      el(
        "div",
        { class: "gc-tags" },
        visibleTags.map((t) => el("span", { class: `tag tag-${t}` }, [TAG_LABELS[t] || t]))
      ),
      el("div", { class: "gc-bottom" }, [
        el("span", { class: "gc-meta" }, [
          g.employeeConnection === "yes" ? "Employee/mentor tie noted" : " ",
        ]),
        el("a", { class: "gc-link", href: g.link || "#", target: "_blank", rel: "noopener" }, [
          g.link ? "View & apply →" : "No link yet",
        ]),
      ]),
    ]);
    return card;
  }

  function render() {
    const filtered = grants.filter(matchesGrant);
    const sorted = sortGrants(filtered);
    const grid = document.getElementById("grant-grid");
    grid.innerHTML = "";
    document.getElementById("results-count").textContent =
      `${sorted.length} grant${sorted.length === 1 ? "" : "s"} match your filters`;

    if (sorted.length === 0) {
      grid.appendChild(
        el("div", { class: "empty-state" }, [
          el("b", {}, ["No grants match those filters"]),
          el("span", {}, ["Try clearing a filter or broadening your search."]),
        ])
      );
      return;
    }
    sorted.forEach((g) => grid.appendChild(grantCard(g)));
  }

  function setupFinder() {
    document.querySelectorAll('[data-filter="status"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        state.statusOpen = !state.statusOpen;
        btn.classList.toggle("active", state.statusOpen);
        render();
      });
    });

    document.querySelectorAll('[data-filter="tag"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-value");
        if (val === "no-geo-restrictions") {
          state.geoNoRestrict = !state.geoNoRestrict;
          btn.classList.toggle("active", state.geoNoRestrict);
        } else {
          if (state.profileTags.has(val)) {
            state.profileTags.delete(val);
            btn.classList.remove("active");
          } else {
            state.profileTags.add(val);
            btn.classList.add("active");
          }
        }
        render();
      });
    });

    document.querySelectorAll('[data-filter="c3"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-value");
        const already = state.c3 === val;
        document.querySelectorAll('[data-filter="c3"]').forEach((b) => b.classList.remove("active"));
        state.c3 = already ? null : val;
        if (!already) btn.classList.add("active");
        render();
      });
    });

    document.getElementById("search-input").addEventListener("input", (e) => {
      state.search = e.target.value.trim().toLowerCase();
      render();
    });

    document.getElementById("sort-select").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });

    document.getElementById("reset-filters").addEventListener("click", () => {
      state.search = "";
      state.statusOpen = false;
      state.profileTags.clear();
      state.c3 = null;
      state.geoNoRestrict = false;
      state.category = "all";
      document.getElementById("search-input").value = "";
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
      document.querySelector('.tab-btn[data-cat="all"]').classList.add("active");
      render();
    });

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        state.category = btn.getAttribute("data-cat");
        render();
      });
    });
  }

  function renderSimpleGrid(containerId, items, opts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item) => {
      const card = el("div", { class: "simple-card" }, [
        opts.badge ? el("span", { class: "badge" }, [opts.badge(item)]) : null,
        el("a", { class: "title-link", href: item.link || "#", target: "_blank", rel: "noopener" }, [item.name]),
        item.notes ? el("p", {}, [item.notes]) : null,
      ]);
      container.appendChild(card);
    });
  }

  Promise.all([
    fetchJSON("data/grants.json"),
    fetchJSON("data/fundraising.json"),
    fetchJSON("data/resources.json"),
  ])
    .then(([g, fundraising, resources]) => {
      grants = g;
      renderStats();
      setupFinder();
      render();
      renderSimpleGrid("fundraising-grid", fundraising, { badge: (i) => i.type || "Fundraiser" });
      renderSimpleGrid("resources-grid", resources, { badge: () => "Resource" });
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("grant-grid").innerHTML =
        '<div class="empty-state"><b>Couldn\'t load grant data</b><span>Check that data/grants.json is reachable.</span></div>';
    });
})();
