# Increment 18 dispatch — remote LFS rehearsal + demo recording

Read `devpost/build-handoff.md` first and follow it exactly. Context: the fresh-history repo is now pushed to **https://github.com/m2ai-portfolio/echoes-specs** (private, branch `main`, single root commit `9c1f996`'s content, LFS objects uploaded). Matthew has authorized recording; he asked us to handle it.

## Scope

### 1. Remote LFS rehearsal (A12 evidence)

Clone `https://github.com/m2ai-portfolio/echoes-specs` on AlienPC to `C:\Users\matth\echoes-remote-rehearsal` (new folder). Verify: LFS objects download on checkout (`git lfs pull` if needed; `SpectaclesInteractionKit.lspkg` ≈1.9 MB not a 130-byte pointer; sha256 of Packages/* match `validation/increment-5/packages-end.sha256`). Open the clone in Lens Studio 5.23.2, compile, and run LEAF `dc5-full-story` — it must PASS. Record steps/results as the A12 remote-rehearsal evidence. Do not switch the repo public — that is Matthew's gate after his review.

### 2. Demo recording (A12)

- **Tooling:** ffmpeg is not installed and winget is unreachable from SSH. Download a static ffmpeg build (gyan.dev or BtbN) to `C:\Users\matth\tools\ffmpeg\` (portable files only, no installer, no system change). Surface this addition here and in the report.
- **Capture:** `gdigrab` on the Lens Studio Preview window (find by title; use the window handle; capture at 30 fps, source resolution). Test-record 5 s first and inspect: is the Preview panel fully framed, is the SIK cursor/target highlight visible on injected clicks?
- **Performance:** follow `devpost/recording-shotlist.md` exactly (11 shots, 2:27). Drive the lens with `InjectPreviewGesture` (allowed tool) using the established coordinate mapping and two-tap protocol. Timing discipline: shot durations per the shotlist; let text breathe.
- **Hazards:** the OAuth reset hits every ~50 min — check the schedule, press a lens reset (or fresh `RunAndCollectLogsTool` refresh) immediately before the take, and if a reset lands mid-take, stop and restart the take.
- **Verification:** duration ≤ 2:30; extract ~8 frames across the video and verify each shotlist element is readable (disclosure line, cue text, correction messages, completion text, final arch hold); verify no other window content leaked into frame; audio track absent or silent.
- Save to `C:\Users\matth\Echoes-recording\echoes-demo.mp4` (outside the repo, so the mp4 is not committed), plus the frame extractions under `validation/recording/` in the repo. Update matrix A12 with the recording evidence. Write `devpost/increment-18-report.md`. Commit repo-side files. No remote push from this increment (the push is done; do not push again), no force-close, no prohibited tools.

YouTube upload and repo visibility change remain Matthew's gates.
