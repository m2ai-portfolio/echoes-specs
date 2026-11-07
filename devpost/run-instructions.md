# Echoes: run instructions

Echoes is a virtual brick-building lens for Specs. You build **Signal Arch v1**, a five-piece arch, on a virtual base. You pick each piece, turn it in 90° steps, choose where it goes, and press Confirm. The lens tells you what to do next, names exactly what is wrong when an attempt doesn't fit, and lets you get help, pause, undo the latest placement, or start over.

It is a **virtual build demo**. No physical bricks are recognized or checked, and the pieces are drawn larger than real bricks so they are easy to see and select. The lens says so on screen.

These steps were rehearsed on a clean local clone (see `devpost/increment-4-report.md` § Clean clone rehearsal). Download from a public remote has not been tested yet.

## What you need

- **Lens Studio 5.23.2** (the project was built and tested with 5.23.2.26081320). Other versions are untested.
- **Git with Git LFS.** The project's assets and packages (`Assets/**`, `Packages/**`) are stored with Git LFS. Without LFS the packages are 130-byte pointer files and the lens won't compile.
- No Specs device is needed. Everything runs in Lens Studio's Preview.
- No network access is used by the lens, and no account is needed to run it in Preview.

## Get the project

```sh
git lfs install
git clone <repository-url> Echoes
cd Echoes
git lfs pull
```

Check that `Packages/SpectaclesInteractionKit.lspkg` is about 1.9 MB, not a small text pointer. If it is a pointer, run `git lfs pull` again.

After the first open, `git status` may list `.gitattributes`, `.gitignore`, `AGENTS.md`, and `jsconfig.json` as modified. Lens Studio rewrites them on open; in the rehearsal only their line endings changed (`git diff` was empty).

## Open it

1. Start Lens Studio 5.23.2.
2. Choose **Open Project** and select `Echoes.esproj` in the cloned folder.
3. Wait for the first compile to finish. A fresh clone has no `Cache/` folder, so Lens Studio rebuilds it the first time; this takes a little longer than usual.
4. The project already targets Specs (Spectacles); you don't change the platform. But the **Preview** panel's simulation mode is a per-computer editor setting that is not stored in the project. On the clean-clone rehearsal, Preview first opened in a recorded-room video view (a tall panel with a living room behind the lens). The lens ran there, but to walk around and click it, switch the Preview to **Interactive Preview**:
   - In Lens Studio 5.23.2 the Preview panel's input switch is a row of **five unlabeled icons at the panel's top-left corner**. From left to right: a picture (image/video input), a camera, **Interactive** (a screen on a stand), pause, and an eye. Click the **third icon**. It is highlighted when it is active. There is no text menu named "Interactive Preview"; that is this guide's name for the mode.
   - The dropdown at the **top center** of the Preview panel then names the interactive room. Choose **Plane** (all testing used it).
   - The dropdown at the **bottom center** should read **SPECS 27**.

   That view is a plain grey virtual room with a floor grid, with the Specs display area in the middle (see `validation/increment-5/captures/p01-preview-chrome-interactive.png`).

What you should see straight ahead, about 90 cm away:

- **Guidance panel** at the top center: the disclosure line (`Virtual build demo · enlarged pieces · no physical bricks are recognized`), progress (`Signal Arch v1 · Step 1 of 5 · 0 placed`), the current instruction (`Put a square pillar on the left pad.`), and a status line (`Chosen: no piece · no attachment`).
- **Left column:** Help and Pause, then the **Pieces** palette (Pillar, Beam, Pedestal, Marker).
- **Right column:** Undo and Replay, then the **Candidate** card, then Turn left, Turn right, and Confirm.
- **Base** in the middle, with a FRONT arrow and label, and translucent attachment boxes (Left pad, Right pad to start). A white pointer marks the next attachment.

If the panel says **Cannot start**, the task data in the scene was changed: see "Settings" below.

## Using the mouse in Interactive Preview

From the Specs template's guidance:

- **Click** acts as a pinch: it presses the button or attachment under the pointer.
- **W, A, S, D** move, **Q and E** go down and up.
- **Right-drag** (or hold **Shift**) to look around.

The content stays where it was placed when Preview started, even if you walk around it. Stand where a user would: about 90 cm from the base, looking at it.

## Controls

| Control | Where | What it does |
|---|---|---|
| **Pillar / Beam / Pedestal / Marker** | Pieces palette, left | Choose the candidate piece. The chosen piece reads `[ Pillar ]` in the palette and appears on the Candidate card with its turn. |
| **Turn left / Turn right** | Right column | Turn the candidate 90° in that direction. The Candidate card shows `Turned 0°`, `90°`, `180°`, or `270°`. |
| **Attachment boxes** (Left pad, Right pad, Beam seat, Pedestal seat, Marker seat) | On the base | Choose where the candidate goes. Only open attachments can be clicked; a ghost of the candidate shows there before you confirm. |
| **Confirm** | Right column, bottom | Try the placement. If it fits, the piece is placed and the next step appears. If not, nothing is placed and the panel says what is wrong (wrong attachment first, then wrong piece, then wrong turn) and what to do instead. |
| **Help / Close help** | Left column, top | Shows what the current step needs. While help is open, nothing else changes. Close help returns you to exactly where you were. |
| **Pause / Resume** | Left column | Pauses the task and says what is kept. While paused, nothing can be placed. Resume returns you to exactly where you were. |
| **Undo** | Right column, top | Removes only the latest accepted piece and reopens that step. Dimmed when nothing has been placed. Works after completion too. |
| **Replay** | Right column | Starts over from the empty base, from any state. |

## Walkthrough (the full build)

1. **Pillar** → choose **Left pad** → **Confirm**. Any turn fits a square pillar.
2. **Pillar** → **Right pad** → **Confirm**.
3. **Beam** → it arrives at 90° (front to back), so press **Turn right** once → **Beam seat** → **Confirm**. 0° and 180° both fit.
4. **Pedestal** → **Pedestal seat** → **Confirm**.
5. **Marker** → it arrives at 180° (pointing away from FRONT), so turn it twice → **Marker seat** → **Confirm**. Only 0°, tip toward FRONT, fits.

The panel then reads `Signal Arch complete: all 5 placements accepted.` and `Virtual check only: no physical model was inspected.` Press **Replay** to start again.

To see a correction, try Confirm with the Beam still at 90°, or choose the Right pad at step 1.

## Settings (for testers)

The `EchoesController` script on the `Echoes Signal Arch` scene object has two inputs. The shipped values are:

- `taskVariant` = `valid`. The other values (`missing-piece`, `missing-target`, `empty-sequence`) deliberately break the task data so you can see the Cannot start state.
- `runStateTests` = off. When on, the lens runs its 31 built-in state assertions at start and prints `ECHOES test END pass=… fail=…` to the Logger.

## Automated tests (LEAF)

The project includes eight LEAF scenarios (`Assets/Echoes/Tests/`), at least one per done criterion. Open the LEAF panel in Lens Studio, let it load the scenarios from Preview, and run any of them; `dc5-full-story` runs the whole story (correction, help, pause, undo, completion, replay). The scenarios press the real buttons and attachments through their interactables. They are not a substitute for a person trying it with the mouse.

## Known limits

- Virtual only: no camera input, no physical brick recognition, no check of a real model.
- Pieces are enlarged (the finished arch is about 30 × 18.5 × 14 cm).
- The layout is designed for about 90 cm. At 60 cm the side columns are outside the Specs display, so you have to turn your head to reach them.
- Comfort, real hand tracking, and readability on a real Specs display have not been tested; there was no device.
