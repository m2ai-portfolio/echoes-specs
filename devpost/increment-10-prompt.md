# Increment 10 dispatch — live A1 capture, then A8 operator-refresh runs

Read `devpost/build-handoff.md` first and follow it exactly. Two jobs, in order.

## Job 1 — live A1 capture (do this first, immediately)

1. Poll the current Lens Studio log (tail) every ~5 s for up to **20 minutes**, watching for a human pre-Confirm hold: a `select-target` (or later) ECHOES line with `piece` and `target` both set, followed by no Confirm/turn/undo/replay for 15+ seconds. The next editor OAuth reset is at **23:35:29** — if it arrives, the hold is lost; report and stop waiting.
2. The moment a hold is detected (piece + target set, ≥15 s quiet), run `CapturePanelScreenshotTool` once and save to `validation/human-preview/captures/a1-human-hold-candidate-target-instruction.png`. Verify the capture shows the candidate card, the target ghost/label, and the instruction text together; if it does not, take one more capture.
3. Record the hold's log lines and the capture in the evidence trail. If 20 minutes pass with no hold, report that and move to Job 2 anyway.

## Job 2 — A8 extraction

After Job 1, extract any further human activity in the log since Increment 9's window (22:46:43 onward) to `validation/human-preview/logs/human-session-2026-11-04-5.log` (same authenticity rules; classify resets — operator refresh vs OAuth at 23:35:29). Look for two operator-refresh runs each containing all six behaviors (correction, Help open/close, Pause/Resume, Undo, completion, Replay). Update A8 accordingly, Pass only if complete; name gaps.

Update the matrix; write `devpost/increment-10-report.md` (short). Commit with conventional titles. No remote, no push.
