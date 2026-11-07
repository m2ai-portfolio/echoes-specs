# Increment 17 dispatch — recording method verification (read-only on the lens)

Read `devpost/build-handoff.md` first and follow it exactly. Context: Matthew will record the demo video (<3 min, public YouTube) himself. No lens code changes.

## Scope

1. **Determine the cleanest recording method on this machine.** Check, read-only: (a) is OBS installed and configured? (b) Xbox Game Bar availability (Win+G) and whether it captures the Lens Studio window acceptably; (c) any Lens Studio built-in capture/export of the Preview panel. Recommend one method with exact steps (window/m region to capture, audio handling — no audio needed, mute is fine).
2. **Dry-run the claims list.** Write `devpost/recording-shotlist.md`: the shot-by-shot script for a <3-minute video that demonstrates every public claim — the Virtual-build-demo disclosure visible at start, one correct placement with the Confirm cue, a wrong-piece correction (work preserved), Help, Pause/Resume, a wrong-orientation correction, Undo, completion text, Replay. Include on-screen moments to let breathe (2–3 s each) and a final frame holding the completed arch. Keep total under 2:30 to leave margin. Each shot: what to click, what text must be readable, approx seconds.
3. **Claims cross-check:** verify each claim in `devpost/asset-record.md` and the matrix's "Supported after passing" list is either shown or deliberately omitted-and-disclosed by the shotlist. Note anything the video must NOT claim (device comfort, physical bricks, hands-free).
4. Verify the current Preview is Interactive and at start state for the recording session; leave it ready.
5. Write `devpost/increment-17-report.md` (short). Commit. No remote, no push. Do not record video yourself.
