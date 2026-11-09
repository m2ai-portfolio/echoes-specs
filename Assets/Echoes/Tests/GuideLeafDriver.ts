// LEAF driver for the 40897 guide. Presses only the hero's real UIKit buttons
// (DefaultLeafInteractor.trigger) and reads EchoesGuideHero.testState().

import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {EchoesGuideHero, GuideHeroTestState} from "../Guide/EchoesGuideHero"

export const EPS = 1e-4
const SETTLE_MS = 150

export function same(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < EPS)
}

export class GuideDriver extends DefaultLeafInteractor {
  private pass = 0
  private hero: EchoesGuideHero

  constructor(private scenario: string) {
    super("Echoes Guide LEAF Interactor")
  }

  s(): GuideHeroTestState {
    if (!this.hero) {
      const so = findSceneObjectByName("Echoes 40897 Guide")
      if (!so) throw new Error("scene object 'Echoes 40897 Guide' not found")
      this.hero = so.getComponent(EchoesGuideHero.getTypeName()) as EchoesGuideHero
      if (!this.hero) throw new Error("EchoesGuideHero not found on 'Echoes 40897 Guide'")
    }
    return this.hero.testState()
  }

  view(st: GuideHeroTestState = this.s()): string {
    return `step=${st.step} confirmed=[${st.confirmed.join(",")}] finished=${st.finished} exploded=${st.exploded} inspect=${st.inspecting} ` +
      `yaw=${st.yaw.toFixed(1)} pitch=${st.pitch.toFixed(1)} zoom=${st.zoom.toFixed(2)}`
  }

  check(name: string, ok: boolean, detail: string = "") {
    print(`ECHOES leaf CHECK ${ok ? "PASS" : "FAIL"} ${this.scenario} · ${name}${detail ? " · " + detail : ""}`)
    if (ok) this.pass++
    expect(ok).toBe(true)
  }

  async press(objectName: string, settleMs: number = SETTLE_MS) {
    const it = findInteractableByName(objectName, undefined, true)
    if (!it) throw new Error(`control "${objectName}" not found or not enabled`)
    await this.trigger(it)
    if (settleMs > 0) await sleep(settleMs)
  }

  /** Start from a clean step 1 even if an earlier scenario left state behind. */
  async begin() {
    await sleep(1500)
    const st = this.s()
    this.check("hero started", st.started)
    if (st.step !== 1 || st.confirmed.length || st.finished || !st.exploded || st.inspecting || st.zoom !== 1) await this.press("Restart")
  }

  fixedCanonical(st: GuideHeroTestState = this.s()): boolean {
    return Object.keys(st.fixedExpected).every((k) => same(st.fixed[k], st.fixedExpected[k]))
  }

  incomingCanonical(st: GuideHeroTestState = this.s()): boolean {
    return Object.keys(st.incoming).every((k) => {
      const v = st.incoming[k]
      const ghostExpected = st.exploded && (!st.inspecting || k === st.focusKey)
      return same(v.solid, st.exploded ? v.expectedSeparated : v.expectedFinal) &&
        same(v.ghost, v.expectedFinal) && v.ghostShown === ghostExpected
    })
  }

  /** The visible model's bounding sphere, at the current scale, fits the model window. */
  contained(st: GuideHeroTestState = this.s()): boolean {
    return st.turntableScale * st.framingRadiusCm <= st.windowRadiusCm + EPS
  }

  end() {
    print(`ECHOES leaf END ${this.scenario} pass=${this.pass} fail=0`)
  }
}
