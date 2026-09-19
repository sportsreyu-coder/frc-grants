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
//
// `detail` is the one-line summary shown in the list. `expanded` is the
// longer write-up shown when a team clicks into a milestone for more
// context on why it matters and how to approach it.
window.SEASON_MILESTONES = [
  // ---- Preseason (Sept -> Kickoff) ----
  { id: "ps-roster", phase: "Preseason", offset: -105,
    label: "Subteams assigned & season registration confirmed",
    detail: "Mechanical, electrical, programming, CAD, and business roles set; Kickoff Kit selection window and event registration confirmed.",
    expanded: "Confirm who is leading mechanical, electrical, programming, CAD, and business/outreach before real training work starts -- ambiguity here is one of the most common reasons preseason plans stall out. Lock in your event registration and payment deadlines, and decide whether you're keeping last year's Kickoff Kit checklist or updating it. If you're attending any fall off-season events, get them on the calendar now so training has a real deadline to build toward." },
  { id: "ps-fundamentals", phase: "Preseason", offset: -77,
    label: "Training chassis drives under teleop control",
    detail: "Practice/training robot has a working drivetrain a student can drive, with basic wiring and CAN bus in place.",
    expanded: "This is the first real capability checkpoint: a student should be able to pick up a controller and drive the practice chassis around under teleop control. Mechanical should have the drivetrain fabricated and mounted, electrical should have the full power path and CAN bus wired end to end, and programming should have a basic command-based drivetrain subsystem running -- all three tracks working in parallel rather than waiting on each other." },
  { id: "ps-auto", phase: "Preseason", offset: -49,
    label: "Autonomous path + PID motion working on the practice bot",
    detail: "One scripted autonomous path and one PID-controlled motion running, vision/AprilTag detection mounted if used.",
    expanded: "Push the practice robot past manual driving: get one PID-tuned motion (like turning to an angle or driving a fixed distance) running cleanly, and one scripted autonomous path executing start to finish. If your team uses vision, this is also the checkpoint to get an AprilTag or camera pipeline mounted and returning real data, even if it isn't wired into a full autonomous routine yet." },
  { id: "ps-offseason-event", phase: "Preseason", offset: -28,
    label: "Fall off-season event attended / scouting app tested",
    detail: "Good checkpoint to test scouting systems live and start drafting your Impact Award narrative while it's fresh.",
    expanded: "A fall off-season event (or even a scrimmage) is the cheapest way to find problems in your scouting system before it actually matters. Run your real scouting app or spreadsheet against live matches, and have your outreach lead start drafting the Impact Award narrative now -- the details are freshest right after an event, not in December when you're trying to reconstruct them." },
  { id: "ps-mock-kickoff", phase: "Preseason", offset: -7,
    label: "Mock kickoff run & practice robot fully verified",
    detail: "Rehearse strategy discussion under time pressure with an old game manual; confirm teleop, autonomous, and electrical are solid before the real Kickoff.",
    expanded: "Pull an old game manual and run a full mock kickoff: read the rules cold, brainstorm strategy, and present a plan under a tight time limit, the same way you'll have to on the real day. In parallel, do a final pass on the practice robot -- confirm teleop, autonomous, and every electrical connection are solid, since this is the platform new drivers and programmers will lean on once build season starts." },

  // ---- Build Season (Kickoff -> first event, ~6-8 weeks) ----
  { id: "bs-strategy", phase: "Build Season", offset: 3,
    label: "Game strategy set",
    detail: "Game manual read, priorities agreed on as a team -- FIRST's own timeline allots the first 2-3 days for this.",
    expanded: "Read the manual as a full team, then narrow down to the two or three game tasks your robot will actually prioritize. FIRST's own build season timeline allots roughly the first 2-3 days to this -- spending much longer usually just delays prototyping without meaningfully improving the strategy." },
  { id: "bs-concepts", phase: "Build Season", offset: 5,
    label: "Prototype concepts chosen",
    detail: "Mechanism brainstorming done and which concepts to prototype decided.",
    expanded: "Turn your strategy into a short list of mechanism concepts worth building rough prototypes of. The goal isn't a finished design yet -- it's picking which two or three approaches per mechanism are worth a few days of prototyping before committing to one in CAD." },
  { id: "bs-prototyping", phase: "Build Season", offset: 21,
    label: "Prototyping complete",
    detail: "Rough mechanism prototypes built and tested enough to commit to a direction.",
    expanded: "By this point you should have tested rough versions of your key mechanisms enough to know which approach works and commit to it. It's normal for prototypes to look rough -- the point is answering \"will this actually work\" before spending fabrication time on a polished version." },
  { id: "bs-cad", phase: "Build Season", offset: 28,
    label: "CAD / detailed design complete",
    detail: "Full robot modeled and ready to release for fabrication.",
    expanded: "The full robot should be modeled and ready to release for fabrication -- not just the mechanisms you prototyped, but how they mount together, wiring routing, and the bumper/frame perimeter. Releasing CAD on time here is usually what keeps fabrication from running into week 6." },
  { id: "bs-fab", phase: "Build Season", offset: 35,
    label: "Drivetrain & core mechanisms fabricated",
    detail: "Main structural and mechanism parts cut, machined, or printed.",
    expanded: "Structural parts, drivetrain, and your main mechanisms should be cut, machined, or printed by now. This is usually the busiest shop week of the season -- if fabrication is running behind, it's often better to cut scope on a mechanism than to let it slip into assembly week." },
  { id: "bs-assembly", phase: "Build Season", offset: 42,
    label: "Robot assembly & wiring complete",
    detail: "Competition robot fully assembled and wired -- FIRST's timeline targets this by end of week 6.",
    expanded: "Everything should be bolted together and wired on the actual competition robot, not just the practice chassis. FIRST's build season timeline targets assembly and wiring wrapping up by the end of week 6, leaving the remaining time for programming, driver practice, and fixing whatever breaks." },
  { id: "bs-code", phase: "Build Season", offset: 45,
    label: "Autonomous + teleop code running on the competition robot",
    detail: "Code running on the actual robot, not just the practice chassis.",
    expanded: "Move your code off the practice chassis and onto the real robot -- sensors, motor IDs, and wiring are never identical between the two, so this always takes longer than expected. Get basic teleop driving and at least one autonomous routine running on the competition bot itself before spending more time polishing either." },
  { id: "bs-practice", phase: "Build Season", offset: 49,
    label: "Driver practice & iteration underway",
    detail: "Regular driver practice time scheduled, punch list of fixes being worked through.",
    expanded: "Get drivers real stick time on the actual robot, and start a running punch list of fixes and improvements from what you see. Teams that treat the last week as practice-and-iterate instead of still-building usually show up to their first event in noticeably better shape." },

  // ---- Competition Season (first event -> last event) ----
  { id: "cs-event1", phase: "Competition Season", offset: 49,
    label: "First competition event attended",
    detail: "Robot competing at its first regional or district event.",
    expanded: "Your robot is competing for real. Treat this event as data collection as much as competition -- note what broke, what the drive team struggled with, and what alliance partners' robots do well, since all of it feeds directly into how you spend the weeks before your next event." },
  { id: "cs-scouting", phase: "Competition Season", offset: 49,
    label: "Scouting system running live at events",
    detail: "Match scouting (paper or app) actually being collected and used for alliance selection.",
    expanded: "Whatever scouting tool you built or tested in the preseason should be in actual use in the stands -- collecting match data your alliance-selection lead can use, not just sitting on a laptop. If it's not working smoothly yet, this is the event to fix it, not the one right before champs." },
  { id: "cs-awards", phase: "Competition Season", offset: 60,
    label: "Award submissions completed",
    detail: "Impact/Chairman's Award, Engineering Inspiration, and other written submissions turned in.",
    expanded: "Impact Award (formerly Chairman's), Engineering Inspiration, and any other written award submissions your team is eligible for should be turned in. These often have earlier deadlines than teams expect, and the writing goes faster if you've been logging outreach and documentation all season instead of reconstructing it now." },
  { id: "cs-iterate", phase: "Competition Season", offset: 70,
    label: "Robot iteration & repairs between events done",
    detail: "Fixes and improvements from event 1 carried into later events.",
    expanded: "Whatever your first event exposed -- a mechanism that jams, a code bug, a repeated foul -- should be fixed and tested before your next event, not patched in the pits. This is also a good checkpoint to revisit your scouting data and see if your game strategy still holds up against what other teams are doing." },
  { id: "cs-champs", phase: "Competition Season", offset: 90,
    label: "Championship qualification decided",
    detail: "Team knows whether it's advancing to district/state champs or the FIRST Championship.",
    expanded: "By now your team should know whether it's advancing to a district/state championship or the FIRST Championship. Whichever way it goes, this is the natural checkpoint to start planning the postseason -- what to fix for next year, and how to wrap up outreach and sponsor relationships either way." },

  // ---- Postseason (last event -> next preseason) ----
  { id: "post-thankyou", phase: "Postseason", offset: 115,
    label: "Sponsor thank-you letters & season impact report sent",
    detail: "Every sponsor and grantor hears back about how their support was used while the season is still fresh.",
    expanded: "Every sponsor and grant-maker should hear specifically how their support was used -- a photo, a result, a number of students reached -- while the season is still fresh. This is also the single best thing you can do to make next year's renewal conversation easier." },
  { id: "post-archive", phase: "Postseason", offset: 120,
    label: "Season documentation archived",
    detail: "Photos, videos, CAD files, and code from the season organized for next year's team and future award submissions.",
    expanded: "Pull together this season's photos, videos, CAD files, and code into somewhere next year's team -- and you, writing next year's award submissions -- can actually find them. Teams that skip this step usually end up rebuilding institutional knowledge from scratch every August." },
  { id: "post-offseason-demo", phase: "Postseason", offset: 160,
    label: "Off-season event or robot demo completed",
    detail: "Robot shown off at a summer/fall off-season event, school event, or community demo.",
    expanded: "Show the robot off -- at a summer off-season competition, a school event, or a community demo. It's good outreach, it's a low-stakes way to onboard new members on the real robot, and it keeps the team visible to sponsors and your school between seasons." },
  { id: "post-leads", phase: "Postseason", offset: 180,
    label: "Next season's officer/lead roles assigned",
    detail: "Team captains and subteam leads for next season decided before the new members show up.",
    expanded: "Decide who's leading each subteam next season before new members show up in the fall. Handing off leadership with enough runway for the outgoing lead to actually mentor their replacement tends to matter more than who gets picked." },
  { id: "post-renewal", phase: "Postseason", offset: 200,
    label: "Sponsor renewal outreach started",
    detail: "Early outreach to last year's sponsors -- most decide next year's giving budget over the summer.",
    expanded: "Reach out to last year's sponsors early -- most companies and foundations set their giving budgets over the summer, so a renewal ask in August lands very differently than one in November. This is also the natural bridge back into the preseason roster and registration milestone." },
];
