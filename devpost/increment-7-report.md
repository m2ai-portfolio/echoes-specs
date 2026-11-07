# Increment 7 report: second Human Preview session extraction

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-7-prompt.md`. No lens code, scene, or package change.

Evidence label: **Human Preview session 2, operator Matthew, 2026-11-04**. Mouse in Interactive Preview, with HEAD at `0a09f4b` during the session. Lens code and scene are unchanged since `f5fb804`.

## Verdict

- **A6 moves to Pass.** Both sessions together cover every human case: Undo at zero, after two or more placements, and after completion.
- **A1, A2, A5, and A8 stay Unverified.** The exact gaps are listed below.

## Window and authenticity

- **Source:** the same Lens Studio log as Increments 5–6 (`LensStudioLog-2026-11-02-23-40-28-082-6e6d2.txt`).
- **Extraction:**
  - Command: `validation/tools/extract-echoes-log.sh <log> 7439816 <out> 21:22:57 21:50:23`. Byte 7439816 is the Increment 6 agent's MCP connect.
  - Output: `validation/human-preview/logs/human-session-2026-11-04-2.log`, 882 lines. Line numbers below refer to this file.
- **Actual bounds:** **21:42:41–21:49:28.** The dispatch estimate was 21:45–21:49, so the session started about three minutes earlier. No ECHOES line appears between 21:21:06 and 21:42:41.
- **No MCP-driven activity in the window** (`human-session-2026-11-04-2-editor-boundaries.log`):
  - The Increment 6 agent's last MCP-attributable call was at 21:24:29 (ListInstalledPackages README lookups). Its commit was at 21:25:40.
  - The next MCP event is this agent connecting at 21:50:23, after the last human line.
  - The log has no disconnect line for the 21:22:57 client, but it shows no MCP-driven activity in between.
- **No injection and no LEAF run.** The only LEAF lines are the scenario registrations every lens start emits (21:48:17). No scenario ran.
- **Human input pattern:** every target choice follows SIK `hover` → `touch-start` → `trigger-start` (29 of 29).
- **Errors and network:** no `[Preview N]` E/W/F line and no lens network line.
- **Captures:** none. No capture tool ran during the window.

## Session map

| Lines | Time | Event |
|---|---|---|
| 1–5 | 21:42:41 | **Replay from complete → run 4.** This is the lens instance left from session 1, which ended at run 3. |
| 17–26, 43–81 | 21:43:09–15 | **Rapid repeat.**<br>• A Confirm 0.42 s after an acceptance is ignored (1→1).<br>• Nine Confirms in 1.2 s leave the count at 2. |
| 93–157 | 21:43:20–30 | **Wrong piece:** pedestal on Beam seat, about 11 times across rotations. Progress stays 2→2. |
| 159–183 | 21:43:32–36 | **Undo at 2:** only the right pillar is removed and the left pillar is kept. Re-placed once. |
| 201–213 | 21:43:41–43 | **Wrong orientation:** beam at 90° is rejected. Turn left, then accepted at 0°. |
| 239–261 | 21:43:49–53 | Marker at 180° and at 270° rejected, then accepted at 0°. **Run 4 complete.** |
| 267–298 | 21:44:24–27 | **Undo after completion** (`wasComplete=true`), then Undo down to 0, then **Undo at zero** blocked ×6. |
| 301–318 | 21:44:28–30 | Replay ×4 (runs 5–8). |
| 330–334 | 21:44:33–34 | **Pause** at step 1 with nothing selected, left by **Replay from paused** (run 9). No Resume. |
| 355–402 | 21:44:39–46 | **Wrong target:** pillar on Right pad at step 1, ×9. Progress stays 0. |
| 423–500 | 21:44:52–45:06 | **Run 9 complete.** |
| 510–512 | 21:48:16–17 | **Lens reset → run 1** (`canStart=true`). |
| 547–589 | 21:48:22–30 | **Undo:** at 1, at 2, at 1, then blocked at zero. |
| 635–719 | 21:48:38–50 | **Wrong orientation:**<br>• beam at 90° ×4, then accepted at 180°;<br>• marker at 180° ×5 and 270° ×3. |
| 724 | 21:48:51 | **Replay from correction → run 2.** Run 1 never completed. |
| 740–877 | 21:48:55–49:20 | Run 2: Undo, Undo blocked ×8, corrections, then **complete** (877). |

**About the reset at 21:48:16:**
- No OAuth line accompanies it. The next token refresh was scheduled for 21:55:29 Central.
- No MCP activity occurred around it.
- It is therefore consistent with an operator Preview refresh, though the log does not record the cause.
- It is the only reset in session 2. The script's "two runs started from Preview refreshes" did not happen.

## Per-row results (sessions 1 + 2 combined)

| Row | Result | Remaining gap |
|---|---|---|
| A1 | Unverified | Only the capture remains. The deliberate wrong orientation is now present (201–213). No pre-Confirm hold was captured, because no capture tool ran. **The panel capture of candidate, target, and instruction together is still pending.** |
| A2 | Unverified | **Multi-error only.** Correct, wrong target, wrong piece, wrong orientation, and rapid repeat are all present. No human attempt had two differing fields (e.g. marker on Right pad at step 1). |
| A5 | Unverified | **Pause with a selected, rotated candidate; Confirm while paused; Resume with an unchanged state.** Session 2 had no Help and no Resume. Session 1's Help case still stands. |
| A6 | **Pass** | None. |
| A8 | Unverified | **Two operator-reset runs, each with correction, help, pause/resume, undo, completion, and replay.**<br>• So far: one operator reset (21:48:16) and one editor/OAuth reset (21:05:29).<br>• The run after 21:48:16 lacks help, pause/resume, and completion.<br>• The automated half and save/reopen remain Pass-ready from Increment 3. |

**Rows not touched:**
- **A3, A4, and A7 stay Pass.** Session 2 is consistent with them: beam accepted at 0° and at 180°; a stale callback is dropped on Replay (line 724 onward, `stale-callback-dropped`).
- **A9–A12 are not affected.**

## Checks

- **Packages:** `sha256sum -c validation/increment-5/packages-end.sha256` gives 8/8 OK. `ListInstalledPackagesTool` shows the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0). No change.
- **`git status`:** before the commits, only the untracked `increment-*-run.log` files and the two new extraction files.
- **Tools used:** `ListInstalledPackagesTool` and file reads of the editor log. No prohibited tool was used, and no capture, injection, LEAF run, or Preview change was made.

## To close the remaining rows

1. **A1:** hold a selected candidate on a target without confirming, and tell the builder. The builder then runs `CapturePanelScreenshotTool` while the hold lasts.
2. **A2:** one multi-error Confirm, for example marker on Right pad at step 1.
3. **A5:** pick and turn a piece, press Pause, press Confirm while paused, then press Resume.
4. **A8:** refresh Preview, then do one run with all six behaviors (a correction, Help open/close, Pause/Resume, Undo, completion, Replay). Repeat after a second refresh.

No remote, no push.
