# Increment 15 dispatch — Confirm-pulse fix + viewer session extraction

Read `devpost/build-handoff.md` first and follow it exactly. Context: A9 viewer testing has begun. Two fresh viewers (uncoached) tested on 2026-11-06, sitting down ~21:05 and ~21:07 (consecutive, done by ~21:12). Both tripped on the same discoverability gap: after selecting a piece and clicking a target (ghost staged), neither pressed Confirm — they expected the target click to place the piece. Both self-recovered via Help unaided, and both passed the A9 comprehension criteria (named the next action; said no work was lost). Matthew has approved a Confirm-pulse fix.

## Scope

1. **Extract the two viewer sessions** from the Lens Studio log (window ~21:00–21:15 on 2026-11-06) to `validation/a9-viewers/logs/viewer1-2026-11-06.log` and `viewer2-...log`. Same authenticity rules (no MCP in window; human touch pattern). Record their actual click sequences: what they selected, whether/were they staged a target without confirming, how long until they found Confirm, whether they used Help. Save as A9 viewer evidence with revisions noted (they tested on HEAD `525fb2a`).
2. **Record viewers 1 and 2 in the matrix** A9 row: uncoached comprehension results (pass/pass on next-action and preserved-work criteria), the shared discoverability finding, self-recovery via Help, and the tested revision.
3. **Implement the Confirm-pulse fix:** when a piece AND target are both staged (ghost visible, awaiting Confirm), pulse/highlight the Confirm button (e.g., gentle scale or alpha oscillation around 1–2 Hz, restrained per the brief's no-flashing rule) and/or extend the status line to "Chosen: … · press Confirm to place". Keep it subtle; stop the pulse on any state change (accept, undo, target change, replay). No other behavior changes.
4. **Regression:** full LEAF suite (8 scenarios) and the 31-assertion state suite on the new code; packages check; note the new revision. Any LEAF scenario that asserts on the status line text may need updating — keep assertions truthful to the new text.
5. Update the matrix: A9 viewer entries + note that viewers 1–2 tested pre-fix revision; the fix lands post their sessions; a third viewer will test post-fix. Write `devpost/increment-15-report.md`. Commit with conventional titles. No remote, no push.

Matthew will then run a quick human re-check of affected touchpoints on the new revision and bring viewer 3.
