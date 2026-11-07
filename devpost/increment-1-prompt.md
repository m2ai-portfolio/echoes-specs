# Increment 1 dispatch — first placement gate

Read `devpost/build-handoff.md` first and follow it exactly: it names the approved brief (`devpost/design-brief.md`), the acceptance matrix (`devpost/echoes-acceptance-matrix.md`), precedence, prohibited/allowed validation tools, and package discipline. The museum implementation brief is historical.

## Scope of this increment

1. Author the Signal Arch v1 task data (identity/version, base geometry, five placements: left pillar, right pillar, beam, pedestal, marker; valid pieces, targets, rotations per placement) in the existing SPECS Base Template project.
2. Implement the core interaction loop with SIK/UIKit, mouse-operable in desktop Preview: select candidate from palette → explicit 90° turn controls around upright axis → choose attachment target → confirm. Candidate and its orientation stay visible before confirmation.
3. Implement placement validation with authored rules, including beam symmetry (0°/180° valid, 90°/270° invalid) and correction messages naming the actual mismatch (priority: target → piece → orientation), never color-alone.
4. Layout defaults from the brief (cm): build 90 cm ahead, 15 cm below eye level; guidance panel ~28×8 cm 12 cm above build; palette 16×18 cm 27 cm left; staging 10×10 cm 24 cm right; controls below build with ≥4 cm gap; targets ≥5×5 cm with ≥1.5 cm spacing. Additive display: light readable text, no dark-anchored content.
5. Validate: one complete correct end-to-end placement and one deliberate wrong orientation attempt via `InjectPreviewGesture`, captures with `CapturePanelScreenshotTool`, logs with `RunAndCollectLogsTool`. This is the brief's first implementation gate.

## Not in this increment

Help, Pause/Resume, Undo, Replay, completion, LEAF scenario suites (A4–A9). Do not build them yet. If the placement gate fails with the explicit controls, simplify the controls while preserving meaningful choice and report before expanding.

## Deliverables

- Working Preview behavior as above; commit(s) with conventional titles; report: what changed, commit hash, evidence file paths (captures/logs), matrix rows touched (A1, A2 partial, A3 partial), what remains untested, and any tool/package proposal. No remote, no push, no force-close, no package patching.
