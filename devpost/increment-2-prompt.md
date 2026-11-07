# Increment 2 dispatch — interruption, undo, replay, completion

Read `devpost/build-handoff.md` first and follow it exactly, then `devpost/increment-1-report.md` for current state (Increment 1 is committed and passing under injection). Build on HEAD; do not refactor Increment 1 behavior that passes.

## Scope of this increment

1. **Help (A5):** explains the current authored piece, orientation, and attachment. Opening/closing never accepts a placement; closing returns to the same objective, with candidate and orientation preserved.
2. **Pause/Resume (A5):** unmistakable paused state; placement attempts blocked while paused; Resume restores accepted progress, current objective, selected candidate, and its orientation exactly.
3. **Undo (A6):** removes only the latest accepted placement, restores that step's instruction, clears candidate/feedback state; disabled at zero accepted placements; after completion, clears completion and reopens the final placement; re-placing the undone piece is a new placement. No Redo.
4. **Completion (A4):** appears only when all five placements and the visible assembly agree; offers Replay and Undo; does not imply physical inspection.
5. **Replay (A7):** from active work, correction, help, pause, and completion — clears progress, selection, orientation, help/pause state, completion, pending feedback; restores starting assembly and controls at the run's existing world location. Delayed callbacks from the previous run must not mutate the new task. Assembly must not teleport to the camera pose.
6. **Sequence integrity (A4):** each proper prefix incomplete; out-of-order targets do not advance; duplicate confirmation does not advance twice; a stale event from the preceding step cannot accept the current step.
7. **Polish from Increment 1 report:** stronger marker shape cue (arrowhead or visible tip), ghost preview not covering the target label, visually distinct disabled controls (esp. cannot-start state), success message not clobbered by "Pick a piece first", shorten marker-step messages or raise panel so Help text fits.
8. Guidance-panel crowding must be resolved before Help lands (report open issue).

## Validation

Use `InjectPreviewGesture` + `CapturePanelScreenshotTool` + `RunAndCollectLogsTool` with the coordinate mapping and two-tap protocol from Increment 1. For each of A4, A5, A6, A7: cover every minimum case listed in that matrix row, capture state snapshots in logs, and record Pass/Fail/Unverified + evidence paths in the matrix. A11 recheck: package inventory + git status at end.

## Deliverables

Working Preview behavior; commits with conventional titles; write `devpost/increment-2-report.md` (same structure as Increment 1: verdict, environment/gate checks, what changed with the state-machine design, runs table, matrix rows touched with evidence, defects found/fixed, open issues, untested surfaces, tool/package proposals). No remote, no push.
