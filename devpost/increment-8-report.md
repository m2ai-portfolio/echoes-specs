# Increment 8 report: third Human Preview session extraction

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-8-prompt.md`. No lens code, scene, or package change.

Evidence label: **Human Preview session 3, operator Matthew, 2026-11-04**. Mouse in Interactive Preview. HEAD was `df6ba4b` during the session; `84b5dbc` was committed at 22:17:49, after the last human input. Lens code and scene are unchanged since `f5fb804`.

## Verdict

- **A2 moves to Pass.** Session 3 supplies the missing multi-error case.
- **A1, A5, and A8 stay Unverified.** Each has one named gap, listed below.

## Window and authenticity

- **Source:** `LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`.
- **Extraction:**
  - Command: `validation/tools/extract-echoes-log.sh <log> 7753817 <out> 21:50:23 22:17:52`. Byte 7753817 is the Increment 7 agent's MCP connect.
  - Output: `validation/human-preview/logs/human-session-2026-11-04-3.log`, 296 lines. Line numbers below refer to this file.
  - Editor events: `human-session-2026-11-04-3-editor-boundaries.log`.
- **Actual bounds:**
  - Lens reset and idle start at 21:55:29–21:55:31 (lines 1–22), then no input for about 20 minutes.
  - **Human input runs from 22:15:22 to 22:17:16.** The last line is the success-note callback at 22:17:24.
  - The dispatch estimate was about 21:55–22:17. The real session was about two minutes long.
- **No MCP-driven activity in the window:**
  - The Increment 7 agent's last MCP-attributable call was at 21:52:51 (ListInstalledPackages README lookups). Its commit was at 21:54:11.
  - The next MCP event is this agent connecting at 22:17:52, after the last human line.
- **Other checks:**
  - No injection and no LEAF run.
  - All 12 target choices follow SIK `hover` → `touch-start` → `trigger-start`.
  - No `[Preview N]` E/W/F line and no lens network line.
  - No capture.

## Reset classification

There is one reset in the window, at **21:55:29.956/.961/.969**. It is an **editor OAuth reset**, not an operator refresh:

- An OAuth token refresh ran at 21:55:29.052–.385, 0.6 s before the reset, matching the 21:55:29 time scheduled in the Increment 7 log.
- The next refresh was scheduled for 22:45:29 Central, after the window.

The operator did not refresh Preview during session 3. Every run that had input (runs 2–5) started from Replay.

## Session map

| Lines | Time | Event |
|---|---|---|
| 1–22 | 21:55:29–31 | OAuth reset → run 1, which had no input |
| 25 | 22:15:23 | Replay from active → run 2 |
| 30–44 | 22:15:27–31 | **Multi-error:** marker at 180° on Right pad at step 1, ×2. `differing=target,piece`, and the target is reported first. Progress stays 0→0. |
| 49–69 | 22:15:32–37 | Replay → run 3; wrong target: pillar on Right pad ×3 |
| 74–189 | 22:15:39–16:48 | Run 4 (Replay-started), below |
| 103–118 | 22:16:02–10 | In run 4: pillar on Right pad, turned to 90°. **Pause** with the candidate kept, Resume after 4 s with the state unchanged, then Confirm accepts it 1→2. **No Confirm while paused.** |
| 123–130 | 22:16:26–32 | In run 4: Help at step 3; a palette press is blocked; Close help restores the state |
| 141–147 | 22:16:36–39 | In run 4: beam at 90° rejected (`mismatch=orientation`); Turn left; accepted at 0° |
| 189 | 22:16:48 | Run 4 complete |
| 201 | 22:16:57 | Replay from complete → run 5 |
| 202–289 | 22:16:59–17:16 | Run 5 clean, complete at line 289 |

## Per-row results (sessions 1–3 combined)

| Row | Result | Remaining gap |
|---|---|---|
| A1 | Unverified | **Capture only.** No sustained pre-Confirm hold: the longest interval with both a candidate and a target chosen was 8.2 s (lines 103–114), and 4 s of it was spent paused. No capture ran. |
| A2 | **Pass** | None. The multi-error case is at lines 40–42; the other five cases come from sessions 1–2. |
| A5 | Unverified | **Placement attempt while paused** (`confirm-blocked reason=paused`). Pause with a selected, rotated candidate and Resume with an unchanged state are now shown (106–113). Help is shown in sessions 1 and 3. |
| A8 | Unverified | **Two operator-reset runs, each with all six behaviors.** Session 3 had no operator reset and no Undo. Run 4 has five of the six behaviors and is missing Undo. Resets across sessions 1–3: one by the operator (21:48:16) and two by OAuth (21:05:29, 21:55:29). |

**Rows not touched:**
- **A3, A4, A6, and A7 stay Pass.** Session 3 is consistent with them.
- **A9–A12 are not affected.**

## Checks

- **Packages:**
  - `sha256sum -c validation/increment-5/packages-end.sha256` gives 8/8 OK.
  - `ListInstalledPackagesTool` shows the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0).
- **`git status`:** only the untracked `increment-*-run.log` files and the new extraction files.
- **Tools used:** `ListInstalledPackagesTool` and file reads of the editor log. No prohibited tool was used, and no capture, injection, LEAF run, or Preview change was made.

## To close the remaining rows

1. **A5:** pick and turn a piece, press Pause, **press Confirm while paused**, then press Resume.
2. **A8:** **refresh Preview yourself.** Wait until the timer refresh at 22:45:29 has passed, or note the time you refresh. Then do one run with a correction, Help open/close, Pause/Resume, **Undo**, completion, and Replay. Repeat after a second refresh.
3. **A1:** hold a candidate on a target without confirming, tell the builder, and re-send this dispatch with capture instructions.

No remote, no push.
