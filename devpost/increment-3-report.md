# Increment 3 report: LEAF suites, A7 camera case, A9 captures, A8 partial

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago), on AlienPC.
Governing documents: `devpost/build-handoff.md`, `devpost/design-brief.md` (approved), `devpost/echoes-acceptance-matrix.md`, `devpost/increment-3-prompt.md` with its orchestrator rulings. Built on HEAD `c1b0f74` (Increment 2 code `310d13d`). No passing behavior was refactored.

## Verdict

**All eight LEAF scenarios pass in Preview, the A7 view-move case passes, and the A9 captures with real measurements are recorded. Human Preview is still missing for A1, A2, A4, A5, A6, and A8, and fresh viewers are missing for A9.**

- 8 LEAF scenarios, at least one per done criterion, ran through the real SIK and UIKit interactables with `DefaultLeafInteractor.trigger`: 218 checks, 0 failures, 10 passing runs. One run was aborted by an editor reset that wasn't caused by the scenario; it passed on the second attempt (details under Runs).
- A7 is now **Pass**: the five Replay cases and the stale callback passed by LEAF, and the camera move left the assembly where it was (logged `pose` lines).
- A3 is now **Pass**: every turn of every piece was tried as its own attempt against its declared set.
- A11 passes for Increment 3.
- A9 measurements show the em vs cap-height question matters. Under em-square, the instruction, progress, and correction text meet 1.2 cm; under cap height, no text does. They also show two layout findings: at 60 cm the side columns are outside the display, and from a 25° side view the base covers part of Confirm.
- The Increment 2 in-lens state suite still passes 31/31 on the new code. No Lens script error occurred in any run.

## Environment and gate checks

| Check | Result |
|---|---|
| Lens Studio | 5.23.2.26081320, project `C:/Users/matth/Echoes/Echoes.esproj`, SPECS target (unchanged) |
| Packages on disk, start and end | `Bitmoji 3D.lsc`, `Leaf.lspkg`, `SpectaclesInteractionKit.lspkg`, `SpectaclesUIKit.lspkg` and `.meta` files. **Byte-identical** to Increment 2's list at start, and identical again at end (sha256, `validation/increment-3/packages-before.sha256`) |
| `ListInstalledPackagesTool`, start and end | Same 5 entries: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, unnamed `package` 0.0.0 (`3aa05179-…`, pre-existing since Increment 1) |
| `git status` at start | Untracked `increment-1-run.log`, `increment-2-run.log`, `increment-3-run.log` (left untouched, uncommitted) |
| `git status` at end | Same three untracked logs only |
| Shipped inputs at end | `taskVariant = valid`, `runStateTests = false` (read back with `scene-graphql getProperty`) |
| Tools used | `scene-graphql`, `RecompileTypeScriptTool`, `RunAndCollectLogsTool`, LEAF panel tools (`open_leaf_panel`, `list_leaf_scenarios`, `run_leaf_scenario`), `InjectPreviewGesture`, `CapturePanelScreenshotTool`, `ListInstalledPackagesTool`, `ExecuteEditorCode` (project save and reopen only), **`MovePreviewCamera` for the A7 case only** (one move, then one reset to default after it) |
| Prohibited tools | Not used: `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, anything installing `AiPreviewAgentInspect`. No force-close, no cache or package patching |

## What changed

| Path | Change |
|---|---|
| `Assets/Echoes/Scripts/EchoesController.ts` | Added `testState()` and the `EchoesTestState` type: a read-only snapshot of task state plus what the scene shows (texts, placed object names, candidate card and ghost, which targets are shown and selectable, which controls read lit). Nothing else changed |
| `Assets/Echoes/Tests/EchoesLeafDriver.ts` | LEAF driver extending `DefaultLeafInteractor`. It presses controls only through their Interactables (UIKit buttons by name; attachments by their `Target <label>` parent, enabled only). Every check prints `ECHOES leaf CHECK PASS/FAIL <scenario> · <case>` and fails the scenario via LEAF `expect` |
| `Assets/Echoes/Tests/Dc*.ts` (8 files) | The scenarios (table below) |
| `Assets/Echoes/Tests/LeafIndex.ts` | `@scenariosIndex` registering the 8 ids |
| `Assets/Scene.scene` | New root object `LeafIndex` with the `LeafIndex` script. Nothing else changed |
| `validation/tools/extract-leaf-log.sh` | Extracts resets, LEAF scenario-manager lines, `[Preview 1]` E/W/F lines, and `ECHOES` lines after a byte offset |
| `validation/tools/measure-glyph-height.py`, `measure-plate-edges.py` | The A9 pixel measurements (Python + Pillow) |
| `validation/increment-3/` | Captures, logs, package hashes |
| `devpost/echoes-acceptance-matrix.md` | Evidence record and rows A1–A9, A11 |

The scenario files ship in the lens but only register IDs. They run only when LEAF asks for them, so Lens behavior is unchanged when no test is running.

## LEAF suites

LEAF 2.0.2, run with `run_leaf_scenario` against Preview. Runs were serial, each preceded by LEAF's own lens reset, with timeouts set to 180–300 s. Each scenario first checks that the lens can start and that its state is fresh; if the state isn't fresh, it presses Replay.

| Scenario | Done criterion | Matrix | Checks | Result | Log |
|---|---|---|---|---|---|
| `dc1-place-next-piece` | 1 Place the next piece | A1, A2 correct | 23 | ✅ PASSED | `logs/leaf-dc1-place-next-piece-run1.log` |
| `dc2-recover-from-mistake` | 2 Recover from a specific mistake | A2 | 15 | ✅ PASSED | `logs/leaf-dc2-recover-from-mistake-run1.log` |
| `dc2-rotation-sets` | 2 (equivalent rotations succeed) | A3 | 32 | ✅ PASSED | `logs/leaf-dc2-rotation-sets-run1.log` |
| `dc3-interrupt-and-return` | 3 Interrupt and return | A5 | 21 | ✅ PASSED | `logs/leaf-dc3-interrupt-and-return-run1.log` |
| `dc4-undo-latest` | 4 Undo (latest only, incl. after completion) | A6 | 16 | ✅ PASSED | `logs/leaf-dc4-undo-latest-run1.log` |
| `dc4-replay-cleanly` | 4 Replay from every state, no late feedback | A7 | 60 | ✅ PASSED | `logs/leaf-dc4-replay-cleanly-run1.log` |
| `dc5-sequence-guards` | 5 Truthful completion | A4 | 24 | ⚠️ attempt 1 aborted (editor reset); ✅ attempt 2 PASSED | `logs/leaf-dc5-sequence-guards-run1-ABORTED-editor-reset.log`, `-run2.log` |
| `dc5-full-story` | 5 Repeatable demonstration (brief's continuous story) | A4, A8 | 27 | ✅ PASSED ×2, plus ✅ once after save/reopen | `logs/leaf-dc5-full-story-run1.log`, `-run2.log`, `logs/a8-after-reopen-leaf-dc5-full-story.log` |

`logs/leaf-all-runs.log` holds the whole window, 16:53–16:56 Central.

What each scenario asserts:

- **dc1**: fresh baseline; the progress line starts with the model goal (`Signal Arch v1`).
- **dc1, selecting and turning**: pick Pillar and the candidate card shows `Pillar` at `Turned 0°` with the palette reading `[ Pillar ]`. Turn right goes to 90° and Turn left back to 0°.
- **dc1, before Confirm**: choosing Left pad shows the ghost, `[ Left pad ]`, the status line `square pillar at 0° … Left pad`, and the step 1 instruction together, and nothing is placed yet.
- **dc1, Confirm**: Confirm adds exactly `Placed p1-left-pillar`, the progress text reads `Step 2 of 5 · 1 placed`, the candidate clears, and the success note names the piece.
- **dc1, wrong orientation**: the beam arrives at 90°, Confirm is rejected with "Wrong turn: at 90° the long beam runs front to back. … spans both pillars", and the candidate is kept. After one turn to 180° it is accepted.
- **dc2-recover**: the exact correction strings for wrong target, wrong piece, and wrong orientation (beam 270°). Multi-error (marker on Right pad at step 1) reports the target first. Correct attempts add one each. Four Confirms back to back with no settle time place the right pillar once. Every rejection leaves ids, placed objects, step, and progress text unchanged.
- **dc2-rotation-sets**: each step's invalid turns first, then its valid ones, each as its own attempt. Accepted turns are undone with Undo; rejected turns start again from a fresh palette pick, which resets the candidate turn. Pillar ×2 {0, 90, 180, 270} accepted; beam 90 and 270 rejected, 0 and 180 accepted; pedestal {0, 90, 180, 270} accepted; marker 90, 180, 270 rejected, 0 accepted.
- **dc3, help**: help at step 1, at step 3 with the beam at 180° on Beam seat, and at completion. During help, Confirm, Turn, palette, Undo, and Pause change nothing, and targets are not selectable. Close help restores the identical snapshot (run, step, ids, placed names, piece, turn, target, instruction, status line, candidate card, feedback).
- **dc3, pause**: Pause shows `PAUSED · …`, hides targets and the ghost, keeps the candidate card at `Turned 180°`, and states "Kept: 2 placed, Step 3, your beam at 180°". During pause, Confirm, Turn, palette, Undo, and Help change nothing. Resume restores the identical snapshot and the kept candidate is accepted once.
- **dc4-undo**: Undo is dimmed and inert at zero. An intermediate Undo removes only the beam; the pillar SceneObjects are the same instances and step 3's instruction and progress text return. Undo after completion clears completion and reopens step 5. Re-placing reaches the next state once each time, and an extra Confirm adds nothing.
- **dc4-replay**: Replay from active, correction, help, pause, and completion. Each reaches the full baseline (7 checks per case), a new run id, and an unchanged world position. The old run's 8 s note-clear callback, with Replay at +2 s, leaves the new run unchanged.
- **dc5-sequence-guards**: out-of-order target rejected; later and filled attachments not selectable at every prefix; a duplicate Confirm after each accept advances once; prefixes 1–4 incomplete with matching text. Completion appears only when ids and `Placed …` objects agree in order. The completion text is truthful ("Virtual check only: no physical model was inspected.") and the controls are correct; input after completion is ignored.
- **dc5-full-story**: begin, wrong piece corrected, both pillars, help open/close, pause/resume with a rotated candidate, beam orientation error corrected, Undo and re-place, marker 180° rejected then turned twice, completion, Replay to baseline.

### Done criteria without a full LEAF test

Every done criterion has at least one LEAF scenario. What LEAF does not cover:

- **Criterion 5, "the recording accurately labels virtual validation and enlarged geometry" and "opens from its clean local package"**: these need a recording and a clean-clone rehearsal (A12), not scenario logic. The disclosure text itself is visible in every capture.
- **All criteria, "demonstrable by a person"**: LEAF drives the real Interactables but is not a human with a mouse. The matrix rows that require Human Preview stay Unverified.
- **Reachability**: no IK (`createIKInteractor`) scenario was written. The content sits 90 cm away, beyond arm's reach, so in Preview it is operated by far-field ray (mouse). An IK run would report that, not test it. Real hand reach is "feel unproven".
- **A4 "event from the preceding step"**: in the UI, a filled attachment can't be selected, and LEAF asserts that. The forced stale-stamp path stays covered by the Increment 2 in-lens suite (direct handler calls).

## A7 camera case (MovePreviewCamera, approved for this case only)

Fresh lens reset (`RunAndCollectLogsTool` refresh), then:

1. Injected placement of the left pillar (pillar 0°, Left pad, Confirm). Logged as accepted, count 1.
2. `MovePreviewCamera setPosition (10, 0, 20)`. The pose read back as (10, 0, 20), rotation 0. Capture `a7-01`: the view has moved and the assembly is still at its place.
3. Injected Replay at the position predicted from the logged screen geometry (x_inject 0.613, y 0.405). The capture confirmed the button was there.
4. Logs (`logs/a7-camera-move-replay.log`):

```
16:57:25.374 pose[start]         buildWorld=(0.00,-24.25,-90.00) buildRotY=0.0 camera=(0.00,0.00,0.00)
16:58:05.367 pose[before-replay] buildWorld=(0.00,-24.25,-90.00) buildRotY=0.0 camera=(10.00,0.00,20.00)
16:58:05.367 replay from=active run=2
16:58:05.367 pose[after-replay]  buildWorld=(0.00,-24.25,-90.00) buildRotY=0.0 camera=(10.00,0.00,20.00)
```

The lens camera moved with the Preview camera, and the assembly did not move to it. Capture `a7-02` shows the baseline after Replay. I then ran `MovePreviewCamera reset`, read the pose back as (0, 0, 0), and did not use the tool again.

## A9 capture portion

**Method.** `MovePreviewCamera` is approved only for A7, so I didn't use it here. The camera stayed at its default pose (origin, facing −Z, level). I used `scene-graphql setLocalTransform` to place the assembly root (`Echoes Signal Arch`) at z = −60, −90, and −120 cm, keeping y = −24.25. For the side views I turned it 25° about its own vertical axis. The viewer-to-build geometry is the same as a viewer standing at that distance, or 25° to the build's left, with the head level and the build straight ahead. Afterward the root was restored to (0, −24.25, −90), rotation 0, and read back. A save at that point left `Assets/Scene.scene` byte-identical to `4132e7b`. Captures are full-resolution Preview panels (2028 × 1590).

**Scale.** I took pixels per cm from the logged screen positions of controls at known spacing (Help↔Undo 41 cm, Help↔Pause 6.5 cm): 26.72 px/cm in the z = −90 plane, square pixels. The base's front face, authored at 30 cm wide and 3 cm closer, measured 29.96 cm. Scale goes as 1/depth: 40.1 px/cm at 60 cm and 20.0 px/cm at 120 cm. Glyph heights come from a brightness threshold (>185 of 255) on a crop around single capital letters (`validation/tools/measure-glyph-height.py <capture> <display-to-original scale> <boxes>`), and plate edges from brightness profiles (`validation/tools/measure-plate-edges.py`), with ±1 px uncertainty: ±0.04 cm at 90 cm, ±0.025 cm at 60 cm.

### Text: em-square vs cap height

`Text.size` sets the em-square: em (cm) = size / 43.886. Measured cap heights:

| Text (size) | Em, cm | Glyph measured | Cap at 90 cm | Cap at 60 cm | Cap / em |
|---|---|---|---|---|---|
| Instruction (58) | 1.32 | "P" of "Put" | 25 px = 0.94 cm | 37 px = 0.92 cm | 0.70 |
| Progress (54) | 1.23 | "S" of "Signal" (has overshoot) | 24 px = 0.90 | 36 px = 0.90 | 0.73 |
| Correction/help (54) | 1.23 | "P" of "Pieces" | — | 35 px = 0.87 | 0.71 |
| Button labels (46) | 1.05 | "H" of "Help", "T" of "Turn" | 20 px = 0.75 | — | 0.71 |
| Candidate status line (46) | 1.05 | "C" of "Chosen" (overshoot) | — | 31 px = 0.77 | 0.74 |
| Target labels (40, 3 cm nearer) | 0.91 | "L" of "Left pad" | 17 px = 0.62 | 26 px = 0.62 | 0.68 |
| Disclosure (38) | 0.87 | "V" of "Virtual" | 16 px = 0.60 | 24 px = 0.60 | 0.69 |

Flat-topped and flat-bottomed capitals give **cap height ≈ 0.70 × em**. The 60 and 90 cm captures agree within 1.5%.

So for "Essential text has at least 1.2 cm character height":

- **If that means em-square:** the instruction (1.32), progress (1.23), and correction/help/pause/completion text (1.23) pass. The candidate status line, button labels, palette labels (44 → 1.00), target labels, and disclosure do not.
- **If that means cap height:** no text passes. Essential text would need size ≈ 75 (1.2 / 0.70 × 43.886), which is about 1.3× the instruction size and wouldn't fit the current 34 × 19 cm panel without a layout change.

Angular size of the instruction capital "P" (0.93 cm), with the line-of-sight distance to the panel plane in parentheses: 60 cm (60.8) → 53′; 90 cm (90.5) → 35′; 120 cm (120.4) → 27′. For reference, 1.2 cm at 90 cm is 46′. The decision belongs to the orchestrator or Matthew.

### Targets and controls

| Item | Authored | Measured (90 cm front) |
|---|---|---|
| Help / Pause / Undo / Replay plates | 7 × 5 cm | Help ≈ 6.9 × 5.05 cm; Pause height 5.35 cm (soft UIKit rim) |
| Turn left / Turn right / Confirm | 7 × 5.5 cm | not separately measured |
| Palette cells | 7 × 6 cm | not separately measured |
| Gap between stacked buttons | 1.5 cm between button bounds | Visible gap between plates ≈ 1.2 cm (Help→Pause, 32 px). The UIKit plate rim adds ≈ 0.15 cm per side, so the gap looks smaller than authored |
| Attachment pick volumes | Pads 6.5 × 8 × 6; Beam seat 26 × 5 × 6; Pedestal seat 8 × 5 × 7; Marker seat 7 × 5 × 7 | Front faces appear wider from the front because their inner side faces are visible; not measured separately |

### Views

| Capture | View | What it shows |
|---|---|---|
| `a9-01-front-90cm.jpg` | 90 cm, front | Everything inside the SPECS display: panel, palette, controls, base, targets, FRONT |
| `a9-02-front-60cm-head-level.jpg` | 60 cm, front, head level | **Palette and control columns are outside the display** (its edges are the faint brackets at x ≈ 0.16 and 0.84); base and most of the pads are below it. Text is very legible. A real user would look down and to the sides; the display is ±16° × ±18°, so the 49 cm-wide layout can't be seen in one view at 60 cm |
| `a9-03-front-120cm.jpg` | 120 cm, front | Everything inside the display, smaller |
| `a9-04-side25-120cm.jpg` | 120 cm, 25° side | Pads and labels clear. **The base's right end covers the left part of the Confirm label** ("onfirm") |
| `a9-05-side25-90cm.jpg` | 90 cm, 25° side | Same Confirm overlap. The **Marker palette cell falls below the display** |
| `a9-06-side25-60cm.jpg` | 60 cm, 25° side | Panel readable; right column cut by the display edge; left column outside |

Comfort checks: no audio is used; there are no flashing or full-screen effects; exits are Close help, Resume, Undo, and Replay. The fresh-viewer portion (three real people) has not been done.

## A8 partial

- **Two complete runs from fresh resets.** `dc5-full-story` ran twice, each after LEAF's lens reset; both PASSED 27/27. Each run covers a correction, help, pause/resume, undo, completion, and replay. No `[Preview 1]` error or warning occurred in any run.
- **No product network.** `Assets/Echoes` uses no `InternetModule`, `RemoteServiceModule`, `RemoteMediaModule`, `fetch`, or WebSocket. The only network lines in the log are editor analytics and OAuth ("Host requires authentication", OAuth token refresh). These are development-tool traffic, not lens calls.
- **Save/reopen.** The project was saved (`IModel.project.save()`), which left tracked files unchanged, then reopened with `IModel.openProject(Echoes.esproj)` at 17:01:04. The log shows the recompile and the editor's on-open AGENTS.md and MCP config injection; those rewrites changed no tracked file. After the reopen, `dc5-full-story` PASSED 27/27 (`logs/a8-after-reopen-leaf-dc5-full-story.log`), so placements and replay work after saving and reopening.
- **Still open.** The two Human Preview runs.

## Runs

"Lens errors" counts E/W/F lines from `[Preview 1]`. The only E/W lines in the window came from the editor itself: analytics uploads ("Host requires authentication"), the LEAF plugin state save, and, once, "Widget is not initialized" (see Defects).

| Run | Code | Content | Lens errors |
|---|---|---|---|
| LEAF ×10 (16:53–16:56) | `4132e7b` working tree (committed unchanged after the runs) | Table above | 0 |
| A7 camera (16:57–16:58) | `4132e7b` | Fresh reset, injected placement, camera move, injected Replay | 0 |
| A9 captures (16:58–17:00) | `4132e7b` | Front and side, 60/90/120 cm | — |
| Save/reopen + LEAF (17:00–17:01) | `4132e7b` | `dc5-full-story` after reopen | 0 |
| State suite regression (17:03) | `4132e7b` | Increment 2's 31 in-lens assertions with `runStateTests` on, then off (`logs/state-tests-4132e7b.log`): **pass=31 fail=0** | 0 |

## Matrix rows touched

| Row | Result | Evidence |
|---|---|---|
| A1 | **Unverified**: Human Preview missing | LEAF `dc1` 23/23 |
| A2 | **Unverified**: Human Preview missing | LEAF `dc2-recover` 15/15 |
| A3 | **Pass** (State test) | LEAF `dc2-rotation-sets` 32/32: separate attempts per turn, all declared sets including the remaining symmetric pieces |
| A4 | **Unverified**: Human Preview of the full sequence missing | LEAF `dc5-sequence-guards` 24/24, `dc5-full-story` ×3; Increment 2 state suite 31/31 again |
| A5 | **Unverified**: Human Preview missing | LEAF `dc3` 21/21 |
| A6 | **Unverified**: per orchestrator ruling, until Human Preview | LEAF `dc4-undo` 16/16 |
| A7 | **Pass** (State test + Capture/log, no human operation) | LEAF `dc4-replay` 60/60; camera move with `pose` lines and captures `a7-01`/`a7-02`. The row's minimum cases don't name Human Preview. If the orchestrator wants it, this becomes Unverified again |
| A8 | **Unverified**: automated half done | Two fresh-reset LEAF full runs, dependency review, save/reopen + LEAF run |
| A9 | **Unverified**: capture portion done; fresh viewers and the text-height decision open | Captures `a9-01`…`a9-06`, measurements above |
| A11 | **Pass for Increment 3** | Package hashes and inventory unchanged; no package added |

Not touched: A10 (pre-build, reviewed earlier) and A12 (packaging, recording).

### Evidence index (`validation/increment-3/`)

| File | Shows |
|---|---|
| `captures/a7-01-camera-moved-before-replay.jpg` | View from camera (10, 0, 20) with one pillar placed |
| `captures/a7-02-after-replay-assembly-not-moved.jpg` | Same view after Replay: baseline, assembly where it was |
| `captures/a9-01-front-90cm.jpg` | 90 cm front, full resolution |
| `captures/a9-02-front-60cm-head-level.jpg` | 60 cm front: columns outside the display |
| `captures/a9-03-front-120cm.jpg` | 120 cm front |
| `captures/a9-04-side25-120cm.jpg` | 120 cm, 25° side: Confirm partly covered by the base |
| `captures/a9-05-side25-90cm.jpg` | 90 cm, 25° side: Confirm overlap, Marker cell below the display |
| `captures/a9-06-side25-60cm.jpg` | 60 cm, 25° side |
| `logs/leaf-*.log` | One file per LEAF run (see the LEAF table); `leaf-all-runs.log` is the whole window |
| `logs/a7-camera-move-replay.log` | A7 camera case |
| `logs/a8-after-reopen-leaf-dc5-full-story.log` | LEAF run after save/reopen |
| `logs/state-tests-4132e7b.log` | Increment 2 state suite re-run, 31/31 |
| `packages-before.sha256` | Package hashes (start; end matched) |

Source log: `C:/Users/matth/AppData/Local/Snap/Lens Studio/logs/LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`, 16:52–17:04 Central. Reproduce extracts with `validation/tools/extract-leaf-log.sh <log> <byte-offset> <out>` (LEAF window from offset 4378844) and `validation/tools/extract-echoes-log.sh`.

## Commits

| Hash | Title |
|---|---|
| `4132e7b` | test: add LEAF scenario suites for the five done criteria |
| `615ddb2` | test: record increment 3 evidence and report |

No remote, no push.

## Defects and incidents

1. **LEAF run aborted by an editor reset (environment, not the lens).** At 16:55:27 the editor's OAuth token refresh re-created the Preview and the LEAF widget 2 s into `dc5-sequence-guards`. The log shows `run_leaf_scenario failed: Widget is not initialized`, three lens resets, and no PASSED or FAILED line for the run. I reopened the panel and re-ran the scenario once, and it passed. I didn't retry anything else. If LEAF runs are scripted for the demo, expect the same thing whenever a token refresh lands during a run.
2. **No Lens code defects found.** Every scenario passed the first time it ran to completion. Nothing in `EchoesController` behavior changed.

## Open issues (design notes for the orchestrator or Matthew)

- **Text height decision.** It now rests on measurement: cap = 0.70 em. Em-square → instruction, progress, and correction pass, but buttons, status line, labels, and disclosure are below 1.2 cm. Cap height → nothing passes, and essential text needs size ≈ 75 plus a larger panel.
- **The 60 cm view doesn't fit.** At 60 cm the 49 cm-wide layout (palette and controls at ±20.5 cm) is wider than the SPECS display (±17 cm at that distance). A user would have to turn their head about 20° each way to reach the columns. 90 and 120 cm fit.
- **Confirm sits partly behind the base from a side view.** Confirm's center is 1 cm below the base top and 5.5 cm outside its end, so from 25° to the left the base covers part of its label. Possible fixes: raise the control column 3–4 cm, or move Confirm above Turn left/right.
- **Marker palette cell leaves the display from a 25° side view at 90 cm.** It is the lowest cell (bottom at build-local −2.7).
- **The visible gap between UIKit plates is ≈ 1.2 cm** against the authored 1.5 cm between button bounds. If the 1.5 cm rule means the visible gap, add about 0.3 cm of spacing.
- Carried over from Increment 2 (unchanged): the ghost doesn't show marker direction well from straight ahead; the "Pieces" and "Candidate" headers stay bright in cannot-start; the success note lasts 8 s.

## Untested surfaces

- **Human Preview** (actual mouse) for A1, A2, A4, A5, A6, and the two A8 runs.
- **A9 fresh viewers** (three real people) and the text-height decision.
- **Pitched or head-turned views at 60 cm.** The captures are head-level, build straight ahead, because I had no approved way to rotate the camera. The assembly-transform method can't represent a head turn without moving the content relative to the room.
- **Hand reach.** No IK scenario; everything is operated by far-field ray in Preview.
- Invalid task-data variants (A11) were not re-run; `validateTask` is unchanged since `13fed72`.
- A10, A12 (packaging, recording, clean clone).
- Anything that needs a SPECS device ("feel unproven": comfort, hand tracking, latency, readability on the real display).

## Tool and package proposals

- **`MovePreviewCamera` for A9 views**, including pitched and head-turned views at 60 cm. I used assembly transforms instead because the tool is approved only for A7. With approval, the same six views plus a "look down at the build" view at 60 cm can be captured without touching the scene.
- **LEAF IK interactor** (`createIKInteractor`, part of the installed Leaf package, uses the installed Bitmoji 3D). Not used. It would add a reach finding, not a pass, while the content sits at 90 cm. I'd propose it only if the layout moves within arm's reach.
- No package was added or changed.
