// Source-only checks for GuideState (40897 steps 1-7). No Lens runtime claim.
// Usage (from the repo root): node validation/guide-hero/tools/guide-state-check.mjs
// Loads the real sources with Node's TypeScript type stripping (Node 24+).
// Supersedes the 2026-11-07 unattended check, whose zoom bound (1.65) and
// step-3-only constructor rule described the earlier implementation.
import assert from "node:assert/strict"
import {GuideState, OrbitDragSession, ZOOM_MAX, ZOOM_MIN} from "../../../Assets/Echoes/Guide/GuideState.ts"
import {GUIDE_SECTION} from "../../../Assets/Echoes/Guide/GuideData.ts"

const checks = []
function check(name, f) { f(); checks.push(name) }
const clone = () => structuredClone(GUIDE_SECTION)

// Original eight checks, with the justified zoom bound.
check("hero step 3 has six fixed pieces and one incoming axle", () => {
  const s = new GuideState(GUIDE_SECTION, 3)
  assert.equal(s.fixedKeys.length, 6); assert.equal(s.activeKeys.length, 1)
})
check("explode never moves fixed receivers and is reversible (every step)", () => {
  for (let n = 1; n <= 7; n++) {
    const s = new GuideState(GUIDE_SECTION, n)
    for (const k of s.fixedKeys) assert.deepEqual(s.position(k, true), s.position(k, false))
    for (const k of s.activeKeys) assert.notDeepEqual(s.position(k, true), s.position(k, false))
    const before = s.activeKeys.map((k) => s.position(k))
    for (let i = 0; i < 100; i++) s.toggleExplode()
    assert.deepEqual(s.activeKeys.map((k) => s.position(k)), before)
  }
})
check("inspect exit restores rotated and zoomed view", () => {
  const s = new GuideState(GUIDE_SECTION, 3)
  s.orbit(31, -40); s.changeZoom(.15)
  const before = [s.yawDegrees, s.pitchDegrees, s.zoom]
  s.toggleInspect(); assert.equal(s.inspecting, true); assert.equal(s.zoom, ZOOM_MAX)
  s.toggleInspect(); assert.deepEqual([s.yawDegrees, s.pitchDegrees, s.zoom], before)
})
check("inspect and underside roundtrip restores original pitch", () => {
  const s = new GuideState(GUIDE_SECTION, 3)
  const pitch = s.pitchDegrees
  s.toggleUnderside(); s.toggleInspect(); s.toggleInspect(); s.toggleUnderside()
  assert.equal(s.pitchDegrees, pitch)
})
check("home clears inspect and underside restoration state", () => {
  const s = new GuideState(GUIDE_SECTION, 3)
  s.toggleUnderside(); s.toggleInspect(); s.home()
  assert.equal(s.inspecting, false); assert.deepEqual([s.yawDegrees, s.pitchDegrees, s.zoom], [28, 26, 1])
  s.toggleUnderside(); s.toggleUnderside(); assert.equal(s.pitchDegrees, 26)
})
check("button-rail press cannot become an orbit drag", () => {
  const d = new OrbitDragSession()
  d.start(.1, .5); assert.equal(d.move(.5, .5), null); d.end()
  d.start(.5, .5); assert.deepEqual(d.move(.6, .5).map((x) => Math.round(x)), [36, 0]); d.end()
  assert.equal(d.move(.7, .5), null)
})
check("view bounds remain bounded (zoom 0.65..1.3, pitch ±170)", () => {
  const s = new GuideState(GUIDE_SECTION, 3)
  s.changeZoom(100); assert.equal(s.zoom, ZOOM_MAX); assert.equal(ZOOM_MAX, 1.3)
  s.changeZoom(-100); assert.equal(s.zoom, ZOOM_MIN)
  s.orbit(0, 10000); assert.equal(s.pitchDegrees, 170)
  s.orbit(0, -10000); assert.equal(s.pitchDegrees, -170)
})
check("zoom steps land exactly on 1.15 and 1.3", () => {
  const s = new GuideState(GUIDE_SECTION, 3)
  s.changeZoom(.15); assert.equal(s.zoom, 1.15); s.changeZoom(.15); assert.equal(s.zoom, 1.3); s.changeZoom(.15); assert.equal(s.zoom, 1.3)
})
check("invalid canonical rotation and invalid receiver rejected", () => {
  let m = clone(); m.parts[0].rotation[0] = 2; assert.throws(() => new GuideState(m, 3))
  m = clone(); m.steps[2].connections[0].receiverKeys = ["nonexistent"]; assert.throws(() => new GuideState(m, 3))
})

// Steps 1-7.
check("all seven steps construct; visible pieces grow 5,6,7,8,12,13,18", () => {
  const counts = []
  for (let n = 1; n <= 7; n++) counts.push(new GuideState(GUIDE_SECTION, n).visibleKeys.length)
  assert.deepEqual(counts, [5, 6, 7, 8, 12, 13, 18])
})
check("initial state: step 1, gear anchor fixed, four pins incoming, nothing confirmed, view from below", () => {
  const s = new GuideState(GUIDE_SECTION)
  assert.equal(s.stepNumber, 1); assert.deepEqual(s.fixedKeys, ["gear"])
  assert.deepEqual(s.activeKeys, ["lower-pin-1", "lower-pin-2", "lower-pin-3", "lower-pin-4"])
  assert.deepEqual(s.confirmed, []); assert.equal(s.finished, false); assert.equal(s.exploded, true)
  assert.deepEqual([s.yawDegrees, s.pitchDegrees, s.zoom], [28, -26, 1])
  assert.deepEqual(s.position("gear", true), [0, 0, 0])
})
check("inspect keeps the authored side but limits elevation to ±30° on every step", () => {
  for (let n = 1; n <= 7; n++) {
    const s = new GuideState(GUIDE_SECTION, n)
    const eye = s.connection().guideEyeOffsetLdu
    s.toggleInspect()
    assert.ok(Math.abs(s.pitchDegrees) <= 30 + 1e-9, `step ${n} pitch ${s.pitchDegrees}`)
    assert.equal(Math.sign(s.pitchDegrees) || 1, Math.sign(eye[1]) || 1)
    assert.equal(Math.round(s.yawDegrees * 1000) / 1000, Math.round(-Math.atan2(eye[0], eye[2]) * 180 / Math.PI * 1000) / 1000)
  }
})
check("Inspect cycles through every incoming joint, then Return restores the view (all steps)", () => {
  for (let n = 1; n <= 7; n++) {
    const s = new GuideState(GUIDE_SECTION, n)
    s.orbit(17, 5); s.changeZoom(-0.15)
    const before = [s.yawDegrees, s.pitchDegrees, s.zoom]
    const seen = []
    for (let j = 0; j < s.activeKeys.length; j++) {
      s.toggleInspect(); assert.equal(s.inspecting, true); assert.equal(s.inspectIndex, j)
      assert.equal(s.hasNextJoint, j < s.activeKeys.length - 1); seen.push(s.focusKey)
    }
    assert.deepEqual(seen, s.activeKeys)
    s.toggleInspect()
    assert.equal(s.inspecting, false); assert.deepEqual([s.yawDegrees, s.pitchDegrees, s.zoom], before)
    assert.equal(s.focusKey, s.activeKeys[0]); assert.equal(s.inspectIndex, 0)
  }
})
check("Home and step changes leave Inspect at joint 1", () => {
  const s = new GuideState(GUIDE_SECTION, 5)
  s.toggleInspect(); s.toggleInspect(); assert.equal(s.focusKey, "radial-pin-2")
  s.home(); assert.equal(s.focusKey, "radial-pin-1"); assert.equal(s.inspectIndex, 0)
  s.toggleInspect(); s.toggleInspect(); s.confirmStep(); assert.equal(s.stepNumber, 6); assert.equal(s.inspectIndex, 0); assert.equal(s.focusKey, "upper-plate")
})
check("step-1 other-side view looks from above, and back", () => {
  const s = new GuideState(GUIDE_SECTION, 1)
  s.toggleUnderside(); assert.equal(s.pitchDegrees, 110); s.toggleUnderside(); assert.equal(s.pitchDegrees, -26)
})
check("every incoming piece of every step is incoming exactly once", () => {
  const seen = []
  for (let n = 1; n <= 7; n++) seen.push(...new GuideState(GUIDE_SECTION, n).activeKeys)
  assert.equal(seen.length, 17); assert.equal(new Set(seen).size, 17); assert.ok(!seen.includes("gear"))
})
check("manual confirmation advances 1→7 and finishes assembled", () => {
  const s = new GuideState(GUIDE_SECTION)
  for (let n = 1; n <= 7; n++) { assert.equal(s.stepNumber, n); assert.equal(s.isConfirmed(), false); s.confirmStep() }
  assert.equal(s.finished, true); assert.equal(s.stepNumber, 7); assert.equal(s.exploded, false)
  assert.deepEqual(s.confirmed, [1, 2, 3, 4, 5, 6, 7])
  s.confirmStep(); assert.deepEqual(s.confirmed, [1, 2, 3, 4, 5, 6, 7]); assert.equal(s.stepNumber, 7)
})
check("step change resets inspect, explode and view to the new step's home", () => {
  const s = new GuideState(GUIDE_SECTION, 2)
  s.toggleInspect(); s.toggleExplode(); s.orbit(50, 10); s.confirmStep()
  assert.equal(s.stepNumber, 3); assert.equal(s.inspecting, false); assert.equal(s.exploded, true)
  assert.deepEqual([s.yawDegrees, s.pitchDegrees, s.zoom], [28, 26, 1])
})
check("back keeps confirmations; back from finished reopens step 7; back at step 1 stays", () => {
  const s = new GuideState(GUIDE_SECTION)
  s.confirmStep(); s.confirmStep(); assert.equal(s.stepNumber, 3)
  s.back(); assert.equal(s.stepNumber, 2); assert.equal(s.isConfirmed(), true); assert.deepEqual(s.confirmed, [1, 2])
  s.back(); s.back(); assert.equal(s.stepNumber, 1)
  const t = new GuideState(GUIDE_SECTION)
  for (let n = 1; n <= 7; n++) t.confirmStep()
  t.back(); assert.equal(t.finished, false); assert.equal(t.stepNumber, 7); assert.equal(t.exploded, true)
  assert.deepEqual(t.confirmed, [1, 2, 3, 4, 5, 6, 7])
})
check("re-confirming a reviewed step does not duplicate it", () => {
  const s = new GuideState(GUIDE_SECTION)
  s.confirmStep(); s.back(); s.confirmStep(); assert.deepEqual(s.confirmed, [1]); assert.equal(s.stepNumber, 2)
})
check("restart clears confirmations and returns to the initial state", () => {
  const s = new GuideState(GUIDE_SECTION)
  for (let n = 1; n <= 7; n++) s.confirmStep()
  s.restart()
  assert.equal(s.stepNumber, 1); assert.deepEqual(s.confirmed, []); assert.equal(s.finished, false)
  assert.equal(s.exploded, true); assert.deepEqual([s.yawDegrees, s.pitchDegrees, s.zoom], [28, -26, 1])
})

// Malformed data still rejected.
check("step numbers must be contiguous from 1", () => {
  const m = clone(); m.steps[3].number = 9; assert.throws(() => new GuideState(m), /numbered/)
})
check("a piece may appear in only one step", () => {
  const m = clone(); m.steps[1].parts = [...m.steps[1].parts, "gear"]; assert.throws(() => new GuideState(m), /more than one step/)
})
check("an anchor (non-incoming piece in a step) must not move", () => {
  const m = clone(); m.parts[0].explodeLdu = [0, 5, 0]; assert.throws(() => new GuideState(m), /must not move/)
})
check("a first step with no anchor has nothing to receive and is rejected", () => {
  const m = clone(); m.steps[0].parts = m.steps[0].parts.filter((k) => k !== "gear")
  assert.throws(() => new GuideState(m), /nothing to receive|invalid receiver/)
})
check("a receiver from a later step is rejected", () => {
  const m = clone(); m.steps[0].connections[0].receiverKeys = ["round-body"]; assert.throws(() => new GuideState(m), /invalid receiver/)
})
check("a step with no incoming piece is rejected", () => {
  const m = clone(); m.steps[5].explodeKeys = []; m.steps[5].connections = []; assert.throws(() => new GuideState(m), /no incoming/)
})
check("a separation path shorter than the insertion depth is rejected", () => {
  const m = clone(); m.parts.find((p) => p.key === "center-axle").explodeLdu = [0, 10, 0]; assert.throws(() => new GuideState(m), /separation path/)
})
check("a missing step is rejected when requested", () => {
  assert.throws(() => new GuideState(GUIDE_SECTION, 8), /missing step/)
})

console.log(JSON.stringify({time: new Date().toISOString(), kind: "source-only unit checks; no Lens runtime claim", passed: checks.length, checks}, null, 2))
