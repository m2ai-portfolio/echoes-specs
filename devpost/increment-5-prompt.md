# Increment 5 dispatch — release-candidate polish (small, final)

Read `devpost/build-handoff.md` first and follow it exactly, then `devpost/increment-4-report.md`. Build on HEAD (`8dbb1e8`).

## Orchestrator rulings

- Redact the private `claude.ai/chat/...` link in `devpost/echoes-implementation-brief.md` (replace with "[private Claude conversation link removed, 2026-11-04]"). Leave the 15 machine-local paths as development records. No history rewrite.
- **`PreviewPanelTool` approved** for exactly one purpose: switching a Preview panel to Interactive Preview and verifying the exact menu/control wording used in `devpost/run-instructions.md`. Fix the instructions to match the real UI wording. Nothing else without reporting.

## Scope

1. The link redaction above.
2. `PreviewPanelTool`: switch to Interactive Preview, read the actual menu path and wording, correct `devpost/run-instructions.md` where it differs. Confirm the demo walkthrough steps match the real controls.
3. Final regression: one `dc5-full-story` LEAF run on the final code, plus a clean Preview start with `taskVariant=valid`, `runStateTests=false` read back.
4. Confirm shipped state: `git status` clean except run logs; camera reset; packages unchanged.

## Deliverables

Commits with conventional titles; `devpost/increment-5-report.md` (short: what changed, wording verified, regression results, any residue). Update the matrix evidence record revision. No remote, no push, no recording.
