# Increment 18 report: remote LFS rehearsal and demo recording

Date: 2026-11-07, America/Chicago, on AlienPC. Builder: Claude Code (claude-opus-5-5).
- Base: `2c9bb8a`. No lens code, scene, or package changes. Evidence commit: `62a509d`.
- No push. The repo's visibility is unchanged and nothing was uploaded to YouTube.

## Summary

- **Remote LFS rehearsal passed** for the content that is on the remote. I cloned the private `m2ai-portfolio/echoes-specs` into a new folder; LFS downloaded on checkout and all package hashes match. The clone opened in Lens Studio 5.23.2 and compiled, and `dc5-full-story` **PASSED 27/27**.
- **Finding: the remote export is stale.** Its single commit `9c1f996` (dated 2026-11-05 09:14) contains the lens **before** `c602ee8`.
  - It has no Confirm cue: no label pulse and no `Press Confirm to place` line.
  - It has the older LEAF checks.
  - Its `devpost/` stops at Increment 14.
  - The recording and the tested revision both include the cue, so the public repo would not match them. The remote needs a fresh export of the current tree before it goes public. That is Matthew's gate; I did not push.
- **Demo recording made:** `%USERPROFILE%\Echoes-recording\echoes-demo.mp4`, outside the repo.
  - It runs **1:51.3**, at 1520 × 1192 and 30 fps, with H.264 video and **no audio stream**.
  - The frame holds only the Preview's rendered area.
  - It follows all 11 shots of `devpost/recording-shotlist.md` in order. I checked 11 extracted frames: every required line is readable. A leak scan found no other window content.
  - It is **injected interaction** driven by `InjectPreviewGesture`, not Human Preview.
- **A12 stays Unverified.** The recording and the remote rehearsal are done. Still open: the stale-remote finding, the public repo, the YouTube upload, and submission.

## Tool and system additions (surfaced)

| Addition | Detail | Reversible |
|---|---|---|
| ffmpeg 9.0.2 essentials (gyan.dev static build) | Portable files in `%USERPROFILE%\tools\ffmpeg\` (zip in `%USERPROFILE%\tools\ffmpeg-dl\`). The zip's SHA-256 `60f46726…2047ba` matches gyan.dev's published `.sha256`. No installer, no PATH change | Delete the folders |
| Transient scheduled tasks `EchoesRecProbe`, `EchoesRec` | The SSH session runs in Windows session 0 and can't see the desktop, while Lens Studio runs in console session 1. gdigrab therefore had to run as an `/IT` (interactive-only) task for the logged-on user. I created each task, ran it on demand, and **deleted both** at the end (`schtasks /Delete` returned SUCCESS) | Done |
| Editor API `model.openProject` | Opened the clone, then reopened the original. This is the same method as the Increment 4 clean clone | — |

No package was added. No prohibited tool was used: no `QueryRuntimeSceneTool`, `PreviewInteractTool`, `CaptureRuntimeViewTool`, or `AiPreviewAgentInspect`. Lens Studio was never force-closed, and no cache or package code was patched.

## 1. Remote LFS rehearsal

| Step | Result |
|---|---|
| Clone | `git clone https://github.com/m2ai-portfolio/echoes-specs` into `%USERPROFILE%\echoes-remote-rehearsal`, a new folder. Git Credential Manager warned "unable to persist credentials" because the session is non-interactive. Authentication still worked |
| LFS | 6 objects were smudged on checkout (4.76 MiB), so `git lfs pull` was not needed. `git lfs fsck`: OK. `SpectaclesInteractionKit.lspkg` is **1,928,577 bytes**, the real file and not a pointer |
| Hashes | All 8 `Packages/*` SHA-256 values are identical to `validation/increment-5/packages-end.sha256` (`validation/increment-18/packages-remote-clone.sha256`) |
| Open | Editor API `openProject` on the clone; read back `projectFile` = clone, `lensName = Echoes`. With no `Cache/`, Lens Studio rebuilt it (TypeScript 19 s, reflection map 22.6 s) |
| Compile/start | `RecompileTypeScriptTool`: succeeded. Refresh: `ECHOES start … variant=valid canStart=true`, initial state Step 1, no errors or warnings, all 8 scenarios registered |
| LEAF | `dc5-full-story` **PASSED**, `pass=27 fail=0`, 12:22:01–12:22:17 (`validation/increment-18/logs/remote-clone-leaf-dc5-full-story.log`, `captures/r01-remote-clone-leaf-passed.jpg`) |
| Side effects | Lens Studio rewrote line endings only in the clone's `.gitattributes`, `.gitignore`, `AGENTS.md`, and `jsconfig.json`, as in Increment 4. The `spk_debug_key.pem`, `.mcp.json`, and similar files in the clone were generated on open and are gitignored, not tracked (`git ls-files` checked) |
| Return | Original reopened and `projectFile` read back. The clone's Preview again opened in the recorded-room mode (`r01`), the known per-computer state from Increment 4 |

**Stale-export detail.** I compared the clone with the working tree. The only lens differences are `Assets/Echoes/Scripts/EchoesController.ts` (Confirm cue code), `Tests/Dc1PlaceNextPiece.ts`, and `Tests/Dc3InterruptAndReturn.ts`. These are the cue checks, and they explain the different log line numbers (`:1144` vs `:1204`). The remote also lacks the `devpost/increment-15…18` files, `recording-shotlist.md`, the matrix updates since Increment 14, and `validation/a9-viewers`, `increment-15`, `increment-17`, and `recording`. Nothing else differs in content. The 27/27 pass therefore proves the remote's LFS and download path, not that the remote matches the release candidate.

## 2. Demo recording

**Capture setup.**
- A probe frame located the Preview 3 render area at window-client offset (1914, 123), 1520 × 1192 px. Preview 3 was in Interactive Preview, room **Plane**, device **SPECS 27**.
- `gdigrab -i hwnd=<Lens Studio main window> -offset_x 1914 -offset_y 123 -video_size 1520x1192 -framerate 30 -draw_mouse 0 -an`, encoded with libx264 and yuv420p.
- The 5 s test recording was fully framed: render area only, no chrome. The in-lens SIK cursor ring appears on injected clicks; the OS pointer is hidden.

**Driving the lens.**
- I used the established mapping `x = 0.5 + (x_cam − 0.5) × 0.6863`. The lens's `touch-start` lines confirmed it, e.g. `x=0.1061` for Pillar at 0.1065.
- Each click is two taps (start/move/end at 150 ms).
- **A tap without the `move` step does nothing** (tested). A one-tap click was used only where the cursor was already on the control: Close help, and the second Turn right.
- Holds use injected `X` key presses as padding. Neither the lens nor any package has a key handler (grep), so they are inert.
- A single injection call times out on the client at about 60 s but keeps running on the server, as seen in the dry run. So the take used five calls of 20–30 s each, sent in one message so they ran back to back.

**Dry run.**
- A full unrecorded pass ran at 12:32–12:36. It used the 150 ms protocol in five calls plus a long timeout-test call.
- Every shot gave the scripted state, ending in `complete run=2 accepted=5` (`validation/recording/dry-run-echoes.log`).

**Take 1 (kept).**
- Timing: the OAuth refresh was at 12:45:59, and the next is 13:35:58. A `RunAndCollectLogsTool` reset followed at 12:46:10, and the recorder started at 12:46:13.
- Shots ran 12:46:27–12:48:13 with **no lens reset during the take**. The take log is `validation/recording/take1-echoes.log`, 237 lines.
- Order of events: Replay → wrong piece → Right pad → Help → wrong turn → Turn right → Pause → blocked Confirm → Resume → Confirm → Undo → re-place → marker at 180°→270°→0° → complete.
- Trim: I cut 8.5 s of identical start frame from the head and the static tail after the 7 s final hold. There are no mid-take cuts (`validation/recording/recording-metadata.txt`).

**Verification.**

| Check | Result |
|---|---|
| Duration | 111.27 s = **1:51.3** (≤ 2:30) |
| Audio | **No audio stream** (`nb_streams=1`, video only) |
| Frames dropped | 63 of ~6000 in the raw take (~1%); motion looks normal in the samples |
| Readability (frames `validation/recording/f01`–`f11`) | f01 disclosure, `Step 1 of 5 · 0 placed`, start instruction, pointer over Left pad · f02 `Chosen: square pillar at 0° (any turn fits) · Left pad` / `Press Confirm to place` · f03 `Placed: square pillar on Left pad. 1 of 5 accepted…` · f04 `Started over: Step 1 of 5…`, Undo dimmed · f05 `Not this piece: that is the long beam. Choose the square pillar.`, `1 placed`, left pillar standing · f06 `HELP ·` and all four help lines including `Help never places a piece` · f07 `Wrong turn: at 90° the long beam runs front to back…`, candidate `Turned 90°` · f08 `PAUSED · Step 4 of 5 · 3 placed`, `Paused. Nothing can be placed…`, `Kept: 3 placed, Step 4, your pedestal at 0°…` · f09 `Undone: removed the flat square pedestal from Pedestal seat. Step 4 is open again.` · f10 `Signal Arch complete: all 5 placements accepted.`, `Complete · 5 of 5 placed`, `Virtual check only: no physical model was inspected.`, `Undo reopens the last placement. Replay starts a new run.` · f11 final arch hold with the same text. The disclosure line is readable in every frame |
| Leakage | 223 frames at 2 fps; the top band and both side margins are pixel-identical to the first frame. No other window content |
| Cosmetic note | In shot 11 the SIK cursor is parked at the far lower-left of the display edge, where a half ring is visible (f11). It is not on the arch |

**Timing vs the shotlist.** The video runs 1:51 instead of the planned 2:27. Injected clicks are faster than a person's. Each hold matches or exceeds the shotlist's hold value: start frame 6.3 s, Confirm cue ~4 s, corrections ~4 s, help ~6.5 s, paused ~4 s, Undo ~4 s, completion ~4.5 s, and final hold 7 s.

**Description note for Matthew.** The video was driven by injected Preview input, not a hand on a mouse. Wording such as "recorded in Lens Studio Preview with scripted mouse-equivalent input" stays inside the shotlist's claims. The must-not-claim list in `devpost/recording-shotlist.md` still applies.

## Package and status check

- `ListInstalledPackagesTool`: the same 5 entries as before. SIK 2.0.0, UIKit 2.0.0, LEAF 2.0.2, Bitmoji 3D 10.0.1, and the known unnamed `3aa05179-…` 0.0.0.
- Working-repo `Packages/*` SHA-256 values are unchanged (`validation/increment-18/packages-end.sha256`) and identical to the remote clone's.
- `git status`: the pre-existing line-ending rewrites of `.gitattributes`, `.gitignore`, and `jsconfig.json` are still uncommitted. Reopening the project also rewrote **`AGENTS.md`**, line endings only (`git diff --ignore-cr-at-eol` is empty). These and the untracked `increment-*-run.log` and `check-log.ps1` were left uncommitted, as in earlier increments.
- The editor title shows `Echoes*` (unsaved) after the project switches and LEAF panel use. I did not save; no scene change was made.

## Matrix rows

| Row | Status | Change |
|---|---|---|
| A12 | **Unverified** | Recording made and reviewed (injected interaction). Remote LFS rehearsal passed for `9c1f996`. **Open:** the remote is stale relative to `c602ee8`+; public repo, YouTube upload, and submission are Matthew's gates. Evidence record updated |
| A1–A8, A10, A11 | Pass | Unchanged. A11 is confirmed for this increment (same packages, same hashes) |
| A9 | Unverified | Unchanged |

LEAF this increment: `dc5-full-story` on the remote clone, PASSED 27/27. No other LEAF run; the lens is unchanged.

## Not done / Matthew's gates

1. Refresh the remote with the current tree. Then optionally repeat this rehearsal on it; the steps above apply unchanged.
2. Switch the repo to public.
3. Upload `echoes-demo.mp4` to YouTube with the shotlist's description text and the injected-input note.
4. Submit.
