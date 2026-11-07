# Increment 13 report: A8 extraction (eighth Human Preview session)

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-13-prompt.md`. There was no lens code, scene, or package change. HEAD during the session was `962f50c`, and lens code and scene are unchanged since `f5fb804`.

## Verdict

**A8 stays Unverified.** Session 8 has one operator-reset run (run D). It has correction, Help open/close, Pause/Resume, completion, and Replay last, but **no Undo**. The row needs two complete operator-reset runs and does not allow combining behaviors across runs. Run C (session 7) is still the only complete one.

Because A8 did not pass, I have not written the "all locally-testable matrix rows are closed" note.

## Extraction

- **Command:** `validation/tools/extract-echoes-log.sh <log> 8145643 validation/human-preview/logs/human-session-2026-11-04-8.log 23:10:39 23:30:00`
  - Output: 190 lines.
  - The window starts at Increment 12's MCP connect (23:10:39.824, byte 8145643). It ends at this agent's MCP connect (23:30:00.862). The last ECHOES line is at 23:29:27.835, and the log had not grown by 23:30:46.
- **Editor events:** `validation/human-preview/logs/human-session-2026-11-04-8-editor-boundaries.log`.
- **Authenticity:**
  - The only `LENSSTUDIO_AI_TOOL_CALL` in the window is the Increment 12 agent's read-only `ListInstalledPackagesTool` at 23:11:25. That is 16 minutes before the first human input.
  - There was no injection, no LEAF run, and no other MCP call. All inputs are `touch-start` lines from the mouse in Interactive Preview.
  - There is no `[Preview N]` E/W/F line and no lens network line. The only E/W lines are editor analytics (`Host requires authentication`).
- **OAuth:** the 23:35:29 refresh had not fired when the window closed, so it split no run.

## Resets

| Time | Lines | Class | Basis |
|---|---|---|---|
| 23:27:38.645 | 6–7 | Operator (Preview ↻) | No OAuth line nearby (next OAuth 23:35:29) and no MCP tool call after 23:11:25 |

Lines 1–5 (23:27:36) are a Replay from active (run 3) in the session 7 lens instance, just before the reset. They belong to no operator-reset run.

## Behaviors in run D (lines 8–190)

| Behavior | Line(s) |
|---|---|
| Correction | 39 (wrong piece: beam on step 1); also 60, 72, 117 |
| Help open/close | 43 / 46 |
| Pause/Resume | 65 / 68 |
| Undo | **missing** (no `undo` event; no touch near the Undo control at 0.867, 0.155) |
| Completion | 180 (5/5 accepted, `placedObjects=5`) |
| Replay (last) | 188 (from complete, starts lens run 2) |

The run also used explicit Turn controls (124, 127, 137, 165, 175). Build poses before and after Replay are identical (187, 190).

## A8 tally across sessions 1–8 (operator-reset runs only)

| Reset | Session | Complete? |
|---|---|---|
| 21:48:16 | 2 | No (missing Help, Pause/Resume, completion) |
| 22:59:33 (run A) | 6 | No (missing Replay) |
| 23:01:32 (run B) | 6 | No (missing Help) |
| 23:08:34 (run C) | 7 | **Yes** |
| 23:27:38 (run D) | 8 | No (missing Undo) |

That gives one complete run out of the two required.

## Per-row results

| Row | Result | Evidence / gap |
|---|---|---|
| A8 | Unverified | Session 8 log and the editor-boundaries log. Run D is missing Undo. One more complete operator-reset run is needed. |

**Other rows:**
- A1–A7 stay Pass. Session 8 is consistent with them.
- A9 still needs three fresh viewers.
- A12 still needs the recording, the public repo, the remote LFS rehearsal, and submission. All of these need separate authorization.

**Matrix updates:**
- Row A8.
- Evidence record: project revision, operator and date, evidence index.

## Checks

- **Packages:**
  - `sha256sum -c validation/increment-5/packages-end.sha256`: 8/8 OK.
  - `ListInstalledPackagesTool`: the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0).
- **`git status`:** only the pre-existing untracked `increment-*-run.log` files and `check-log.ps1`, plus this increment's files.
- **Tools:** `ListInstalledPackagesTool` and log file reads only. I used no prohibited tool, did no injection or LEAF run, and made no Preview change. There is no new tool or package proposal.

## To close A8

Do one more run like run C, and remember Undo:
1. Press Preview ↻, away from 23:35:29 and every 50 minutes after it (next: 00:25:29).
2. Make a wrong attempt (correction).
3. Open Help, then close it.
4. Pause, then Resume.
5. Place at least one piece, then press **Undo** (top right, above Replay). Undo needs an accepted placement to remove.
6. Finish all five placements (completion).
7. Press Replay, and do this last.

When that run is in the log, A8 passes, and the closing note can be written.

## Commits

- `1379e80` test: extract eighth preview session log with one operator-reset run
- docs commit for this report and the matrix update (see `git log`)

No remote, no push.
