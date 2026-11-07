# Increment 19 report: re-rehearsal on the refreshed remote and public-tree leak check

Date: 2026-11-07, America/Chicago, on AlienPC. Builder: Claude Code (claude-opus-5-5).
- Base: `4216356`. No lens code, scene, or package changes.
- No push. The repo's visibility is unchanged.

## Summary

- **The remote re-rehearsal passed.** A fresh clone of `c939831` matches the working tree, Confirm cue included, so the Increment 18 stale-export finding is **resolved**. LFS and package hashes are good, and `dc5-full-story` **PASSED 27/27**.
- **Deviation: the remote has two commits, not one.** `c939831` sits on top of `9c1f996`, the stale export. Pushing the remote public would publish both.
- **Leak check (c) FAILS.** The remote tracks 18 `increment-*-run.log` files and `check-log.ps1`. Checks (a), (b), and (d) pass. No credentials were found.
- **A12 stays Unverified.** Open items: remove the run logs from the remote, decide on the history shape, then public visibility, YouTube upload, and submission (Matthew's gates).

## 1. Fresh clone

| Step | Result |
|---|---|
| Delete / clone | Checked that the old `%USERPROFILE%\echoes-remote-rehearsal` was the `9c1f996` clone, deleted it, and ran `git clone https://github.com/m2ai-portfolio/echoes-specs` into the same path. The Git Credential Manager "unable to persist" warning appeared, as in Increment 18. Authentication worked |
| History | `git log --oneline`: `c939831 Echoes: Signal Arch v1 - public export (release candidate)` and then `9c1f996 Echoes: Signal Arch v1 - public export`. **Two commits.** The dispatch expected the single commit `c939831` |
| Tree | 281 tracked files. Compared with the working repo, every tracked file is the same apart from line endings (`diff --strip-trailing-cr`). The only file missing from the clone is the newer `devpost/increment-19-prompt.md` |
| LFS | 6 objects smudged on checkout (4.76 MiB). `git lfs fsck` OK. `SpectaclesInteractionKit.lspkg` is 1,928,577 bytes |
| Confirm cue | `EchoesController.ts` has `CONFIRM_CUE_LINE = "\nPress Confirm to place"` (line 96) |
| Hashes | All 8 `Packages/*` SHA-256 match `validation/increment-5/packages-end.sha256` and the working repo (`validation/increment-19/packages-remote-clone.sha256`, `packages-end.sha256`) |

## 2. LEAF on the clone

- **Open:** Editor API `model.openProject` on the clone; read back `projectFile` = clone, `lensName = Echoes`. With no `Cache/`, Lens Studio rebuilt it.
- **Compile and start:** `RecompileTypeScriptTool` succeeded. The refresh at 12:58:24 logged `ECHOES start … variant=valid canStart=true`, the initial state Step 1, and no errors or warnings. All 8 scenarios registered. The log line `EchoesController.ts:1204` matches the current code (Increment 18's stale remote logged `:1144`).
- **LEAF:** `open_leaf_panel`, then `dc5-full-story` **PASSED**: `ECHOES leaf END dc5-full-story pass=27 fail=0`, 12:58:47.097, run time 16.4 s. Live `ECHOES confirm-cue on … / off` lines show the cue running in the clone's code. No E or F lines appeared. Evidence: `validation/increment-19/logs/remote-clone-leaf-dc5-full-story.log` (225 lines).
- **Return:** reopened the original and read back `projectFile = …/Echoes/Echoes.esproj`.
- **Clone side effects:** line-ending rewrites only, in `.gitattributes`, `.gitignore`, `AGENTS.md`, and `jsconfig.json` (`git diff --ignore-cr-at-eol` is empty). Generated `spk_debug_key.pem` and `.mcp.json` are not tracked.
- **No panel capture this increment.** The log line is the evidence.

## 3. Public-tree leak check

The full record is `validation/increment-19/public-tree-leak-check.md`. I scanned both commits, because history becomes public with the repo.

| Check | Result |
|---|---|
| (a) `claude.ai/chat` URL | **Pass.** No URL with a conversation ID. Only prose mentions of the bare string |
| (b) `spk_debug_key.pem`, `.mcp.json`, `ls-live-instance.json`, `.claude/`, `.codex/` tracked | **Pass.** None, and no other `*.pem`, `.cursor/`, `.env`, or `*.key` either |
| (c) `increment-*-run.log` tracked | **FAIL.** `c939831` tracks `increment-1-run.log` … `increment-18-run.log` and `check-log.ps1`. They came from the local export commit `1732743`; `9c1f996` does not have them. `.gitignore` has no rule for them |
| (d) Brief line 187 | **Pass.** Shows `[private Claude conversation link removed, 2026-11-04]` |
| Other | No credential patterns, e-mail addresses, or account identifiers in file content. The only URL in the logs is `http://localhost:50040/mcp`. The A9 viewers are anonymous. Machine paths are present, as accepted by ruling |

**What else should not go public (for decision):**
1. The run logs and `check-log.ps1` from (c). They hold builder chat summaries and a log-tail helper, with no secrets. One log names the Windows username in a path. The fix is a remote change, which I did not make. Options: re-export without them, or add a removal commit (history would keep them unless re-exported), plus a `.gitignore` rule such as `increment-*-run.log`.
2. **The two-commit history.** The parent `9c1f996` is the stale export. If the public repo should show only the release candidate, it needs an orphan single-commit export.
3. **Two author identities.** The two commits carry different author names and e-mail addresses in their metadata. Both become public. This is not a defect; it only needs a deliberate choice.

## Package and status check

- `ListInstalledPackagesTool`: the same 5 entries. SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, and the known unnamed `3aa05179-…` 0.0.0.
- Working-repo package hashes are unchanged.
- `git status`: the known line-ending rewrites of `.gitattributes`, `.gitignore`, `AGENTS.md`, and `jsconfig.json` are back after reopening and are left uncommitted. `increment-19-run.log` is left untracked.
- No package or tool was added. No prohibited tool was used. Lens Studio was not force-closed, and no cache or package code was patched.

## Matrix rows

| Row | Status | Change |
|---|---|---|
| A12 | **Unverified** | Remote rehearsal re-run on the refreshed export: PASSED 27/27, and the stale-export finding is resolved. The recording was reviewed in Increment 18. Leak check (c) fails. **Open:** run logs on the remote, history shape, then public visibility, YouTube upload, and submission (Matthew's gates) |
| A1–A8, A10, A11 | Pass | Unchanged. A11 is confirmed (same packages and hashes) |
| A9 | Unverified | Unchanged |

LEAF this increment: `dc5-full-story` on the remote clone, PASSED 27/27. No other row was touched.
