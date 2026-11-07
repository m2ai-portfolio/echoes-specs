# Increment 21 report: repository README

- Base: `438c5f0`. Work commit: `45aed87` (`docs: add repository README and hero image`). This report is committed separately.
- This increment made no lens code, scene, or package changes. Nothing was pushed, and no remote was touched.

## What changed

| File | Change |
|---|---|
| `README.md` (new) | Polished version of the dispatch draft. Adds the hero image and a **Screenshots** section |
| `docs/hero.png` (new) | 1600×900 hero, composed from two real Preview captures (see below) |
| `docs/make-hero.ps1` (new) | Script that regenerates `docs/hero.png` from the repo root |

### README diff summary

- Every factual claim from the draft is kept, and none is strengthened. Edits were wording only: em-dash clauses became full sentences, and some list items became sentences ("You need…", "A 41-assertion…").
- The "8 LEAF scenario suites: 220 checks, 0 failures", "41-assertion", "Nine human Preview sessions", "2-viewer sample", "zero network calls" (now "makes no network calls"), and "untested" device-comfort claims are unchanged in substance.
- Added a **Screenshots** section embedding `validation/increment-4/captures/a9-01-front-90cm.jpg` and `validation/increment-2/captures/07-run2-completion-5-of-5.jpg`. Both are plain git files, not LFS, so they render on GitHub.
- Added the hero at the top with a truthful caption (see the deviation below).
- All relative links resolve: `devpost/run-instructions.md`, `devpost/echoes-acceptance-matrix.md`, `devpost/asset-record.md`, `devpost/design-brief.md`. The README and script contain no absolute user paths.

## Hero image: which path was used

Each option in the dispatch's decision tree was checked in order:

1. **OpenAI key.** No usable key was found. `OPENAI_API_KEY` is not set in the Process, User, or Machine environment. The Codex CLI config (`~/.codex/config.toml`, `~/.codex/auth.json`) has `OPENAI_API_KEY: null`. Codex is signed in with ChatGPT OAuth tokens, not an API key, so those tokens were not used against the Images API. The Codex `imagegen` skill's CLI path also requires `OPENAI_API_KEY`, and its built-in `image_gen` tool exists only inside Codex.
2. **Installed image-gen skill with a configured key.** The `banana-squad` skill (Gemini 3 Pro Image) is installed, but `GEMINI_API_KEY` is not set in any environment scope and no `.env` holds it. The skill is unusable.
3. **Fallback.** The hero is composed from the two real captures side by side, under a title band (thin "E C H O E S" wordmark, mint accent on dark slate). Pillow is not installed in any local Python, and ffmpeg is absent. Rather than install a package, I used .NET `System.Drawing` through Windows PowerShell 5.1, which ships with the OS. Script: `docs/make-hero.ps1`.

**Key source:** none. No API key was found or used.

**Deviation from the dispatch caption:** the dispatch's caption "Concept illustration — actual lens below" applies only to a generated marketing visual. This hero is made of real Preview captures, so that caption would be false. The README instead says: "Hero image built from two real Lens Studio Preview captures. It is not an AI or concept illustration." If a generated concept hero is wanted later, replace `docs/hero.png` and restore the dispatch caption.

### Surfaced tool proposals (not used; orchestrator decision)

- **Higgsfield MCP connector** (`generate_image`, default model `gpt_image_2_6`). It is listed as a deferred connector in this session, but it is a paid remote service and is not on this machine. Using it would be an unapproved additional tool.
- **Lens Studio `GenerateTexture` MCP tool.** It writes into the Lens project, which is outside this increment's no-lens-change scope.
- **Installing Pillow** (a local Python package) to compose the hero. It was not needed, because System.Drawing was enough.

## Package and status check

- `ListInstalledPackagesTool` shows the same 5 entries: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, and the known unnamed `3aa05179-…` 0.0.0. No package was added or changed.
- `git status` before and after shows only the same pre-existing items, which this increment left alone and did not commit: modified `.gitattributes`, `.gitignore`, `AGENTS.md`, `jsconfig.json`, and untracked `increment-19/20/21-run.log`.
- No prohibited tool was used. Lens Studio was not force-closed, and no cache or package code was patched.

## Matrix rows

| Rows | Status |
|---|---|
| A1–A8, A10, A11 | Pass. Unchanged; this increment changed documentation only |
| A9, A12 | Unverified. Unchanged |

No LEAF or scenario runs were needed because no lens behavior changed. Submission steps (public repo, YouTube video, Devpost submission) remain Matthew's and the orchestrator's gates.
