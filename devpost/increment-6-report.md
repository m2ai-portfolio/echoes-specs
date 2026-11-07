# Increment 6 report: Human Preview evidence extraction

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-6-prompt.md`. No lens code, scene, or package change.

Evidence label: **Human Preview, operator Matthew, 2026-11-04**. Mouse in Interactive Preview, on HEAD `8eeee4e`. Lens code and scene are unchanged since `f5fb804`.

## Verdict

- **A4 moves to Pass.** Matthew completed the full five-placement sequence twice by mouse, and A4's state cases already passed in Increment 3.
- **A1, A2, A5, A6, and A8 stay Unverified.** The session covered part of each row but not every required case. The gaps are named below.

## Evidence and how it was separated from injected input

- **Source:** the same Lens Studio log as Increment 5 (`%LOCALAPPDATA%\Snap\Lens Studio\logs\LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`). Extraction started at byte offset 7253301 (Increment 5's final clean start, 17:28:56) and kept the window 21:00:00–21:22:56.
- **Extraction:** `validation/human-preview/logs/human-session-2026-11-04.log`, 386 lines covering 21:04:49–21:21:06. It was made with `validation/tools/extract-echoes-log.sh <log> 7253301 <out> 21:00:00 21:22:56`. Line numbers below refer to this file.
- **Editor boundaries:** `validation/human-preview/logs/human-session-2026-11-04-editor-boundaries.log` holds the OAuth refresh, lens-reset, and MCP-connect lines.
- **Why every line in the window is human:**
  - No MCP client was connected between 17:28:56 and 21:22:57. 21:22:57 is this agent connecting, after the last human line.
  - No LEAF scenario ran and no injection tool appears in the window.
  - Every action follows the SIK pattern `hover` → `touch-start` → `trigger-start` from a mouse pinch.
- **Start time:** human input begins at **21:04:49**, about two minutes before the "around 21:07" given in the dispatch.
- **Captures:** none exist for the session. No capture tool was run, so the log plus Matthew's statement is the evidence.
- **Errors and network:** no `[Preview N]` E/W/F line appears in the window. The only network lines are the editor's own OAuth refresh and analytics, not lens calls.

## What the session covered

| Lines | Time | Event |
|---|---|---|
| 1–48 | 21:04:49–21:05:24 | This lens instance started at the 20:15:29 editor reset. Pedestal picked, Left and Right pad chosen several times, no Confirm. |
| 49–51 | 21:05:29 | **Lens reset.** The cause was the editor's 50-minute OAuth token refresh (21:05:28.752; the same pattern at 17:45, 18:35, 19:25, 20:15), not an operator action. Fresh start: `canStart=true`, step 1, 0 accepted. |
| 72–167 | 21:06:16–21:07:24 | **Run 1:** five correct placements. Beam turned left 90→0 (114), marker turned right twice 180→0 (151, 154). `complete run=1 accepted=5 placedObjects=5` (162). No error, help, pause, undo. |
| — | 21:07:24–21:19:33 | No lens lines (idle). |
| 169–172 | 21:19:33 | **Replay from complete → run 2.** Camera at (0, 0, 3); build stays at (0, −24.25, −90). |
| 176–234 | 21:19:37–21:19:58 | Run 2: several pick/target changes and a turn. **Wrong piece ×2** (beam on Left pad at 90° and 180°; 211–213, 218–220; progress 0→0). Pillar then accepted (230–234). |
| 237–258 | 21:20:00–21:20:22 | **Help** opened at step 2 with pillar selected (244). A palette press during help was blocked (251). **Close help** restored the state (258). |
| 260–275 | 21:20:24–21:20:28 | **Undo** removed `p1-left-pillar`, 1→0, and Step 1 reopened (260–261). Re-placed once (271–275). |
| 278–282 | 21:20:30–21:20:32 | **Pause / Resume** at step 2 with no candidate selected. State identical. |
| 284–289 | 21:20:35–21:20:36 | **Replay from active → run 3.** The old run's note-clear callback was dropped (`stale-callback-dropped scheduledRun=2 currentRun=3`, 288). |
| 291–384 | 21:20:36–21:21:03 | **Run 3:** five correct placements. Beam accepted at 180° (334), marker turned 180→0 (367, 372). `complete run=3 accepted=5 placedObjects=5` (377). |
| 385–386 | 21:21:05–06 | Two touches with no effect. End of session. |

## Per-row results

| Row | Result | What the human log shows | Missing human case |
|---|---|---|---|
| A1 | **Unverified** | Ten mouse-driven placements: palette, Turn, attachment, Confirm (e.g. 105–123). | No deliberate wrong-orientation attempt; no capture of candidate, target, and instruction together. |
| A2 | **Unverified** | Correct ×10, each +1 (e.g. 82–86). Wrong piece ×2, progress unchanged, and the message names the actual and required piece (211–220). | Wrong target, wrong orientation, multi-error, rapid-repeat Confirm. |
| A4 | **Pass** | The full sequence completed twice (162, 377). Each prefix was incomplete, with the accepted count and ids in order. The state cases passed in Increment 3. | None. There is no panel capture of the final assembly; the logged placed-object count and Matthew's observation stand in. |
| A5 | **Unverified** | Help mid-step blocked input, and Close help restored the state (244–258). Pause and Resume left the state unchanged (278–282). | No pause with a selected, rotated candidate; no placement attempt while paused. |
| A6 | **Unverified** | Intermediate Undo at 1 accepted, then re-placed once (260–275). | No Undo at zero; no Undo after completion. "Earlier pieces unchanged" was not exercised because only one piece was placed. |
| A8 | **Unverified** | Every required behavior occurred at least once, with no lens errors and no product network. | Only one fresh reset, and it came from the editor. Runs 2–3 started from Replay. Each fresh-reset run did not include correction, help, pause/resume, undo, completion, and replay. |

**Rows not touched:**
- **A3 and A7 stay Pass.** The human log adds consistent observations: beam 180° accepted; Replay with a moved camera leaves the build in place; a stale callback is dropped.
- **A9, A10, A11, A12 are not affected.**

## Checks

- **Packages:** files match `validation/increment-5/packages-end.sha256` (`sha256sum -c`: 8/8 OK). `ListInstalledPackagesTool` shows the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0). No change.
- **`git status`:** before the commit, only the untracked `increment-*-run.log` files and the new `validation/human-preview/`.
- **Tools used:** `ListInstalledPackagesTool`, plus file reads of the editor log. No prohibited tool was used; no capture, injection, LEAF run, or Preview change was made.

## To close the remaining rows

These rows need a second human session that does the following:

1. **Start fresh twice.** Reset Preview before each of two runs.
2. **In each run:** a wrong-orientation Confirm (e.g. beam at 90° on Beam seat), a wrong-target Confirm, a wrong piece on a wrong target (multi-error), and a rapid double Confirm on a correct placement.
3. **Help.**
4. **Pause and Resume** with a turned candidate selected, pressing Confirm while paused.
5. **Undo three ways:**
   - at zero placements;
   - after two or more placements;
   - after completion.
6. **Completion, then Replay.**
7. **Capture.** Take one panel capture showing candidate, target, and instruction together.

No remote, no push.
