// Done criterion 5 (truthful completion) · Matrix A4 sequence guards.
// Each proper prefix is incomplete; an out-of-order target does not advance;
// later and already-filled attachments cannot be picked; duplicate Confirm
// advances once; completion appears only when 5 accepted ids and 5 visible
// placed objects agree.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {EchoesLeafDriver, STEPS} from "./EchoesLeafDriver"

@component
export class Dc5SequenceGuards extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc5-sequence-guards")
    await d.begin()

    // Out-of-order target at step 1.
    await d.choose("pillar", 0, "right-pad")
    await d.confirm()
    let st = d.s()
    d.check("out-of-order target does not advance", st.acceptedIds.length === 0 && st.stepIndex === 0 && st.feedback.indexOf("Use the left pillar attachment first") > 0, st.feedback)
    d.check("later attachments not selectable at step 1", !d.targetSelectable("beam-seat") && !d.targetSelectable("pedestal-seat") && !d.targetSelectable("marker-seat"))

    for (let i = 0; i < STEPS.length; i++) {
      await d.placeStep(i)
      // Duplicate confirmation right after an accept.
      await d.confirm(0)
      await d.confirm()
      st = d.s()
      d.check(`step ${i + 1}: duplicate Confirm advances once`, st.acceptedIds.length === i + 1 && st.placedNames.length === i + 1 && st.stepIndex === i + 1, d.brief(st))
      d.check(`step ${i + 1}: filled attachment no longer selectable`, !d.targetSelectable(STEPS[i].target))
      if (i < STEPS.length - 1) {
        d.check(
          `prefix ${i + 1}: incomplete and says so`,
          !st.complete && st.progressText.indexOf("Complete") < 0 && st.progressText.indexOf(`Step ${i + 2} of 5 · ${i + 1} placed`) >= 0,
          st.progressText
        )
        // Attachments two steps ahead stay unavailable.
        if (i + 2 < STEPS.length) d.check(`prefix ${i + 1}: attachment for step ${i + 3} not selectable`, !d.targetSelectable(STEPS[i + 2].target))
      }
    }
    st = d.s()
    d.check(
      "completion only with 5 accepted ids and 5 visible placed objects in order",
      st.complete && st.acceptedIds.join(",") === STEPS.map((x) => x.id).join(",") && st.placedNames.join(",") === STEPS.map((x) => "Placed " + x.id).join(","),
      `${st.acceptedIds.join(",")} | ${st.placedNames.join(",")}`
    )
    d.check("completion view is truthful", st.progressText.indexOf("Complete · 5 of 5 placed") >= 0 && st.statusText === "Virtual check only: no physical model was inspected.", `${st.progressText} | ${st.statusText}`)
    d.check("completion offers Undo and Replay, dims task controls", st.controls["undo"].lit && st.controls["replay"].lit && !st.controls["confirm"].lit && !st.controls["turn-right"].lit && !st.controls["pause"].lit)
    await d.piece("pillar")
    await d.confirm()
    st = d.s()
    d.check("input after completion is ignored", st.complete && st.placedNames.length === 5 && st.piece === null, d.brief(st))
    d.end()
  }
}
