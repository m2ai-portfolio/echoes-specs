/** Per-piece LDraw mesh construction. Source rotations are baked into vertices. */
import {MeshAccumulator} from "../Scripts/EchoesMeshes"
import {GUIDE_MESHES, GUIDE_MESH_UNIT_CM} from "./Generated/GuideMeshes"
import {GuidePart} from "./GuideState"

function rotatedPoint(p: GuidePart, x: number, y: number, z: number): vec3 {
  const m = p.rotation
  const s = GUIDE_MESH_UNIT_CM
  return new vec3(
    (m[0] * x + m[1] * y + m[2] * z) * s,
    (m[3] * x + m[4] * y + m[5] * z) * s,
    (m[6] * x + m[7] * y + m[8] * z) * s
  )
}

/** Rotated part vertices in cm, relative to the part origin, as flat xyz triples. */
export function guidePartVertices(part: GuidePart): number[] {
  const batches = GUIDE_MESHES[part.ldrawPart]
  if (!batches || batches.length !== 1) throw new Error(`unverified LDraw material batches ${part.ldrawPart}`)
  const src = batches[0].positionsQ
  const m = part.rotation
  const s = GUIDE_MESH_UNIT_CM
  const out: number[] = []
  for (let i = 0; i < src.length; i += 3) {
    const x = src[i], y = src[i + 1], z = src[i + 2]
    out.push((m[0] * x + m[1] * y + m[2] * z) * s, (m[3] * x + m[4] * y + m[5] * z) * s, (m[6] * x + m[7] * y + m[8] * z) * s)
  }
  return out
}

export function buildGuidePartMesh(part: GuidePart): RenderMesh {
  const batches = GUIDE_MESHES[part.ldrawPart]
  if (!batches || batches.length !== 1 || batches[0].colorCode !== "16")
    throw new Error(`unverified LDraw material batches ${part.ldrawPart}`)
  const source = batches[0]
  if (source.triangleCount * 3 > 65535 || source.positionsQ.length !== source.triangleCount * 9)
    throw new Error(`unsafe mesh size ${part.ldrawPart}`)
  const mesh = new MeshAccumulator(1.6)
  for (let i = 0; i < source.positionsQ.length; i += 9) {
    const a = rotatedPoint(part, source.positionsQ[i], source.positionsQ[i + 1], source.positionsQ[i + 2])
    const b = rotatedPoint(part, source.positionsQ[i + 3], source.positionsQ[i + 4], source.positionsQ[i + 5])
    const c = rotatedPoint(part, source.positionsQ[i + 6], source.positionsQ[i + 7], source.positionsQ[i + 8])
    const face = b.sub(a).cross(c.sub(a))
    if (face.dot(face) < 1e-12) throw new Error(`zero-area mesh triangle ${part.ldrawPart}`)
    mesh.tri(a, b, c, face.normalize())
  }
  return mesh.build()
}
