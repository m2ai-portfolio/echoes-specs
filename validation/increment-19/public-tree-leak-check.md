# Increment 19 public-tree leak check (pre-publication)

Target: fresh clone of `m2ai-portfolio/echoes-specs` (private), HEAD `c939831`, 281 tracked files. Both commits reachable from HEAD were scanned (`c939831` and its parent `9c1f996`), because a public repo exposes its history.

| Check | `c939831` (tip) | `9c1f996` (parent) |
|---|---|---|
| (a) `claude.ai/chat` URL with a conversation ID (`git grep -E "claude\.ai/chat/[A-Za-z0-9]"`) | None. 9 prose mentions of the bare string (matrix, increment-4/5 reports and prompt, `increment-4/5-run.log`), none with an ID | None |
| (b) `spk_debug_key.pem`, any `*.pem`, `.mcp.json`, `ls-live-instance.json`, `.claude/`, `.codex/`, `.cursor/`, `.env`, `*.key` tracked | None | None |
| (c) `increment-*-run.log` tracked | **FAIL: 18 files** (`increment-1-run.log` … `increment-18-run.log`), plus `check-log.ps1` | None |
| (d) `devpost/echoes-implementation-brief.md` line 187 | Shows `[private Claude conversation link removed, 2026-11-04]` | Same |
| Credentials pattern scan (`ghp_`, `github_pat_`, `sk-`, `sk-ant-`, `AKIA`, `xox[bp]-`, private-key headers, `api_key=`, `password=`, `token=`, bearer) | None | None |
| E-mail addresses in file content | None | None |
| URLs in logs | Only `http://localhost:50040/mcp` (local MCP server start line) | — |
| Account identifiers in extracted Lens Studio logs (user id, username, session/refresh tokens) | None. One line `MyLenses Authorization: Avatar URL is empty` (no identifier) | — |
| A9 viewer record | Viewers are anonymous ("viewer 1/2"); no names | — |
| Machine paths `C:\Users\<user>\…` | Present in 16 files (docs, `increment-4-run.log`, editor-boundary log extracts) | Present |

Machine paths are accepted as development records by the Increment 5 ruling.

## Findings

1. **(c) fails: run logs are tracked on the remote.** The 18 `increment-*-run.log` files and `check-log.ps1` entered through the local export commit `1732743` (2026-11-07 12:54) and are in the remote tip `c939831`. They are not in `9c1f996`. `.gitignore` has no rule for them. Their content is the builder's end-of-increment chat summaries (51 KB total). The scan found no credentials in them. They do name the Windows username in one path (`increment-4-run.log:17`) and refer to the private link only in prose. They are not secret, but the dispatch lists them as must-not-publish. Remediation needs a new export or a removal commit on the remote, plus a `.gitignore` rule. That is a push, so it is the orchestrator's or Matthew's gate. The builder did not change it.
2. **History is not a single commit.** The dispatch expected one commit, `c939831`. The remote has two: `c939831` ("public export (release candidate)") has the parent `9c1f996` ("public export"), the stale Increment 18 export. So the older export would also become public. Neither commit contains the private link or secrets. If a single-commit public history was intended, the remote needs an orphan re-export.
3. **Commit metadata:** the two commits carry two different author identities (different names and e-mail addresses). Both would be visible in public commit metadata. This is normal for GitHub. It is noted only so the choice is deliberate.
