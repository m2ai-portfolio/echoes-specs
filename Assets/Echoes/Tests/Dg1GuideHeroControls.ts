// 40897 guide, step 3 (axle into the gear's center cross-hole): Rotate, Explode,
// Inspect Connection, Underside, Zoom bounds and framing, Home, and rapid repeats,
// driven through the hero's real UIKit buttons with DefaultLeafInteractor.trigger.
// Reads EchoesGuideHero.testState(), which reports GuideState and the scene transforms.
//
// Every check prints `ECHOES leaf CHECK <PASS|FAIL> dg1-guide-hero-controls · <name>`.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {EPS, GuideDriver, same} from "./GuideLeafDriver"

const SETTLE_MS = 150

@component
export class Dg1GuideHeroControls extends Scenario {
  async run(): Promise<void> {
    const d = new GuideDriver("dg1-guide-hero-controls")
    await d.begin()
    // Reach step 3 through the real step controls.
    await d.press("Placed")
    await d.press("Placed")
    let st = d.s()
    d.check("two confirmations reach step 3", st.step === 3 && st.confirmed.join(",") === "1,2", d.view(st))
    d.check("step 3 opens at the authored home, exploded", st.exploded && !st.inspecting && st.yaw === 28 && st.pitch === 26 && st.zoom === 1, d.view(st))
    d.check("fixed receivers at canonical poses (6)", Object.keys(st.fixed).length === 6 && d.fixedCanonical(st))
    d.check("incoming axle separated, ghost at final pose, path shown", d.incomingCanonical(st) && st.axisCueShown)
    const homeRotation = st.turntableRotation.slice()
    const homeScale = st.turntableScale

    await d.press("Explode")
    st = d.s()
    d.check("Reassemble seats the axle at its final pose", !st.exploded && d.incomingCanonical(st) && !st.axisCueShown && st.explodeLabel === "Explode", d.view(st))
    d.check("Reassemble leaves fixed receivers fixed and does not rescale", d.fixedCanonical(st) && Math.abs(st.turntableScale - homeScale) < EPS)
    await d.press("Explode")
    st = d.s()
    d.check("Explode restores the separated pose and label", st.exploded && d.incomingCanonical(st) && st.axisCueShown && st.explodeLabel === "Reassemble", d.view(st))

    for (let i = 0; i < 3; i++) await d.press("Turn")
    st = d.s()
    d.check("Turn 45° ×3 rotates the view to yaw 163", Math.abs(st.yaw - 163) < EPS && st.pitch === 26, d.view(st))
    d.check("rotation never moves parts relative to the model", d.fixedCanonical(st) && d.incomingCanonical(st))
    const turned = [st.yaw, st.pitch, st.zoom]

    await d.press("Inspect")
    st = d.s()
    d.check("Inspect enters the connection view at the framing limit", st.inspecting && st.inspectLabel === "Return" && st.detailText.indexOf("Inspect: red cross axle enters gear center cross-hole") === 0 && Math.abs(st.zoom - 1.3) < EPS, `${d.view(st)} · ${st.detailText}`)
    d.check("Inspect keeps parts canonical and the whole model inside the window", d.fixedCanonical(st) && d.incomingCanonical(st) && d.contained(st))
    await d.press("Inspect")
    st = d.s()
    d.check("Return restores the turned view exactly", !st.inspecting && same([st.yaw, st.pitch, st.zoom], turned) && st.inspectLabel === "Inspect joint", d.view(st))

    await d.press("Underside")
    d.check("Underside flips to pitch -110", d.s().pitch === -110 && d.s().sideLabel === "Underside", d.view())
    await d.press("Inspect")
    await d.press("Inspect")
    await d.press("Underside")
    st = d.s()
    d.check("Underside → Inspect → Return → Underside restores pitch 26", st.pitch === 26 && !st.inspecting, d.view(st))

    for (let i = 0; i < 10; i++) await d.press("Zoom in", 50)
    st = d.s()
    d.check("Zoom + clamps at 1.3", Math.abs(st.zoom - 1.3) < EPS, d.view(st))
    d.check("at maximum zoom the whole model's bounding sphere fits the window", d.contained(st), `scale=${st.turntableScale.toFixed(3)} radius=${st.framingRadiusCm.toFixed(2)} window=${st.windowRadiusCm}`)
    for (let i = 0; i < 12; i++) await d.press("Zoom out", 50)
    d.check("Zoom − clamps at 0.65", Math.abs(d.s().zoom - 0.65) < EPS, d.view())

    await d.press("Home")
    st = d.s()
    d.check("Home returns to yaw 28, pitch 26, zoom 1", !st.inspecting && st.yaw === 28 && st.pitch === 26 && st.zoom === 1, d.view(st))
    d.check("Home turntable transform equals the opening transform", same(st.turntableRotation, homeRotation) && Math.abs(st.turntableScale - homeScale) < EPS)

    for (let i = 0; i < 20; i++) await d.press("Explode", 0)
    await sleep(SETTLE_MS)
    st = d.s()
    d.check("20 rapid Explode presses return to exploded with no drift", st.exploded && d.incomingCanonical(st) && d.fixedCanonical(st), d.view(st))
    for (let i = 0; i < 9; i++) await d.press("Inspect", 0)
    await sleep(SETTLE_MS)
    st = d.s()
    d.check("9 rapid Inspect presses end inspecting", st.inspecting, d.view(st))
    await d.press("Inspect")
    st = d.s()
    d.check("after rapid Inspect, Return restores home view", !st.inspecting && st.yaw === 28 && st.pitch === 26 && st.zoom === 1, d.view(st))

    await d.press("Restart")
    st = d.s()
    d.check("Restart leaves a clean step 1 for the next scenario", st.step === 1 && st.confirmed.length === 0 && !st.finished, d.view(st))
    d.end()
  }
}
