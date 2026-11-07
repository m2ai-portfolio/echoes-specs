# Increment 20 public-tree leak check (pre-publication, final)

Target: fresh clone of `m2ai-portfolio/echoes-specs` (private) into `%USERPROFILE%\echoes-remote-rehearsal-final`. `git ls-remote` shows only `HEAD` and `refs/heads/main`, both `89c8dd6`. `git rev-list --all` returns **one commit** (`89c8dd6`, no parent), so the whole public history is this one tree (262 tracked files).

| Check | Result on `89c8dd6` |
|---|---|
| (a) `claude.ai/chat` URL with a conversation ID (`git grep -E "claude\.ai/chat/[A-Za-z0-9]"` over all commits) | **Pass.** None. 7 prose mentions of the bare string in the matrix, `increment-4-report.md`, `increment-5-prompt.md`, and `increment-5-report.md`, none with an ID |
| (b) `spk_debug_key.pem`, any `*.pem`, `.mcp.json`, `ls-live-instance.json`, `.claude/`, `.codex/`, `.cursor/`, `.env`, `*.key` tracked | **Pass.** None |
| (c) `increment-*-run.log` or `check-log.ps1` tracked | **Pass.** None tracked, and none among the reachable objects (`git rev-list --all --objects`). `.gitignore` now has `increment-*-run.log` and `check-log.ps1` rules |
| (d) `devpost/echoes-implementation-brief.md` line 187 | **Pass.** Shows `[private Claude conversation link removed, 2026-11-04]` |
| Credentials pattern scan (`ghp_`, `github_pat_`, `sk-`, `sk-ant-`, `AKIA`, `xox[bp]-`, private-key headers, `api_key=`, `password=`, `token=`, bearer) | None |
| E-mail addresses in file content | None |

Commit metadata: one author/committer identity (the release-candidate commit). It is public with the repo, by design.

Machine paths `C:\Users\<user>\…` in docs remain, accepted as development records by the Increment 5 ruling.
