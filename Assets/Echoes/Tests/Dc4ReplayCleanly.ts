// Done criterion 4 (replay half) · "Replay restores the baseline from every
// supported state, without late feedback from the previous run."  Matrix A7:
// active, correction, help, pause, completion; a delayed callback scheduled in
// the old run; the assembly's world position. (The camera-move case is a
// separate MovePreviewCamera check, see the Increment 3 report.)
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {EchoesLeafDriver} from "./EchoesLeafDriver"

@component
export class Dc4ReplayCleanly extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc4-replay-cleanly")
    await d.begin()
    const world = d.s().buildWorld

    const replayFrom = async (label: string, expectMode: string) => {
      const st = d.s()
      d.check(`reached ${label} state`, st.mode === expectMode, d.brief(st))
      const run = st.runId
      await d.replay()
      d.check(`replay from ${label} starts a new run`, d.s().runId === run + 1)
      d.assertBaseline(`replay from ${label}`, true, world)
    }

    // Active: one placed, a candidate chosen and turned, a target chosen.
    await d.placeStep(0)
    await d.choose("pillar", 90, "right-pad")
    await replayFrom("active", "active")

    // Correction: wrong piece rejected.
    await d.choose("beam", 90, "left-pad")
    await d.confirm()
    await replayFrom("correction", "correction")

    // Help open with a candidate.
    await d.placeStep(0)
    await d.choose("pillar", 0, "right-pad")
    await d.help()
    await replayFrom("help", "help")

    // Paused with a turned candidate.
    await d.placeStep(0)
    await d.choose("pillar", 90, "right-pad")
    await d.pause()
    await replayFrom("pause", "paused")

    // Completion.
    for (let i = 0; i < 5; i++) await d.placeStep(i)
    await replayFrom("completion", "complete")

    // Delayed callback: accepting schedules the 8 s "Placed" note clear in the
    // old run. Replay before it fires; afterwards the new run must be unchanged.
    await d.placeStep(0)
    const oldRun = d.s().runId
    await sleep(2000)
    await d.replay()
    const after = d.core()
    d.note(`replayed at +2 s from run ${oldRun}; waiting past the old 8 s callback`)
    await sleep(8000)
    const st = d.s()
    d.check("old run's delayed callback cannot change the new run", d.core(st) === after && st.feedback.indexOf("Started over") === 0 && st.runId === oldRun + 1, d.core(st))
    d.assertBaseline("after stale callback window", true, world)
    d.end()
  }
}
