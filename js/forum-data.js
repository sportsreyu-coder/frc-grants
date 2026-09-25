// Shared between account.js (the team profile's district dropdown) and
// forum.js (the district board directory). Kept as plain data so both
// only need to agree on district *values* (used as forum board slugs),
// not duplicate a hardcoded list.
//
// FIRST creates/renames districts occasionally, so this list may drift
// out of date -- "other" is always offered as a fallback rather than
// blocking a team whose district isn't listed here yet.
window.FRC_DISTRICTS = [
  { value: "chesapeake", label: "FIRST Chesapeake District" },
  { value: "michigan", label: "FIRST In Michigan" },
  { value: "indiana", label: "FIRST Indiana Robotics" },
  { value: "israel", label: "FIRST Israel District" },
  { value: "mid-atlantic", label: "FIRST Mid-Atlantic District" },
  { value: "new-england", label: "FIRST New England District" },
  { value: "north-carolina", label: "FIRST North Carolina District" },
  { value: "ontario", label: "FIRST Ontario District" },
  { value: "pacific-northwest", label: "FIRST Pacific Northwest District" },
  { value: "south-carolina", label: "FIRST South Carolina District" },
  { value: "peachtree", label: "Peachtree District (Georgia)" },
  { value: "none", label: "Not in a district (regional-only)" },
  { value: "other", label: "Other / not listed here" },
];

window.FRC_DISTRICT_LABELS = {};
window.FRC_DISTRICTS.forEach(function (d) { window.FRC_DISTRICT_LABELS[d.value] = d.label; });

// Team-to-team matchmaking boards -- not tied to any district, meant for
// the practical cross-team coordination Chief Delphi's global Q&A forums
// don't really serve: trading/lending hardware, connecting mentors, and
// lining up scouting partnerships for alliance selection prep.
window.FORUM_MATCHMAKING_BOARDS = [
  { slug: "team2team-parts", name: "Parts Trading & Lending", description: "Spare motors, drivetrains, electronics, or anything else sitting in a bin that another team could use right now." },
  { slug: "team2team-mentors", name: "Mentor Connections", description: "Looking for (or willing to give) help on a specific technical problem — swerve, vision, CAD, whatever." },
  { slug: "team2team-scouting", name: "Scouting Partnerships", description: "Coordinate scouting data-sharing or strategy alliances with other teams before an event." },
  { slug: "team2team-general", name: "General Team-to-Team", description: "Anything practical that doesn't fit the other boards — off-season events, demo swaps, general coordination." },
];

function forumDistrictBoardSlug(districtValue) {
  return "district-" + districtValue;
}
window.forumDistrictBoardSlug = forumDistrictBoardSlug;

// Full board registry keyed by slug, built from the two lists above --
// forum.js uses this to resolve a board slug (from the URL) into a
// display name/description without re-deriving it in two places.
//
// "none" and "other" are profile values, not real districts -- lumping
// unrelated teams into a fake shared board for either would just be
// noise, so neither gets one.
window.FORUM_BOARDS = {};
window.FRC_DISTRICTS.forEach(function (d) {
  if (d.value === "none" || d.value === "other") return;
  window.FORUM_BOARDS[forumDistrictBoardSlug(d.value)] = {
    slug: forumDistrictBoardSlug(d.value),
    name: d.label,
    description: "Coordination for teams in " + d.label + " — practice fields, carpools, scrimmages, local rule chatter.",
    category: "district",
  };
});
window.FORUM_MATCHMAKING_BOARDS.forEach(function (b) {
  window.FORUM_BOARDS[b.slug] = {
    slug: b.slug,
    name: b.name,
    description: b.description,
    category: "matchmaking",
  };
});
