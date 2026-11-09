// Echoes — runtime mesh helpers shared by the controller and the workshop look.
//
// Increment 22 (richness pass 1): moved out of EchoesController.ts unchanged
// except that every vertex now carries a planar UV (cm / uvScale), projected on
// the plane its face normal is closest to. Geometry, winding, and normals are
// identical to Increments 1–21, so placement, pick volumes, and colliders are
// unaffected; the UVs only let the procedural finish textures map onto faces.

export class MeshAccumulator {
  verts: number[] = []
  indices: number[] = []
  private count = 0

  /** Centimetres per texture tile for planar UVs. */
  constructor(public uvScale: number = 10) {}

  private uv(p: vec3, n: vec3): [number, number] {
    const ax = Math.abs(n.x)
    const ay = Math.abs(n.y)
    const az = Math.abs(n.z)
    const s = this.uvScale
    // Grain/brush direction runs along X on the front, back, and top faces, and
    // along Z on the ends, so a beam's grain follows its length.
    if (ay >= ax && ay >= az) return [p.x / s, p.z / s]
    if (ax >= az) return [p.z / s, p.y / s]
    return [p.x / s, p.y / s]
  }

  private push(p: vec3, n: vec3, uv?: [number, number]) {
    const t = uv || this.uv(p, n)
    this.verts.push(p.x, p.y, p.z, n.x, n.y, n.z, t[0], t[1])
  }

  quad(a: vec3, b: vec3, c: vec3, d: vec3, n: vec3, uvs?: [number, number][]) {
    // a,b,c,d counter-clockwise when viewed from the side the normal faces.
    const base = this.count
    const pts = [a, b, c, d]
    for (let i = 0; i < 4; i++) this.push(pts[i], n, uvs ? uvs[i] : undefined)
    this.indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    this.count += 4
  }

  tri(a: vec3, b: vec3, c: vec3, n: vec3) {
    const base = this.count
    for (const p of [a, b, c]) this.push(p, n)
    this.indices.push(base, base + 1, base + 2)
    this.count += 3
  }

  /** Convex planar polygon; winding and normal are fixed to face away from `inside`. */
  poly(points: vec3[], inside: vec3) {
    let pts = points
    let n = pts[1].sub(pts[0]).cross(pts[2].sub(pts[0])).normalize()
    let centroid = vec3.zero()
    for (const p of pts) centroid = centroid.add(p)
    centroid = centroid.uniformScale(1 / pts.length)
    if (n.dot(centroid.sub(inside)) < 0) {
      pts = pts.slice().reverse()
      n = n.uniformScale(-1)
    }
    const base = this.count
    for (const p of pts) this.push(p, n)
    for (let i = 1; i < pts.length - 1; i++) this.indices.push(base, base + i, base + i + 1)
    this.count += pts.length
  }

  /** Axis-aligned box with its bottom-center at `o`. */
  box(o: vec3, w: number, h: number, d: number) {
    const x0 = o.x - w / 2
    const x1 = o.x + w / 2
    const y0 = o.y
    const y1 = o.y + h
    const z0 = o.z - d / 2
    const z1 = o.z + d / 2
    const v = (a: number, b: number, c: number) => new vec3(a, b, c)
    this.quad(v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1), v(0, 0, 1)) // front +Z
    this.quad(v(x1, y0, z0), v(x0, y0, z0), v(x0, y1, z0), v(x1, y1, z0), v(0, 0, -1)) // back
    this.quad(v(x1, y0, z1), v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1), v(1, 0, 0)) // right
    this.quad(v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0), v(-1, 0, 0)) // left
    this.quad(v(x0, y1, z1), v(x1, y1, z1), v(x1, y1, z0), v(x0, y1, z0), v(0, 1, 0)) // top
    this.quad(v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1), v(0, -1, 0)) // bottom
  }

  build(): RenderMesh {
    const mb = new MeshBuilder([
      {name: "position", components: 3},
      {name: "normal", components: 3, normalized: true},
      {name: "texture0", components: 2},
    ])
    mb.topology = MeshTopology.Triangles
    mb.indexType = MeshIndexType.UInt16
    mb.appendVerticesInterleaved(this.verts)
    mb.appendIndices(this.indices)
    mb.updateMesh()
    return mb.getMesh()
  }
}

/** Box with origin at bottom-center. */
export function boxMesh(w: number, h: number, d: number, uvScale: number = 10): RenderMesh {
  const m = new MeshAccumulator(uvScale)
  m.box(vec3.zero(), w, h, d)
  return m.build()
}

/**
 * Flat rectangle facing `normal` (+Y floor-like or +Z wall-like), centered at
 * the origin, with one texture tile stretched across the whole surface (so a
 * baked vignette stays centered).
 */
export function panelMesh(w: number, h: number, facing: "up" | "front"): RenderMesh {
  const m = new MeshAccumulator()
  const x = w / 2
  const y = h / 2
  const uvs: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  if (facing === "up") {
    // h runs along -Z (away from the viewer); v = 1 at the far edge.
    m.quad(new vec3(-x, 0, y), new vec3(x, 0, y), new vec3(x, 0, -y), new vec3(-x, 0, -y), new vec3(0, 1, 0), uvs)
  } else {
    m.quad(new vec3(-x, -y, 0), new vec3(x, -y, 0), new vec3(x, y, 0), new vec3(-x, y, 0), new vec3(0, 0, 1), uvs)
  }
  return m.build()
}
