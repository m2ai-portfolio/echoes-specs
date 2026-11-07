# Increment 8 dispatch — third Human Preview session extraction + A1 capture readiness

Read `devpost/build-handoff.md` first and follow it exactly. Context: Matthew performed a third Human Preview session on 2026-11-04 evening, after Increment 7's extraction (last human line 21:49:28; your own MCP window began 21:50:23). The session should cover, per the closing script: (1) a multi-error Confirm (e.g. marker on Right pad at step 1) for A2; (2) the A5 pause sequence (pick + turn a piece, Pause, Confirm while paused, Resume); (3) two complete runs each started by an operator Preview refresh, each containing a correction, Help open/close, Pause/Resume, an Undo, completion, and Replay, for A8. The A1 held-selection capture may or may not appear at the end — check for a sustained pre-Confirm hold; do NOT run any capture yourself unless this dispatch is explicitly re-sent with capture instructions. No lens code changes.

## Scope

1. Extract the new human window (verify bounds; expect roughly 21:55–22:17). Save to `validation/human-preview/logs/human-session-2026-11-04-3.log`. Same authenticity rules as Increments 6–7 (no MCP-driven activity in the window — note the Increment 7 agent's disconnect/commit times and exclude your own connection).
2. Classify every lens reset in the window: operator refresh vs editor OAuth timer (refreshes were ~21:55:29 and later at 50-minute intervals — verify from the editor boundaries).
3. Combine all three human sessions; update rows: A2 (multi-error), A5 (pause with rotated candidate + confirm-while-paused + resume), A8 (two operator-reset runs each with all six behaviors). Pass only if every case is present; name any gap.
4. A1: if a sustained pre-Confirm hold exists in the log, note its timestamp and whether any capture ran. The capture sub-case stays pending otherwise.
5. Update the matrix; write `devpost/increment-8-report.md` (short). Commit with conventional titles. No remote, no push.
