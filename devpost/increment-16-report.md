# Increment 16 report: re-check extraction and A9 final recording

Builder: Claude Code (claude-opus-5-5), 2026-11-06 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-16-prompt.md`. HEAD at dispatch was `0ef4f9b`. **No code change.**

## Summary

- **Re-check extracted.** It is log-corroborated. The A1, A2, and A5 human evidence is refreshed on `c602ee8`. A8 stays on `f5fb804`, which is noted and was not redone.
- **Viewer-2 discrepancy closed.** The segment at 21:04:10–21:05:15 was viewer 2, who had watched viewer 1 first, so that viewer was not naive.
- **A9 is in its final honest state:** **Unverified**. The comprehension sample is 2 viewers: one fresh pass and one observation-contaminated pass. No third fresh viewer is available. The capture and measurement portion is done. The row stays open in case another viewer is found before Nov 9.

## 1. Re-check extraction

**Files:**
- `validation/human-preview/logs/recheck-c602ee8-2026-11-06.log`: 253 lines, extracted with `extract-echoes-log.sh <log> 0 … 21:45:00 21:50:36`.
- `validation/human-preview/logs/recheck-c602ee8-2026-11-06-editor-boundaries.log`.

**Source:** `LensStudioLog-2026-11-06-20-57-54-706-22375.txt`. This is the same editor session as the viewers. Its md5 at copy was `bd8429cee2bcb3d975a2d72b72387828`.

**Revision.** HEAD during the re-check was `f42cb1e`. That commit is docs only, so the lens code and scene are `c602ee8`. `0ef4f9b` was committed at 21:50:34, after the last input.

### Authenticity

- **No AI tool calls in the window.** The last `LENSSTUDIO_AI_TOOL_CALL` is at 21:32:45 (the Increment 15 agent's LEAF run), and there are 0 in the window. This agent connected at 21:50:36.
- **No other automation.** There was no injection, LEAF run, or capture.
- **Agent residue excluded.** Lines at 21:33:02–07 are four stale-callback drops left over from the agent's last LEAF run. They have no input and are not in the extract.
- **Resets:**
  - 21:45:34: an OAuth-refresh reset, 1.0 s after the scheduled 21:45:33 token refresh. No input follows it.
  - 21:46:46: an operator Preview reset.
- **Human input** runs from 21:46:51.4 to 21:49:12.7: 40 touches. All 8 attachment choices follow hover → touch-start → trigger-start.
- **No errors or network traffic.** There is no lens E/W/F line and no lens network line.

### Coverage against the dispatch checklist

Line numbers refer to the extract. Each `confirm-cue on` line means the pulse and the "Press Confirm to place" line were both showing; they share one `awaitingConfirm` flag in `EchoesController.ts`.

| Touchpoint | Evidence |
|---|---|
| Staged candidate → pulse + "Press Confirm to place" | Yes: lines 51, 70, 99, 119, 142, 175, 198, 224 |
| Candidate change while staged → pulse continues | **Partial:** piece changes (74, 78, 146) and turns (179, 228) re-phased the cue, and it stayed on. **The attachment was never changed while a candidate was staged.** The state suite check "re-phased by an attachment change" covers that case on `c602ee8`. |
| Help open/close → pulse stops/returns | Yes: open at 81 with the cue off at 82; close at 85 with the cue on at 86. The candidate was unchanged. |
| Wrong Confirm → no pulse during correction | Yes, twice:<br>• Wrong piece at 151: the cue goes off at 152 and returns after the piece is fixed (158).<br>• Wrong orientation at 231: the cue goes off at 232 and returns after a turn (237). |
| Accept | Yes: 7 accepts, each turning the cue off |
| Undo | Yes:<br>• Undo with a staged candidate at 89 turns the cue off (90).<br>• A second Undo at 133. |
| Completion | Yes: 5/5 with `placedObjects=5` (242) |
| Replay | Yes: from complete (249). The cue was already off at completion and did not come back. |
| Pause | Not exercised; it was not on the checklist. Its human evidence stays on sessions 3–4, and the state suite covers it on `c602ee8`. |

## 2. Viewer-2 discrepancy closed

Matthew's statement is recorded in `validation/a9-viewers/viewers-2026-11-06.md` (Increment 16 resolution):
- **Viewer 1** was fresh. Their Confirm stumble and recovery via Help are log-corroborated, and they passed both criteria.
- **Viewer 2's** comprehension answers pass, but that viewer had observed viewer 1's session first, so the pass is observation-contaminated.
- The operator-reported "viewer 2 tripped on Confirm" is not supported by the log and is withdrawn from the evidence.

## 3. A9 final state

**Comprehension: Unverified.** The sample is 2 viewers: one fresh pass and one observation-contaminated pass, and a third fresh viewer is unavailable. **Capture/measurement: done.** The row stays open for an upgrade before Nov 9.

**The exact questions are now recorded** in both the matrix and the viewer record:
1. "This is a build puzzle. Tell me what you'd do next, and go ahead."
2. "What are you supposed to do next?"
3. "When it told you something was wrong — did you lose any of your work?"
4. "How did you know what to do?"

## Per-row results

| Row | Result | Note |
|---|---|---|
| A1 | Pass | Human evidence refreshed on `c602ee8` |
| A2 | Pass | Refreshed on `c602ee8`:<br>• Correct attempts: one placement each.<br>• Wrong piece and wrong orientation: progress unchanged.<br>The wrong-target, rapid-repeat, and multi-error human cases stay on the earlier sessions; LEAF covers them on `c602ee8`. |
| A5 | Pass | Help refreshed on `c602ee8`. Pause stays on the earlier sessions. |
| A8 | Pass (unchanged) | Two human runs remain on `f5fb804`, not redone. The re-check has no Pause, so it is not counted as an A8 run. |
| A9 | **Unverified** | Final state as above |
| A11 | Pass for Increment 16 | Packages unchanged |
| A3, A4, A6, A7, A10 | Pass (unchanged) | Not touched |
| A12 | Unverified | Unchanged |

## Checks

- **Packages:**
  - The `packages-end.sha256` check passed 8/8 (the file has CRLF endings, which were stripped before checking).
  - `ListInstalledPackagesTool` returned the same 5 entries: unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0.
- **`git status`:** only the pre-existing `.gitattributes`, `.gitignore`, and `jsconfig.json` modifications, the untracked `increment-*-run.log` files, and `check-log.ps1`. None are part of this increment.
- **Tools:** `ListInstalledPackagesTool` plus local log reads. No prohibited tool was used, and there is no new tool or package proposal.

## Commits

- `test: extract c602ee8 human re-check preview log`
- `docs: record A9 final state, viewer 2 resolution, and increment 16 report`

No remote, no push.
