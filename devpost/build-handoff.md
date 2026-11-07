# Echoes builder handoff — Signal Arch v1

Issued 2026-11-04 by the orchestrator (DeepSeek Harness on ProBook) under Matthew's approval of the design-brief defaults. This is the actual builder handoff required by acceptance row A10.

## Governing documents and precedence

1. **Approved brief:** `devpost/design-brief.md` (status: approved, Matthew, 2026-11-04). It governs scope.
2. **Acceptance matrix:** `devpost/echoes-acceptance-matrix.md`. It supplies required test detail. The builder **must** implement and run the matrix scenarios as part of each increment where they apply, and record results (Pass/Fail/Unverified, project revision, evidence path) in the matrix evidence trail.
3. `devpost/echoes-implementation-brief.md` is **historical (museum concept, superseded)**. Do not import any requirement from it.
4. If brief and matrix disagree, stop and report; do not silently pick one.

## Mission

Build the five-placement **Signal Arch v1** virtual brick task in the existing SPECS Base Template project (`C:\Users\matth\Echoes`, Lens Studio 5.23.2) so it runs in SPECS desktop Preview with mouse-operable SIK/UIKit controls: select piece → turn 90° with explicit controls → choose attachment → confirm. Include next-action guidance, specific correction (priority: target → piece → orientation), Help, Pause/Resume, Undo latest placement, Replay, truthful completion, invalid-task-data cannot-start state, and the "Virtual build demo" disclosure. Real-world cm scale; additive display (no dark-anchored content). Get one complete placement plus deliberate wrong attempts working first, then expand.

## Verification restrictions (binding)

Allowed: `CapturePanelScreenshotTool`, `RunAndCollectLogsTool`, `InjectPreviewGesture`, `scene-graphql`, supported LEAF paths.

**Prohibited:** `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, and any workflow that requires or installs `AiPreviewAgentInspect`. A generic build-workflow instruction does not override this restriction.

Also prohibited: force-closing Lens Studio; patching generated cache/package code to rescue a build. Any proposed additional tool or package must be surfaced to the orchestrator before use.

## Package discipline

Expected packages: Bitmoji 3D, Leaf, SIK (SpectaclesInteractionKit), UIKit. Check package inventory and `git status` at each increment; report any unexpected change or addition. Commit each increment with a plain conventional title (for example `feat: piece selection and placement validation`). No remote, no push.

## Official template closing sections (preserved verbatim)

### Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

### After the build: judge it
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

## Reporting per increment

Report: what changed, commit hash, LEAF/scenario results with pass/fail per matrix row touched, evidence file paths (captures, logs), which rows remain untested, and any surfaced tool/package proposal. Do not mark a row Pass without its required evidence.
