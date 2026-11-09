// Deterministic, seeded stress pass over GuideState (40897 steps 1-7). Source-level;
// no Lens runtime claim. Usage (repo root):
//   node validation/guide-hero/tools/guide-state-stress.mjs [firstSeed] [seedCount] [actionsPerSeed]
// Defaults: 20261107 10 5000. Prints a JSON summary; exits 1 on any invariant failure.
import {GuideState, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, HOME_YAW, HOME_PITCH} from "../../../Assets/Echoes/Guide/GuideState.ts"
import {GUIDE_SECTION} from "../../../Assets/Echoes/Guide/GuideData.ts"

const firstSeed = Number(process.argv[2] || 20261107)
const seedCount = Number(process.argv[3] || 10)
const perSeed = Number(process.argv[4] || 5000)
const VISIBLE = {1: 5, 2: 6, 3: 7, 4: 8, 5: 12, 6: 13, 7: 18}
const EPS = 1e-9

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const canonical = Object.fromEntries(GUIDE_SECTION.parts.map((p) => [p.key, p.positionLdu.slice()]))
const view = (s) => [s.yawDegrees, s.pitchDegrees, s.zoom]
const sameView = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < EPS)

const ACTIONS = ["confirm", "back", "restart", "inspect", "explode", "turn", "drag", "underside", "zoomIn", "zoomOut", "home",
  "confirmBurst", "inspectThenInterrupt", "dragHuge"]

function runSeed(seed) {
  const rand = mulberry32(seed)
  const pick = (n) => Math.floor(rand() * n)
  const s = new GuideState(GUIDE_SECTION)
  const failures = []
  const counts = Object.fromEntries(ACTIONS.map((a) => [a, 0]))
  let preInspect = null // view saved by this harness when an inspection starts
  let lastAction = ""
  let maxStep = 1, finishes = 0, restarts = 0, returnsChecked = 0, undersideRoundtrips = 0

  const fail = (i, msg) => { if (failures.length < 20) failures.push({seed, action: i, after: lastAction, msg, step: s.stepNumber, view: view(s)}) }

  function inspectPress() {
    const wasInspecting = s.inspecting
    if (!wasInspecting) preInspect = view(s)
    s.toggleInspect()
    if (wasInspecting && !s.inspecting) {
      returnsChecked++
      if (preInspect && !sameView(view(s), preInspect)) return `Return did not restore the pre-Inspect view ${JSON.stringify(preInspect)}`
    }
    if (!s.inspecting) preInspect = null
    return null
  }

  function check(i) {
    const [y, p, z] = view(s)
    if (![y, p, z].every(Number.isFinite)) fail(i, "non-finite view")
    if (Math.abs(y) >= 360) fail(i, `yaw out of range ${y}`)
    if (p < -170 - EPS || p > 170 + EPS) fail(i, `pitch out of range ${p}`)
    if (z < ZOOM_MIN - EPS || z > ZOOM_MAX + EPS) fail(i, `zoom out of range ${z}`)
    const n = s.stepNumber
    if (!Number.isInteger(n) || n < 1 || n > 7) fail(i, `step out of range ${n}`)
    const c = s.confirmed
    if (new Set(c).size !== c.length) fail(i, `duplicate marks ${c}`)
    if (!c.every((v, k) => Number.isInteger(v) && v >= 1 && v <= 7 && (k === 0 || v > c[k - 1]))) fail(i, `marks not sorted/in range ${c}`)
    // Explode stays available after finishing ("Explode to see the joint again"), so finished
    // only implies step 7 with all seven marks. (First run wrongly required exploded=false.)
    if (s.finished && (n !== 7 || c.length !== 7)) fail(i, "finished state inconsistent")
    if (s.visibleKeys.length !== VISIBLE[n]) fail(i, `visible ${s.visibleKeys.length} at step ${n}`)
    const step = GUIDE_SECTION.steps[n - 1]
    if (s.activeKeys.join() !== step.explodeKeys.join()) fail(i, "active keys differ from step explode keys")
    for (const k of s.fixedKeys) {
      if (s.position(k, true).join() !== canonical[k].join() || s.position(k, false).join() !== canonical[k].join())
        fail(i, `fixed piece ${k} moved`)
    }
    for (const k of s.activeKeys) {
      if (s.position(k, false).join() !== canonical[k].join()) fail(i, `incoming ${k} final pose not canonical`)
    }
    if (s.inspecting) {
      if (!(s.inspectIndex >= 0 && s.inspectIndex < s.activeKeys.length) || s.focusKey !== s.activeKeys[s.inspectIndex])
        fail(i, "inspect focus inconsistent")
    } else if (s.inspectIndex !== 0 || s.focusKey !== s.activeKeys[0]) fail(i, "idle focus not reset to joint 1")
  }

  for (let i = 0; i < perSeed; i++) {
    const a = ACTIONS[pick(ACTIONS.length)]
    counts[a]++
    lastAction = a
    let err = null
    switch (a) {
      case "confirm": s.confirmStep(); preInspect = null; break
      case "back": s.back(); preInspect = null; break
      case "restart": {
        s.restart(); preInspect = null; restarts++
        if (s.stepNumber !== 1 || s.confirmed.length || s.finished || !s.exploded || s.inspecting ||
            !sameView(view(s), [HOME_YAW, -HOME_PITCH, 1])) err = "Restart not clean"
        break
      }
      case "inspect": err = inspectPress(); break
      case "explode": s.toggleExplode(); break
      case "turn": s.orbit(45, 0); break
      case "drag": s.orbit((rand() - 0.5) * 120, (rand() - 0.5) * 90); break
      case "dragHuge": s.orbit((rand() - 0.5) * 1e6, (rand() - 0.5) * 1e6); break
      case "underside": {
        const before = s.pitchDegrees
        const alreadyOtherSide = s.savedUnderPitch !== null // runtime-visible private field
        const otherSide = s.homePitch() > 0 ? -110 : 110
        s.toggleUnderside()
        if (rand() < 0.5) { // immediate second press
          s.toggleUnderside(); undersideRoundtrips++
          if (!alreadyOtherSide && Math.abs(s.pitchDegrees - before) > EPS)
            err = `Underside round trip changed pitch ${before} -> ${s.pitchDegrees}`
          // Entered while already on the other side: first press returns, second goes to the other side again.
          if (alreadyOtherSide && Math.abs(s.pitchDegrees - otherSide) > EPS)
            err = `Underside return-then-flip ended at ${s.pitchDegrees}, expected ${otherSide}`
        }
        break
      }
      case "zoomIn": s.changeZoom(ZOOM_STEP); break
      case "zoomOut": s.changeZoom(-ZOOM_STEP); break
      case "home": {
        s.home(); preInspect = null
        if (!sameView(view(s), [HOME_YAW, s.homePitch(), 1]) || s.inspecting) err = "Home not at the step's home view"
        break
      }
      case "confirmBurst": { // repeated (final) confirmations
        const k = 2 + pick(9)
        for (let j = 0; j < k; j++) s.confirmStep()
        preInspect = null
        break
      }
      case "inspectThenInterrupt": { // start inspecting, step partway through joints, then interrupt
        err = inspectPress()
        const more = pick(4)
        for (let j = 0; j < more && !err; j++) if (s.inspecting) err = inspectPress()
        const interrupt = ["confirm", "back", "restart", "home", "explode", "underside", "zoomIn"][pick(7)]
        if (interrupt === "confirm") { s.confirmStep(); preInspect = null }
        else if (interrupt === "back") { s.back(); preInspect = null }
        else if (interrupt === "restart") { s.restart(); preInspect = null; restarts++ }
        else if (interrupt === "home") { s.home(); preInspect = null }
        else if (interrupt === "explode") s.toggleExplode()
        else if (interrupt === "underside") s.toggleUnderside()
        else s.changeZoom(ZOOM_STEP)
        lastAction = `${a}:${interrupt}`
        break
      }
    }
    if (err) fail(i, err)
    if (s.finished) finishes++
    maxStep = Math.max(maxStep, s.stepNumber)
    check(i)
  }
  return {seed, actions: perSeed, failures, counts, maxStepReached: maxStep, actionsEndingFinished: finishes, restarts, returnsChecked, undersideRoundtrips}
}

const results = []
for (let k = 0; k < seedCount; k++) results.push(runSeed(firstSeed + k))
const totalFailures = results.reduce((n, r) => n + r.failures.length, 0)
console.log(JSON.stringify({
  kind: "seeded GuideState stress pass; source-level, no Lens runtime claim",
  time: new Date().toISOString(),
  firstSeed, seedCount, actionsPerSeed: perSeed, totalActions: seedCount * perSeed,
  totalFailures,
  totals: {
    returnsChecked: results.reduce((n, r) => n + r.returnsChecked, 0),
    undersideRoundtrips: results.reduce((n, r) => n + r.undersideRoundtrips, 0),
    restarts: results.reduce((n, r) => n + r.restarts, 0),
    actionsEndingFinished: results.reduce((n, r) => n + r.actionsEndingFinished, 0),
  },
  seeds: results,
}, null, 2))
process.exit(totalFailures ? 1 : 0)
