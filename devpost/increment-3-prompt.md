# Increment 3 dispatch — LEAF suites, A7 camera case, A9 captures

Read `devpost/build-handoff.md` first and follow it exactly, then `devpost/increment-2-report.md` for current state. Build on HEAD (`22ea79b`); do not refactor passing behavior.

## Orchestrator rulings for this increment

- **`MovePreviewCamera` is approved** for exactly one purpose: the A7 "move the view before Replay" case. Use it nowhere else without reporting first. All other handoff restrictions unchanged.
- Layout side-column arrangement is approved and recorded.
- A6 remains Unverified until Human Preview; do not mark it Pass.

## Scope

1. **LEAF scenario suites for each of the five done criteria** in the brief (place next piece; recover from specific mistake; interrupt and return; undo and start again cleanly; finish truthful repeatable demonstration). Use LEAF 2.0.2 and the `DefaultLeafInteractor.trigger` path proven at setup (avoids injection coordinate mapping). Cover the matrix minimum cases that LEAF can express: A1 selection/orientation/attempt path, A2 four cases + multi-error + rapid repeat, A3 beam 0/180 valid vs 90/270 invalid plus remaining symmetric pieces' declared sets (pillar and pedestal rotations, marker 90/270 rejections), A4 sequence guards, A5 help/pause, A6 undo states, A7 replay-from-each-state. Run them in Preview; record pass/fail per scenario. Say which done criteria have no LEAF test and why.
2. **A7 camera case:** with `MovePreviewCamera`, move the view, Replay, compare logged `pose` lines — assembly must not move to the camera.
3. **A9 capture portion:** captures and actual cm measurements of panel text and targets at 60, 90, and 120 cm, front view and a modest side view exposing the attachment. Record the em vs cap-height measurement so the 1.2 cm question can be decided with evidence. The fresh-viewer portion of A9 stays Unverified (humans, later).
4. **A8 partial:** two full runs from fresh Preview resets via your automated path with logs retained (the Human-Preview half of A8 stays open); save/reopen the project and repeat one representative placement + replay check.

## Deliverables

Commits with conventional titles; `devpost/increment-3-report.md` in the same structure as prior reports (verdict, gate checks including package hashes, what changed, runs, matrix rows touched with results and evidence paths, defects fixed, open issues, untested surfaces, tool/package proposals). Update the matrix evidence record for every row touched. No remote, no push.
