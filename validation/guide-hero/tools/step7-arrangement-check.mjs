// Step-7 arrangement check against what printed page 10 of the official 40897
// instructions shows (PDF 6670807.pdf, page 10 of 56): four curved tiles form a ring
// around the pink round 2x2 centre, curved edges outward, and the seams between
// tiles sit directly over the four red radial pins.
// Usage (from the repo root): node validation/guide-hero/tools/step7-arrangement-check.mjs
// Uses the committed meshes at canonical poses. A geometric check, not physical fit.
import {GUIDE_SECTION} from "../../../Assets/Echoes/Guide/GuideData.ts"
import {GUIDE_MESHES, GUIDE_MESH_UNIT_CM} from "../../../Assets/Echoes/Guide/Generated/GuideMeshes.ts"

const Q_TO_LDU = GUIDE_MESH_UNIT_CM / 0.04
const r3 = (v) => Math.round(v * 1000) / 1000

function placed(key) {
  const part = GUIDE_SECTION.parts.find((p) => p.key === key)
  const src = GUIDE_MESHES[part.ldrawPart][0].positionsQ
  const m = part.rotation
  const out = []
  for (let i = 0; i < src.length; i += 3) {
    const x = src[i] * Q_TO_LDU, y = src[i + 1] * Q_TO_LDU, z = src[i + 2] * Q_TO_LDU
    out.push([m[0] * x + m[1] * y + m[2] * z + part.positionLdu[0],
      m[3] * x + m[4] * y + m[5] * z + part.positionLdu[1],
      m[6] * x + m[7] * y + m[8] * z + part.positionLdu[2]])
  }
  return out
}

function footprint(key) {
  const v = placed(key)
  const xs = v.map((p) => p[0]), ys = v.map((p) => p[1]), zs = v.map((p) => p[2])
  const radial = v.map((p) => Math.hypot(p[0], p[2]))
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cz = zs.reduce((a, b) => a + b, 0) / zs.length
  return {
    x: [r3(Math.min(...xs)), r3(Math.max(...xs))], y: [r3(Math.min(...ys)), r3(Math.max(...ys))],
    z: [r3(Math.min(...zs)), r3(Math.max(...zs))],
    radial: [r3(Math.min(...radial)), r3(Math.max(...radial))],
    centroidAngleDeg: r3(Math.atan2(cz, cx) * 180 / Math.PI),
  }
}

const tiles = ["arc-tile-1", "arc-tile-2", "arc-tile-3", "arc-tile-4"]
const result = {
  kind: "geometric arrangement check from committed meshes; visual source comparison is separate; not a physical-fit check",
  source: {pdf: "https://www.lego.com/cdn/product-assets/product.bi.core.pdf/6670807.pdf", sha256: "1ec7785b2c47c7dfdc7a3a16be5a04b4ffcdad0292865fae5f26b1edc87379bb", page: "printed page 10 = PDF page 10 of 56", step: 7},
  tiles: Object.fromEntries(tiles.map((k) => [k, footprint(k)])),
  centerMark: footprint("center-mark"),
  radialPins: Object.fromEntries(["radial-pin-1", "radial-pin-2", "radial-pin-3", "radial-pin-4"].map((k) => [k, footprint(k)])),
  upperPlate: footprint("upper-plate"),
}
const fp = result.tiles
const checks = {
  "each tile fills one diagonal quadrant (centroid near ±45°/±135°)": tiles.every((k) => Math.abs(((fp[k].centroidAngleDeg % 90) + 90) % 90 - 45) < 10),
  "the four tiles cover four different quadrants": new Set(tiles.map((k) => `${Math.sign(fp[k].x[0] + fp[k].x[1])},${Math.sign(fp[k].z[0] + fp[k].z[1])}`)).size === 4,
  "tiles stay on their side of the x=0 and z=0 seams": tiles.every((k) => (fp[k].x[0] >= -0.01 || fp[k].x[1] <= 0.01) && (fp[k].z[0] >= -0.01 || fp[k].z[1] <= 0.01)),
  "curved edges outward: tile outer radius reaches the plate rim": tiles.every((k) => Math.abs(fp[k].radial[1] - result.upperPlate.radial[1]) < 1.5),
  "ring opening holds the centre plate (tile inner radius ≥ centre radius)": tiles.every((k) => fp[k].radial[0] >= result.centerMark.radial[1] - 0.5),
  "radial pins sit on the seam axes (x=0 or z=0)": Object.values(result.radialPins).every((p) => Math.abs(p.centroidAngleDeg % 90) < 1 || Math.abs(Math.abs(p.centroidAngleDeg % 90) - 90) < 1),
  "tiles and centre plate share the top layer": tiles.every((k) => Math.abs(fp[k].y[0] - result.centerMark.y[0]) < 0.5),
}
result.checks = checks
result.passed = Object.values(checks).every(Boolean)
console.log(JSON.stringify(result, null, 2))
