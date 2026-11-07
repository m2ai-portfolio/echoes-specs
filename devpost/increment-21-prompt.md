# Increment 21 dispatch — repository README

Read `devpost/build-handoff.md` first and follow it exactly. No lens code, scene, or package changes.

## Scope

1. **Write `README.md` at the repo root** (working repo main). Content: use the draft below, polish wording, keep every factual claim exactly as written (they trace to acceptance evidence — do not strengthen any claim). Add: a **Screenshots** section embedding two real captures from `validation/` (the Increment 4 `a9-01-front-90cm.jpg` layout capture and Increment 2's `07-run2-completion-5-of-5.jpg` completion capture), and the generated hero image at the top once it exists (`docs/hero.png`).

2. **Generate a hero visual** (`docs/hero.png`, landscape ~1600×900): find an available image-generation capability on this machine and use the closest available to OpenAI GPT image:
   - Check for an OpenAI API key in the environment or Codex CLI config (`%USERPROFILE%\.codex\config*`, env `OPENAI_API_KEY`). If a key is usable for the image endpoint, call the OpenAI images API (model `gpt-image-1` or the newest available).
   - Else check for an installed image-gen skill (e.g. a Gemini/Nano Banana skill with a configured key) and use it.
   - Else: **do not fake it** — instead compose a clean hero from the two real captures side by side with a title band using ffmpeg/Python PIL, and say so in the report.
   - **Image prompt concept:** clean minimal tech illustration, dark background, a translucent AR-style heads-up display floating in space showing a small stylized brick arch being assembled — five glowing piece slots on a base plate, one piece highlighted with a soft pulse, a small guidance card reading "Press Confirm to place", the word **ECHOES** as a modern thin-wordmark title. No Snapchat/Snap logos, no Spectacles glasses imagery, no photoreal humans. Muted teal/mint accent on dark slate.
   - The image is a marketing visual, not a screenshot — that must be clear: caption it "Concept illustration — actual lens below".
3. **Commit** README + hero on working main with conventional title. Do NOT push — the orchestrator handles the public export.
4. Report which image path was used, key source (not the key itself), and the README diff summary. `devpost/increment-21-report.md`.

## README draft (polish, don't strengthen)

# Echoes

Echoes is a companion that stays beside your work. In this demonstration it guides you through assembling an original five-piece virtual brick model — the **Signal Arch** — in a SPECS Lens, putting the next instruction where the work happens.

- **Guided next action** — the current step, a pointer, and a staged-candidate prompt ("Press Confirm to place") sit beside the build.
- **Specific correction, zero loss** — a wrong piece, attachment, or orientation names the actual mismatch (target → piece → orientation) and never touches accepted work.
- **Interruption-safe** — Help never advances the task; Pause/Resume restores the exact state; Undo removes only the latest placement, even after completion; Replay resets cleanly with stale callbacks dropped.
- **Truthful completion** — the build finishes only when all five placements and the visible assembly agree: "Virtual check only: no physical model was inspected."

## What it is not

It says so on screen: "Virtual build demo · enlarged pieces · no physical bricks are recognized." No camera perception, no physical verification, no AI model in the loop — a deterministic authored task with zero network calls. Built and tested entirely in Lens Studio Preview; device comfort and hand tracking are untested (no SPECS device was available).

## Run it

See [devpost/run-instructions.md](devpost/run-instructions.md). Requires Lens Studio 5.23.2 and Git LFS.

## How it was verified

- 8 LEAF scenario suites — 220 checks, 0 failures, covering every done criterion
- 41-assertion in-lens state suite
- Clean-clone and remote clone-from-GitHub rehearsals, each running the full story
- Nine human Preview sessions by a first-time operator; uncoached-viewer comprehension testing (2-viewer sample, honestly recorded)

Full evidence trail: [devpost/echoes-acceptance-matrix.md](devpost/echoes-acceptance-matrix.md).

## How it was built

Lens Studio 5.23.2 (SPECS Base Template) with Claude Opus 5.5 as the coding agent through CLAD; Spectacles Interaction Kit, UI Kit, LEAF 2.0.2 — all disclosed in [devpost/asset-record.md](devpost/asset-record.md). Scope governed by the approved [devpost/design-brief.md](devpost/design-brief.md).

## License / rights

Original authored content; incorporated packages disclosed in the asset record. See [devpost/asset-record.md](devpost/asset-record.md).
