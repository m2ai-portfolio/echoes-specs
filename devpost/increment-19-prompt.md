# Increment 19 dispatch — re-rehearsal on refreshed remote + public-tree leak check

Read `devpost/build-handoff.md` first and follow it exactly. Context: the remote `m2ai-portfolio/echoes-specs` (private) was force-pushed to `c939831` — a fresh single-commit export of the current working tree (281 files), including the Confirm cue, devpost/increment-15–18, A9 viewer evidence. Orchestrator pushed from ProBook; no AlienPC git state changed.

## Scope

1. **Delete and re-clone** `C:\Users\matth\echoes-remote-rehearsal` fresh from GitHub (or clone to `...-2` if delete is uncomfortable; prefer a clean clone). Verify: `git log --oneline` shows the single commit `c939831`; LFS objects smudge on checkout; `EchoesController.ts` contains the Confirm cue; Packages sha256 match.
2. **LEAF `dc5-full-story`** in the clone, open via Editor API as before. Must PASS 27/27 (or the updated count).
3. **Public-tree leak check** (pre-publication): on the clone, confirm (a) no `claude.ai/chat` URL anywhere; (b) no `spk_debug_key.pem`, `.mcp.json`, `ls-live-instance.json`, `.claude/`, `.codex/` tracked; (c) no increment `*-run.log` tracked; (d) `devpost/echoes-implementation-brief.md` line 187 shows the redaction text. Report anything else that should not go public (private usernames in machine paths are accepted per ruling; flag only genuinely sensitive content).
4. **Update A12** evidence: remote rehearsal on refreshed export; recording already reviewed in Increment 18. Remaining: public visibility, YouTube upload, submission (Matthew's gates). Write `devpost/increment-19-report.md` (short). Commit. No push.
