// Done criterion 1 · "I can place the next piece."  Matrix A1 (+ A2 correct case).
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {EchoesLeafDriver} from "./EchoesLeafDriver"

@component
export class Dc1PlaceNextPiece extends Scenario {
  async run(): Promise<void> {
    const d = new EchoesLeafDriver("dc1-place-next-piece")
    await d.begin()
    d.assertBaseline("fresh start", false)
    let st = d.s()
    d.check("start shows goal context and disclosure", st.progressText.indexOf("Signal Arch v1") === 0, st.progressText)
    // Increment 23: the story intro in Echoes' voice, with the disclosure unchanged and the step-1 instruction still shown.
    d.check(
      "start shows the story intro, unchanged disclosure, and step 1",
      st.introShown && st.panelText.indexOf("The relay's beacon went dark.") === 0 &&
        st.disclosureText === "Virtual build demo · enlarged pieces · no physical bricks are recognized" &&
        st.instructionText === st.stepInstructions[0] && !st.beaconLit && st.beaconLevel === 0,
      `${st.panelText} | ${st.disclosureText}`
    )

    // Select a candidate: it becomes visible in the staging card at its authored turn.
    await d.piece("pillar")
    st = d.s()
    d.check("select piece shows the candidate", st.piece === "pillar" && st.stagingShown && st.stagingName === "Pillar" && st.stagingDetail === "Turned 0°" && st.palette["pillar"].label === "[ Pillar ]", d.brief(st))

    // Change orientation with the explicit 90° controls; the candidate stays visible.
    await d.turnRight()
    st = d.s()
    d.check("Turn right turns the candidate 90°", st.rotation === 90 && st.stagingShown && st.stagingDetail === "Turned 90°", d.brief(st))
    await d.turnLeft()
    st = d.s()
    d.check("Turn left turns it back to 0°", st.rotation === 0 && st.stagingDetail === "Turned 0°", d.brief(st))

    // Choose the attachment: the candidate ghost appears there; nothing is placed yet.
    await d.target("left-pad")
    st = d.s()
    d.check(
      "candidate, target, and instruction visible together before Confirm",
      st.target === "left-pad" && st.ghostShown && st.stagingShown && st.targets["left-pad"].label === "[ Left pad ]" &&
        st.statusText.indexOf("square pillar at 0°") >= 0 && st.statusText.indexOf("Left pad") >= 0 && st.instructionText === st.stepInstructions[0],
      `${st.statusText} | ${st.instructionText}`
    )
    d.check("choosing does not place", st.acceptedIds.length === 0 && st.placedNames.length === 0, d.brief(st))
    // Increment 15 Confirm cue: once piece and attachment are both chosen, the status
    // gains the line "Press Confirm to place" and the Confirm label pulses.
    d.check(
      "staged candidate cues Confirm (status text and pulse)",
      st.confirmCue && st.statusText.indexOf("· Left pad\nPress Confirm to place") > 0,
      st.statusText
    )

    // Attempt: correct placement adds exactly one visible piece and one accepted placement.
    await d.confirm()
    st = d.s()
    d.check(
      "correct Confirm adds one piece and advances once",
      st.acceptedIds.join(",") === "p1-left-pillar" && st.placedNames.join(",") === "Placed p1-left-pillar" && st.stepIndex === 1,
      d.brief(st)
    )
    d.check("progress text agrees with the scene", st.progressText.indexOf("Step 2 of 5 · 1 placed") >= 0 && st.instructionText === st.stepInstructions[1], st.progressText)
    d.check("candidate cleared after accept, Confirm cue stopped", st.piece === null && st.target === null && !st.ghostShown && !st.confirmCue, d.brief(st))
    d.check("success note names what was placed", st.feedbackKind === "ok" && st.feedback.indexOf("Placed the square pillar on Left pad. 1 of 5 accepted.") === 0, st.feedback)
    d.check("intro gives way after the first accepted placement; disclosure stays", !st.introShown && st.panelText === st.feedback && st.disclosureText.indexOf("Virtual build demo") === 0, st.panelText)

    // Deliberately wrong orientation: the beam arrives at 90° (front to back).
    await d.placeStep(1)
    await d.piece("beam")
    await d.target("beam-seat")
    st = d.s()
    d.check("beam arrives turned 90° and is visible", st.rotation === 90 && st.stagingName === "Beam" && st.ghostShown, d.brief(st))
    await d.confirm()
    st = d.s()
    d.check(
      "wrong orientation rejected, progress unchanged",
      st.acceptedIds.length === 2 && st.placedNames.length === 2 && st.stepIndex === 2 && st.mode === "correction",
      d.brief(st)
    )
    d.check("correction names the orientation and the fix", st.feedback.indexOf("Not quite: at 90° the long beam runs front to back.") === 0 && st.feedback.indexOf("spans both pillars") > 0, st.feedback)
    d.check("candidate kept for another try", st.piece === "beam" && st.rotation === 90 && st.target === "beam-seat", d.brief(st))
    await d.turnRight()
    await d.confirm()
    st = d.s()
    d.check("turned to 180° the beam is accepted", st.acceptedIds.length === 3 && st.placedNames[2] === "Placed p3-beam", d.brief(st))
    d.end()
  }
}
