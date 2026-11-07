# Increment 17 report: checking the recording method

Date: 2026-11-06. Base revision `007d9d1`. **No lens code, scene, or package changes.** No video was recorded. Nothing was pushed.

## What changed

- New `devpost/recording-shotlist.md`. It has the recording-method findings, recommended steps, an 11-shot script (2:27), and a claims cross-check with a must-not-claim list and suggested description text.
- New `validation/increment-17/preview-start-state-ready.jpg`. This is the Preview start-state capture taken after the readiness refresh.

## 1. Recording method (read-only checks)

| Option | Result |
|---|---|
| OBS | Not installed (no program dir, no `%APPDATA%\obs-studio`, no uninstall entry) |
| Xbox Game Bar | Installed (`XboxGamingOverlay` 7.326), `GameDVR_Enabled=1`, no policy block. It records the whole window only, so on the 3440 × 1440 ultrawide the Preview would be a small part of the frame. Not test-recorded (recording is out of scope) |
| NVIDIA App / ShadowPlay | Installed. Records the full display only |
| Lens Studio built-in | The docs list a Preview "Screen Recording" bottom control. Not verified in SPECS Interactive Preview on 5.23.2 |
| **Snipping Tool screen recording** | Installed (`ScreenSketch` 11.2608). It was used before on this PC (`Videos\Screen Recordings\*.mp4`, 2026-02/03). It does region capture, so it can frame exactly the Preview panel. **Recommended**, with audio off |

The exact steps are in the shotlist. One timing hazard: the editor's OAuth refresh resets the lens about every 50 minutes. The last one was at 21:45:33 Central, so the next is about 22:35:30.

## 2–3. Shot list and claims cross-check

The shots cover the disclosure at start, one correct placement with the Confirm cue, Replay, a wrong-piece correction with work preserved, Help, a wrong-orientation correction, Pause/Resume, Undo, the completion text, and a 5–7 s final hold on the completed arch. Replay goes early (shot 3) so the final frame can be the arch. An alternative ending that shows Replay from completion is noted.

I checked every on-screen string in the shotlist against `EchoesController.ts`, `PlacementRules.ts`, and `SignalArchTask.ts`. That includes turn arithmetic (Turn right = +90, so the beam goes from 90° to 180° and the marker from 180° to 0° in two presses) and that choosing a piece keeps the chosen attachment.

The cross-check maps every item in the matrix's "Supported after passing" list and in the `asset-record.md` disclosures to a shot. Items that can't be seen on screen are routed to the description:
- wrong-target correction;
- the cannot-start state;
- exact dimensions;
- Preview-only / no device;
- no audio or network;
- authored help.

The must-not-claim list covers:
- physical recognition or verification;
- spatial registration or true scale;
- structural safety;
- AI or intelligence;
- hands-free use;
- device comfort, tracking, latency, or readability;
- persistence;
- brand likeness.

## 4. Preview readiness

- The tail log showed the lens in run 2, after Matthew's 21:49:12 Replay. It was at Step 1 but still had the "Started over" note on screen.
- I ran one `RunAndCollectLogsTool` refresh (21:55:33). The result was `ECHOES start … variant=valid canStart=true`, `state[initial] run=1 step=1 accepted=0`, with no errors. The Preview is in Interactive Preview: the Plane grid room, with SIK cursor clicks logged earlier in the session.
- The capture `validation/increment-17/preview-start-state-ready.jpg` shows the four-line start panel with Undo dimmed. The panel renders at 2028 × 1590.
- This MCP refresh is not an operator reset and is not evidence for any matrix row. Matthew should still press ↻ himself right before the take.

## Package and status check

- `ListInstalledPackagesTool` returned the same 5 entries as before: SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, and the unnamed `3aa05179-…` 0.0.0 that has been known since Increment 1.
- The `Packages/*` SHA-256 hashes are identical to `validation/increment-4/packages-before.sha256`.
- `git status`: the pre-existing editor-rewritten `.gitattributes`, `.gitignore`, and `jsconfig.json` (line endings only) and the untracked `increment-*-run.log` / `check-log.ps1` were left uncommitted, as before.

## Matrix rows

None changed. No LEAF run; no lens change.
- A1–A8, A10, A11: Pass, unchanged.
- A9: Unverified, unchanged.
- A12: still Unverified. Recording, public repo, remote LFS, and submission are Matthew's separate actions.

Tools used: `CapturePanelScreenshotTool`, `RunAndCollectLogsTool`, `ListAllPanels`, `ListInstalledPackagesTool`, `QueryLensStudioKnowledgeBase` (docs lookup only). No prohibited tools. No new tool or package was proposed.
