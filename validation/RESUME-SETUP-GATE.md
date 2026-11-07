# Resuming the Echoes setup gate

> Superseded: the gate passed on Lens Studio 5.23.2 on 2026-11-03. See `validation/setup-gate.md`. Kept for history.

`C:\Users\matth\echoes-handoff\SETUP-GATE.md` is still the authority. Read `validation/setup-gate.md` for what already happened. These are additions, not replacements.

## Matthew, before starting Claude (about two minutes)

1. Open Lens Studio from the Start menu and open `C:\Users\matth\Echoes\Echoes.esproj`.
   - If it will not open, stop. That is now the blocker, and Claude needs to know exactly what you saw.
2. Click sign-in once. Note whether a browser opens, what it shows, and whether Lens Studio stays open.
3. Leave Lens Studio open, whatever happened with sign-in.
4. Start a new Claude Code session in `C:\Users\matth\Echoes` on `claude-opus-5-5`, and paste:

> Read validation/RESUME-SETUP-GATE.md and validation/setup-gate.md, then follow C:\Users\matth\echoes-handoff\SETUP-GATE.md from step 3. Sign-in result: [what you saw].

## Claude, rules for this run

**Tools**
- Do not use `QueryRuntimeSceneTool` or `PreviewInteractTool`. Both depend on the AiPreviewAgent package, and this project's `.claude/settings.local.json` denies them. Treat `CaptureRuntimeViewTool` the same way; whether it installs the package is unverified.
- Use `CapturePanelScreenshotTool`, `InjectPreviewGesture`, `RunAndCollectLogsTool` and `scene-graphql`.
- Injected touches: one start, two moves and one end, 300 ms apart, worked. 150 ms with one move did not fire.
- After any tool you have not used here before, run `git status --short`. Unexpected packages mean stop and report.

**Project state**
- Save after creating or changing assets, before anything that could restart Lens Studio. `SaveProject` was not in the tool list last run. `project.save` is documented in `editor.d.ts` but untested here.
- Recreate the proof. `Assets/SetupProof/SetupProofMat2.mat` is empty on disk (`PassesInfo: []`), and the scene has no `SetupProof`. Replace the material, keep `SetupProofTap.ts`, then recompile.
- Lens Studio added its own block to `.gitignore` and created `.gitattributes`, which routes `Assets/**` and `Packages/**` through Git LFS. Both are committed. New files under those folders will go through LFS (git-lfs 3.7.1); the baseline predates this and is not in LFS. Never add a remote.

**Asking Matthew**
- Do not ask to continue. Never force-close Lens Studio.
- Have everything ready first, with Preview refreshed and no dialog open, then ask for the click once. His observation is the step 4 evidence.
- Do not predict how many more asks remain.

**Sign-in**
- Not established as required for the gate. Asset Library search worked signed out; `QueryLensStudioKnowledgeBase` did not. Snap's setup and LEAF pages do not state a requirement.
- If LEAF will not install signed out, record it as a LEAF blocker and continue with step 6.
- The gate names 5.23.2 as the fallback if 5.24 authentication fails. Installing it is outside this project folder, and whether this 5.24.1 project opens in 5.23.2 is unknown. Ask Matthew before doing it. Devpost returned HTTP 403 on 2026-11-02, so its guidance was not re-verified.

Budget: about 45 minutes of three hours used, contingency untouched. Deadline: 2026-11-09 22:00 UTC, per the gate file.
