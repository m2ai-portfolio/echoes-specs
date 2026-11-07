// Done criterion 4 (undo half) · "Undo reverses only the latest placement,
// including after completion."  Matrix A6: zero, intermediate, completion.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils"
import {EchoesLeafDriver} from "./EchoesLeafDriver"

@component
export class Dc4UndoLatest extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc4-undo-latest")
    await d.begin()

    // Zero placements: Undo reads disabled and does nothing.
    let st = d.s()
    d.check("Undo dimmed at zero", !st.controls["undo"].lit)
    const zero = d.core(st)
    await d.undo()
    d.check("Undo at zero changes nothing", d.core() === zero && d.s().acceptedIds.length === 0, d.brief())

    // Intermediate: three placed, a candidate chosen, then Undo.
    await d.placeStep(0)
    await d.placeStep(1)
    await d.placeStep(2)
    const root = findSceneObjectByName("Accepted Pieces")
    const keep0 = root.getChild(0)
    const keep1 = root.getChild(1)
    await d.choose("pedestal", 90, "pedestal-seat")
    d.check("Undo lit with placements", d.s().controls["undo"].lit)
    await d.undo()
    st = d.s()
    d.check("intermediate Undo removes only the beam", st.acceptedIds.join(",") === "p1-left-pillar,p2-right-pillar" && st.placedNames.join(",") === "Placed p1-left-pillar,Placed p2-right-pillar", d.brief(st))
    d.check("earlier pieces are the same objects", root.getChildrenCount() === 2 && root.getChild(0) === keep0 && root.getChild(1) === keep1)
    d.check("progress decreases by one, step 3 instruction restored", st.stepIndex === 2 && st.instructionText === st.stepInstructions[2] && st.progressText.indexOf("Step 3 of 5 · 2 placed") >= 0, st.progressText)
    d.check("candidate and feedback reset consistently", st.piece === null && st.target === null && st.rotation === 0 && !st.ghostShown && st.feedback.indexOf("Undone: removed the long beam from Beam seat. Step 3 is open again.") === 0, st.feedback)
    d.check("undone attachment is offered again", d.targetSelectable("beam-seat") && !d.targetSelectable("pedestal-seat"))
    await d.placeStep(2)
    st = d.s()
    d.check("re-place reaches step 4 once", st.acceptedIds.length === 3 && st.stepIndex === 3 && st.placedNames.length === 3, d.brief(st))

    // Completion, then Undo.
    await d.placeStep(3)
    await d.placeStep(4)
    st = d.s()
    d.check("complete with 5 placed", st.complete && st.placedNames.length === 5 && st.progressText.indexOf("Complete · 5 of 5 placed") >= 0, st.progressText)
    await d.undo()
    st = d.s()
    d.check("Undo after completion clears completion", !st.complete && st.mode !== "complete" && st.progressText.indexOf("Complete") < 0, st.progressText)
    d.check("Undo after completion reopens the final placement", st.acceptedIds.length === 4 && st.placedNames.length === 4 && st.stepIndex === 4 && st.instructionText === st.stepInstructions[4], d.brief(st))
    d.check("marker seat offered again with its pointer", d.targetSelectable("marker-seat") && st.targets["marker-seat"].pointer)
    await d.placeStep(4)
    st = d.s()
    d.check("re-place final reaches completion once", st.complete && st.acceptedIds.length === 5 && st.placedNames.length === 5, d.brief(st))
    await d.confirm()
    d.check("no Redo/duplicate: extra Confirm adds nothing", d.s().placedNames.length === 5)
    d.end()
  }
}
