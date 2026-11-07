# Increment 4 dispatch — packaging, name, run instructions, small fixes

Read `devpost/build-handoff.md` first and follow it exactly, then `devpost/increment-3-report.md`. Build on HEAD (`65e49a1`); do not refactor passing behavior.

## Orchestrator rulings (record these in the matrix evidence record)

- Text height: **em-square interpretation** rules. Essential text = instruction, progress, correction/help (all ≥ 1.2 cm em). Cap-height measurements and angular sizes stay recorded as evidence and as a disclosed limitation in claims text.
- Primary working distance: **90 cm**. The 60 cm constrained-view finding is recorded as a limitation.
- `MovePreviewCamera` is **approved for A9 view captures** (including pitched/head-turned views). Still nothing else without reporting.

## Scope

1. **Small fixes from Increment 3:** raise the right control column 3–4 cm (or otherwise stop the base covering Confirm from a 25° side view); add ≈0.3 cm spacing between UIKit plates so the visible gap meets 1.5 cm; with `MovePreviewCamera`, recapture the side views and a look-down 60 cm view to confirm the fixes and close the A9 capture set.
2. **A12 packaging:**
   - Project/lens named **Echoes** everywhere a user sees it (project display name, any template-named surfaces). No rename of internal package files that would break the template.
   - Accurate run instructions: how to open `Echoes.esproj` in Lens Studio 5.23.2, enter SPECS Preview, and operate the demo (controls list). Write to `devpost/run-instructions.md`.
   - Asset/license record: `devpost/asset-record.md` — original authored assets, incorporated template (SPECS Base Template), packages (Bitmoji 3D, Leaf, SIK, UIKit) and their roles, and a statement that no third-party music/imagery/branding is used. Disclose the enlarged-geometry choice and virtual-only validation in the same record.
   - **Clean local clone rehearsal:** clone the repo (or copy the tree) to a fresh directory outside the working repo, open the clone in Lens Studio 5.23.2, run `dc5-full-story` LEAF scenario in the clone, confirm the full task is available. Record the clone path, steps, and result. Do not delete the clone; put it under `C:\Users\matth\Echoes-clean-rehearsal` or similar.
   - Confirm no secrets or machine-local links in tracked files (scan for tokens, absolute paths outside the repo, private URLs).
3. **Regression:** after the fixes, re-run `dc5-full-story` and the state suite (31 assertions) on the final code; record results.

## Deliverables

Commits with conventional titles; `devpost/increment-4-report.md` in the standard structure; matrix updates for every row touched (A9 capture set, A12 partial/Pass-as-far-as-authorized, A11 recheck). Note plainly which A12 items (recording, remote distribution) remain Unverified and why. No remote, no push, no video recording.
