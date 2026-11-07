# Increment 6 dispatch — Human Preview evidence extraction

Read `devpost/build-handoff.md` first and follow it exactly. Context: Matthew performed a Human Preview session with the mouse in Interactive Preview on 2026-11-04, approximately 21:07–21:21 Central. All increments 1–5 are committed and passing; this increment changes NO lens code.

## Scope

1. Extract the human-session window from the current Lens Studio log (the same log file referenced in prior reports; the session starts after Increment 5's final clean start at 17:28:56 — human lines begin around 21:07). Save the full ECHOES extraction to `validation/human-preview/logs/human-session-2026-11-04.log` with the extract tool (it now matches any `[Preview N]`).
2. Reconstruct the session from the `ECHOES` state lines (start, select-piece, turn, select-target, attempt/verdict/mismatch, accepted counts, help/pause/undo/replay events, pose lines, refresh/lens-reset boundaries). Map it against the matrix minimum cases for A1, A2, A4, A5, A6, A8.
3. Mark each row **Pass only if every required case for that row is actually present in the human log** (A8 needs two complete fresh-reset runs including a correction, help, pause/resume, undo, completion, and replay each; A2 needs correct/wrong-target/wrong-piece/wrong-orientation/multi-error/rapid-repeat). If a case is missing, record what is present and keep the row Unverified with the gap named. Do not infer clicks that are not logged; distinguish human operation from any injected line by timestamp window.
4. If panel captures of the human session exist in the log (they likely do not — no capture tool was run), note their absence; the log plus Matthew's statement is the evidence, labeled "Human Preview, operator Matthew, 2026-11-04".
5. Update the matrix evidence record and rows; write `devpost/increment-6-report.md` (short: what the human session covered, per-row results with log line references, gaps if any). Commit with conventional titles. No remote, no push.
