# Increment 20 dispatch — final rehearsal on publication candidate 89c8dd6

Read `devpost/build-handoff.md` first and follow it exactly. Context: the orchestrator force-pushed a corrected export to `m2ai-portfolio/echoes-specs` — `main` is now **single commit `89c8dd6`** (fresh orphan history), 262 tracked files: identical to `c939831`'s tree minus the 18 `increment-*-run.log` files and `check-log.ps1`, plus `jsconfig.json` force-added and `.gitignore` rules for the artifacts. Increment 16's leak-check failures should be resolved.

## Scope

1. **Fresh clone** of the remote (new folder `echoes-remote-rehearsal-final`). Verify: single commit in history; 262 tracked files; no run logs / check-log.ps1 tracked; LFS smudges; cue present; package hashes match.
2. **Leak check re-run** per Increment 19's four checks — all must pass now. Confirm history contains exactly one commit and its tree is clean.
3. **LEAF `dc5-full-story`** in the clone. Must pass.
4. **A12 evidence final state:** record everything done (recording Increment 18, remote rehearsals 18/19/20). Remaining: public visibility, YouTube, submission — Matthew's gates. Write `devpost/increment-20-report.md` (short). Commit. No push.
