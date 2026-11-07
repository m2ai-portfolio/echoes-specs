# Increment 15 report: Confirm cue and A9 viewers 1–2

Builder: Claude Code (claude-opus-5-5), 2026-11-06 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-15-prompt.md`. HEAD at dispatch was `a9c013f`. The viewers tested `525fb2a`.

## Summary

- **Viewer sessions:** extracted and checked for authenticity. **Viewer 1's Confirm trip is in the log. Viewer 2's is not**; see "Discrepancy to resolve" below.
- **Confirm cue:** implemented in `c602ee8`:
  - The Confirm label pulses gently.
  - The status gains a second line, "Press Confirm to place".
  - The cue is on only while a candidate is fully staged and Confirm would be evaluated.
- **Regression on the final code:**
  - LEAF: **8/8 scenarios, 220 checks, 0 failures**.
  - State suite: **41/41** (the 31 original checks plus 10 new cue checks).
  - Packages: unchanged.
- **A9 stays Unverified.** Two of the three viewers are observed; a third must test `c602ee8` or later.

## Discrepancy to resolve

The dispatch places the sit-downs at about 21:05 and 21:07, done by about 21:12. The Lens Studio log for that editor session (`LensStudioLog-2026-11-06-20-57-54-706-22375.txt`) shows something different:

1. **Human input exists only from 20:59:16.7 to 21:05:15.8.** The log contains **no line of any kind** between 21:05:22.9 and this agent's MCP connect at 21:17:46.8.
2. **20:59:16–21:02:53 matches the viewer description exactly.**
   - Staged at 20:59:21.
   - Never pressed Confirm. Instead re-chose the target 10 times and the piece 8 times, and clicked the Candidate card 4 times.
   - Opened Help at 21:00:42 and kept it open 47 s.
   - Pressed Confirm at 21:01:34, 133 s after staging and 5 s after closing Help.
   - Then completed 5/5.
3. **21:04:10–21:05:15 does not match.**
   - The first action is Replay.
   - Every staged candidate is confirmed within 3.8 s.
   - There are two complete runs of about 28 s each, around an operator Preview reset at 21:04:44.
   - Help was open once, for 0.9 s.

   This looks like a practiced operator, or a viewer who had just watched viewer 1. It does not look like someone who expected the target click to place the piece.

I recorded **viewer 1 as log-corroborated**. For **viewer 2**, I recorded the operator's report and noted that the log does not show it. I did not invent a second trip, and I did not discard the operator's account. **Matthew: please confirm who operated 21:04:10–21:05:15, and whether viewer 2's session happened somewhere this log does not cover** (for example, another machine or editor session). The comprehension answers for both viewers are verbal and operator-reported in any case.

The exact questions asked of the viewers were not in the dispatch. The A9 row requires them ("Record exact questions"), so they are still owed.

## 1. Viewer session extraction

| File | Content |
|---|---|
| `validation/a9-viewers/logs/viewer1-2026-11-06.log` | `extract-echoes-log.sh <log> 0 … 20:57:54 21:03:59`, 253 lines |
| `validation/a9-viewers/logs/viewer2-2026-11-06.log` | `extract-echoes-log.sh <log> 0 … 21:04:00 21:17:46`, 251 lines |
| `validation/a9-viewers/logs/viewers-2026-11-06-editor-boundaries.log` | Editor events: Lens Studio start 20:57:54, project open, resets, MCP connect 21:17:46 |
| `validation/a9-viewers/viewers-2026-11-06.md` | Click sequences, timings, authenticity, operator-reported results |

**Authenticity:**
- **No AI tool calls:** `LENSSTUDIO_AI_TOOL_CALL` count in the file is 0. No MCP client was connected before 21:17:46.
- **No other automation:** no injection, LEAF run, or capture.
- **Target clicks follow the mouse pattern (hover → touch → trigger):** 12/16 for viewer 1, where the other 4 are repeat clicks on an already-hovered target, and 11/11 for viewer 2.
- **No lens errors:** no lens E/W/F line and no network line.
- **Viewer boundary:** inferred from a 76.5 s idle gap (21:02:53.6 → 21:04:10.2). The 21:04:44 reset is an operator reset: there was no OAuth event near it (the next refresh was at 21:45:33) and no MCP client was connected.

**Revision:** `525fb2a` was HEAD for the whole session (`a9c013f` was committed at 21:17:43). Lens code and scene are unchanged since `f5fb804`. **Both viewers tested the pre-fix revision.**

## 2. Confirm cue (`c602ee8`)

**When the cue is on:** the overlay is none, the task is not complete, a piece and an attachment are both chosen, and there is no open correction. After a rejected attempt the cue stays off, because the correction asks for a change first. It returns as soon as the user changes the piece, turn, or attachment.

**What it looks like:**
- **Pulse:** the Confirm label eases between white and the success tint (0.7, 1.0, 0.75) and between scale 1.00 and 1.08, at **1.2 Hz**. The motion is a smooth cosine; there are no on/off flashes.
  - Only the label moves. The plate, its collider, and the 1.8 cm gaps to neighboring controls are unchanged.
  - 1.2 Hz is well under the 3 Hz flashing threshold, and there is no full-screen effect.
- **Text:** the status gains a second line: "Press Confirm to place".

**Re-phasing and stopping:** the cue is re-evaluated on every refresh.
- A new candidate (run, step, piece, turn, or attachment) restarts the pulse from rest.
- Accept, Undo, Replay, Help, Pause, and a correction stop it, and the label returns to rest at once.
- Each change is logged as `ECHOES confirm-cue on candidate=<run:step:piece:rot:target>` or `ECHOES confirm-cue off`.

**I departed from the suggested text.** The dispatch suggested appending "· press Confirm to place" to the same status line. In a Preview capture, that one line already ran past the guidance panel into the Pause and Replay columns at Step 1 (`validation/increment-15/captures/c01-one-line-cue-overflows-rejected.jpg`), and longer candidates would cover them. The cue is therefore a second line, in space that is always empty while a candidate waits for Confirm. It fits inside the panel with the longest candidate, "flat square pedestal at 0° (any turn fits) · Pedestal seat" (`c02`, `c03`, taken 5 s apart). `c01` also shows the label at its peak pale-green tint; `c02` and `c03` happened to catch it near rest.

**Other behavior is unchanged.** Every other text, control, and state transition is the same, and `testState()` gains a read-only `confirmCue` flag.

## 3. Regression

| Run | Code | Result | Evidence |
|---|---|---|---|
| State suite (21:30:23–21:30:32) | final | **pass=41 fail=0**: the 31 original checks, plus 10 new A9 cue checks (off with a piece only; on when staged; re-phased by an attachment change; off in correction, help, and pause; back after resume; stops on accept, undo, and replay). `assertBaseline` also requires the cue to be off after every Replay. | `validation/increment-15/logs/state-tests-final.log` |
| LEAF ×8 (21:30:45–21:32:59) | final | **8/8 passed, 220 checks, 0 failures**: dc1 24, dc2-recover 15, dc2-rotation 32, dc3 22, dc4-undo 16, dc4-replay 60, dc5-guards 24, dc5-full 27 | `validation/increment-15/logs/leaf-all-runs-final.log` |
| Earlier runs | one-line cue | State 41/41. LEAF first pass: dc3 **failed** one check (explained below). After the dc3 update: 8/8, 220. | `state-tests-one-line-cue.log`, `leaf-first-pass-dc3-fail.log`, `leaf-all-runs-one-line-cue.log` |

**Why dc3 failed on the first pass.** "Confirm, Turn, palette, Undo, Pause during help change nothing" compared the state during Help with a snapshot taken *before* Help opened, and that snapshot includes the status text. Opening Help now correctly removes the cue line, so the two snapshots differed even though no task state changed.

**The fix keeps the assertion honest.** Presses made during Help are now compared with the state just after Help opened. A new check asserts that the cue is off while Help is open. "Close help restores …" still compares with the pre-help snapshot and now also requires the cue to be back.

**dc1 has two cue checks:** the staged candidate shows the cue and the "Press Confirm to place" line, and the cue stops after accept.

**Check counts.** Increment 4 had 218 checks. This run has 220: one more in dc1 (the new cue check; the after-accept check was extended rather than added) and one more in dc3.

**No lens errors.** There was no `[Preview N]` E/W/F line in any run.

## Per-row results

| Row | Result | Note |
|---|---|---|
| A1–A8, A10 | Pass (unchanged) | The LEAF suite and state suite cover A1–A7 on `c602ee8`. A8's two human runs predate the cue. The cue does not change any accepted transition. |
| A9 | **Unverified** | 2 of 3 viewers observed on `525fb2a`. Operator-reported comprehension is Pass/Pass. The discoverability finding is shared (log-corroborated for viewer 1 only). The fix landed after their sessions. **Viewer 3 must test `c602ee8`+.** The exact questions are still owed. |
| A11 | Pass for Increment 15 | Packages unchanged (below) |
| A12 | Unverified | Unchanged |

**Matrix updates:** rows A9 and A11, plus the evidence record (project revision, operator and date).

## Checks

- **Packages:**
  - `sha256sum -c validation/increment-5/packages-end.sha256`: 8/8 OK.
  - `ListInstalledPackagesTool`: the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0).
- **Scene:** `runStateTests` was set on for the suite and back off with `scene-graphql`. `Assets/Scene.scene` has no diff.
- **`git status`:** only the pre-existing `.gitattributes`, `.gitignore`, and `jsconfig.json` modifications (Lens Studio line-ending rewrites), the untracked `increment-*-run.log` files, and `check-log.ps1`. None are part of this increment.
- **Tools:**
  - Used: `RecompileTypeScriptTool`, `RunAndCollectLogsTool`, `scene-graphql`, `list_leaf_scenarios`/`run_leaf_scenario`, `InjectPreviewGesture` (to stage candidates for the layout capture), `CapturePanelScreenshotTool`, `ListInstalledPackagesTool`.
  - No prohibited tool was used. There is no new tool or package proposal.
- **Feel unproven:** whether the pulse is noticeable enough, or too insistent, on real Specs is "feel unproven". Only viewer 3 and a device can tell.

## For Matthew's human re-check on `c602ee8`

1. Choose a piece and then an attachment. Confirm should pulse slowly, and the status should read "Press Confirm to place" on its own line.
2. Change the attachment or turn the piece: the pulse continues.
3. Open Help or Pause: it stops. Close or Resume: it returns.
4. Make a deliberately wrong Confirm: no pulse while the correction shows. It returns after you change something.
5. Accept, Undo, or Replay: it stops.

## Commits

- `3b4c3bb` test: extract A9 viewer 1 and 2 preview session logs
- `c602ee8` feat: pulse Confirm and prompt it while a candidate is staged
- A docs commit for the matrix update and this report (see `git log`)

No remote, no push.
