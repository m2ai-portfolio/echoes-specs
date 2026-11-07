# Echoes: demo video shot list

Written at Increment 17 (2026-11-06) against lens revision `007d9d1` (lens code unchanged since `c602ee8`). Matthew records this; the builder did not record any video.

Target length: **2:27**, under the 2:30 working cap and the 3:00 hackathon limit. The video is silent: the lens has no audio, so record with microphone and system audio off. Optional on-screen captions are listed per shot. Everything else is what the lens already shows.

## Recording method (checked read-only on this machine)

| Option | Finding | Verdict |
|---|---|---|
| OBS Studio | Not installed: no `Program Files\obs-studio`, no `%APPDATA%\obs-studio`, and no uninstall entry | Not available without installing new software |
| Xbox Game Bar (Win+G) | Installed (`Microsoft.XboxGamingOverlay` 7.326), `GameDVR_Enabled = 1`, and no policy blocks it. It records the **whole focused app window**, not a region. With Lens Studio on the 3440 × 1440 ultrawide, the Preview would fill only part of the frame, surrounded by editor panels | Fallback only |
| NVIDIA App / ShadowPlay | Installed (NVIDIA App 11.0.8). It records the full display at 3440 × 1440 | Fallback only: same framing problem, larger files |
| Lens Studio Preview "Screen Recording" | The Lens Studio docs (*Previewing Your Lens → Bottom Controls → Screen Recording*) describe a Preview button that records the lens and then asks where to save. Not tried here: the builder may not record, and the SPECS Interactive Preview in 5.23.2 might not show the button | Worth a 10 s test if the button is visible. It would give lens-only footage |
| **Windows Snipping Tool screen recording** | Installed (`Microsoft.ScreenSketch` 11.2608). It has been used on this PC before: `%USERPROFILE%\Videos\Screen Recordings\` holds MP4s from 2026-02 and 2026-03. It records a **dragged region**, so it can frame exactly the Preview panel | **Recommended** |

### Recommended steps (Snipping Tool)

1. In Lens Studio, enlarge the **Preview 1** panel, for example by maximizing it or dragging its splitters. Leave the five-icon mode row and the dropdowns outside your selection. The panel currently renders at 2028 × 1590 px.
2. Check the Preview: the third mode icon (Interactive) is highlighted, the top dropdown says **Plane**, and the bottom one says **SPECS 27**.
3. Press **↻ (refresh)** on the Preview once. The guidance panel should show only four lines: the disclosure, `Signal Arch v1 · Step 1 of 5 · 0 placed`, `Put a square pillar on the left pad.`, and `Chosen: no piece · no attachment`. **Undo** should be dimmed. There should be no "Started over" line.
4. Press **Win + Shift + R**, or open Snipping Tool, pick the video-camera mode, and click **New**. Drag a rectangle over the Preview's rendered area only: the grey room with the Help column on the left and the Confirm column on the right.
5. Turn **microphone and system audio off** in the recording toolbar, if it shows those toggles. Click **Start** and wait for the 3-2-1 countdown.
6. Run the shots below. Click only with the left button. **Do not use WASD, Q/E, Shift, or right-drag**: moving the camera shifts the layout.
7. Click **Stop**. Snipping Tool opens the clip, which autosaves to `%USERPROFILE%\Videos\Screen Recordings\`. Check the length (≤ 3:00) and confirm the disclosure line is readable at 1080p.

**Timing hazard.** Lens Studio's account OAuth refresh resets the lens about every 50 minutes. The last one in today's log was 21:45:33 Central, so the next is about **22:35:30**, then about 23:25:30. Start a take only if it will finish before the next refresh. If the lens jumps back to Step 1 in the middle of a take, stop and start again from step 3 above.

**Do a dry run first.** Do one unrecorded pass to learn the click targets. Then press ↻ and record.

## Shots

"Hold" means: take your hand off the mouse and let the frame sit. Times are cumulative.

| # | Time | What to click | Text that must be readable on screen | Hold |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Nothing (start frame) | `Virtual build demo · enlarged pieces · no physical bricks are recognized` · `Signal Arch v1 · Step 1 of 5 · 0 placed` · `Put a square pillar on the left pad.` · white pointer over **Left pad** | 6 s on the start frame. Optional caption: "Virtual build demo in Lens Studio Preview — no physical bricks are recognized." |
| 2 | 0:08–0:23 | **Pillar** → **Left pad** → *(hold)* → **Confirm** | Before Confirm: `Chosen: square pillar at 0° (…) · Left pad`, then the second line `Press Confirm to place`, and the **Confirm** label pulsing. After: `Placed: square pillar on Left pad. 1 of 5 accepted. Next step is shown above.` and `Step 2 of 5 · 1 placed` | 3 s on the pulsing Confirm cue, then 3 s on "Placed" |
| 3 | 0:23–0:31 | **Replay** | `Started over: Step 1 of 5. Pieces and choices are cleared.` The base is empty again and **Undo** is dimmed | 3 s. Optional caption: "Replay: clean restart from any state." |
| 4 | 0:31–0:39 | **Pillar** → **Left pad** → **Confirm** (no pause) | `Step 2 of 5 · 1 placed` · `Put a square pillar on the right pad.` | 2 s |
| 5 | 0:39–0:59 | **Beam** → **Right pad** → **Confirm** (the wrong piece) | `Not this piece: that is the long beam. Choose the square pillar.` The progress line still reads `Step 2 of 5 · 1 placed`, and the left pillar is still standing (**work preserved**) | 3 s on the correction |
|   |   | Then **Pillar** → **Confirm**. Choosing a piece keeps the chosen attachment, so Right pad stays selected and the status shows `· Right pad` | `Placed: square pillar on Right pad. 2 of 5 accepted.` · `Step 3 of 5 · 2 placed` | 2 s |
| 6 | 0:59–1:11 | **Help** → *(hold)* → **Close help** | Progress begins `HELP ·`. The help text reads `Piece: the long beam ("Beam" in Pieces).` / `Turn: 0° or 180°, so it spans left to right. It arrives at 90°, so turn it once.` / `Attachment: … ("Beam seat"), under the white pointer.` / `Then Confirm. Help never places a piece.` | 4 s on the help text. After Close help, the instruction is back to `Lay the long beam across both pillar tops.` |
| 7 | 1:11–1:31 | **Beam** (it arrives at 90°) → **Beam seat** → **Confirm** (the wrong turn) | Candidate card `Turned 90°`. Correction: `Wrong turn: at 90° the long beam runs front to back. Turn the beam so it spans both pillars.` Still `2 placed` | 3 s on the correction |
|   |   | Then **Turn right** once (`Turned 180°`) → **Confirm** | `Placed: long beam on Beam seat. 3 of 5 accepted.` · `Step 4 of 5 · 3 placed` | 2 s |
| 8 | 1:31–1:47 | **Pedestal** → **Pedestal seat** → **Pause** → *(hold)* → optionally **Confirm** once (nothing happens) → **Resume** | While paused: `PAUSED · Step 4 of 5 · 3 placed` · `Paused. Nothing can be placed until you press Resume.` · `Kept: 3 placed, Step 4, your pedestal at 0°. Press Resume to go on.` After Resume: the same choices are back, `Chosen: … · Pedestal seat` with `Press Confirm to place` | 3 s paused, 2 s after Resume |
| 9 | 1:47–2:05 | **Confirm** → **Undo** → *(hold)* → **Pedestal** → **Pedestal seat** → **Confirm** | After Confirm: `4 of 5 accepted`. After Undo: `Undone: removed the flat square pedestal from Pedestal seat. Step 4 is open again.` with `Step 4 of 5 · 3 placed`, while beam and pillars remain. After the re-place: `Step 5 of 5 · 4 placed` | 3 s on the Undo message |
| 10 | 2:05–2:20 | **Marker** (it arrives at 180°) → **Turn right** ×2 (`Turned 0°`, tip toward FRONT) → **Marker seat** → **Confirm** | `Signal Arch v1 complete: all 5 placements accepted.` · `Complete · 5 of 5 placed` · `Virtual check only: no physical model was inspected.` · `Undo reopens the last placement. Replay starts a new run.` | 3 s on the completion text |
| 11 | 2:20–2:27 | Nothing. Move the pointer off the arch, onto the empty floor | Final frame: the completed Signal Arch with both pillars, the beam, the pedestal, and the marker pointing at FRONT, plus the `Virtual check only` line | **5–7 s, then Stop** |

Replay comes early (shot 3) so that the final frame can be the completed arch. If you would rather show Replay from the finished arch, the path the tests checked, click **Replay** after shot 11's hold and stop 3 s later. The video then ends on the cleared base. It runs about 2:32, still under 3:00.

### If something goes wrong in a take

- A misclick on a wrong attachment or piece just produces a correction. You can keep going, since that also shows the claim, but you will run over time. Stopping and pressing ↻ is cleaner.
- If you clicked Undo with nothing placed, nothing happens. Carry on.
- If the camera moved, stop, press ↻, and retake. The layout depends on the start pose.

## Claims cross-check

**Shown in the video.** Sources: `devpost/asset-record.md` and the matrix "Supported after passing" list in `devpost/echoes-acceptance-matrix.md`.

| Claim | Source | Shot(s) |
|---|---|---|
| Bounded, original virtual task (Signal Arch v1, five placements) | Matrix | 1–11 (`Step n of 5`) |
| Working state tracking | Matrix | Progress line in every shot; `placed` count across 5, 7, 9 |
| Contextual next-action guidance | Matrix | Instruction line plus white pointer (1, 4); Confirm cue (2, 8) |
| Specific correction: wrong piece, with work preserved | Matrix | 5 |
| Specific correction: wrong orientation | Matrix | 7 |
| Within-run interruption recovery (Help, Pause/Resume restore exact state) | Matrix | 6, 8 |
| Latest-placement undo | Matrix | 9 |
| Clean replay | Matrix | 3 |
| Truthful completion | Matrix and asset record | 10, 11 |
| "Virtual build demo · enlarged pieces · no physical bricks are recognized" shown at all times | Asset record | Visible in every shot; held in 1 |
| `Virtual check only: no physical model was inspected.` on completion | Asset record | 10, 11 |
| Help is fixed authored text and never places a piece | Asset record | 6 (the text itself says `Help never places a piece`). "Not generated by a live model / no network" can't be seen on screen; put it in the description |
| Runs in Lens Studio Preview with mouse-operated SIK/UIKit controls | Handoff | Whole video (pointer clicks) |

**Left out on purpose. Disclose these in the YouTube description, not in the video.**

| Item | Why it is left out | Where to disclose |
|---|---|---|
| Wrong-target correction and the correction priority (target → piece → turn) | Time. It is tested (A2 Pass, LEAF and Human Preview) | Optional: one sentence in the description |
| Invalid-task-data "Cannot start" state | Developer configuration (`taskVariant`). Showing it means editing the scene mid-video | Description or repo README only |
| Exact enlarged dimensions (arch about 30 × 18.5 × 14 cm) | They can't be read on screen. The disclosure already says "enlarged pieces" | Description: "pieces are drawn larger than real bricks" |
| Tested in Preview only, no Specs device | Not visible | Description, required |
| No audio, no network, no camera use, authored help | Not visible | Description |

**The video (captions, title, description, voiceover if added) must NOT claim:**

- recognition of physical bricks, or that it checks a real model ("verifies your build", "sees your bricks");
- spatial registration to physical objects, or true-to-life brick scale;
- structural safety;
- AI or "intelligent" guidance. Help and corrections are authored text;
- hands-free use. Every action is a click/pinch;
- device comfort, real hand tracking, latency, or readability on Specs. These are untested, and no device was used;
- persistence across sessions;
- any brand or set likeness. Signal Arch is an invented generic model.

Suggested description lines, adapted from the asset record:

> Echoes is a virtual brick-building demo for Specs, recorded in Lens Studio 5.23.2 Preview (Interactive Preview, mouse as pinch). It checks placements against authored task data in a virtual scene. It does not use the camera and does not recognize physical bricks. Pieces are drawn larger than real bricks. Help and corrections are fixed, authored text, not a live model. No Specs device was used: comfort, hand tracking, and on-device readability are untested.
