# Increment 2 report: interruption, undo, replay, completion

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago), on AlienPC.
Governing documents: `devpost/build-handoff.md`, `devpost/design-brief.md` (approved), `devpost/echoes-acceptance-matrix.md`, `devpost/increment-2-prompt.md`. Built on Increment 1 HEAD (`3d8e4fc`). Increment 1 behavior that passed was not refactored.

## Verdict

**Help, Pause/Resume, Undo, truthful completion, Replay, and the sequence guards all work under injected input and focused state tests. Human mouse operation is still needed, and one A7 sub-case can't be run with the allowed tools.**

- An in-lens state suite of 31 assertions passes 31/31 on the committed code (`310d13d`).
- Three injected Preview runs covered help, pause, undo at every required point, completion, replay from all five states, and a delayed callback dropped after Replay through the real UI path.
- No Lens script error occurred in any run.

Under the matrix's evidence rules, injection and state tests are not Human Preview, so **A4, A5, and A6 stay Unverified**. **A7 also stays Unverified** because its "move the view before Replay" case could not be performed: the injected WASD key did not move the Preview camera, and the tool that could is not on the allowed list (see Tool and package proposals). **A11 passes for Increment 2.**

## Environment and gate checks

| Check | Result |
|---|---|
| Lens Studio | 5.23.2.26081320, project `C:/Users/matth/Echoes/Echoes.esproj`, `targetPlatform: Spectacles` (unchanged from Increment 1) |
| Packages on disk, before and after | `Bitmoji 3D.lsc`, `Leaf.lspkg`, `SpectaclesInteractionKit.lspkg`, `SpectaclesUIKit.lspkg` and their `.meta` files. **Byte-identical** before and after (sha256; the "before" list is `validation/increment-2/packages-before.sha256`) |
| `ListInstalledPackagesTool`, before and after | The same 5 entries both times: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, and the unnamed `package` 0.0.0 (`3aa05179-…`) already reported in Increment 1. No change |
| `git status` at start | Untracked `increment-1-run.log` and `increment-2-run.log` (both left untouched and uncommitted) |
| `git status` at end | The same two untracked logs only. `Echoes.esproj` and `Assets/Scene.scene` unchanged on disk |
| Shipped inputs at end | `taskVariant = valid`, `runStateTests = false` (read back with `scene-graphql getProperty`) |
| Tools used | `scene-graphql` (component lookup; `taskVariant` and `runStateTests` set and read back), `RecompileTypeScriptTool`, `RunAndCollectLogsTool`, `InjectPreviewGesture`, `CapturePanelScreenshotTool`, `ListInstalledPackagesTool` |
| Prohibited tools | Not used: `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, anything that installs `AiPreviewAgentInspect`. Also not used: `MovePreviewCamera` (not on the allowed list; proposed below). No force-close, no cache or package patching |

## What changed

| Path | Change |
|---|---|
| `Assets/Echoes/Scripts/EchoesController.ts` | State machine; Help, Pause/Resume, Undo, Replay controls; completion view; run-guarded delayed callbacks; selection stamps; disabled-control styling; pointed marker mesh and arrow; target labels above pick volumes; taller guidance panel; pose logging; opt-in `runStateTests` suite |
| `Assets/Echoes/Scripts/SignalArchTask.ts` | Per-placement `turnHelp` text for Help; marker form `pointed-wedge`; shorter marker instruction and correction wording (`FRONT` instead of "the front arrow") |
| `Assets/Echoes/Scripts/PlacementRules.ts` | Unchanged |
| `Assets/Scene.scene` | Unchanged on disk |
| `validation/increment-2/` | 13 captures, 5 extracted logs, package hashes |
| `validation/tools/extract-echoes-log.sh` | Extracts `ECHOES` lines and reset markers from the Lens Studio log by byte offset and time window (the tool that produced every log here) |
| `devpost/echoes-acceptance-matrix.md` | Evidence record and results for A4, A5, A6, A7, A11 |

### State-machine design

```
canStart = false  → cannot-start: every control inactive and dimmed; nothing accepted (Increment 1).
overlay ∈ { none, help, paused }   help and pause are mutually exclusive
complete          derived, never stored: stepIndex = 5 AND acceptedIds = the 5 placement ids in
                  order AND 5 placed SceneObjects named `Placed <id>` exist and are enabled
runId             incremented by Replay
pieceStamp / targetStamp = "runId:stepIndex" when the piece / target was chosen
```

| Control | Acts when | Otherwise |
|---|---|---|
| Palette, Turn, Target, Confirm | overlay = none and not complete | logged as `<action>-blocked reason=help/paused/complete`; no state change |
| Help / Close help | overlay ≠ paused | `help-blocked reason=paused` |
| Pause / Resume | overlay = paused, or overlay = none and not complete | `pause-blocked reason=help/complete` |
| Undo | overlay = none and ≥ 1 accepted | `undo-blocked reason=no-accepted-placement/help/paused` |
| Replay | always (except cannot-start) | — |

- **Help** shows the current step's piece (noun and palette label), its valid turns and how it arrives, and its attachment, in the correction area. The instruction, chosen-candidate line, and accepted build stay visible. It only sets `overlay`, so closing restores the same objective, candidate, turn, target, and even the hidden correction text.
- **Pause** sets `overlay = paused`. The panel header reads `PAUSED`, the instruction says nothing can be placed until Resume, targets and the candidate ghost are hidden, task controls are dimmed, the chosen-candidate line and the candidate card stay visible, and the button reads `Resume`.
- **Undo** pops the last accepted id and destroys that one placed object, decrements the step, clears the candidate, and shows "Undone: removed the … Step N is open again." Because completion is derived, Undo after completion clears it automatically. There is no Redo; re-placing is an ordinary new attempt.
- **Completion** appears only when `isComplete()` holds. The header reads `Complete · 5 of 5 placed`, the status line says "Virtual check only: no physical model was inspected.", and Undo and Replay are offered. Palette, Turn, Confirm, and Pause are dimmed.
- **Replay** increments `runId`, destroys every placed object, and resets step, accepted list, candidate, rotation, overlay, attempt count, and feedback. It shows "Started over: Step 1 of 5. …". It never writes the controller's transform: the assembly stays where this Preview run put it, and `pose[before-replay]` and `pose[after-replay]` log it.
- **Delayed callbacks** go through `later()`, which captures `runId` and drops the callback if a Replay happened (`stale-callback-dropped`). The one product callback is the "Placed: …" note clearing itself after 8 s. It also checks a feedback sequence number, so it never clears a newer message (`callback-superseded`).
- **Selection stamps**: Confirm drops any piece or target chosen in an earlier step or run (`stale-selection-dropped`). Selections are also cleared on every accept, Undo, and Replay, so this is defense in depth. Targets for already-filled attachments are not selectable (`select-target-ignored reason=unavailable`).
- **Disabled controls** keep their colliders but read as dimmed (label alpha 0.32), so a blocked press is logged and visibly does nothing. The cannot-start state also sets UIKit `inactive`.
- **`runStateTests`** (Inspector input, default off) runs 31 focused assertions at start through the same handlers the buttons call, then replays to a clean start. It is a test fixture like `taskVariant` and must stay off in the shipped scene.

## Layout

All other Increment 1 positions are unchanged. World cm, eye level y = 0, camera at the origin facing −Z, build origin at (0, −24.25, −90).

| Element | Increment 1 | Increment 2 |
|---|---|---|
| Guidance panel | 34 × 15, center y = +7.25 | **34 × 19**, center y = **+9.75** (bottom edge +0.25, top +19.25). Rows: disclosure, progress, instruction (2 lines), chosen candidate, then a 5-line area for correction, help, pause, or completion text |
| Help / Pause | — | 7 × 5 UIKit buttons at x = −20.5, centers y = +13.4 / +6.9 (1.5 gap), above the "Pieces" header. Screen y 0.275 / 0.384 |
| Undo / Replay | — | 7 × 5 at x = +20.5, the same heights, above the "Candidate" header |
| Target labels | On the pick volume's front face (covered by the ghost) | **0.75 cm above** the pick volume; the next-step pointer sits above the label. Highest point (marker seat pointer) is build-local 23.8, 0.7 cm under the panel |
| Marker | Sloped wedge, thin edge at the front | **Pointed wedge**: an arrowhead in plan (5 × 3 × 6 cm, 90° tip), flat top with a light arrow that matches the base's FRONT arrow at 0° |

Help text fits in the panel at the essential sizes already in use (feedback 54 = 1.23 cm em); see capture `01`. The marker step's instruction is now one line and its correction two (capture `05`).

## Commits

| Hash | Title |
|---|---|
| `310d13d` | feat: add help, pause, undo, replay, and truthful completion |
| `4fc110a` | test: record increment 2 evidence and report |

No remote, no push.

## Runs

Each injected click used the Increment 1 mapping (x_inject = 0.5 + (x_cam − 0.5) × 0.6863) and the two-tap protocol (touch start, three moves, end; 400 ms apart). "Lens errors" counts E/W/F lines from `[Preview 1]`. The only E/W lines came from the editor itself: analytics uploads ("Host requires authentication") and LEAF plugin state saves.

| Run | Code | Content | Lens errors |
|---|---|---|---|
| State suite (`logs/state-tests-310d13d.log`) | `310d13d` | 31 assertions covering A4–A7 (list below). Result `pass=31 fail=0`. An identical earlier pass ran on the pre-fix working tree | 0 |
| Run 1 (`logs/run1-injected-help-pause-undo.log`) | working tree just before `310d13d` (see note) | Undo at zero (blocked); both pillars; beam at seat turned 90→180; Help; Confirm during help (blocked); Close help; Pause; Confirm and Turn during pause (blocked); Resume; Confirm (2→3); Undo (3→2); beam re-placed at 0°; pedestal; marker 180° rejected | 0 |
| Run 2 (`logs/run2-injected-complete-undo-replay.log`) | `310d13d` | Fresh reset; 0→4; marker 180° rejected; turned to 0°; accepted, complete; extra Confirm ignored; Undo after completion (5→4); marker re-placed, complete; Replay 4 s later; stale note-clear callback dropped at +8 s | 0 |
| Run 3 (`logs/run3-injected-replay-from-each-state.log`) | `310d13d` | Same Preview session: Replay from active (candidate and target chosen), correction (wrong piece), help (1 placed, pillar selected), pause (pillar at Left pad turned 90°); then an injected A-key hold | 0 |
| A11 recheck (`logs/a11-missing-piece-recheck.log`) | `310d13d` | `taskVariant = missing-piece`; injected Replay, Undo, Confirm; restored to `valid` | 0 |

Run 1 note: run 1 ran before three small edits that were folded into `310d13d`. Those edits flattened the marker top (the defect below), renamed one log event (`callback-fired` → `callback-due` / `callback-superseded`), and reworded the help attachment line. None touches state logic. Runs 2–3, the A11 recheck, and the state suite ran on the committed code.

State-suite assertions (all PASS): undo at zero does nothing · out-of-order target does not advance · duplicate confirm advances once · prefixes 1, 2, 3, 4 incomplete · late event for the preceding step's target ignored · that event cannot accept step 2 · a selection stamped in the preceding step cannot accept · a later target is not selectable early · help opens with the current piece · help blocks placement and edits · help close restores the exact snapshot · paused header shown · pause blocks Confirm, Turn, target, Undo, Help · resume restores the exact snapshot · undo at an intermediate step removes only the latest (same remaining object instances, instruction restored) · re-place after undo reaches the next state once · complete after five with the scene agreeing · completion blocks further input · undo after completion reopens the final placement · re-place final reaches completion once · replay from completion, active, correction, help, pause each reaches the full baseline · assembly world position unchanged by replays · a stale delayed callback cannot mutate the new run.

## Matrix rows touched

| Row | Result | Evidence |
|---|---|---|
| **A4** | **Unverified**: Human Preview missing; all state cases pass | State suite: each proper prefix incomplete; out-of-order target (right pad at step 1) rejected 0→0; pedestal seat not selectable at step 3; two duplicate Confirms after an accept → 1 accepted; a late Left-pad event at step 2 ignored and cannot accept; a stale-stamped selection dropped; completion needs ids and visible objects to agree. Injected run 2: full sequence 0→5 with `complete accepted=5 placedObjects=5`, extra Confirm after completion ignored. Captures `07`. |
| **A5** | **Unverified**: Human Preview missing | Run 1: help at step 3 with beam 180° on Beam seat (`01`); Confirm in help blocked; close → same state. Pause with the same candidate (`02`); Confirm and Turn while paused blocked with unchanged snapshots; Resume → same; then accepted. Clear route back: `Close help` / `Resume` on the same button. State suite: snapshots byte-identical across help and pause. |
| **A6** | **Unverified**: Human Preview missing; all cases pass by state test and injection | Zero: injected Undo blocked, label dimmed (`00`). Intermediate: 3→2, pillars kept, Step 3 instruction back, candidate cleared (`03`); re-placed once. Completion: Undo clears completion and reopens Step 5 (`08`); re-placed → complete once. No Redo. |
| **A7** | **Unverified**: "move the view before Replay" not performed | Five reset cases pass by injection (runs 2–3; captures `09`, `10`) and state test. Delayed callback via the real UI: accept 16:41:07 → Replay 16:41:11 → `stale-callback-dropped scheduledRun=1 currentRun=2` 16:41:15, new run unchanged. Assembly world position `(0, −24.25, −90)` in every before/after-replay pose line. The view-move case could not be performed (capture `12`). |
| **A11** | **Pass for Increment 2** | Package files byte-identical, inventory unchanged. Missing-piece variant: Cannot start, 0 accepted, all controls dimmed and inactive (`11`); injected Replay, Undo, Confirm produced only `touch-start` lines. `validateTask` is unchanged since `13fed72`, so missing-target and empty-sequence were not re-run. |

Not touched: A1–A3 were not re-run as rows, but run 2 repeats a correct placement path and a marker orientation correction on the new code. A8, A9, A10, and A12 are out of scope.

A6 wording note for the orchestrator: A6's evidence column says "Human Preview/state checks". If the slash means either kind is enough, A6 could be marked Pass on the state checks recorded here. I kept it Unverified to match how A1 and A2 were treated in Increment 1.

### Evidence index (`validation/increment-2/`)

| File | Shows |
|---|---|
| `captures/00-initial-layout-undo-disabled.jpg` | New layout; Undo dimmed at zero placements; pad labels above volumes; pointed marker miniature |
| `captures/01-help-open-beam180-candidate-kept.jpg` | Help at step 3: HELP header, candidate "long beam at 180° · Beam seat" kept, help body, task controls dimmed |
| `captures/02-paused-candidate-kept-controls-dimmed.jpg` | Paused state with the candidate kept and targets hidden |
| `captures/03-undo-intermediate-step3-reopened.jpg` | After Undo of the beam: both pillars kept, Step 3 instruction, note |
| `captures/04-run1-marker180-correction-DEFECT-sloped-arrow-reads-inverted.jpg` | Defect evidence (fixed): the sloped-top arrow read as ▼ at 180° |
| `captures/05-run2-marker180-rejected-arrow-points-away.jpg` | Fixed marker at 180°: candidate card arrow ▲; one-line instruction, two-line correction |
| `captures/06-run2-marker0-before-confirm-arrow-to-front.jpg` | Marker at 0° before Confirm: arrow ▼ like FRONT |
| `captures/07-run2-completion-5-of-5.jpg` | Completion view |
| `captures/08-run2-undo-after-completion-step5-reopened.jpg` | Undo after completion |
| `captures/09-run2-replay-from-completion-baseline.jpg` | Baseline after Replay |
| `captures/10-run3-correction-state-before-replay.jpg` | Correction state (wrong piece) just before Replay; chosen-target label shown as `[ Left pad ]` above the ghost |
| `captures/11-cannot-start-controls-dimmed.jpg` | Cannot-start with every control dimmed |
| `captures/12-run3-after-injected-A-key-view-unchanged.jpg` | View unchanged after an injected A-key hold |
| `logs/*.log` | See the Runs table |
| `packages-before.sha256` | Package hashes at the start of the increment |

Source log: `C:/Users/matth/AppData/Local/Snap/Lens Studio/logs/LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`, 16:31–16:44 Central. Reproduce an extract with `validation/tools/extract-echoes-log.sh <log> <byte-offset> <out> [from] [to]`.

## Increment 1 open issues: status

| Issue | Status |
|---|---|
| Marker direction reads weakly from the front | **Improved.** The marker is now an arrowhead in plan, with lit tip faces and a flat top arrow matching FRONT. The candidate card and palette show the direction clearly (`05`, `06`). The translucent ghost on the build is still weak from straight ahead (open below) |
| Guidance panel crowding / help must fit | **Fixed.** Panel 34 × 19; marker instruction is one line, correction two; help fits in five lines (`01`) |
| Ghost covers the target label | **Fixed.** Labels sit above the pick volume; the chosen target reads `[ Label ]` (`10`) |
| Inactive buttons look active in cannot-start | **Fixed.** All disabled controls are dimmed in every state (`00`, `01`, `02`, `07`, `11`) |
| "Pick a piece first" clobbers the success note | **Fixed.** A Confirm with nothing selected keeps the "Placed: …" note (`confirm-ignored nothing selected; success note kept`). The note clears itself after 8 s |
| Controls not below the build | **Unchanged**, still awaiting approval. The new task controls follow the same side-column arrangement |

## Defects found and fixed during the increment

1. **Marker arrow read backwards from the front (found in run 1, capture `04`).** On the first pointed-wedge design the top sloped down toward the tip. Seen from the front, a few degrees above, the high back edge projected above the low tip. So at 180° (pointing away) the top arrow looked like ▼, the same as FRONT. Fixed by making the top level; at 180° the arrow now reads ▲ (`05`). Folded into `310d13d`.
2. **Misleading callback log.** The note-clear callback logged `callback-fired` even when it then did nothing because a newer message had replaced the note. It now logs `callback-due` and, when superseded, `callback-superseded`. Folded into `310d13d`.
3. **Redundant help wording** ("Beam seat, the beam seat across …"). Now "the beam seat across the pillar tops ("Beam seat")". Folded into `310d13d`.

## Open issues (design notes for the next increment or Matthew)

- **The candidate ghost on the build doesn't show marker direction well from straight ahead.** It is translucent and unlit, so its tip faces don't shade (`05`, `06`). The candidate card, palette, and text carry the direction. Option: a lit or more opaque ghost, or a small floating arrow over the chosen seat.
- **The "Pieces" and "Candidate" headers stay bright in cannot-start** (`11`). Cosmetic.
- **The Help, Pause, Undo, and Replay buttons sit in the side columns**, like the Increment 1 controls. Together with the pending "controls not below the build" approval, the arrangement needs the orchestrator's or Matthew's agreement.
- **The success note lasts 8 s.** That is long enough for a Replay to land before it fires, which is what made the UI-path callback test possible. Shorter may feel better on device; adjust after Human Preview.
- **Open measurement carried over:** does "1.2 cm character height" mean em-square or cap height (Increment 1 report)?

## Untested surfaces

- **Human Preview** (actual mouse operation) for A4, A5, A6, and A7, and still for A1 and A2.
- **A7 view move before Replay.** The assembly is world-placed and Replay never writes its transform (logged pose unchanged), but no allowed tool moved the Preview camera.
- **A4 "event from the preceding step"** is covered by state tests (direct handler calls, including a forced stale stamp), not by a natural UI race. In the UI the filled target is hidden, so it can't be clicked.
- Help opened at completion, and help or pause at steps other than 3, were not captured (state tests cover the logic; help at completion uses its own text).
- Missing-target and empty-sequence variants were not re-run (validation code unchanged).
- Readability and reach at 60 and 120 cm and from side views (A9); fresh viewers; A8 two-run Human Preview and save/reopen; A12 packaging.
- LEAF scenarios. The in-lens state suite stands in for them in this increment; the LEAF package is installed but no scenarios were written.
- Anything that needs a SPECS device ("feel unproven": comfort, hand tracking, latency).

## Tool and package proposals

- **`MovePreviewCamera`** (Lens Studio MCP). Needed only for A7's "move the view before Replay" case. It is not on the handoff's allowed list, so I did not use it. If the orchestrator approves it, the check is a single camera move followed by an injected Replay and a comparison of the logged `pose` lines. Alternatively, a person can run this case during Human Preview with WASD.
- No package was added or changed.
