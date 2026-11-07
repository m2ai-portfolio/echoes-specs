# Increment 12 report: A8 extraction (seventh Human Preview session)

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-12-prompt.md`. There was no lens code, scene, or package change. HEAD during the session was `1b682ec`, and lens code and scene are unchanged since `f5fb804`.

## Verdict

**A8 stays Unverified.** Session 7 has one operator-reset run (run C), and it contains all six behaviors with Replay last. The dispatch expected two operator resets, but the log has only one. The row needs two complete operator-reset runs and does not allow combining behaviors across runs, so one more complete run is needed.

Because A8 did not pass, I have not written the "all locally-testable matrix rows are closed" note.

## Extraction

- **Command:** `validation/tools/extract-echoes-log.sh <log> 8083957 validation/human-preview/logs/human-session-2026-11-04-7.log 23:03:06 23:10:39`
  - Output: 163 lines.
  - The window starts at Increment 11's MCP connect (23:03:06.308, byte 8083957). It ends at this agent's MCP connect (23:10:39). The last ECHOES line is at 23:10:08.189, and the log had not grown by 23:11:06.
- **Editor events:** `validation/human-preview/logs/human-session-2026-11-04-7-editor-boundaries.log`.
- **Authenticity:**
  - The only `LENSSTUDIO_AI_TOOL_CALL` in the window is the Increment 11 agent's read-only `ListInstalledPackagesTool` at 23:04:06. That is 4.5 minutes before the reset and the first human input.
  - There was no injection, no LEAF run, and no other MCP call. All inputs are `touch-start` lines from the mouse in Interactive Preview.
  - There is no `[Preview N]` E/W/F line and no lens network line. The only E/W lines are editor analytics (`Host requires authentication`). The LEAF logger lines at 23:08:34 are package start-up output after the reset.

## Resets

| Time | Lines | Class | Basis |
|---|---|---|---|
| 23:08:34.096 | 1–2 | Operator (Preview ↻) | No OAuth line nearby (next OAuth 23:35:29) and no MCP tool call after 23:04:06 |

There was no OAuth reset in the window and no third reset.

## Behaviors in run C (lines 3–163)

| Behavior | Line(s) |
|---|---|
| Correction | 32 (wrong piece: beam on step 1, "Not this piece…") |
| Help open/close | 48 / 53 |
| Pause/Resume | 56 / 59 |
| Undo | 62 (removed `p1-left-pillar`) |
| Completion | 153 (5/5 accepted, `placedObjects=5`) |
| Replay (last) | 161 (from complete, starts lens run 2) |

All six behaviors are present. The run also used explicit Turn controls (104, 136, 148). Build poses before and after Replay are identical (160, 163).

## A8 tally across sessions 1–7 (operator-reset runs only)

| Reset | Session | Complete? |
|---|---|---|
| 21:48:16 | 2 | No (missing Help, Pause/Resume, completion) |
| 22:59:33 (run A) | 6 | No (missing Replay) |
| 23:01:32 (run B) | 6 | No (missing Help) |
| 23:08:34 (run C) | 7 | **Yes** |

That gives one complete run out of the two required.

## Per-row results

| Row | Result | Evidence / gap |
|---|---|---|
| A8 | Unverified | Session 7 log and the editor-boundaries log. Run C is complete. One more complete operator-reset run is needed. |

**Other rows:**
- A1–A7 stay Pass. Session 7 is consistent with them.
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

Do one more run exactly like run C:
1. Press Preview ↻, away from 23:35:29 and every 50 minutes after it.
2. Make a wrong attempt (correction).
3. Open Help, then close it.
4. Pause, then Resume.
5. Undo.
6. Finish all five placements (completion).
7. Press Replay, and do this last.

When that run is in the log, A8 passes, and the closing note can be written.

## Commits

- `80c67a1` test: extract seventh preview session log with one operator-reset run
- docs commit for this report and the matrix update (see `git log`)

No remote, no push.
