# Increment 4 report: layout fixes, A9 capture set, naming, packaging, clean clone

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago), on AlienPC.
Governing documents: `devpost/build-handoff.md`, `devpost/design-brief.md` (approved), `devpost/echoes-acceptance-matrix.md`, and `devpost/increment-4-prompt.md` with its orchestrator rulings (now recorded in the matrix evidence record). Built on HEAD `722c731` (Increment 3 code `4132e7b`). Task logic is unchanged; only layout constants changed.

## Verdict

**Both layout fixes work and the A9 capture set is closed. The lens is named Echoes, the run instructions and asset record are written, and a clean local clone opened in Lens Studio 5.23.2 and passed `dc5-full-story`. A12 still has one open review finding (machine-local paths and a private link in the docs), and the recording and remote distribution have not been run.**

- **Confirm** is no longer covered by the base from a 25° side view. The mirror case, the **Marker** cell from the other side, is also fixed. Both side columns were raised 4.6 cm.
- **Visible gaps** between UIKit plates now measure 1.50–1.57 cm at 90 cm, up from 1.20–1.27 cm, using the same method as Increment 3.
- **Regression on the final code:** all 8 LEAF scenarios pass (218 checks, 0 failures, the same counts as Increment 3). The in-lens state suite passes 31/31. No lens errors.
- **Clean clone** of `081867e` was opened from a fresh folder with no `Cache/`. It compiled and started clean, and `dc5-full-story` passed 27/27.
- **Secrets scan:** no credentials anywhere, and the lens itself has no machine paths. The docs, however, contain 15 absolute `C:\Users\<user>\…` paths and one private `claude.ai/chat` link. I did not edit those docs (see Open issues).

## Environment and gate checks

| Check | Result |
|---|---|
| Lens Studio | 5.23.2.26081320, project `Echoes.esproj`, target platform Spectacles (read back with the Editor API) |
| Packages on disk, start and end | `Bitmoji 3D.lsc`, `Leaf.lspkg`, `SpectaclesInteractionKit.lspkg`, `SpectaclesUIKit.lspkg` and `.meta` files, **byte-identical** to Increments 2 and 3 (sha256, `validation/increment-4/packages-before.sha256`, diff empty at start and at end) |
| `ListInstalledPackagesTool`, start and end | Same 5 entries: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, unnamed `package` 0.0.0 (`3aa05179-…`, pre-existing since Increment 1) |
| `git status` at start | Untracked `increment-1-run.log` … `increment-4-run.log` (left untouched, uncommitted) |
| `git status` at end | Same four untracked logs only |
| Shipped inputs at end | `taskVariant = valid`, `runStateTests = false` (set back with `scene-graphql` after the state suite; `Assets/Scene.scene` is unchanged from HEAD) |
| Camera at end | `MovePreviewCamera reset`, pose read back (0, 0, 0), rotation 0 |
| Tools used | `MovePreviewCamera` (A9 captures, approved), `CapturePanelScreenshotTool`, `RunAndCollectLogsTool`, `RecompileTypeScriptTool`, `scene-graphql` (`runStateTests` on and off), LEAF panel tools, `ListInstalledPackagesTool`, `ExecuteEditorCode` (set `MetaInfo.lensName`, save, read `targetPlatform`, open the clone, reopen the original) |
| Prohibited tools | Not used: `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, anything installing `AiPreviewAgentInspect`. No force-close, no cache or package patching. `InjectPreviewGesture` was not needed |

## What changed

| Path | Change |
|---|---|
| `Assets/Echoes/Scripts/EchoesController.ts` | Layout constants only. `PLATE_GAP = 1.8` for palette cells, Turn/Confirm, and task buttons (header spacing unchanged). Both side columns start at `SIDE_COLUMN_TOP = COLUMN_TOP + 4.6`. Task-button rows are computed from the column top. No logic changed |
| `Echoes.esproj` | `lensName: SpecsBaseTemplate` → `Echoes`, set through the Editor API (`model.project.metaInfo`) and saved. No other manifest change |
| `devpost/run-instructions.md` | New: requirements (LS 5.23.2, Git LFS), clone and open steps, the Interactive Preview step, mouse and keys, a controls table, the full walkthrough, settings, LEAF, known limits |
| `devpost/asset-record.md` | New: original work, incorporated template, packages and their roles, repository tooling, "not used" list, and the virtual-only, enlarged-geometry, authored-help, and Preview-only disclosures |
| `validation/tools/measure-plate-gaps.py` | New: measures the visible gap between stacked plates as the background band between plate rims |
| `validation/increment-4/` | Captures, logs, package hashes |
| `devpost/echoes-acceptance-matrix.md` | Evidence record (Increment 4 revision, operator, layout, evidence, and both sets of orchestrator rulings) and rows A9, A11, A12 |

### Layout, build-local cm (base bottom-center origin; eye level at 24.25)

| Item | Increment 3 | Increment 4 |
|---|---|---|
| Side column top (palette, candidate card) | 25.25 | 29.85 |
| Help / Undo center (top edge) | 37.65 (40.15) | 42.55 (45.05), 20.8 cm above eye level, 13° up at 90 cm |
| Pause / Replay center | 31.15 | 35.75 |
| Palette cell centers | 22.25, 14.75, 7.25, −0.25 | 26.85, 19.05, 11.25, 3.45 |
| Turn left / Turn right / Confirm centers | 13.0 / 6.0 / −1.0 | 17.3 / 10.0 / 2.7 |
| Plate gap (between button bounds) | 1.5 | 1.8 |

Confirm and the Marker cell each rise **3.7 cm**, which is within the requested 3–4 cm. Commit `cefa790`'s message and the first version of the code comment said 4.0 cm because I left part of the extra gap out of the sum. `f5fb804` corrects the comment.

## Fix 1: the base no longer covers Confirm (or Marker)

**Method.** I used `MovePreviewCamera`, now approved for A9, to place the camera at head level at the stated distance from the build root and aimed it at the root: `setPosition` then `lookAt (0, 0, −90)`. For 25° views the position is root + d·(∓sin 25°, 0, cos 25°). For 90 cm left that is (−38.04, 0, −8.43), which logged yaw 335°. The left 90 cm "before" capture matches Increment 3's `a9-05` (the assembly-turn method). Mean absolute difference is 0.94/255, and 0.3% of pixels differ by more than 20, mostly the "Started over" feedback line present only in Increment 3's frame. The two methods agree.

| Capture | Code | View | Result |
|---|---|---|---|
| `b01-before-side25-left-90cm` | `722c731` | 25° left, 90 cm | The base's near-right corner covers the Confirm label ("onfirm"), as in Increment 3 |
| `b02-before-side25-right-90cm` | `722c731` | 25° right, 90 cm (not captured before) | Confirm is cut off by the display bottom, and the base's left end touches the Marker cell |
| `b03-rightraise-only-side25-right-90cm` | right column raised only (working tree, not committed) | 25° right | Confirm is clear and inside the display. The base now covers more of the Marker cell, because the 1.8 cm gaps lowered it 0.9 cm |
| `b04-rightraise-only-side25-left-90cm` | same | 25° left | Confirm is clear. The Marker cell falls below the display |
| `a9-05-side25-left-90cm` | `cefa790` | 25° left | **Confirm and Marker clear and inside the display** |
| `a9-06-side25-right-90cm` | `cefa790` | 25° right | **Confirm and Marker clear and inside the display** |

Raising only the right column fixed Confirm but made the mirror case worse, so I applied the same raise to the left column. The columns stay symmetric.

## Fix 2: visible plate gap

Front 90 cm, full resolution (`a9-01-front-90cm.jpg`, 2028 × 1590). Scale: 26.72 px/cm in the z = −90 plane (Increment 3). I measured the gap as the run of rows at the wall-background level between one plate's rim and the next plate's faint outer rim, averaged over 9 columns (`validation/tools/measure-plate-gaps.py <capture> <x> 200 1140 26.72`), with ±1 px = ±0.04 cm. Applied to Increment 3's capture, the same method gives its recorded 32 px (1.20 cm). A fixed-threshold scan was rejected because it read Increment 3's gap as 48 px. The soft UIKit rim makes threshold edges unreliable.

| Gap | Increment 3 | Increment 4 |
|---|---|---|
| Help → Pause | 32 px = 1.20 cm | 42 px = 1.57 cm |
| Undo → Replay | 32 px = 1.20 cm | 40 px = 1.50 cm |
| Pillar → Beam | 32 px = 1.20 cm | 42 px = 1.57 cm |
| Beam → Pedestal | not measured | 42 px = 1.57 cm |
| Candidate card → Turn left | 34 px = 1.27 cm | 42 px = 1.57 cm |
| Turn left → Turn right | not measured | 42 px = 1.57 cm |
| Pedestal → Marker, Turn right → Confirm | not measured | not measured: these gaps sit over the dark floor, where the method doesn't apply. Authored the same as the others |

Every measured visible gap now meets 1.5 cm.

## A9 capture set (closed)

Rulings applied: em-square text height, 90 cm primary distance, and the 60 cm constrained view recorded as a limitation. All captures use `cefa790` with the lens at its start state, from fresh preview refreshes.

| Capture | View | What it shows |
|---|---|---|
| `a9-01-front-90cm.jpg` (full res) | 90 cm front, head level | Everything inside the display: both columns, panel, base, pads, FRONT |
| `a9-02-front-60cm-head-level.jpg` | 60 cm front | Panel text very legible; both columns outside the display; pads cut by the bottom edge (limitation) |
| `a9-03-front-120cm.jpg` | 120 cm front | Everything inside the display, smaller |
| `a9-04-side25-left-120cm.jpg` | 120 cm, 25° left | Confirm clear; all controls inside the display |
| `a9-05-side25-left-90cm.jpg` | 90 cm, 25° left | Confirm clear; Marker cell fully inside the display |
| `a9-06-side25-right-90cm.jpg` | 90 cm, 25° right | Confirm clear and inside; Marker clear |
| `a9-07-side25-right-120cm.jpg` | 120 cm, 25° right | All inside; the base's left end touches the Marker cell's lower-right corner, label clear |
| `a9-08-side25-left-60cm.jpg` | 60 cm, 25° left | Panel readable; right column cut by the display edge; left column outside (limitation) |
| `a9-09-side25-right-60cm.jpg` | 60 cm, 25° right | Mirror of `a9-08` (limitation) |
| `a9-10-front-60cm-look-down.jpg` | 60 cm, head pitched 14° down at the build center | Build, pads, pointer, and FRONT clear; panel and columns outside the display. A user at 60 cm has to look up to read and sideways to press |
| `a9-11-front-60cm-head-turned-right.jpg` | 60 cm, head turned ≈ 19° right, 4° down | Replay, Candidate card, Turn left, Turn right, Confirm, and the right pad together; Undo cut at the top |

Text sizes are unchanged from Increment 3. Under the em-square ruling, the essential text (instruction 1.32 cm, progress 1.23 cm, correction/help 1.23 cm) meets 1.2 cm. Cap heights (≈ 0.70 × em) and angular sizes stay recorded in `devpost/increment-3-report.md` § A9 as a disclosed limitation. The fresh-viewer part of A9 (three real people) remains open.

## A12 packaging

### Name

`Echoes.esproj` `lensName` went from `SpecsBaseTemplate` to `Echoes` (`70eb40c`). I set it through `Editor.Model.IModel.project.metaInfo`; `MetaInfo.isLensNameValid("Echoes")` returned true. The metaInfo object is a copy, so it had to be assigned back. Then I saved. The only remaining "SpecsBaseTemplate" mentions are provenance notes in the docs. The manifest's `fromTemplateName: Spectacles` is template-internal and was left alone. No package or internal file was renamed.

### Run instructions and asset record

- `devpost/run-instructions.md`: written, then corrected after the clean-clone rehearsal (Preview simulation mode; line-ending rewrites on first open). Every quoted UI string was checked against `EchoesController.ts`.
- `devpost/asset-record.md`: written. It lists Echoes code imports (SIK `Interactable` and `WorldCameraFinderProvider`; UIKit `Button` and `BackPlate`; Leaf in tests only) and Bitmoji 3D as unused by Echoes code but kept as LEAF's declared dependency. `Base.png` is a 1 × 1 grey texture copied in by a Lens Studio material preset. `Echopark.hdr` and the render assets come from the template. A grep found no network or camera-module API in `Assets/Echoes`.

### Clean clone rehearsal

| Step | Result |
|---|---|
| Clone | `git clone file:///…/Echoes` into **`%USERPROFILE%\Echoes-clean-rehearsal`** (a new sibling folder outside the repo; it didn't exist before). HEAD `081867e`. Kept, not deleted |
| LFS | `git lfs pull`: all 6 LFS objects present; package sha256 identical to the working repo |
| Open | `ExecuteEditorCode`: `model.openProject(<clone>/Echoes.esproj)`; read back `projectFile = <clone>/Echoes.esproj`, `lensName = Echoes`, `targetPlatform = Spectacles` |
| Compile | No `Cache/` in the clone, so Lens Studio rebuilt it (including a 26 s reflection-map compression). `RecompileTypeScriptTool`: succeeded |
| Start | `ECHOES start … variant=valid canStart=true`, Step 1 baseline state; all 8 LEAF scenarios registered; no `[Preview 2]` error or warning |
| LEAF | `dc5-full-story` **PASSED 27/27** (17:20:18–17:20:34) |
| Side effects | On open, Lens Studio rewrote `.gitattributes`, `.gitignore`, `AGENTS.md`, `jsconfig.json` with new line endings only (`git diff` empty in the clone). The working repo was not affected |
| Return | Original reopened; `projectFile` read back; lens starts clean with the same screen positions as before; original `git status` unchanged |

**Finding: the Preview simulation mode is not part of the project.** The clone's Preview panel (a new panel, "Preview 2") opened in a recorded-room video mode: a tall 1392 × 2436 view with a living room behind the lens (`c01-clone-start-default-preview-mode.jpg`), not the Interactive Preview grey room used for all testing. The lens ran normally there, and LEAF doesn't depend on the mode, but a person needs Interactive Preview to walk around and click. The run instructions now say to switch to it. I didn't switch it myself because `PreviewPanelTool` isn't on the approved tool list.

### Secrets and machine-local links

Scanned every tracked file except the vendor packages with `git grep`:

- **Credentials:** no keys, tokens, passwords, private-key blocks, or provider key patterns. The only matches are prose about tokens. `spk_debug_key.pem`, `.mcp.json`, `.claude/settings.local.json`, `ls-live-instance.json`, and `leaf_plugin_settings.json` are gitignored and untracked.
- **The lens itself** (`Assets/`, `Echoes.esproj`, `Packages/`): no absolute paths or private URLs.
- **Docs: finding, open.** There are 15 absolute machine paths of the form `C:\Users\<user>\…` in `devpost/build-handoff.md`, `devpost/increment-1-report.md`, `increment-2-report.md`, `increment-3-report.md`, `devpost/increment-4-prompt.md`, `validation/RESUME-SETUP-GATE.md`, `validation/SETUP-GATE-instructions.md`, and `validation/setup-gate.md`. There is also **one private link**: a `claude.ai/chat/…` conversation URL in the historical `devpost/echoes-implementation-brief.md` (line 187). None is a credential. I didn't edit them. Most are orchestrator-authored governing documents or earlier evidence, and every one is already in git history, so a redaction commit would not remove it from a public repo. Rewriting history isn't authorized. This report and the matrix row avoid adding new ones; the clone path is written as `%USERPROFILE%`.
- **Public URLs** in docs are hackathon, Snap, and Anthropic documentation pages and the public starter repo. They're fine.

### Not run (A12)

- **The Preview recording** (under 3 minutes) and the claims-versus-recording review that depends on it. Recording was out of scope for this increment.
- **Remote LFS/download rehearsal.** No remote exists, and pushing isn't authorized.
- So A12 stays **Unverified**, and the package is not submission-ready.

## Regression on the final code

| Run | Code | Result | Log |
|---|---|---|---|
| LEAF ×8 (17:13:03–17:15:34), serial, each after LEAF's lens reset | `cefa790` + `70eb40c` | **8/8 PASSED, 218 checks, 0 failures**: dc1 23, dc2-recover 15, dc2-rotation 32, dc3 21, dc4-undo 16, dc4-replay 60, dc5-guards 24, dc5-full-story 27 (identical counts to Increment 3). No `[Preview 1]` E/W/F line | `logs/leaf-all-runs.log`, `logs/leaf-<id>-run1.log` |
| State suite (17:15:52–17:16:03), `runStateTests` on, then off | same | **pass=31 fail=0**, including the 8 s stale-callback case | `logs/state-tests-final.log` |
| Clean clone `dc5-full-story` | `081867e` | **PASSED 27/27** | `logs/clone-leaf-dc5-full-story.log` |
| Recompile and start after the comment fix | `f5fb804` | Compile succeeded; `canStart=true`; no lens errors. Only a comment changed, so the runs above stand | — |

No LEAF run was aborted this time.

## Matrix rows touched

| Row | Result | Evidence |
|---|---|---|
| A9 | **Unverified**: capture portion closed; three fresh viewers still missing | Captures `a9-01`…`a9-11` and `b01`…`b04`, gap table, text sizes under the em-square ruling |
| A11 | **Pass for Increment 4** | Package hashes identical at start and end (and in the clone), same 5 inventory entries, no package added, no prohibited tool. Invalid-data variants not re-run (`validateTask` unchanged) |
| A12 | **Unverified**: name, clean clone, instructions, and asset record done; the docs' machine-path and private-link finding is open; recording and remote distribution not run | This report § A12 |
| Evidence record | Updated | Increment 4 revision, operator, layout, evidence index, and the Increment 3 and 4 orchestrator rulings |

Not changed: A1, A2, A4, A5, A6, and A8 still need Human Preview; A3 and A7 Pass from Increment 3; A10 reviewed before the build. The Increment 4 LEAF runs repeat their automated evidence on the new layout but don't change their status.

### Evidence index (`validation/increment-4/`)

| File | Shows |
|---|---|
| `captures/b01-before-side25-left-90cm.jpg` | Before the fix: base covers Confirm |
| `captures/b02-before-side25-right-90cm.jpg` | Before the fix, mirror: Confirm cut by the display bottom; base touches Marker |
| `captures/b03-rightraise-only-side25-right-90cm.jpg`, `b04-…-left-90cm.jpg` | Intermediate right-only raise: Confirm fixed, Marker worse |
| `captures/a9-01` … `a9-11` | Final A9 set (table above) |
| `captures/c01-clone-start-default-preview-mode.jpg` | Clean clone running in the recorded-room preview mode |
| `logs/leaf-all-runs.log`, `logs/leaf-<id>-run1.log` | LEAF regression |
| `logs/state-tests-final.log` | State suite 31/31 |
| `logs/clone-leaf-dc5-full-story.log` | Clone compile, start, and LEAF run |
| `packages-before.sha256` | Package hashes (start; end and clone matched) |

Source log: the Lens Studio log for this editor session (`%LOCALAPPDATA%\Snap\Lens Studio\logs\LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`), 17:08–17:22 Central. LEAF window from byte offset 5522651, state suite from 6126061, clone from 6640486. Reproduce with `validation/tools/extract-leaf-log.sh` and `extract-echoes-log.sh`.

## Commits

| Hash | Title |
|---|---|
| `cefa790` | fix: raise side columns and widen control plate gaps |
| `70eb40c` | chore: name the lens Echoes |
| `081867e` | docs: add run instructions and asset record |
| `f5fb804` | docs: correct side-column raise in layout comment |
| `0c6055b` | test: record increment 4 evidence and report |

No remote, no push, no video recording.

## Defects and incidents

1. **My arithmetic error (fixed).** The first comment and `cefa790`'s message said Confirm rises 4.0 cm; it rises 3.7 cm. Fixed in `f5fb804` without amending.
2. **My line-ending slip (fixed before commit).** A Python edit on Windows wrote CRLF into `EchoesController.ts` (attribute `eol=lf`). I converted it back to LF before committing; `git ls-files --eol` shows `w/lf`.
3. **The first run-instructions draft was wrong about Preview** ("you don't need to change any setting"). The clone rehearsal disproved it, and the text is corrected.
4. No lens code defects. No lens error in any run.

## Open issues (for the orchestrator or Matthew)

- **Machine-local paths and a private link in the docs (A12).** Options: (a) accept them as development records; (b) redact them in a new commit and accept that history keeps them; (c) publish a fresh repository or history without them, which needs explicit authorization. The private `claude.ai/chat` link in the historical museum brief matters most.
- **Preview mode is per-computer.** A judge cloning the repo may land in the video simulation. The run instructions cover it. Exact menu wording wasn't verified, because I didn't use `PreviewPanelTool`.
- **Side columns now reach 45 cm build-local** (13° above the eye at 90 cm) instead of 40 cm. Everything is inside the display at 90 and 120 cm, front and 25° sides.
- **At 120 cm, 25° right,** the base still touches the Marker cell's lower corner; the label is clear.
- Carried over: 60 cm constrained view (ruled a limitation), cap-height limitation, ghost marker direction from straight ahead, bright "Pieces"/"Candidate" headers in cannot-start, and the 8 s success note.

## Untested surfaces

- Human Preview for A1, A2, A4, A5, A6, and the two A8 runs.
- A9 fresh viewers (three real people).
- The A12 recording, the claims-versus-recording review, and the remote LFS/download rehearsal.
- Invalid task-data variants (unchanged code, not re-run).
- Hand reach (no IK scenario; content at 90 cm).
- Everything that needs a Specs device ("feel unproven": comfort, hand tracking, latency, readability on the real display).

## Tool and package proposals

- **`PreviewPanelTool`** (or equivalent) to switch a Preview panel to Interactive Preview and verify the exact control name in the run instructions. Not used.
- No package was added or changed.
