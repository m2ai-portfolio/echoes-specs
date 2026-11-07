# Increment 14 report: A8 closing run (ninth Human Preview session)

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-14-prompt.md`. There was no change to lens code, the scene, or packages. HEAD during the session was `a3bc1a8`. Lens code and scene are unchanged since `f5fb804`.

## Verdict

**A8 is now Pass.** Session 9 contains run E, a second complete operator-reset run. Run E has a correction, Help open/close, Pause/Resume, Undo, completion, and Replay last. With run C from session 7, that makes the two runs the row requires. Each run has all six behaviors on its own, so nothing is combined across runs.

**A10 is now Pass (Review).** The dispatch assumed A10 was already closed. The matrix still said **Not run**: Increments 3 and 4 mentioned the review but never recorded it. A10 is a document-review row, so I did the review in this increment and recorded it (§ A10). I mention it because it is a status change the dispatch didn't anticipate.

So the closing note applies, and I have added it to the matrix evidence record. **Every locally testable row (A1–A8, A10, A11) is closed.**

## Extraction

- **Command:** `validation/tools/extract-echoes-log.sh <log> 8216582 validation/human-preview/logs/human-session-2026-11-04-9.log 23:30:00 23:50:27`
  - Output: 183 lines.
  - The window starts at Increment 13's MCP connect (23:30:00.862, byte 8216582). It ends at this agent's MCP connect (23:50:27.488).
  - Human input runs from 23:48:34.054 to 23:49:57.942. The last ECHOES line is at 23:49:58.630.
- **Editor events:** `validation/human-preview/logs/human-session-2026-11-04-9-editor-boundaries.log`.
- **Authenticity:**
  - The only `LENSSTUDIO_AI_TOOL_CALL` in the window is the Increment 13 agent's read-only `ListInstalledPackagesTool` at 23:30:54. That is 17.5 minutes before the first human input.
  - There was no injection, no LEAF run, and no other MCP call. All 29 inputs are `touch-start` lines from the mouse in Interactive Preview.
  - There is no `[Preview N]` E/W/F line and no lens network line. The only E/W lines are:
    - editor analytics (`Host requires authentication`, `Failed to send event`)
    - `Avatar URL is empty`, logged during the OAuth re-authorization

## Resets

| Time | Lines | Class | Basis |
|---|---|---|---|
| 23:35:30.753 | 1–3 | Editor (OAuth) | Refresh requested at 23:35:29.692, 1.06 s earlier. The run it started (lines 4–22) has no input. |
| 23:48:28.035 | 23–24 | Operator (Preview ↻) | No OAuth line nearby (next refresh 00:25:29). No MCP tool call after 23:30:54. |

**The OAuth timer did not split anything.** No human input occurred between 23:30:00 and 23:48:28. Its run simply idled until the operator reset.

## Behaviors in run E (lines 25–183)

| Behavior | Line(s) |
|---|---|
| Correction | 54 (wrong piece: beam on step 1, "Choose the square pillar.") |
| Help open/close | 59 / 62 |
| Pause/Resume | 65 / 68 (state unchanged across the pause) |
| Undo | 82: removed `p1-left-pillar` after the accepted placement at 76–77. The touch is at (0.884, 0.163) on line 81. Pillar re-placed at 95. |
| Completion | 173 (5/5 accepted, `placedObjects=5`) |
| Replay (last) | 179 (from complete, starts lens run 2). Build pose is identical before and after (178, 181). The stale success callback is dropped (182). |

The run also used the explicit Turn controls (128, 158, 168).

## A8 tally across sessions 1–9 (operator-reset runs only)

| Reset | Session | Complete? |
|---|---|---|
| 21:48:16 | 2 | No (missing Help, Pause/Resume, completion) |
| 22:59:33 (run A) | 6 | No (missing Replay) |
| 23:01:32 (run B) | 6 | No (missing Help) |
| 23:08:34 (run C) | 7 | **Yes** |
| 23:27:38 (run D) | 8 | No (missing Undo) |
| 23:48:28 (run E) | 9 | **Yes** |

**Two complete runs: C and E.** Increment 3 had already met the rest of the row:
- **Automated half:** two `dc5-full-story` LEAF runs from fresh resets, 27/27 each.
- **Runtime-dependency review:** no `InternetModule`, `RemoteServiceModule`, `RemoteMediaModule`, `fetch`, or WebSocket in `Assets/Echoes`.
- **Save/reopen:** `dc5-full-story` passed 27/27 after reopening the project.

Neither human run had a script error or a lens network line.

**Capture references:** the session logs, the Human Preview capture `validation/human-preview/captures/a1-human-hold-candidate-target-instruction.png` (session 5), and the Increment 3 captures. **No panel capture was taken during run C or run E.** I recorded this in the row rather than treating it as a gap, because the dispatch defines A8 closure as two complete runs.

## A10

I reviewed the handoff at `a3bc1a8`:

1. **Before building:** the handoff was committed in `499ab17` at 15:43:14. The first build commit, `13fed72`, came at 16:20:55.
2. **Names the brief and the matrix:** it names `devpost/design-brief.md` and `devpost/echoes-acceptance-matrix.md`. The brief's frontmatter says `status: approved` and `approved_by: Matthew, 2026-11-04`.
3. **Requires the matrix scenarios:** the builder "must implement and run the matrix scenarios … and record results".
4. **States precedence:** the brief governs scope; the matrix supplies test detail; the museum brief is historical; if brief and matrix disagree, stop and report.
5. **Preserves the official closing sections:** "Build notes for CLAD" and "After the build: judge it" are word-for-word identical to `agent/skills/plan-lens/templates/design-brief-template.md`. A diff of the 28 lines matched exactly, apart from heading level.
6. **Restrictions:** it lists the allowed tools. It prohibits `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, and `AiPreviewAgentInspect` workflows, as well as force-closing and cache patching.
7. **Museum supersession is visible:** `devpost/echoes-implementation-brief.md` opens with a **HISTORICAL — SUPERSEDED** banner.

Result: **Pass.** The approval covers the brief's defaults only. It gives no authority to publish or submit.

## Per-row results

| Row | Result | Evidence / note |
|---|---|---|
| A1–A7 | Pass (unchanged) | Session 9 is consistent with them: correction text, help/pause preservation, latest-only Undo, completion, and Replay pose. |
| A8 | **Pass** | Session 9 log and editor-boundaries log (run E), session 7 log (run C), Increment 3 automated, network, and reopen evidence |
| A9 | Unverified | Three fresh real viewers are still needed. The capture and measurement half is done. |
| A10 | **Pass** | Review above |
| A11 | Pass (unchanged) | Package check below |
| A12 | Unverified | Needs the recording under 3 minutes, the public repo, the remote LFS rehearsal, and submission. Each is separately authorized. |

**Matrix updates:**
- Rows A8 and A10.
- Evidence record: project revision, operator and date, evidence index, and a new closing note.

## Closing note

All locally testable matrix rows are closed: **A1–A8, A10, and A11 are Pass.**

Outstanding:
- **A9:** Unverified until three fresh viewers observe the lens without coaching, and at least two of them identify the next action and explain preserved progress.
- **A12:** the Preview recording under three minutes, making the repo public, the remote LFS/download rehearsal, and submission. Each needs separate authorization.

Claims stay limited to the matrix's "Supported after passing" list. Device comfort, real hand tracking, and viewer comprehension remain "feel unproven".

## Checks

- **Packages:**
  - `sha256sum -c validation/increment-5/packages-end.sha256`: 8/8 OK.
  - `ListInstalledPackagesTool`: the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0).
- **`git status`:** only the pre-existing untracked `increment-*-run.log` files and `check-log.ps1`, plus this increment's files.
- **Tools:**
  - Used: `ListInstalledPackagesTool`, log and file reads, and a local `diff`.
  - Not used: no prohibited tool, no injection, no LEAF run, no Preview change.
  - There is no new tool or package proposal.

## Commits

- `4206dfd` test: extract ninth preview session log with second complete operator-reset run
- A docs commit for this report and the matrix update (see `git log`)

No remote, no push.
