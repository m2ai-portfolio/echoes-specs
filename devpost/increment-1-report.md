# Increment 1 report: first placement gate

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago), on AlienPC.
Governing documents: `devpost/build-handoff.md`, `devpost/design-brief.md` (approved), `devpost/echoes-acceptance-matrix.md`, `devpost/increment-1-prompt.md`.

## Verdict

**The first implementation gate holds under injected input, and human mouse operation is still needed.** The explicit controls were not simplified. In SPECS desktop Preview, one complete correct placement and deliberate wrong-orientation attempts both behave as the brief requires. Every interaction was injected with `InjectPreviewGesture`. Under the matrix's evidence rules that is not Human Preview, so A1 and A2 stay **Unverified** until a person repeats the path with the mouse.

## Environment and gate checks

| Check | Result |
|---|---|
| Lens Studio | 5.23.2.26081320 (running process), project `C:/Users/matth/Echoes/Echoes.esproj`, signed in (`isAuthorized: true`), `targetPlatform: Spectacles` |
| Packages on disk, before and after | `Bitmoji 3D.lsc`, `Leaf.lspkg`, `SpectaclesInteractionKit.lspkg`, `SpectaclesUIKit.lspkg`. No files added, removed, or changed |
| `ListInstalledPackagesTool`, before and after | The same 5 entries both times: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, plus one unnamed `package` 0.0.0 (id `3aa05179-8c22-47ab-8e76-896f1efc6ff4`). That id appears in no project file or package meta. It existed before any change in this increment and did not change; it may be a dependency packed inside another package. Reported for the orchestrator; I took no action. |
| `git status` at start | Only the untracked `increment-1-run.log` (left untouched and uncommitted) |
| `git status` at end | Only `increment-1-run.log` untracked. `Echoes.esproj` unchanged |
| Tools used | `scene-graphql`, `asset-graphql`, `VirtualScene` (scene edits), `ExecuteEditorCode` (project path, sign-in, save), `RecompileTypeScriptTool`, `RunAndCollectLogsTool`, `InjectPreviewGesture`, `CapturePanelScreenshotTool`, `ListAllPanels`, `ListInstalledPackagesTool` |
| Prohibited tools | Not used: `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, anything that installs `AiPreviewAgentInspect`. No force-close, no cache or package patching |

Process note: the `lens-studio-router` skill's default is to hand the build to the `specs-experience-builder` sub-agent. I did not, because that agent's toolset includes the prohibited `CaptureRuntimeViewTool` and its generic workflow would conflict with the handoff restrictions. The build ran inline under the handoff rules. I also read `ls-live-instance.json` once while orienting. It holds only the executable path, a stale version string (5.24.1), and the project path; no credential.

## What changed

| Path | Purpose |
|---|---|
| `Assets/Echoes/Scripts/SignalArchTask.ts` | Signal Arch v1 task data (`signal-arch`, version 1): base, 4 piece forms, 5 targets, 5 placements with valid yaw sets, per-piece staging orientation, `validateTask()` for the cannot-start state |
| `Assets/Echoes/Scripts/PlacementRules.ts` | `evaluateAttempt()`: pure validation, priority target → piece → orientation, text corrections naming the actual mismatch and the required alternative |
| `Assets/Echoes/Scripts/EchoesController.ts` | Runtime scene construction, state, input handling, view refresh, `ECHOES …` state logging, screen-position probe |
| `Assets/Echoes/Materials/EchoesPiece.mat`, `EchoesGhost.mat` (+ preset shader/texture dependencies) | Lit material for pieces; translucent unlit material for targets, ghost preview, pointers |
| `Assets/Scene.scene` | One new object, `Echoes Signal Arch` at (0, −24.25, −90) with `EchoesController`. No other scene changes |
| `validation/increment-1/` | Evidence: 12 captures, 6 extracted logs |
| `devpost/echoes-acceptance-matrix.md` | Evidence record and results for A1, A2, A3, A11 |

### Signal Arch v1 as authored

Build-local cm, origin at the base's bottom-center, +Z toward the viewer (the FRONT arrow). Yaw is measured clockwise seen from above, in 90° steps.

| Placement | Piece (W×H×D cm) | Target | Valid yaw | Arrives at |
|---|---|---|---|---|
| 1 left pillar | square pillar 5×8×5 | Left pad (−10.5, 2, 0) | 0/90/180/270 | 0° |
| 2 right pillar | square pillar 5×8×5 | Right pad (10.5, 2, 0) | 0/90/180/270 | 0° |
| 3 beam | long beam 26×3×5 | Beam seat (0, 10, 0); needs both pads | **0/180** (90/270 run front to back) | **90°** |
| 4 pedestal | flat square pedestal 6×2.5×6 | Pedestal seat (0, 13, 0); needs beam | 0/90/180/270 | 0° |
| 5 marker | wedge marker 5×3×6 (thin edge = point) | Marker seat (0, 15.5, 0); needs pedestal | **0** (points to FRONT arrow) | **180°** |

Supplied base: 30×2×14 cm with a FRONT arrow on its top front edge. Completed model: 30 W × 18.5 H × 14 D cm.

Design choices the orchestrator may want to confirm:
1. **Arrival orientation.** The beam arrives at 90° and the marker at 180°, so both pieces need a turn before they can be placed. Without this, the default orientation would already be valid and the turn control would carry no real choice.
2. **Offered targets.** Only attachments whose supports are already placed are selectable. At steps 1–2 both pads are offered, so a wrong target can be chosen there. At steps 3–5 only one target exists, so a wrong-target attempt is impossible at those steps.
3. **Ghost preview.** Once a piece and a target are chosen, a translucent copy of the candidate appears at the target with its current turn, and the panel says "Chosen: …". It shows the user's own choice, never the answer, and nothing is accepted until Confirm.

## Commits

| Hash | Title |
|---|---|
| `13fed72` | feat: author Signal Arch v1 task data and placement rules |
| `1318c82` | feat: add first placement loop with SIK and UIKit controls |
| `875d3c9` | test: record increment 1 placement gate evidence and report |

No remote, no push.

## Layout

### Why the brief's defaults changed

The brief allows default dimensions to change at the single-placement check if the new measurements are recorded. The lens printed the camera's screen-space position for every control (`ECHOES screen …`), and at 90 cm the SPECS Preview display spans about **±26 cm horizontally and ±30 cm vertically** (≈ 32° × 37°). In the brief's default layout:
- the palette, centered 27 cm left and 16 cm wide, reached −35 cm and printed at screen x < 0;
- the controls below the build, with the ≥4 cm gap, sat 28–34 cm below eye level and printed at screen y > 1.

The first capture showed the palette and controls cut off. CLAD's "Keep content inside the user's view" note conflicts with those defaults, so I compacted the layout and kept the build where the brief puts it.

### Actual layout (world cm; eye level y = 0; camera at origin facing −Z)

| Element | Brief default | Increment 1 actual |
|---|---|---|
| Build | center 90 ahead, 15 below eye; ~30×18×14 | center (0, −15, −90); 30×18.5×14. **Unchanged** |
| Guidance panel | ~28×8, centered 12 above build top | **34×15**, centered **13** above build top (y = +7.25). It holds 5 lines: disclosure, progress, instruction, chosen candidate/attachment, correction |
| Palette | 16×18, centered 27 left | **Single column** of 4 UIKit buttons, 7×6 each, 1.5 gap, centered x = −20.5, top at y = +1 |
| Staging | 10×10, centered 24 right | **7×8** card at x = +20.5, top at y = +1 |
| Controls | below build, ≥4 gap | **Turn left / Turn right / Confirm** stacked under staging at x = +20.5, 7×5.5 each, 1.5 gap; lowest edge y ≈ −28 |
| Targets | ≥5×5, ≥1.5 spacing | Front faces: pads 6.5×8, beam seat 26×5, pedestal seat 8×5, marker seat 7×5. The pads are the only targets offered at the same time, 14.5 cm apart |
| Side spacing | — | 2 cm from the base's edge (±15) to each column's inner edge (±17) |

The controls are **not** below the build as the brief's default says. That is a visible change to the interaction layout; the orchestrator or Matthew should approve it or ask for another arrangement. The alternative, controls below the build, needs either the build raised to about 10 cm below eye level or a longer view distance.

### Text sizes

`Text.size` sets the em-square height: em cm = size / 43.886 (UIKit type-scale calibration). Instruction 58 (1.32 cm em), correction 54 (1.23), progress 54 (1.23), candidate status 46 (1.05), disclosure 38 (0.87), buttons 46, palette labels 44, target labels 40.

**Open measurement:** the brief requires essential text to be at least 1.2 cm in *character height*. Instruction, correction, and progress meet that if it means the em-square. They do not if it means cap height: the instruction's cap height is about 0.9 cm. This needs a decision and an actual measurement under A9.

## How verification worked (and what it means)

1. **Coordinate mapping.** `InjectPreviewGesture` render space is the whole Preview panel, but the SPECS display covers only its middle. A touch-position probe (`ECHOES touch-start`) showed lens screen x = 0.1962 for injected x = 0.2915, with y unchanged. Mapping: **x_inject = 0.5 + (x_camera − 0.5) × 0.6863, y_inject = y_camera.** Every tap was then aimed at coordinates computed from the lens's own logged positions, not estimated from screenshots.
2. **Two-tap protocol.** SIK's MouseInteractor only moves its ray on touch events, while a real mouse sets the hover target before clicking. An injected press therefore triggers on whatever the ray last pointed at. Each control was clicked with a "move" tap (no action, because its release is outside the old target) and then a real tap. The logs show the move taps never fired an action: UIKit's `onTriggerUp` only fires on an in-target release. This was investigated with the touch probe and hover/trigger log lines, both kept in the code.
3. **What the evidence is.** Captures are actual Preview panel captures. State evidence is the runtime log: every attempt logs piece, rotation, target, verdict, mismatch list and message, followed by a before/after progress count and a full state snapshot. All of it is **injected interaction**, never human operation.

### Runs

| Run | Code | Content | Lens errors |
|---|---|---|---|
| Run 1 (`logs/run1-injected-gate.log`) | `1318c82` minus two UI fixes made afterward (see Defects) | multi-error, wrong piece, correct pillar (turned to 90°), rapid duplicate Confirms, right pillar, beam 90° ✗, 270° ✗, 180° ✓ | 0 |
| Run 2 (`logs/run2-injected-full-sequence.log`) | `1318c82` | fresh reset, both pillars, beam 0° ✓, pedestal ✓, marker 180° ✗, marker 0° ✓ (5 of 5 accepted) | 0 |
| Run 3 (`logs/run3-injected-wrong-target.log`) | `1318c82` | fresh reset, wrong target only (pillar on right pad) | 0 |
| A11 (`logs/a11-*.log`) | `1318c82` | three invalid task-data variants via the controller's `taskVariant` input; restored to `valid` afterward | 0 |

"Lens errors" counts E/W/F log lines from `[Preview 1]`. The only E/W lines in these windows came from the editor itself: analytics uploads ("Host requires authentication") and LEAF plugin state saves.

## Matrix rows touched

| Row | Result | Evidence |
|---|---|---|
| **A1** | **Unverified**: logic proven by injection; Human Preview missing | Correct placement: run 1 attempt 3 (pillar turned to 90°, accepted, 0→1); captures `03` (candidate, target, and instruction together before Confirm) and `04` (after). Deliberate wrong orientation: run 1 attempt 7 (beam 90°, "Wrong turn: at 90° the long beam runs front to back. Turn the beam so it spans both pillars.", 2→2); capture `05`. Candidate and orientation visible before Confirm: captures `01`, `03`, `07`. No debug command, custom gesture, native mouse twist, or voice used. |
| **A2** | **Unverified**: all cases pass by injection; Human Preview missing | Correct: 0→1 (run 1), 1→2, 2→3, 3→4, 4→5 (run 2), with the placed-object count equal to accepted each time. Wrong target: run 3, pillar on right pad → "Not yet: that is the right pillar attachment. Use the left pillar attachment first." 0→0 (capture `11`). Wrong piece: run 1 attempt 2 → "Not this piece: that is the long beam. Choose the square pillar." 0→0. Wrong orientation: run 1 attempts 7 and 8, run 2 attempt 5, all unchanged. Multi-error: beam on right pad, `differing=target,piece`, target reported first (capture `02`). Rapid repeat: two Confirms 80 ms apart after an accept, both rejected as incomplete, 1→1. Corrections are text with a word cue ("Not yet", "Not this piece", "Wrong turn"); color only reinforces. |
| **A3** | **Unverified**: beam cases demonstrated; other pieces' sets incomplete | Beam: 90° ✗ and 270° ✗, then 180° ✓ (run 1); 0° ✓ after a fresh reset (run 2). The 90/270/180 attempts were consecutive in one run because Undo does not exist yet; the rejected attempts changed no state. Marker {0}: 180° ✗, 0° ✓. Pillar 0° and 90° ✓; pedestal 0° ✓; their other rotations untested. Orientation definitions live with the model in `SignalArchTask.ts`. |
| **A11** | **Pass for Increment 1** | Package files and inventory unchanged (see above). Missing piece → "Cannot start … Problem: placement 'p3-beam' references missing piece 'beam'"; an injected Confirm produced no attempt (capture `10`). Missing target → errors for `pedestal-seat` references. Empty sequence → "empty required sequence". Each had 0 accepted and all targets disabled. Only allowed tools used. |

Not touched (out of scope): A4–A10, A12. Help, Pause/Resume, Undo, Replay, completion, and the LEAF suites were not built. After 5 of 5 placements the panel says only "All five placements are accepted."; there is no completion flow, Replay, or Undo.

### Evidence index (`validation/increment-1/`)

| File | Shows |
|---|---|
| `captures/00-initial-layout.jpg` | Starting layout after compaction (before the palette-label fix) |
| `captures/01-candidate-beam90-rightpad-before-confirm.jpg` | Wrong piece + wrong target chosen, ghost preview, before Confirm |
| `captures/02-multi-error-target-first-correction.jpg` | Target-first correction |
| `captures/03-candidate-pillar90-leftpad-before-confirm.jpg` | Correct candidate turned to 90° at Left pad, before Confirm (staging model overlaps its label: defect, fixed) |
| `captures/04-after-accept-left-pillar-and-duplicate-confirms.jpg` | One pillar placed, Step 2 of 5 · 1 placed |
| `captures/05-wrong-orientation-beam90-rejected.jpg` | Wrong-orientation correction with the front-to-back ghost |
| `captures/06-beam180-accepted-step4.jpg` | Beam at 180° accepted, Step 4 of 5 · 3 placed |
| `captures/07-run2-beam0-before-confirm.jpg` | Beam at 0° ("spans left to right") before Confirm, after the fixes |
| `captures/08-run2-marker180-rejected.jpg` | Marker orientation correction |
| `captures/09-run2-all-five-accepted.jpg` | 5 of 5 placed; scene and progress agree |
| `captures/10-cannot-start-missing-piece.jpg` | Cannot-start state |
| `captures/11-run3-wrong-target-only.jpg` | Wrong-target-only correction |
| `logs/run1-injected-gate.log`, `run2-injected-full-sequence.log`, `run3-injected-wrong-target.log`, `a11-missing-piece.log`, `a11-missing-target.log`, `a11-empty-sequence.log` | `ECHOES` lines and reset markers extracted from the Lens Studio log, starting at each run's reset boundary |

Source log: `C:/Users/matth/AppData/Local/Snap/Lens Studio/logs/LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`, around 16:10–16:21 Central.

## Defects found and fixed during the increment

1. Palette miniatures covered their labels (capture `00`). Fixed: smaller miniatures, and selection shown as a bracketed label such as `[ Beam ]`.
2. The correction stayed on screen after the user turned the piece or changed the target, so the panel still said "at 90°" while the candidate was at 270°. Fixed in `1318c82`: turning or choosing a target clears the old correction.
3. The staging model covered its "Turned …" label (capture `03`). Fixed in `1318c82`.

Fixes 2 and 3 landed after run 1. Runs 2, 3, and A11 ran on the committed code.

## Open issues (not fixed; design notes for the next increment or for Matthew)

- **Marker direction reads weakly from the front.** At 0° the wedge's slope faces the viewer and looks almost like a box (captures `08`, `09`). The text ("points away from the front arrow") carries the meaning. A stronger shape cue, such as an arrowhead or a visible tip, would help.
- **Guidance panel crowding.** The marker step's instruction wraps to two lines and its correction to three, ending just inside the panel edge (capture `08`). Shorter messages or a taller panel are needed before Help text is added.
- **The ghost preview covers the chosen target's label** (captures `01`, `02`).
- **In the cannot-start state, inactive UIKit buttons look the same as active ones.** They do not respond, but nothing shows they are disabled.
- **Stale "Pick a piece first" after rapid repeats.** It replaces the "Placed: …" confirmation; harmless, but the success message disappears.
- **Controls are no longer below the build** (see Layout); this needs approval.

## Untested surfaces

- **Human Preview** (actual mouse operation) for every row; this is what A1 and A2 still need.
- Readability and reach at **60 and 120 cm**, and **side views** (A9). Only the default front view at 90 cm was captured.
- The cap-height reading of the 1.2 cm text requirement.
- The pillar and pedestal rotations not listed above. Marker 90° and 270° (the code rejects anything outside {0}, but no attempt was made).
- Every A4–A10 and A12 behavior: completion, help, pause, undo, replay, persistence, LEAF scenarios, fresh viewers, packaging.
- Behavior on a SPECS device (none available). Hand tracking, comfort, and latency are "feel unproven".

## Tool and package proposals

None. No package was added and no extra tool was used. Two observations for whoever writes the LEAF suites:
- LEAF's `DefaultLeafInteractor.trigger` (the path proven at setup) would avoid the injection coordinate mapping and the two-tap protocol.
- The `taskVariant` Inspector input on `EchoesController` (`valid`, `missing-piece`, `missing-target`, `empty-sequence`) can serve as a fixture for A11 scenarios. It must stay `valid` in the shipped scene.
