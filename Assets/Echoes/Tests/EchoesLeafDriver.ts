// LEAF driver for Echoes (Increment 3).
//
// Drives the lens only through its real SIK/UIKit interactables using LEAF's
// DefaultLeafInteractor.trigger (hover → select → release on the actual
// Interactable component). Reads state through EchoesController.testState(),
// which is read-only and also reports what the scene shows.
//
// Every check prints `ECHOES leaf CHECK <PASS|FAIL> <scenario> · <name>` so the
// Lens Studio log is per-case evidence, then fails the scenario on the first
// FAIL via LEAF's expect().

import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractableByName, findInteractables, matchInteractableParentName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {EchoesController, EchoesTestState} from "../Scripts/EchoesController"

export const PIECE_BUTTON: {[id: string]: string} = {
  pillar: "Palette Pillar",
  beam: "Palette Beam",
  pedestal: "Palette Pedestal",
  marker: "Palette Marker",
}

export const TARGET_OBJECT: {[id: string]: string} = {
  "left-pad": "Target Left pad",
  "right-pad": "Target Right pad",
  "beam-seat": "Target Beam seat",
  "pedestal-seat": "Target Pedestal seat",
  "marker-seat": "Target Marker seat",
}

/** Authored sequence (Signal Arch v1): piece, one valid turn, attachment. */
export const STEPS: {piece: string; rot: number; target: string; id: string}[] = [
  {piece: "pillar", rot: 0, target: "left-pad", id: "p1-left-pillar"},
  {piece: "pillar", rot: 0, target: "right-pad", id: "p2-right-pillar"},
  {piece: "beam", rot: 0, target: "beam-seat", id: "p3-beam"},
  {piece: "pedestal", rot: 0, target: "pedestal-seat", id: "p4-pedestal"},
  {piece: "marker", rot: 0, target: "marker-seat", id: "p5-marker"},
]

const SETTLE_MS = 150

export class EchoesLeafDriver extends DefaultLeafInteractor {
  private pass = 0
  private controller: EchoesController

  constructor(private scenario: string) {
    super("Echoes LEAF Interactor")
  }

  // ── State ──────────────────────────────────────────────────────────────────

  ctl(): EchoesController {
    if (!this.controller) {
      const so = findSceneObjectByName("Echoes Signal Arch")
      if (!so) throw new Error("scene object 'Echoes Signal Arch' not found")
      this.controller = so.getComponent(EchoesController.getTypeName()) as EchoesController
      if (!this.controller) throw new Error("EchoesController not found on 'Echoes Signal Arch'")
    }
    return this.controller
  }

  s(): EchoesTestState {
    return this.ctl().testState()
  }

  /** Task state that help/pause must preserve (everything except the overlay itself). */
  core(st: EchoesTestState = this.s()): string {
    return JSON.stringify({
      run: st.runId,
      step: st.stepIndex,
      ids: st.acceptedIds,
      placed: st.placedNames,
      piece: st.piece,
      rot: st.rotation,
      target: st.target,
      instruction: st.instructionText,
      status: st.statusText,
      staging: [st.stagingShown, st.stagingName, st.stagingDetail],
      feedback: st.feedback,
    })
  }

  brief(st: EchoesTestState = this.s()): string {
    return (
      `run=${st.runId} mode=${st.mode} step=${st.stepIndex + 1} accepted=${st.acceptedIds.length} placed=${st.placedNames.length} ` +
      `piece=${st.piece} rot=${st.rotation} target=${st.target} feedback="${st.feedback}"`
    )
  }

  check(name: string, ok: boolean, detail: string = "") {
    const line = `ECHOES leaf CHECK ${ok ? "PASS" : "FAIL"} ${this.scenario} · ${name}${detail ? " · " + detail : ""}`
    print(line)
    if (ok) this.pass++
    expect(ok).toBe(true)
  }

  note(msg: string) {
    print(`ECHOES leaf NOTE ${this.scenario} · ${msg}`)
  }

  // ── Input (real interactables only) ────────────────────────────────────────

  async press(objectName: string, settleMs: number = SETTLE_MS) {
    const it = findInteractableByName(objectName, undefined, true)
    if (!it) throw new Error(`control "${objectName}" not found or not enabled`)
    await this.trigger(it)
    if (settleMs > 0) await sleep(settleMs)
  }

  async piece(id: string) {
    await this.press(PIECE_BUTTON[id])
  }

  async turnRight() {
    await this.press("Turn Right")
  }

  async turnLeft() {
    await this.press("Turn Left")
  }

  async confirm(settleMs: number = SETTLE_MS) {
    await this.press("Confirm", settleMs)
  }

  async help() {
    await this.press("Help")
  }

  async pause() {
    await this.press("Pause")
  }

  async undo() {
    await this.press("Undo")
  }

  async replay() {
    await this.press("Replay")
  }

  /** True when the attachment's own interactable is live (shown and enabled). */
  targetSelectable(id: string): boolean {
    return findInteractables(matchInteractableParentName(TARGET_OBJECT[id], true), undefined, true).length > 0
  }

  async target(id: string) {
    const it = findInteractables(matchInteractableParentName(TARGET_OBJECT[id], true), undefined, true)[0]
    if (!it) throw new Error(`attachment "${id}" is not selectable now`)
    await this.trigger(it)
    await sleep(SETTLE_MS)
  }

  /** Turn with the explicit Turn right control until the candidate reads `rot`. */
  async turnTo(rot: number) {
    for (let i = 0; i < 4 && this.s().rotation !== rot; i++) await this.turnRight()
    if (this.s().rotation !== rot) throw new Error(`could not turn to ${rot}°`)
  }

  async choose(piece: string, rot: number, target: string) {
    await this.piece(piece)
    await this.turnTo(rot)
    await this.target(target)
  }

  async placeStep(i: number) {
    const st = STEPS[i]
    await this.choose(st.piece, st.rot, st.target)
    await this.confirm()
  }

  // ── Scenario frame ─────────────────────────────────────────────────────────

  /** Wait for the lens; LEAF resets it before each run, so expect the fresh baseline. */
  async begin() {
    await sleep(1500)
    const st = this.s()
    this.note(`BEGIN ${this.brief(st)}`)
    this.check("lens can start with valid task data", st.canStart, `canStart=${st.canStart}`)
    if (st.acceptedIds.length > 0 || st.overlay !== "none" || st.piece || st.target) {
      // Not a fresh reset (e.g. run back-to-back without a lens reset): start over.
      this.note("state was not fresh; pressing Replay first")
      await this.replay()
    }
  }

  end() {
    print(`ECHOES leaf END ${this.scenario} pass=${this.pass} fail=0`)
  }

  /** Full A7 baseline: zero progress, initial objective, empty selection, initial orientation, no overlay, no completion. */
  assertBaseline(label: string, afterReplay: boolean, buildWorld?: number[]) {
    const st = this.s()
    const d = this.brief(st)
    this.check(`${label}: zero accepted, no placed objects`, st.acceptedIds.length === 0 && st.placedCount === 0 && st.placedNames.length === 0, d)
    this.check(
      `${label}: initial objective`,
      st.stepIndex === 0 && st.instructionText === st.stepInstructions[0] && st.progressText.indexOf("Step 1 of 5 · 0 placed") >= 0 && st.targets["left-pad"].pointer,
      `${st.progressText} | ${st.instructionText}`
    )
    this.check(
      `${label}: empty selection, initial orientation`,
      st.piece === null && st.target === null && st.rotation === 0 && !st.stagingShown && !st.ghostShown && st.stagingName === "None yet",
      d
    )
    this.check(
      `${label}: help closed, unpaused, not complete`,
      st.overlay === "none" && !st.complete && st.controls["help"].label === "Help" && st.controls["pause"].label === "Pause" && st.progressText.indexOf("HELP") < 0 && st.progressText.indexOf("PAUSED") < 0,
      `overlay=${st.overlay} complete=${st.complete} help="${st.controls["help"].label}" pause="${st.controls["pause"].label}"`
    )
    this.check(
      `${label}: earlier feedback cleared`,
      afterReplay ? st.feedbackKind === "info" && st.feedback.indexOf("Started over") === 0 : st.feedback === "",
      `"${st.feedback}"`
    )
    this.check(
      `${label}: only first-step attachments offered`,
      st.targets["left-pad"].selectable && st.targets["right-pad"].selectable && !st.targets["beam-seat"].selectable && !st.targets["pedestal-seat"].selectable && !st.targets["marker-seat"].selectable,
      JSON.stringify(st.targets)
    )
    this.check("undo dimmed at zero placements", !st.controls["undo"].lit, `undo lit=${st.controls["undo"].lit}`)
    if (buildWorld) {
      const w = st.buildWorld
      const moved = Math.abs(w[0] - buildWorld[0]) + Math.abs(w[1] - buildWorld[1]) + Math.abs(w[2] - buildWorld[2])
      this.check(`${label}: assembly world position unchanged`, moved < 0.001, `${JSON.stringify(buildWorld)} -> ${JSON.stringify(w)}`)
    }
  }
}
