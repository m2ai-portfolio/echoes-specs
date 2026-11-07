---
status: approved
approved_by: Matthew, 2026-11-04 (America/Chicago)
approved_defaults: Signal Arch v1; five placements; discrete turn/target controls; stated layout dimensions; candidate-state behavior as written
---

# Design brief: Echoes

**For Matthew's review, November 4, 2026.** This is the brick-building first proof of Echoes, a companion that stays with a person through a hands-on task, explains the next useful action beside the work, and helps them recover without losing progress.

Matthew selected brick building first, cars across multiple makes/models second, and excluded DCS. The detailed choices marked **(default)** below are proposals for this brief, not earlier user decisions. Approval can adopt these defaults or replace them. This draft does not start implementation or authorize publication.

## The one spatial moment

A person is assembling a small original brick model at a desk. They look from the partial build to a highlighted attachment and choose the next piece. They try the wrong piece. Echoes explains the mismatch at that attachment, leaves the completed work intact, and makes the correction clear. Later, they return from an interruption and continue from the same step.

The first proof is one complete, five-placement **Signal Arch (default)**: a supplied base, two square pillars, a long beam spanning them, a small square pedestal, and a wedge-shaped marker on top. The base is the starting assembly; the five added pieces are the task. The intended sequence is left pillar, right pillar, beam, pedestal, marker. At least three piece forms are visibly distinguishable without color. The beam has a meaningful orientation constraint: it must span the pillars. Turning it 180 degrees is equivalent; turning it 90 degrees is wrong. The marker points toward an authored forward arrow on the base, independent of the viewer's current camera angle.

This is an original authored model, with generic virtual pieces and authored attachment rules. It does not claim structural analysis or compatibility with a commercial brick system. The colleague can propose a simpler original model before approval if it preserves the complete task, wrong-piece correction, and meaningful orientation test.

**The demonstration is virtual.** Echoes knows the selected virtual piece, the requested orientation, and the target the person chose. It validates those inputs against the authored task and visibly updates the virtual assembly. A persistent label says “Virtual build demo”; the opening explains that no physical bricks are being recognized. The state response works, while physical perception and real-world registration are outside this proof.

## Why it belongs on glasses

The useful information is tied to a particular piece, attachment, and moment in the work. Guidance beside that attachment can reduce the need to translate a separate instruction page into the scene. Correction can show what to change while keeping the accepted assembly visible. Returning to the same objective after an interruption is part of that value.

SPECS is an interface to Echoes. This submission demonstrates the interaction in Lens Studio's SPECS desktop Preview. Mouse-operated success supports the virtual workflow; it does not establish hands-free usability, headset comfort, tracking quality, latency, or safety in a physical workshop. Those need later device and task testing.

Cars are the second application, after this proof. A future first car experience should be narrowly scoped to parked-vehicle component location and source-backed explanation across explicit configurations. Vehicle identification, maintenance, repair, and diagnostics are not part of this build.

## Product or overlay

Echoes owns a bounded task: the authored goal, accepted progress, current objective, contextual help, and recovery. The person can attempt an action, receive a specific correction, interrupt, undo the latest placement, finish, and replay. The visible assembly, progress, and instructions must agree throughout.

The product truth is deliberately limited. Accepted virtual placement is verified scene state. A person's assertion, if added later, is a different evidence type. Physical state is unknown here. Authored help explains known task facts. No live model is required, and this deterministic proof is not evidence of open-ended reasoning or autonomous planning.

The emotional result should be modest and clear: “I know what to do next, I understand my mistake, and I haven't lost my place.”

## Where things live

These are authored scene dimensions, in centimeters, for the first Preview layout. They are **defaults to test**, not measurements from a working experience. The model is intentionally enlarged; the demo labels that choice.

- **Build (default):** center 90 cm ahead of the initial view and 15 cm below eye level; completed model approximately 30 cm wide, 18 cm high, and 14 cm deep. It stays at that world location during the run. No face-locked model or persistent real-world anchor is required.
- **Next-action guidance (default):** a panel approximately 28 × 8 cm, centered 12 cm above the build's top. A restrained outline or pointer identifies the intended attachment without covering the contact area. Essential text has at least 1.2 cm character height at the authored scale.
- **Piece choices (default):** a 16 × 18 cm palette centered 27 cm to the left of the build; a 10 × 10 cm candidate staging area centered 24 cm to its right. Distinguish choices by shape and plain labels; color can reinforce the distinction. Keep the selected candidate visible while its orientation changes.
- **Controls and targets (default):** place the compact controls below the build with at least a 4 cm visual gap. Essential selectable surfaces are at least 5 × 5 cm, with at least 1.5 cm between adjacent controls. Attachment selection can use a visibly associated enlarged target. Selectable areas must not overlap or make the wrong target unavoidable.
- **Working views (default):** verify the task at 60, 90, and 120 cm from the build, including a front view and a modest side view that exposes the attachment. The colleague chooses the final compact layout so the relevant piece, instruction, and attachment remain readable together.
- **Help and pause (default):** use the instruction area and a clear return control. Keep the accepted build visible. Replay retains the world placement established at the start of this Preview run; it does not move the assembly to the current camera pose.

These values can change during the single-placement check if the revised measurements are recorded and preserve the same readable, reachable experience. A material change to scope or interaction requires an updated agreement, not an invisible reduction in the acceptance target.

## Hands and input

Use standard SIK controls with a mouse-operable path in desktop Preview. **Select a piece, turn it, choose an attachment, and confirm (default).** Turning uses explicit 90-degree controls around the model's upright axis; pitch and roll are authored. No custom gesture, native mouse twisting, voice input, or two-hand manipulation is required.

The controls must let the person make a real choice: choose a wrong piece, select an inappropriate attachment, or submit a meaningful wrong orientation. A glowing guide must not silently choose and accept the answer for them. Discrete target selection and snapping are acceptable; physical collision or camera-based recognition is not claimed.

For an invalid attempt, identify the differing attribute and the required alternative without relying on color. If several attributes differ, explain target first, then piece, then orientation **(default)**. For example: “Use the left pillar attachment first,” “Choose the long beam,” or “Turn the beam so it spans both pillars.” Valid equivalent rotations are accepted.

Help, Pause/Resume, Undo latest placement, and Replay are available through ordinary controls. Repeated input must not duplicate an accepted placement or skip a step. Voice and a live explanation service are optional later additions only after the required experience and packaging are secure.

## When things show

- **Start:** show the original model goal, brief controls, and the virtual-demo disclosure. The supplied base and first objective appear with zero accepted placements.
- **During a step:** show only the current concise instruction, its relevant attachment, candidate choices, and progress. Accepted pieces remain visible. A correct attempt adds the selected piece and advances exactly once.
- **After a mistake:** keep accepted work unchanged. Show a specific correction at the work and allow another attempt. Out-of-order choices explain the current objective; they do not alter the sequence.
- **Help:** explain the current authored piece, orientation, and attachment. Opening or closing help never accepts a placement; closing it returns to the same objective.
- **Pause (default):** show an unmistakable paused state and prevent placement. Resume restores the same accepted progress, objective, selected candidate, and candidate orientation. No hidden step advances while paused.
- **Undo:** remove only the most recently accepted piece, restore its instruction, and clear candidate/feedback state. Disable Undo when there is no accepted placement. Undo after completion clears completion and reopens the final placement. Placing it again is a new placement; there is no separate Redo feature.
- **Completion:** appear only when all five required placements and the visible final assembly agree. Offer Replay and Undo; do not imply that a physical model was inspected.
- **Replay:** from active work, correction, help, pause, or completion, clear task progress, selection, orientation, help/pause state, completion, and pending feedback. Restore the starting assembly and controls at the run's existing world location. Old callbacks must not change the new task.

The authored task has an identity/version and a complete set of valid pieces, targets, and rotations. Invalid or incomplete task data should produce a clear cannot-start state rather than fabricated progress. All required user behavior works without a product network request, live model, or developer intervention.

## Done criteria

Each outcome is demonstrable by a person in SPECS Preview. The companion `devpost/echoes-acceptance-matrix.md` supplies the specific cases and evidence. No criterion is passed by this draft.

1. **I can place the next piece.** Guidance beside the assembly and mouse-operable controls let me select, orient, and attempt a placement. The scene and displayed progress agree after each accepted piece.
2. **I can recover from a specific mistake.** A wrong piece, attachment, or genuinely wrong orientation produces a useful correction without losing accepted work. Equivalent valid rotations succeed.
3. **I can interrupt and return.** Current-step help and Pause/Resume preserve the agreed task and candidate state. Paused input cannot accept a placement.
4. **I can undo and start again cleanly.** Undo reverses only the latest placement, including after completion. Replay restores the baseline from every supported state, without late feedback from the previous run.
5. **I can finish a truthful, repeatable demonstration.** The full authored build finishes only when every required placement is accepted. Two fresh-reset runs succeed without script errors; the recording accurately labels virtual validation and enlarged geometry. The final project opens from its clean local package with the required assets.

The demonstration story is one continuous task: begin, make and correct a wrong-piece choice, interrupt and resume, make and correct an orientation error, undo the latest piece and place it again, complete the model, then replay. Focused checks cover cases that would make that story too long. A fresh-viewer check targets three people, with at least two able to identify the next action and explain how correction preserved progress without coaching; report the actual sample and any remaining uncertainty.

## Out of scope

Physical-brick recognition or assembly inspection; arbitrary commercial sets; copied building instructions; freeform assembly or branching planning; custom/two-hand gestures; persistent anchors; memory across Preview sessions; accounts/backend; real-time AI as a dependency; vehicle implementation; and DCS.

The first build does not certify a real model, physical structure, or repair. It does not demonstrate true-to-life brick scale or hands-free operation. Presentation should name these limits rather than fill them in with narration.

Extra placements, audio, animation, and optional voice/live explanation are secondary. They must not displace correction, interruption recovery, truthful completion, verification, or a usable package. Proposed fallback order: remove optional polish, then reduce the number of placements while retaining the complete task and meaningful orientation test. Replacing separate Pause with help as the sole interruption is a scope change requiring Matthew's agreement.

## Risks and open questions

**Choices to confirm.** The Signal Arch, five placements, discrete turn/target controls, layout dimensions, and candidate-state behavior are proposed defaults. Matthew can approve them together or change the part that matters. Actual available working hours and protected verification/package time remain unknown; the old 30-hour estimate does not establish remaining capacity. These are build-handoff questions, not a claim that the design has already been approved.

**Interaction risk.** Mouse button presses have historical setup evidence; native mouse rotation does not. The first implementation gate is a complete correct placement and deliberate wrong attempts using the explicit controls. If it fails, simplify the controls while preserving meaningful choice before expanding the model.

**State risk.** Help, pause, undo, replay, and repeated inputs must preserve one coherent task. Fix state mismatches before polish. Record every matrix result against a named revision and distinguish real mouse operation from injected or automated tests.

**Safety and access.** Keep the central work visible, avoid flashing/full-screen effects, and provide clear exits. Essential guidance uses readable text and shape/relationship cues as well as color; audio is never required. This is a stationary virtual desk task. Do not encourage use while driving or imply that the later car concept can safely guide repairs. Device comfort and accessibility beyond this tested input path remain unverified.

**Original work and assets.** Use original generic piece geometry and instructions. Do not use commercial brick branding, copied sets, third-party music, or imagery without rights. Keep a short asset/license record and disclose incorporated templates, packages, and pre-existing work. The exact build and recording must match the public claims.

**Baseline and authority.** The existing project has no gameplay implementation to reuse. The recorded November 3 setup pass on Lens Studio 5.23.2 and the template establishes historical tooling evidence only; a bounded current check is still needed. On approval, this brief governs scope, the named acceptance matrix supplies compatible test detail, and the reconciled implementation guide explains intent. The museum brief is superseded for this build and must be visibly marked as historical in the repository before handoff. Do not silently import its requirements.

**Build handoff gates.** Before implementation begins, the approved brief and named matrix must be present in the project and explicitly referenced by the actual builder handoff. Preserve the official template's two closing sections verbatim. The supplemental handoff must carry the established safe-validation restrictions: do not use `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, or workflows that require/install `AiPreviewAgentInspect`; use the established `CapturePanelScreenshotTool`, `RunAndCollectLogsTool`, `InjectPreviewGesture`, `scene-graphql`, and supported LEAF paths. Retain the expected Bitmoji 3D, Leaf, SIK, and UIKit packages, with no unexpected package changes. Surface any proposed tool/package addition before using it. Do not force-close Lens Studio or patch generated cache/package code to rescue the build.

**Delivery and permission.** The public-ready package needs the Echoes name, accurate run instructions, acceptance evidence, an asset record, and a clean local open rehearsal. Remote/LFS distribution remains unverified until separately authorized and tested. There is no authorization here to create/push a remote, publish a video, submit an entry, accept new terms, or remove private development history. The intended public-history policy is a separate decision.

**Event boundary.** The official deadline is November 9, 2026, 5 p.m. Eastern / 4 p.m. Central / 22:00 UTC. The event requires Devpost Learn planning, CLAD/Lens Studio/MCP construction, a Preview-running SPECS Lens, a public code repository, a description, and a public YouTube demonstration. Keep the video under three minutes. Planning documents are optional in the public repository; the planning workflow is required. Review and authorize the final submission separately. [Official rules, checked November 4](https://learn-specs.devpost.com/rules)

The organizer confirms mouse/keyboard SPECS simulation in Preview and recommends contextual placement, standard interaction controls, clear exits, and attention to comfort. Preview does not replace real-device testing. [Official FAQ, checked November 4](https://learn-specs.devpost.com/details/faqs)

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
