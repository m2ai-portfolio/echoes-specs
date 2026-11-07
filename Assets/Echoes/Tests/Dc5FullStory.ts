// Done criterion 5 · "I can finish a truthful, repeatable demonstration."
// The brief's one continuous story: begin, make and correct a wrong-piece
// choice, interrupt (help) and resume (pause), make and correct an orientation
// error, undo the latest piece and place it again, complete, then replay.
// Run twice from fresh Preview resets for the automated half of A8.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {EchoesLeafDriver} from "./EchoesLeafDriver"

@component
export class Dc5FullStory extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc5-full-story")
    await d.begin()
    const world = d.s().buildWorld
    d.assertBaseline("begin", false)

    // Wrong piece, then correct it.
    await d.choose("beam", 90, "left-pad")
    await d.confirm()
    let st = d.s()
    d.check("wrong piece corrected in words, nothing placed", st.acceptedIds.length === 0 && st.feedback.indexOf("Not this piece") === 0, st.feedback)
    await d.choose("pillar", 0, "left-pad")
    await d.confirm()
    await d.placeStep(1)
    d.check("both pillars placed", d.s().placedNames.length === 2)

    // Interrupt: help, then pause/resume with a rotated candidate.
    await d.choose("beam", 90, "beam-seat")
    const kept = d.core()
    await d.help()
    d.check("help open", d.s().overlay === "help")
    await d.confirm()
    await d.help()
    d.check("help closed, same state", d.s().overlay === "none" && d.core() === kept)
    await d.pause()
    await d.confirm()
    d.check("paused blocks Confirm", d.s().overlay === "paused" && d.s().acceptedIds.length === 2)
    await d.pause()
    d.check("resumed, same state", d.s().overlay === "none" && d.core() === kept)

    // Orientation error (beam arrives at 90°), then correct it.
    await d.confirm()
    st = d.s()
    d.check("orientation error corrected in words", st.acceptedIds.length === 2 && st.feedback.indexOf("Wrong turn: at 90°") === 0, st.feedback)
    await d.turnLeft()
    await d.confirm()
    d.check("beam accepted at 0°", d.s().acceptedIds.length === 3)

    // Undo the latest and place it again.
    await d.undo()
    d.check("undo removed only the beam", d.s().acceptedIds.length === 2 && d.s().placedNames.length === 2)
    await d.placeStep(2)
    await d.placeStep(3)
    // Marker arrives pointing away (180°): wrong; turn twice.
    await d.piece("marker")
    await d.target("marker-seat")
    await d.confirm()
    d.check("marker at 180° rejected", d.s().acceptedIds.length === 4 && d.s().feedback.indexOf("Wrong turn: at 180°") === 0, d.s().feedback)
    await d.turnRight()
    await d.turnRight()
    await d.confirm()
    st = d.s()
    d.check("complete: 5 accepted, 5 visible, truthful label", st.complete && st.placedNames.length === 5 && st.statusText.indexOf("Virtual check only") === 0, d.brief(st))

    await d.replay()
    d.assertBaseline("replay after completion", true, world)
    d.end()
  }
}
