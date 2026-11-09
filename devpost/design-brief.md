---
status: approved
---

# Design brief: Echoes, guidance beside the work

Approved scope reconciliation, November 9, 2026 (UTC). The learner approved the framing and replacement of the old Signal Arch brief. This brief combines the learner's stated intent with the implemented and tested demonstration. Approval does not authorize a rebuild or publication. Implementation facts below are evidence-derived, not invented learner answers.

## The one spatial moment

A person works through a real-world challenge while guided 3D diagrams explain the task alongside what they are looking at. Echoes is about help with everyday things; the seven-step brick example demonstrates the idea rather than defining the whole product.

## Why it belongs on glasses

- Uses: draws information alongside real work and leaves the person's hands available.
- The learner's priority is maintaining reference and getting help without looking away or holding a phone. This is the intended glasses benefit, not proof of hands-free operation on a device.

## Product or overlay

- Intended product: guidance overlaid alongside the person's real activity.
- Current demonstration: an inspectable virtual guide for printed steps 1-7 of the LEGO 40897 lower assembly, operated in Lens Studio desktop Preview.
- Sensing in this version: none. The user selects and confirms progress; Echoes does not identify the task or inspect physical placement.
- Preview stand-in: the authored section, enlarged model and explicit I placed it button show the guidance and progression without pretending recognition occurred.

## Where things live

- Intended use: the person looks at the real task. The guide stays in the upper left or upper right peripheral area and can be brought into focus when needed. A fixed side and exact device placement have not been selected.
- Demonstrated layout: preserve the existing central enlarged model, readable heading above it and large controls beside it. This brief does not claim the current prototype implements peripheral placement.
- Existing model window: 13 cm bounding radius at maximum zoom in guide-root coordinates, centered at (0, -0.5, 0). The heading plate is 35 x 15 cm at local y 27.5 cm. Buttons are 7 x 4.3 x 1 cm, with rails at local x -20.5 and +20.5 cm. These are measured implementation values, not newly selected learner dimensions.
- No new placement default is introduced. Preserve the tested scene placement for this demonstration. Glasses comfort and peripheral visibility require a separate experiment.

## Hands and input

- Click the large UI Kit controls in Interactive Preview; mouse input stands in for standard pinch interaction.
- Turn 45, center drag, Underside/Top side, Home and Zoom adjust the virtual guide's view.
- Explode/Reassemble shows incoming parts apart from or seated in their final poses.
- Inspect joint, Next joint and Return expose each connection and restore the prior view.
- I placed it records a manual statement and advances. Back keeps marks. Restart clears marks. All marked is the completed-state label, not an extra action.
- Voice or looking direction are possible future focus-activation experiments. Neither is selected, implemented or verified here. No assumption about another glasses product establishes SPECS support. Any later voice experiment needs a demonstrable Preview input fallback.

## When things show

- Current demo: the model, current instruction, controls and progress remain visible while the guide runs. Each step shows its relevant fixed and incoming parts; cyan final-position ghosts and insertion cues explain the connections. Inspection focuses on one incoming connection at a time.
- At the seventh confirmation, the assembly is shown complete and the message says the user marked all seven steps. Back enables review and Restart returns to the initial state.
- Future vision: peripheral availability and on-demand focus, possibly receding when attention moves away. That timing is experimental, not a current automatic behavior.
- No out-of-view attention notification is implemented or required for the current demo.

## Done criteria

These criteria are derived from the implementation and existing acceptance evidence, rather than invented learner answers. Each can be checked in Lens Studio Preview.

1. Follow all seven steps and see the correct incoming pieces, cyan final-position ghosts and insertion paths. There are 17 incoming pieces across the section.
2. Turn, orbit, switch underside, zoom and return Home without losing the model or covering the heading and controls; Explode/Reassemble keeps fixed pieces fixed and restores canonical poses.
3. Inspect every incoming joint and Return to the previous view without drift or a stuck state.
4. Confirm steps manually through completion, then use Back with marks preserved and Restart with all marks cleared. The wording never claims that Echoes checked physical bricks.
5. Open the saved project, start the guide cleanly and repeat the sequence with the mouse. Keep the guide enabled and the earlier Signal Arch module disabled.

### Existing evidence and remaining verification

- Guide LEAF control suite: 24/24; step-flow suite: 79/79, including all 17 joints. Source checks: 29/29. Seeded state stress: 50,000 actions, zero failures.
- Saved-project reopen and a fresh local checkout passed compile/start and the guide suites. These are previous runtime checks, not a claim that the final proposed public export has been opened in Lens Studio.
- The learner reported completing the build, reset, Back and all buttons with a physical mouse and finding the experience intuitive. Exact coverage of each joint and every detailed rehearsal subcheck was not separately reported.
- The separated export passed source and geometry checks. Exact-export Lens Preview verification is still pending.
- A separate 2:14.2 silent local demo is labeled as agent-injected input on every frame. It is not a recording of the human mouse pass.

## Out of scope

- New task modules beyond the seven-step example for this demonstration.
- Live camera overlay, task recognition, verification of physical assembly, physical-fit certification or an AI operator.
- Voice activation, eye/gaze activation, automatic attention-based hiding, peripheral-to-focus transitions, persistent memory or multi-user sharing.
- Claiming proven headset comfort or device hand tracking.
- Publication, uploads and submission without their separate authorization.

## Risks and open questions

- The broader everyday-task and hands-free benefits are the product vision. The desktop example demonstrates guidance mechanics, not the complete wearable experience.
- The proposed peripheral position must remain within the narrow glasses view and be comfortable to find. Device testing must establish placement, visibility and activation behavior; no guessed platform parity is accepted as evidence.
- Physical fit and feel remain unproven. Current progress is manual confirmation only.
- Current-demo and future-vision framing is approved. Exact-export Preview verification and separate release decisions remain pending. No new feature inventory is needed from the learner.

The template sections below are retained verbatim. They are workflow guidance, not authorization to rebuild, publish or submit. Use existing tested functionality and evidence before proposing new work.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
