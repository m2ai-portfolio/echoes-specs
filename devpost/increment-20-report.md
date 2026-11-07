# Increment 20 report: final rehearsal on publication candidate 89c8dd6

Date: 2026-11-07, America/Chicago, on AlienPC. Builder: Claude Code (claude-opus-5-5).
- Base: `471f4ea`. No lens code, scene, or package changes. No push; the repo's visibility is unchanged.

## Summary

- **All three checks passed.** The fresh clone is the single commit `89c8dd6` with 262 files and no run logs. The four leak checks all pass. `dc5-full-story` **PASSED 27/27** in the clone.
- **The Increment 19 findings are resolved:** the run logs are gone from the remote, and the history is one commit.
- **A12 stays Unverified, but only Matthew's gates are left:** making the repo public, the YouTube upload, and submission.

## 1. Fresh clone (`%USERPROFILE%\echoes-remote-rehearsal-final`, new folder)

| Check | Result |
|---|---|
| History | `git rev-list --all` returns only `89c8dd6 Echoes: Signal Arch v1 (release candidate)`, with no parent. `git ls-remote` lists only `HEAD` and `refs/heads/main`, both `89c8dd6`. The usual Git Credential Manager "unable to persist" warning appeared, and authentication worked |
| Files | 262 tracked. No `increment-*-run.log` or `check-log.ps1` in the tree or in any reachable object. `jsconfig.json` is tracked. `.gitignore` has the `increment-*-run.log` and `check-log.ps1` rules |
| LFS | 6 objects smudged (4.76 MiB). `git lfs fsck` OK |
| Cue | `EchoesController.ts:96` `CONFIRM_CUE_LINE = "\nPress Confirm to place"` |
| Hashes | All 8 `Packages/*` SHA-256 match `validation/increment-5/packages-end.sha256` and the working repo (`validation/increment-20/packages-remote-clone.sha256`, `packages-end.sha256`) |
| vs working tree | Every file matches apart from line endings, except two. `.gitignore` has the new rules. `echoes-acceptance-matrix.md` is the Increment 18 version. The remote also lacks the Increment 19–20 prompts, reports, and `validation/increment-19`. **Note for Matthew:** the public repo will not include this report or the Increment 19 and 20 records unless the export is refreshed. The lens code is not affected |

## 2. Leak check (`validation/increment-20/public-tree-leak-check.md`)

| Check | Result |
|---|---|
| (a) `claude.ai/chat` URL with a conversation ID | **Pass.** Prose mentions only |
| (b) `*.pem`, `.mcp.json`, `ls-live-instance.json`, `.claude/`, `.codex/` (also `.cursor/`, `.env`, `*.key`) tracked | **Pass.** None |
| (c) Run logs / `check-log.ps1` tracked | **Pass.** None |
| (d) Brief line 187 | **Pass.** Shows the redaction text |
| Credentials and e-mail addresses in file content | None. There is one commit identity in the metadata |

History is exactly one commit, so this tree is everything that would be published.

## 3. LEAF on the clone

- I opened the clone with Editor API `model.openProject` and read back the project file and `lensName = Echoes`. Lens Studio rebuilt `Cache/`.
- `RecompileTypeScriptTool` succeeded. The refresh logged `ECHOES start … variant=valid canStart=true` at 13:05:01, with no errors or warnings, and all 8 scenarios registered.
- `dc5-full-story` **PASSED**: `ECHOES leaf END dc5-full-story pass=27 fail=0` at 13:05:22.378, run 13:05:07–13:05:22. The log shows live `confirm-cue on/off` lines and no E or F lines. One W line came from the LEAF editor plugin when its panel opened after the project switch ("Skipping plugin state save…"). It is editor-side, not from the lens.
- Evidence: `validation/increment-20/logs/remote-clone-leaf-dc5-full-story.log` (265 lines). The one user path in it was rewritten to `%USERPROFILE%`.
- I reopened the original and read back `projectFile = %USERPROFILE%\Echoes\Echoes.esproj`.
- Side effects in the clone are line-ending rewrites only, in `.gitattributes`, `.gitignore`, `AGENTS.md`, and `jsconfig.json` (`git diff --ignore-cr-at-eol` is empty).

## 4. A12 final state

**Done:**
- Clean local clone rehearsal (Increment 4).
- Recording made and reviewed (Increment 18).
- Remote LFS rehearsals passed: Increment 18 (stale export), Increment 19 (`c939831`), and Increment 20 (`89c8dd6`, the publication candidate).
- Leak check: all pass on the single-commit history.

**Remaining (Matthew's gates):**
- Make the repo public.
- Upload the YouTube video (public).
- Submit to Devpost.

A12 stays **Unverified** until those are done.

## Package and status check

- `ListInstalledPackagesTool` shows the same 5 entries: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, and the known unnamed `3aa05179-…` 0.0.0. Working-repo package hashes are unchanged.
- `git status` shows the known line-ending rewrites of `.gitattributes`, `.gitignore`, `AGENTS.md`, and `jsconfig.json`, left uncommitted. `increment-19-run.log` and `increment-20-run.log` are left untracked.
- No package or tool was added. No prohibited tool was used. Lens Studio was not force-closed, and no cache or package code was patched.

## Matrix rows

| Row | Status | Change |
|---|---|---|
| A12 | **Unverified** | Final remote rehearsal on `89c8dd6`: 27/27, and the leak check passes. Only Matthew's gates remain |
| A1–A8, A10, A11 | Pass | Unchanged. A11 is reconfirmed (same packages and hashes) |
| A9 | Unverified | Unchanged |
