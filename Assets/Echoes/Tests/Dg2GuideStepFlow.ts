// 40897 guide, steps 1-7: every step's pieces and incoming parts, Explode and
// Inspect on each step, framing at maximum zoom, manual confirmation, Back
// (backtracking), finish, and Restart. Real UIKit buttons only.
//
// Every check prints `ECHOES leaf CHECK <PASS|FAIL> dg2-guide-step-flow · <name>`.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {GUIDE_SECTION} from "../Guide/GuideData"
import {EPS, GuideDriver} from "./GuideLeafDriver"

const VISIBLE = [5, 6, 7, 8, 12, 13, 18]
const FORBIDDEN = ["verified", "detected", "checked by echoes", "sensed", "confirmed by camera"]

@component
export class Dg2GuideStepFlow extends Scenario {
  async run(): Promise<void> {
    const d = new GuideDriver("dg2-guide-step-flow")
    await d.begin()
    let st = d.s()
    d.check("initial state: step 1, nothing confirmed, view from below", st.step === 1 && st.confirmed.length === 0 && !st.finished && st.pitch === -26 && st.sideLabel === "Top side", d.view(st))
    d.check("step 1 shows the gear as its fixed anchor", Object.keys(st.fixed).join(",") === "gear" && d.fixedCanonical(st))
    await d.press("Back")
    d.check("Back at step 1 stays on step 1", d.s().step === 1, d.view())

    for (let n = 1; n <= 7; n++) {
      const step = GUIDE_SECTION.steps[n - 1]
      st = d.s()
      d.check(`step ${n}: title, instruction and unconfirmed line`, st.step === n && st.titleText.indexOf(`step ${n} / 7`) > 0 && st.statusText === step.instruction && st.confirmText.indexOf("of 7 marked by you") > 0, `${st.titleText} · ${st.confirmText}`)
      d.check(`step ${n}: ${VISIBLE[n - 1]} pieces shown, later pieces hidden`, st.shownParts.length === VISIBLE[n - 1], st.shownParts.join(","))
      d.check(`step ${n}: a ghost and an insertion path for each of ${step.explodeKeys.length} incoming pieces`, st.shownGhosts.join(",") === step.explodeKeys.join(",") && st.shownCues.join(",") === step.explodeKeys.join(","), st.shownGhosts.join(","))
      d.check(`step ${n}: fixed pieces and incoming pieces at canonical poses`, d.fixedCanonical(st) && d.incomingCanonical(st))
      await d.press("Explode")
      st = d.s()
      d.check(`step ${n}: Reassemble seats every incoming piece; ghosts and paths hide`, !st.exploded && d.incomingCanonical(st) && d.fixedCanonical(st) && st.shownGhosts.length === 0 && st.shownCues.length === 0)
      await d.press("Explode")
      for (let i = 0; i < 3; i++) await d.press("Zoom in", 50)
      st = d.s()
      d.check(`step ${n}: maximum zoom keeps the whole model inside the window`, Math.abs(st.zoom - 1.3) < EPS && d.contained(st), `scale=${st.turntableScale.toFixed(3)} radius=${st.framingRadiusCm.toFixed(2)}`)
      const beforeInspect = [st.yaw, st.pitch, st.zoom]
      const joints = step.explodeKeys.length
      for (let j = 0; j < joints; j++) {
        await d.press("Inspect")
        st = d.s()
        const key = step.explodeKeys[j]
        const feature = step.connections.find((c) => c.incomingKey === key).matingFeature
        const tag = joints > 1 ? ` (joint ${j + 1} of ${joints})` : ""
        const label = j < joints - 1 ? "Next joint" : "Return"
        d.check(`step ${n}: Inspect joint ${j + 1}/${joints} (${key}) shows only its ghost and names it`,
          st.inspecting && st.focusKey === key && st.detailText.indexOf(`Inspect${tag}: ${feature}`) === 0 &&
          st.shownGhosts.join(",") === key && st.shownCues.join(",") === key && st.inspectLabel === label &&
          Math.abs(st.pitch) <= 30 + EPS && d.contained(st) && d.fixedCanonical(st) && d.incomingCanonical(st),
          `${st.detailText} · ${st.inspectLabel}`)
      }
      await d.press("Inspect")
      st = d.s()
      d.check(`step ${n}: Return after the last joint restores the view and every ghost`,
        !st.inspecting && Math.abs(st.yaw - beforeInspect[0]) < EPS && Math.abs(st.pitch - beforeInspect[1]) < EPS &&
        Math.abs(st.zoom - beforeInspect[2]) < EPS && st.shownGhosts.join(",") === step.explodeKeys.join(",") && st.inspectLabel === "Inspect joint",
        d.view(st))
      await d.press("Placed")
    }

    st = d.s()
    d.check("after step 7: finished, all seven marked, shown assembled", st.finished && st.step === 7 && st.confirmed.join(",") === "1,2,3,4,5,6,7" && !st.exploded && st.confirmLabel === "All marked", d.view(st))
    d.check("finish wording says the marks are the user's", st.confirmText.indexOf("You marked all 7 steps placed") === 0, st.confirmText)
    await d.press("Placed")
    d.check("pressing again after finishing changes nothing", d.s().finished && d.s().confirmed.length === 7)

    await d.press("Back")
    st = d.s()
    d.check("Back from finished reopens step 7, exploded, keeping marks", !st.finished && st.step === 7 && st.exploded && st.confirmed.length === 7, d.view(st))
    await d.press("Back")
    await d.press("Back")
    st = d.s()
    d.check("Back twice reaches step 5 with its four red pins incoming", st.step === 5 && st.shownGhosts.length === 4 && d.fixedCanonical(st) && d.incomingCanonical(st), d.view(st))
    d.check("a reviewed step says it was already marked by you", st.confirmText.indexOf("You already marked step 5 placed") === 0, st.confirmText)
    await d.press("Placed")
    st = d.s()
    d.check("re-marking a reviewed step moves on without duplicating", st.step === 6 && st.confirmed.join(",") === "1,2,3,4,5,6,7", d.view(st))

    const texts = [st.titleText, st.statusText, st.detailText, st.confirmText].join(" ").toLowerCase()
    d.check("no text claims Echoes checked the physical bricks", FORBIDDEN.every((w) => texts.indexOf(w) < 0), texts)

    await d.press("Restart")
    st = d.s()
    d.check("Restart clears marks and returns to the initial step-1 view", st.step === 1 && st.confirmed.length === 0 && !st.finished && st.exploded && st.yaw === 28 && st.pitch === -26 && st.zoom === 1 && st.shownParts.length === 5, d.view(st))
    d.end()
  }
}
