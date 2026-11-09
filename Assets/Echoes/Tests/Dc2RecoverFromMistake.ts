// Done criterion 2 · "I can recover from a specific mistake."  Matrix A2.
// Four cases (correct, wrong target, wrong piece, wrong orientation), one
// multi-error case (target + piece → target first), and a rapid repeat Confirm.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {EchoesLeafDriver} from "./EchoesLeafDriver"

@component
export class Dc2RecoverFromMistake extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc2-recover-from-mistake")
    await d.begin()

    const unchanged = (label: string, n: number) => {
      const st = d.s()
      d.check(`${label}: accepted work and progress unchanged`, st.acceptedIds.length === n && st.placedNames.length === n && st.stepIndex === n && st.progressText.indexOf(`${n} placed`) >= 0, d.brief(st))
    }

    // Wrong target only: right pillar attachment at step 1.
    await d.choose("pillar", 0, "right-pad")
    await d.confirm()
    let st = d.s()
    unchanged("wrong target", 0)
    d.check("wrong target names chosen and required attachment", st.feedback === "Not there yet: that's the right pillar attachment. Let's use the left pillar attachment first.", st.feedback)

    // Wrong piece only: beam on the left pad.
    await d.choose("beam", 90, "left-pad")
    await d.confirm()
    st = d.s()
    unchanged("wrong piece", 0)
    d.check("wrong piece names chosen and required piece", st.feedback === "That piece won't fit here: it's the long beam. Choose the square pillar.", st.feedback)

    // Multi-error: wrong piece AND wrong target → target is explained first.
    await d.choose("marker", 180, "right-pad")
    await d.confirm()
    st = d.s()
    unchanged("multi-error", 0)
    d.check("multi-error reports target first (target → piece → orientation)", st.feedback.indexOf("Not there yet: that's the right pillar attachment.") === 0, st.feedback)

    // Correct: adds exactly one.
    await d.choose("pillar", 0, "left-pad")
    await d.confirm()
    unchanged("correct (now 1)", 1)
    d.check("correct attempt accepted the left pillar", d.s().acceptedIds[0] === "p1-left-pillar")

    // Rapid repeat: three Confirms back-to-back with no settle → progress rises once.
    await d.choose("pillar", 90, "right-pad")
    await d.confirm(0)
    await d.confirm(0)
    await d.confirm(0)
    await d.confirm()
    st = d.s()
    unchanged("rapid repeat Confirm ×4", 2)
    d.check("rapid repeat placed the right pillar exactly once", st.placedNames.filter((n) => n === "Placed p2-right-pillar").length === 1, st.placedNames.join(","))

    // Wrong orientation: beam at 270 (front to back).
    await d.choose("beam", 270, "beam-seat")
    await d.confirm()
    st = d.s()
    unchanged("wrong orientation", 2)
    d.check("wrong orientation names the actual turn and the fix", st.feedback === "Not quite: at 270° the long beam runs front to back. Turn it so it spans both pillars.", st.feedback)
    d.check("color is not the only cue (correction is text)", st.panelText === st.feedback && st.feedback.length > 0, st.panelText)

    // Recover: turn once more → 0°, accepted.
    await d.turnRight()
    await d.confirm()
    unchanged("recovered", 3)
    d.end()
  }
}
