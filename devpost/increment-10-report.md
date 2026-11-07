# Increment 10 report: live A1 capture and fifth Human Preview session

Builder: Claude Code (claude-opus-5-5), 2026-11-04 (America/Chicago). Governing documents: `devpost/build-handoff.md` and `devpost/increment-10-prompt.md`. No lens code, scene, or package change. HEAD during the session was `e87a586`, and lens code and scene are unchanged since `f5fb804`.

## Verdict

- **A1 moves to Pass.** A live human pre-Confirm hold was captured.
- **A8 stays Unverified.** There was no reset of any kind in the window, so there are no new operator-refresh runs.

## Job 1: live A1 capture

- **Watch:**
  - This agent connected at 22:49:21.
  - A watcher polled the editor log every 3–5 s, from 22:49:49, with a 20-minute limit.
  - Trigger: the latest state shows `mode=active overlay=none` with `piece` and `target` both set (non-null), followed by at least 15 s without any non-hover ECHOES line.
  - Correction: the first watcher version also matched `target=null`. It was stopped and fixed at 22:52:37, before it fired. The fixed version ran from 22:52:43.
- **Hold:** run 1, the same lens instance since the 22:45:30 OAuth reset.
  - 22:52:27.115: pillar selected (`human-session-2026-11-04-5.log` lines 2–4).
  - 22:52:33.295: Left pad chosen, through SIK `touch-start` → `trigger-start` → `select-target` (lines 7–10). State: `piece=pillar rot=0 target=left-pad`, 0 placed.
  - The next ECHOES line is a hover at 22:53:10.712 (line 11). No Confirm, turn, undo, or replay came in between.
- **Capture:**
  - The hold was detected at 22:52:48, and `CapturePanelScreenshotTool` (Preview 3) ran once at 22:52:50, 17 s into the live hold.
  - Saved as `validation/human-preview/captures/a1-human-hold-candidate-target-instruction.png` (2028×1590, re-encoded to PNG from the tool's JPEG).
  - All of the following are visible together:
    - the candidate card ("Candidate · Pillar · Turned 0°")
    - the Left pad ghost with `[ Left pad ]` and its arrow
    - the instruction "Put a square pillar on the left pad."
    - the status line "Chosen: square pillar at 0° (any turn fits) · Left pad"
    - progress "Step 1 of 5 · 0 placed"
  - The "Virtual build demo" disclosure is also visible. No second capture was needed.
- **Result:** every A1 sub-case now has Human Preview evidence: a correct placement (session 1), a deliberate wrong orientation (session 2), and this capture.

## Job 2: A8 extraction

- **Extraction:**
  - Command: `validation/tools/extract-echoes-log.sh <log> 7897862 validation/human-preview/logs/human-session-2026-11-04-5.log 22:46:43 22:53:12`. Byte 7897862 is the Increment 9 agent's MCP connect.
  - Output: 11 lines.
  - Editor events: `human-session-2026-11-04-5-editor-boundaries.log`.
- **Resets:** none in the window. There is no `Lens has been reset` line and no OAuth line. The next scheduled OAuth reset is 23:35:29.
- **Authenticity:**
  - MCP activity in the window:
    - 22:47:31: the Increment 9 agent's package lookups.
    - 22:49:21: this agent connected.
    - 22:49:53: this agent's `ListInstalledPackagesTool` call.
    - 22:52:50: this agent's capture.
  - None of these touched lens state. There was no injection and no LEAF run.
  - No `[Preview N]` E/W/F line and no lens network line appeared.
- **Behaviors:** the only human input is the A1 hold. There is no correction, Help, Pause/Resume, Undo, completion, or Replay.
- **A8 gap (unchanged):** across sessions 1–5, there is one operator reset (21:48:16) and there are three OAuth resets (21:05:29, 21:55:29, 22:45:30). No operator-reset run contains all six behaviors.
- **After the cutoff:** the operator kept interacting after 22:53:12 (Left pad re-chosen at 22:53:31.963 in run 1, no reset). That activity is outside this extraction.

## Per-row results

| Row | Result | Evidence / gap |
|---|---|---|
| A1 | **Pass** | Capture above, plus session 5 log lines 2–10 and the evidence from sessions 1–2 |
| A8 | Unverified | Needs two runs, each started by an operator Preview refresh and each containing a correction, Help open/close, Pause/Resume, Undo, completion, and Replay |

**Other rows:**
- A2–A7 stay Pass. Session 5 is consistent with them.
- A9–A12 are untouched. A9 still needs viewers and A12 still needs recording and the remote.

## Checks

- **Packages:**
  - `sha256sum -c validation/increment-5/packages-end.sha256` gives 8/8 OK.
  - `ListInstalledPackagesTool` shows the same 5 entries (unnamed 0.0.0, Bitmoji 3D 10.0.1, LEAF 2.0.2, SIK 2.0.0, UIKit 2.0.0).
- **`git status`:** only the pre-existing untracked `increment-*-run.log` files and `check-log.ps1`, plus this increment's files.
- **Tools:** `CapturePanelScreenshotTool` (once), `ListInstalledPackagesTool`, and log file reads. No prohibited tool, no injection, no LEAF run, no Preview change. No new tool or package proposal.

## To close A8

Refresh Preview yourself, away from 23:35:29 (and every 50 minutes after it). Then do one run with a correction, Help open/close, Pause/Resume, Undo, completion, and Replay. Repeat after a second refresh you make yourself, and note both refresh times.

No remote, no push.
