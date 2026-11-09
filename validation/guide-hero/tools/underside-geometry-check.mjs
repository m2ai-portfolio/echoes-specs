// Underside geometry check for the 40897 guide (step 3 view from below).
// Usage (from the repo root): node validation/guide-hero/tools/underside-geometry-check.mjs
// Loads the real guide sources with Node's TypeScript type stripping, places every
// part at its canonical pose exactly as GuideMeshFactory does (rotation baked into
// vertices, then the canonical LDU position), and casts vertical rays upward from
// below the model. Reports which part each ray hits first and the part bounds.
import {GUIDE_SECTION} from "../../../Assets/Echoes/Guide/GuideData.ts"
import {GUIDE_MESHES, GUIDE_MESH_UNIT_CM} from "../../../Assets/Echoes/Guide/Generated/GuideMeshes.ts"

const LDU_CM = 0.04
const Q_TO_LDU = GUIDE_MESH_UNIT_CM / LDU_CM
const STEP = Number(process.argv[2] || 3)

const visible = GUIDE_SECTION.steps.filter((s) => s.number <= STEP).flatMap((s) => s.parts)
const parts = GUIDE_SECTION.parts.filter((p) => visible.includes(p.key))

function placed(part) {
  const src = GUIDE_MESHES[part.ldrawPart][0].positionsQ
  const m = part.rotation
  const out = new Float64Array(src.length)
  for (let i = 0; i < src.length; i += 3) {
    const x = src[i] * Q_TO_LDU, y = src[i + 1] * Q_TO_LDU, z = src[i + 2] * Q_TO_LDU
    out[i] = m[0] * x + m[1] * y + m[2] * z + part.positionLdu[0]
    out[i + 1] = m[3] * x + m[4] * y + m[5] * z + part.positionLdu[1]
    out[i + 2] = m[6] * x + m[7] * y + m[8] * z + part.positionLdu[2]
  }
  return out
}

const geo = parts.map((p) => ({key: p.key, ldraw: p.ldrawPart, v: placed(p)}))

function bounds(v) {
  const b = {minY: Infinity, maxY: -Infinity, maxRadial: 0}
  for (let i = 0; i < v.length; i += 3) {
    b.minY = Math.min(b.minY, v[i + 1]); b.maxY = Math.max(b.maxY, v[i + 1])
    b.maxRadial = Math.max(b.maxRadial, Math.hypot(v[i], v[i + 2]))
  }
  for (const k of Object.keys(b)) b[k] = Math.round(b[k] * 1000) / 1000
  return b
}

// Upward ray (x, -1000, z) + t(0, 1, 0) against each triangle (Möller–Trumbore).
function firstHitUp(x, z) {
  let best = null
  for (const g of geo) {
    const v = g.v
    for (let i = 0; i < v.length; i += 9) {
      const ax = v[i], ay = v[i + 1], az = v[i + 2]
      const e1x = v[i + 3] - ax, e1y = v[i + 4] - ay, e1z = v[i + 5] - az
      const e2x = v[i + 6] - ax, e2y = v[i + 7] - ay, e2z = v[i + 8] - az
      // dir = (0,1,0): p = dir × e2 = (e2z, 0, -e2x)
      const px = e2z, pz = -e2x
      const det = e1x * px + e1z * pz
      if (Math.abs(det) < 1e-12) continue
      const inv = 1 / det
      const tx = x - ax, ty = -1000 - ay, tz = z - az
      const u = (tx * px + tz * pz) * inv
      if (u < 0 || u > 1) continue
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x
      const w = qy * inv
      if (w < 0 || u + w > 1) continue
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv
      if (t <= 0) continue
      const y = -1000 + t
      if (!best || y < best.y) best = {part: g.key, y: Math.round(y * 1000) / 1000}
    }
  }
  return best
}

const samples = [[0, 0], [5, 0], [0, 5], [10, 10], [20, 0], [0, 20], [-20, 0], [28, 0], [0, -28], [35, 0], [45, 0]]
const result = {
  kind: "geometry check from the committed guide meshes; no Lens runtime claim",
  step: STEP,
  visibleParts: geo.map((g) => g.key),
  boundsLdu: Object.fromEntries(geo.map((g) => [g.key, bounds(g.v)])),
  upwardRayFirstHit: samples.map(([x, z]) => ({x, z, hit: firstHitUp(x, z)})),
}
console.log(JSON.stringify(result, null, 2))
