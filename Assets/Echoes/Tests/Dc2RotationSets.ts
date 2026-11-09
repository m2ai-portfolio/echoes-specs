// Done criterion 2 (equivalent rotations succeed) · Matrix A3.
// Every turn of every piece is tried as its own attempt against the authored
// valid set: accepted turns are undone before the next one is tried, rejected
// turns start again from a fresh palette pick (which resets the candidate turn).
//   pillar (both pads) {0,90,180,270} · beam {0,180} · pedestal {0,90,180,270} · marker {0}
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {EchoesLeafDriver, STEPS} from "./EchoesLeafDriver"

const VALID: number[][] = [
  [0, 90, 180, 270],
  [0, 90, 180, 270],
  [0, 180],
  [0, 90, 180, 270],
  [0],
]

@component
export class Dc2RotationSets extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc2-rotation-sets")
    await d.begin()

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i]
      // Try invalid turns first, then valid ones; end with the step accepted.
      const order = [0, 90, 180, 270].filter((r) => VALID[i].indexOf(r) < 0).concat(VALID[i])
      for (let k = 0; k < order.length; k++) {
        const rot = order[k]
        const valid = VALID[i].indexOf(rot) >= 0
        const last = k === order.length - 1
        await d.choose(step.piece, rot, step.target)
        const before = d.s()
        await d.confirm()
        const st = d.s()
        if (valid) {
          d.check(
            `${step.piece} at ${rot}° on ${step.target} accepted (valid set ${JSON.stringify(VALID[i])})`,
            st.acceptedIds.length === i + 1 && st.acceptedIds[i] === step.id && st.placedNames.length === i + 1,
            d.brief(st)
          )
          if (!last) {
            await d.undo()
            const u = d.s()
            d.check(`undo restores step ${i + 1} for the next turn`, u.acceptedIds.length === i && u.placedNames.length === i && u.stepIndex === i, d.brief(u))
          }
        } else {
          d.check(
            `${step.piece} at ${rot}° on ${step.target} rejected as orientation (valid set ${JSON.stringify(VALID[i])})`,
            st.acceptedIds.length === before.acceptedIds.length && st.placedNames.length === i && st.feedback.indexOf(`Not quite: at ${rot}°`) === 0,
            `${d.brief(st)}`
          )
        }
      }
    }
    const st = d.s()
    d.check("all five accepted with authored turns; completion reached", st.complete && st.placedNames.length === 5, d.brief(st))
    d.end()
  }
}
