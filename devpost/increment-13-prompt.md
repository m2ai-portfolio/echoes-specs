# Increment 13 dispatch — A8 final run extraction (session 8)

Read `devpost/build-handoff.md` first and follow it exactly. Context: Matthew performed the closing Human Preview run after Increment 12's window (ended 23:10:39, your MCP connect; last human line 23:10:08). Expecting one more operator-reset (↻) run with all six behaviors (correction, Help open/close, Pause/Resume, Undo, completion, Replay last). Run C (23:08:34, session 7) is already complete; this should be the second. OAuth timer fires 23:35:29 — if it appears, classify it and check whether any run it split is still complete.

## Scope

1. Extract human activity from Increment 12's cutoff to now → `validation/human-preview/logs/human-session-2026-11-04-8.log`. Same authenticity rules.
2. Classify resets; evaluate the new run(s) against the six behaviors.
3. A8: Pass if two complete operator-reset runs exist across all sessions (run C plus this one); otherwise name the gap.
4. If A8 passes: write the closing note — all locally-testable matrix rows closed; outstanding: A9 three fresh viewers (Unverified until humans observe), A12 recording under 3 minutes / public repo / remote LFS rehearsal / submission, all separately authorized. Update evidence record fully (final operator date, project revision, evidence index). Write `devpost/increment-13-report.md`. Commit. No remote, no push.
