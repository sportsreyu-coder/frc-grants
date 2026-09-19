// Season Tracker milestone plan.
//
// Every offset is in days relative to Kickoff day (the first Saturday of
// January). Negative offsets fall before Kickoff (preseason); positive
// offsets fall after it (build season onward). Sourced from:
//  - Build season shape: FIRST's own "Build Season Timeline" handout
//    (firstinspires.org/hubfs/web/program/frc/resources/build-season-timeline-11x17.pdf)
//  - Preseason plan: LearnFRC's week-by-week preseason training plan
//    (learnfrc.com/blog/frc-preseason-training-plan)
//  - Competition/postseason shape: general FRC community practice (awards
//    submissions, sponsor thank-yous, off-season events, recruiting)
//
// This is a recommended pace, not an official requirement -- teams should
// adapt it to their own season plan.
window.SEASON_MILESTONES = [
  // ---- Preseason (Sept -> Kickoff) ----
  { id: "ps-roster", phase: "Preseason", offset: -105,
    label: "Subteams assigned & season registration confirmed",
    detail: "Mechanical, electrical, programming, CAD, and business roles set; Kickoff Kit selection window and event registration confirmed." },
  { id: "ps-fundamentals", phase: "Preseason", offset: -77,
    label: "Training chassis drives under teleop control",
    detail: "Practice/training robot has a working drivetrain a student can drive, with basic wiring and CAN bus in place." },
  { id: "ps-auto", phase: "Preseason", offset: -49,
    label: "Autonomous path + PID motion working on the practice bot",
    detail: "One scripted autonomous path and one PID-controlled motion running, vision/AprilTag detection mounted if used." },
  { id: "ps-offseason-event", phase: "Preseason", offset: -28,
    label: "Fall off-season event attended / scouting app tested",
    detail: "Good checkpoint to test scouting systems live and start drafting your Impact Award narrative while it's fresh." },
  { id: "ps-mock-kickoff", phase: "Preseason", offset: -7,
    label: "Mock kickoff run & practice robot fully verified",
    detail: "Rehearse strategy discussion under time pressure with an old game manual; confirm teleop, autonomous, and electrical are solid before the real Kickoff." },

  // ---- Build Season (Kickoff -> first event, ~6-8 weeks) ----
  { id: "bs-strategy", phase: "Build Season", offset: 3,
    label: "Game strategy set",
    detail: "Game manual read, priorities agreed on as a team -- FIRST's own timeline allots the first 2-3 days for this." },
  { id: "bs-concepts", phase: "Build Season", offset: 5,
    label: "Prototype concepts chosen",
    detail: "Mechanism brainstorming done and which concepts to prototype decided." },
  { id: "bs-prototyping", phase: "Build Season", offset: 21,
    label: "Prototyping complete",
    detail: "Rough mechanism prototypes built and tested enough to commit to a direction." },
  { id: "bs-cad", phase: "Build Season", offset: 28,
    label: "CAD / detailed design complete",
    detail: "Full robot modeled and ready to release for fabrication." },
  { id: "bs-fab", phase: "Build Season", offset: 35,
    label: "Drivetrain & core mechanisms fabricated",
    detail: "Main structural and mechanism parts cut, machined, or printed." },
  { id: "bs-assembly", phase: "Build Season", offset: 42,
    label: "Robot assembly & wiring complete",
    detail: "Competition robot fully assembled and wired -- FIRST's timeline targets this by end of week 6." },
  { id: "bs-code", phase: "Build Season", offset: 45,
    label: "Autonomous + teleop code running on the competition robot",
    detail: "Code running on the actual robot, not just the practice chassis." },
  { id: "bs-practice", phase: "Build Season", offset: 49,
    label: "Driver practice & iteration underway",
    detail: "Regular driver practice time scheduled, punch list of fixes being worked through." },

  // ---- Competition Season (first event -> last event) ----
  { id: "cs-event1", phase: "Competition Season", offset: 49,
    label: "First competition event attended",
    detail: "Robot competing at its first regional or district event." },
  { id: "cs-scouting", phase: "Competition Season", offset: 49,
    label: "Scouting system running live at events",
    detail: "Match scouting (paper or app) actually being collected and used for alliance selection." },
  { id: "cs-awards", phase: "Competition Season", offset: 60,
    label: "Award submissions completed",
    detail: "Impact/Chairman's Award, Engineering Inspiration, and other written submissions turned in." },
  { id: "cs-iterate", phase: "Competition Season", offset: 70,
    label: "Robot iteration & repairs between events done",
    detail: "Fixes and improvements from event 1 carried into later events." },
  { id: "cs-champs", phase: "Competition Season", offset: 90,
    label: "Championship qualification decided",
    detail: "Team knows whether it's advancing to district/state champs or the FIRST Championship." },

  // ---- Postseason (last event -> next preseason) ----
  { id: "post-thankyou", phase: "Postseason", offset: 115,
    label: "Sponsor thank-you letters & season impact report sent",
    detail: "Every sponsor and grantor hears back about how their support was used while the season is still fresh." },
  { id: "post-archive", phase: "Postseason", offset: 120,
    label: "Season documentation archived",
    detail: "Photos, videos, CAD files, and code from the season organized for next year's team and future award submissions." },
  { id: "post-offseason-demo", phase: "Postseason", offset: 160,
    label: "Off-season event or robot demo completed",
    detail: "Robot shown off at a summer/fall off-season event, school event, or community demo." },
  { id: "post-leads", phase: "Postseason", offset: 180,
    label: "Next season's officer/lead roles assigned",
    detail: "Team captains and subteam leads for next season decided before the new members show up." },
  { id: "post-renewal", phase: "Postseason", offset: 200,
    label: "Sponsor renewal outreach started",
    detail: "Early outreach to last year's sponsors -- most decide next year's giving budget over the summer." },
];
