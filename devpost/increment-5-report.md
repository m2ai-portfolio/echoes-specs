# Increment 5 report: release-candidate polish

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago), on AlienPC.
Governing documents: `devpost/build-handoff.md`, `devpost/increment-4-report.md`, and `devpost/increment-5-prompt.md` with its orchestrator rulings (now in the matrix evidence record). Built on HEAD `55e2da3` (the dispatch commit, after `8dbb1e8`). No lens code or scene change.

## Verdict

**All four scope items are done.**
- The private link is redacted.
- The run instructions now describe the real Preview controls. The old text named a mode ("Interactive Preview") but didn't say where to switch it. In Lens Studio 5.23.2 that switch is an unlabeled icon.
- `dc5-full-story` passed 27/27 on the final code, and a clean Preview start showed the shipped inputs.
- Packages, scene, and manifest are unchanged, and the camera is reset.

A12 stays **Unverified**: the recording and remote distribution have still not been run.

## What changed

| Commit | Change |
|---|---|
| `c6a8059` docs: redact private conversation link from historical brief | `devpost/echoes-implementation-brief.md` line 187: the `claude.ai/chat/…` URL is replaced with `[private Claude conversation link removed, 2026-11-04]`. `git grep claude.ai/chat` now finds only prose mentions, none with a conversation ID. The 15 machine-local paths are left as development records (ruling). No history rewrite, so the old URL is still in git history. |
| `f6b63fe` docs: match run instructions to the real Preview controls | `devpost/run-instructions.md` "Open it" step 4 now says where the switch is and what it looks like (below). Adds captures `p01`, `p02`. |
| (this commit) chore + test | `validation/tools/extract-leaf-log.sh` and `extract-echoes-log.sh` now match any `[Preview N]` panel label, not only `[Preview 1]`. This session's panel logged as `[Preview 3]`, and the old filter dropped every lens line. Filtering is otherwise unchanged. Also adds the Increment 5 evidence, the matrix update, and this report. |

## Preview wording verified (`PreviewPanelTool`, approved use only)

Calls: `getConfig`, `listSources`, `setConfig` (Interactive + `Scenes/Plane`), `getConfig` again, and two `screenshot` calls with `includeChrome`. No other action.

- **Before:** this machine's Preview was already `inputType=Interactive`, source `InteractiveResources.bundle/Scenes/Plane`, device `SPECS 27`, camera `Front`. So `setConfig` changed nothing that can be seen. The read-back after it was identical (`p01` vs `p02`).
- **What the panel actually shows** (`p01-preview-chrome-interactive.png`):
  - **Top-left:** a row of five icons with **no text labels**: picture, camera, a screen on a stand (highlighted when Interactive is active), pause, eye.
  - **Top center:** a dropdown reading **Plane ▾**.
  - **Bottom center:** **SPECS 27 ▾**.
  - **Bottom-left:** **Start ▾**.
- **Not seen:** a menu or control labeled "Interactive Preview". I couldn't read tooltips, so the icon names come from their pictures and from the `inputType` read-back, not from on-screen text. The instructions now call it "the third icon", give "Interactive Preview" as this guide's name for the mode, and don't claim any tooltip text.
- **Lens text vs. instructions:** every on-screen label in the capture matches `run-instructions.md`:
  - Panel: disclosure line, progress, step-1 instruction, `Chosen: no piece · no attachment`.
  - Left column: Help, Pause, Pieces, Pillar/Beam/Pedestal/Marker.
  - Right column: Undo (dimmed), Replay, Candidate, Turn left, Turn right, Confirm.
  - Base: Left pad, Right pad, pointer, FRONT.
- **Walkthrough strings checked against the code:**
  - The step instructions, the five attachment labels, and the turn help come from `SignalArchTask.ts`: the beam "arrives at 90°, so turn it once"; the marker "arrives at 180°, so turn it twice".
  - The completion line is `${title} complete: all ${total} placements accepted.` with title `Signal Arch`, plus `Virtual check only: no physical model was inspected.`
  - All of these match the instructions. The walkthrough steps match the real controls.
- **Not reproduced:** the clean clone's recorded-room mode. Switching this panel to Multimedia to reproduce it would have gone beyond the approved use.

## Regression on the final code (`f6b63fe`)

| Run | Result | Log |
|---|---|---|
| `RecompileTypeScriptTool` | succeeded | — |
| Clean Preview start, 17:28:06 | `ECHOES start … variant=valid canStart=true`, step 1 baseline (0 accepted, 0 placed), build at (0, −24.25, −90), all 8 LEAF scenarios registered. No `[Preview N]` E/W/F line. The only `W` line is the editor's own `QNetworkAccessManager` "Host requires authentication", which is not a lens line. | `validation/increment-5/logs/start-and-dc5-full-story.log` |
| LEAF `dc5-full-story`, 17:28:12–17:28:26 | **PASSED, 27 checks, 0 failures** (same count as Increments 3 and 4). It covers correction, help, pause, undo, completion (`complete run=1 accepted=5 placedObjects=5`), and replay. | same |
| Final clean start, 17:28:56 | Same start state as above. Lens left at the start state. | `validation/increment-5/logs/final-clean-start.log` |

Source: this editor session's Lens Studio log (`%LOCALAPPDATA%\Snap\Lens Studio\logs\LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`). The regression starts at byte offset 7169002 and the final start at 7253301. Reproduce with the two extract scripts.

## Shipped state

| Check | Result |
|---|---|
| `taskVariant` / `runStateTests` | `valid` / `false`, read back with `scene-graphql` (not changed this increment) |
| `Assets/Scene.scene`, `Echoes.esproj` | Unchanged from HEAD |
| Camera | `MovePreviewCamera` reset; pose read back (0, 0, 0), rotation 0 |
| Preview | Interactive, Plane, SPECS 27 (same as at the start) |
| Packages on disk | sha256 identical to Increments 2–4 at start and end (`validation/increment-5/packages-end.sha256`) |
| `ListInstalledPackagesTool` (end) | Same 5 entries: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, unnamed `package` 0.0.0 (pre-existing) |
| `git status` (end) | Untracked `increment-1-run.log` … `increment-5-run.log` only |
| Prohibited tools | Not used: `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, `AiPreviewAgentInspect`. No force-close, no cache or package patching. |

## Matrix

- **Evidence record:** Increment 5 revision, operator, evidence index, and rulings added.
- **A11:** **Pass for Increment 5**.
- **A12:** stays **Unverified**. The review finding is resolved by ruling (link redacted, paths accepted), and the instructions are verified against the real Preview.
- **Other rows:** no other row changed.

## Residue and open items

- **Not run for A12:** the Preview recording (under 3 minutes), the claims-versus-recording review, and the remote LFS/download rehearsal. They need separate authorization.
- **Old link in history:** the redacted URL is still reachable in git history. The ruling accepted that.
- **Icon names:** read from the pictures, not from tooltips. If a judge's Lens Studio build arranges the icon row differently, "third icon" could be off. The instructions also describe the icon, which hedges this.
- **Self-inflicted mistakes, fixed before commit:**
  - My first screenshot call wrote to a folder that didn't exist yet, and the tool still reported success. I created the folder and retook it.
  - My first `sed` edit of the extract scripts mangled their back-references. I reverted it with `git checkout` and redid the edit exactly.
- **Carried over:** Human Preview for A1, A2, A4, A5, A6, A8; the A9 fresh viewers; and everything that needs a device.

No remote, no push, no recording.
