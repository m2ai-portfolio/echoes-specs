// Done criterion 3 · "I can interrupt and return."  Matrix A5.
// Help mid-step (step 3, beam turned to 180° on the Beam seat), help at step 1
// and at completion; Pause with the same rotated candidate; every task input
// tried while help/pause is up; Close help / Resume restore the same state.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {EchoesLeafDriver} from "./EchoesLeafDriver"

@component
export class Dc3InterruptAndReturn extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc3-interrupt-and-return")
    await d.begin()

    // Help at step 1 with nothing chosen.
    await d.help()
    let st = d.s()
    d.check("help at step 1 explains the pillar and left pad", st.overlay === "help" && st.panelText.indexOf("Piece: the square pillar") === 0 && st.panelText.indexOf("Left pad") > 0, st.panelText)
    await d.help()
    d.check("close help at step 1 returns to step 1", d.s().overlay === "none" && d.s().stepIndex === 0)

    await d.placeStep(0)
    await d.placeStep(1)
    await d.choose("beam", 180, "beam-seat")
    const before = d.core()
    d.note(`candidate before help: ${d.brief()}`)

    // ── Help ──
    await d.help()
    st = d.s()
    d.check("help opens with current piece, turn, attachment", st.overlay === "help" && st.progressText.indexOf("HELP · ") === 0 && st.panelText.indexOf("Piece: the long beam") === 0 && st.panelText.indexOf("Beam seat") > 0, st.panelText)
    d.check("help keeps instruction, candidate line, and build visible", st.instructionText === st.stepInstructions[2] && st.statusText.indexOf("long beam at 180°") >= 0 && st.placedNames.length === 2, st.statusText)
    d.check("clear route back: the Help button reads Close help", st.controls["help"].label === "Close help" && st.controls["help"].lit, st.controls["help"].label)
    d.check("task controls read as disabled during help", !st.controls["confirm"].lit && !st.controls["turn-right"].lit && !st.controls["undo"].lit && !st.palette["pillar"].lit)
    // Increment 15: the status drops its "Press Confirm to place" line (and the Confirm
    // pulse stops) while help is open, because Confirm cannot act. So presses during
    // help are compared with the state just after help opened.
    d.check("Confirm cue is off while help is open", !st.confirmCue && st.statusText.indexOf("Press Confirm") < 0, st.statusText)
    const helpCore = d.core(st)
    await d.confirm()
    await d.turnRight()
    await d.piece("pillar")
    await d.undo()
    await d.pause()
    st = d.s()
    d.check("Confirm, Turn, palette, Undo, Pause during help change nothing", st.overlay === "help" && d.core(st) === helpCore, d.core(st))
    d.check("help never accepts a placement", st.acceptedIds.length === 2 && st.placedNames.length === 2)
    d.check("targets not selectable while help is open", !d.targetSelectable("beam-seat"))
    await d.help()
    st = d.s()
    d.check("close help restores the same objective and candidate, Confirm cue back", st.overlay === "none" && d.core(st) === before && st.confirmCue, d.core(st))

    // ── Pause ──
    await d.pause()
    st = d.s()
    d.check("unmistakable paused state", st.overlay === "paused" && st.progressText.indexOf("PAUSED · ") === 0 && st.instructionText.indexOf("Paused.") === 0, st.progressText)
    d.check("pause hides targets and the ghost, keeps the candidate card", !st.targets["beam-seat"].shown && !st.ghostShown && st.stagingShown && st.stagingDetail === "Turned 180°")
    d.check("clear route back: the Pause button reads Resume", st.controls["pause"].label === "Resume" && st.controls["pause"].lit)
    d.check("pause states what is kept", st.panelText.indexOf("Kept everything: 2 placed, Step 3, your beam at 180°") === 0, st.panelText)
    const pausedCore = d.core(st)
    await d.confirm()
    await d.turnRight()
    await d.piece("pedestal")
    await d.undo()
    await d.help()
    st = d.s()
    d.check("Confirm, Turn, palette, Undo, Help while paused change nothing", st.overlay === "paused" && d.core(st) === pausedCore && st.acceptedIds.length === 2, d.core(st))
    await d.pause()
    st = d.s()
    d.check("resume restores the same progress, objective, candidate, turn", st.overlay === "none" && d.core(st) === before, d.core(st))
    await d.confirm()
    st = d.s()
    d.check("after resume the kept candidate is accepted once", st.acceptedIds.length === 3 && st.placedNames[2] === "Placed p3-beam", d.brief(st))

    // ── Help at completion ──
    await d.placeStep(3)
    await d.placeStep(4)
    d.check("complete before help", d.s().complete)
    await d.help()
    st = d.s()
    d.check("help at completion uses its own text and does not change progress", st.overlay === "help" && st.panelText.indexOf("All 5 placements are accepted and the beacon is lit.") === 0 && st.acceptedIds.length === 5, st.panelText)
    await d.help()
    st = d.s()
    d.check("close help at completion returns to completion", st.overlay === "none" && st.complete && st.progressText.indexOf("Complete · 5 of 5 placed") >= 0, st.progressText)
    d.end()
  }
}
