# Run and rehearse Echoes

## Open the project

Extract the entire ZIP first. Open Echoes.esproj in Lens Studio 5.23.2. All Assets and Packages files are included; do not open from inside the ZIP. No login, API key or external service is required by the guide code.

Keep Echoes 40897 Guide enabled and Echoes Signal Arch disabled. In Preview select Interactive (third input icon), Plane, and SPECS 27. Refresh Preview. Expect step 1 / 7 and 0 of 7 marked by you.

## Controls

- Turn 45 and center drag change the view. A drag starting on a button does not orbit.
- Underside / Top side flips the view. Home restores the step's default view. Zoom changes size within fixed bounds.
- Explode / Reassemble separates incoming parts from their canonical final positions.
- Inspect joint, Next joint and Return inspect the current step's incoming connections and restore the previous view.
- I placed it is a manual confirmation. Back preserves marks. Restart clears marks.
- All marked means all seven confirmations were recorded. Pressing it again does not advance, clear, save or submit anything.

## Seven-step walkthrough

1. Four pins below the gear: inspect all four joints, Return, then I placed it.
2. Round underside tile: inspect its seat, Return and confirm.
3. Center axle: compare Explode/Reassemble and the underside, inspect, Return and confirm. The underside disc is the preceding tile.
4. Round body: inspect, Return, use Turn and Home, then confirm.
5. Four radial pins: try maximum zoom, inspect all four, Return and confirm.
6. Upper round plate: inspect, Return and confirm.
7. Four curved tiles plus the center plate: inspect all five, Return and confirm.

Expect Lower assembly complete and You marked all 7 steps placed. Use Back to review, then Restart to return to step 1 and zero marks. This walkthrough has 17 incoming joints. A successful walkthrough does not verify physical fit or real-world placement.

## Source and geometric checks

From the project root, using Node 24 or later:

```
node validation/guide-hero/tools/guide-state-check.mjs
node validation/guide-hero/tools/underside-geometry-check.mjs 3
node validation/guide-hero/tools/step7-arrangement-check.mjs
node validation/guide-hero/tools/guide-state-stress.mjs
```

Expect 29 source checks, step-3 rays hitting the lower disc, step-7 passed true and 50,000 stress actions with zero failures. These are not Lens Preview tests.

In Lens Studio's LEAF panel run dg1-guide-hero-controls then dg2-guide-step-flow, one at a time. Expected counts: 24 and 79 passes, zero failures. Automated/injected input must not be described as a human mouse pass.

If Preview starts in recorded-room mode, select Interactive and refresh. If the heading or buttons are covered, capture the step and view settings. A cannot-start panel names invalid data in the log.
