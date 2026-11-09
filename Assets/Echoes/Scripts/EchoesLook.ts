// Echoes — workshop look (Increment 22, richness pass 1).
//
// Additive visual polish only. Nothing here reads or changes task state, and
// no object built here has a collider or an Interactable, so input, placement,
// and control hit areas are exactly as before.
//
//   • Procedural finish textures, generated in code at start (no imported art):
//     brushed plastic, wood grain, stone, brushed metal, slate, table top,
//     backdrop, floor. They are light, low-contrast detail maps multiplied by
//     each piece's own (light) color, so hue still carries the piece identity
//     and nothing relies on black on the additive display.
//   • Piece families: pillar = brushed plastic, beam = wood grain,
//     pedestal = stone, marker = brushed metal; supplied base = slate.
//   • Warm key light (the template's directional light, recolored in the
//     scene) with soft contact shadows drawn in code under the base, mat, and
//     each placed piece.
//   • Workshop set: table with a felt build mat under the base, legs, floor,
//     and a backdrop with a dark-slate → lighter-horizon gradient. The
//     vignette is baked into the backdrop, floor, and table-top textures (no
//     full-screen or post effect, nothing animated).

import {boxMesh, MeshAccumulator, panelMesh} from "./EchoesMeshes"

export type Finish = "plastic" | "wood" | "stone" | "metal" | "slate"

/** Which finish each Signal Arch piece uses (piece ids from SignalArchTask). */
export const PIECE_FINISH: {[pieceId: string]: Finish} = {
  pillar: "plastic",
  beam: "wood",
  pedestal: "stone",
  marker: "metal",
}

const FINISH_PBR: {[f: string]: {roughness: number; metallic: number}} = {
  plastic: {roughness: 0.38, metallic: 0.0},
  wood: {roughness: 0.62, metallic: 0.0},
  stone: {roughness: 0.82, metallic: 0.0},
  metal: {roughness: 0.34, metallic: 0.35},
  slate: {roughness: 0.7, metallic: 0.0},
}

// ── Workshop layout (build-local cm; origin = base bottom-center) ────────────
// The base sits on a 0.6 cm felt build mat, so the table top is at -0.6: the
// lowest control (Confirm, bottom edge at -0.05) stays clear of every surface.
// The table's front edge stops at z = 6.9, just behind the FRONT label
// (z = 7.2, y -2.2…-0.6), which therefore reads against the table's front apron.
export const WORKSHOP = {
  matTop: 0,
  mat: {w: 36, h: 0.6, d: 15.4, z: -0.8},
  tableTop: -0.6,
  table: {w: 72, h: 3.5, d: 34, front: 6.9},
  legH: 70,
  backdrop: {z: -45, w: 230, bottom: -75, top: 100},
  floor: {w: 230, d: 170},
}

// ── Procedural textures ─────────────────────────────────────────────────────

function hash(ix: number, iy: number, seed: number): number {
  let h = (ix * 374761393 + iy * 668265263 + seed * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h = h ^ (h >>> 16)
  return (h >>> 0) / 4294967295
}

/** Value noise, tileable with integer periods px, py. */
function vnoise(x: number, y: number, px: number, py: number, seed: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const w = (i: number, p: number) => ((i % p) + p) % p
  const a = hash(w(x0, px), w(y0, py), seed)
  const b = hash(w(x0 + 1, px), w(y0, py), seed)
  const c = hash(w(x0, px), w(y0 + 1, py), seed)
  const d = hash(w(x0 + 1, px), w(y0 + 1, py), seed)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

/** Tileable fBm over the unit square; base periods px, py. */
function fbm(u: number, v: number, px: number, py: number, seed: number, octaves: number = 4): number {
  let sum = 0
  let amp = 0.5
  let norm = 0
  let fx = px
  let fy = py
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(u * fx, v * fy, fx, fy, seed + o * 17)
    norm += amp
    amp *= 0.5
    fx *= 2
    fy *= 2
  }
  return sum / norm
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** Radial vignette: 1 in the middle, `edge` at the corners. */
function vignette(u: number, v: number, edge: number): number {
  const dx = (u - 0.5) * 2
  const dy = (v - 0.5) * 2
  const r = Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.SQRT2)
  const t = r * r * (3 - 2 * r)
  return 1 - (1 - edge) * t
}

function makeTexture(w: number, h: number, fn: (u: number, v: number) => [number, number, number]): Texture {
  const tex = ProceduralTextureProvider.createWithFormat(w, h, TextureFormat.RGBA8Unorm)
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h
    for (let x = 0; x < w; x++) {
      const c = fn((x + 0.5) / w, v)
      const i = (y * w + x) * 4
      data[i] = Math.round(clamp01(c[0]) * 255)
      data[i + 1] = Math.round(clamp01(c[1]) * 255)
      data[i + 2] = Math.round(clamp01(c[2]) * 255)
      data[i + 3] = 255
    }
  }
  ;(tex.control as ProceduralTextureProvider).setPixels(0, 0, w, h, data)
  return tex
}

const grey = (g: number): [number, number, number] => [g, g, g]

/** Wood grain: lines run along u (piece length), wobbling with low-frequency noise. */
function woodValue(u: number, v: number, seed: number, lines: number): number {
  const warp = fbm(u, v, 2, 3, seed, 3) * 2.2
  const ring = 0.5 + 0.5 * Math.sin((v * lines + warp) * Math.PI * 2)
  const fibre = vnoise(u * 8, v * 96, 8, 96, seed + 5)
  return 0.8 + 0.13 * Math.pow(ring, 3) + 0.07 * fibre
}

const texCache: {[k: string]: Texture} = {}

function texture(name: string): Texture {
  if (texCache[name]) return texCache[name]
  let t: Texture
  switch (name) {
    case "plastic":
      // Fine, low-contrast brushing along u.
      t = makeTexture(128, 128, (u, v) => grey(0.9 + 0.08 * vnoise(u * 4, v * 64, 4, 64, 11) + 0.02 * vnoise(u * 32, v * 32, 32, 32, 3)))
      break
    case "wood":
      t = makeTexture(256, 256, (u, v) => {
        const g = woodValue(u, v, 21, 6)
        return [g, g * 0.97, g * 0.93]
      })
      break
    case "stone":
      t = makeTexture(128, 128, (u, v) => {
        const base = fbm(u, v, 4, 4, 31, 4)
        const speck = hash(Math.floor(u * 128), Math.floor(v * 128), 7) > 0.93 ? -0.06 : 0
        const vein = Math.abs(Math.sin((u * 2 + v + fbm(u, v, 3, 3, 41, 3) * 1.6) * Math.PI * 2))
        const veinLine = vein < 0.06 ? -0.08 * (1 - vein / 0.06) : 0
        return grey(0.8 + 0.16 * base + speck + veinLine)
      })
      break
    case "metal":
      // Strong single-direction brushing.
      t = makeTexture(128, 128, (u, v) => grey(0.84 + 0.14 * vnoise(u * 2, v * 128, 2, 128, 51) + 0.02 * vnoise(u * 16, v * 16, 16, 16, 9)))
      break
    case "slate":
      // Layered slate: soft bands across v plus fine grain.
      t = makeTexture(128, 128, (u, v) => {
        const bands = fbm(u, v, 1, 8, 61, 3)
        const grain = vnoise(u * 32, v * 32, 32, 32, 67)
        return grey(0.82 + 0.12 * bands + 0.05 * grain)
      })
      break
    case "table":
      // One tile across the whole table top: wide boards, grain, soft vignette.
      t = makeTexture(256, 128, (u, v) => {
        const g = woodValue(u * 3, v, 81, 22)
        const board = Math.abs(((v * 5) % 1) - 0.5) > 0.49 ? 0.86 : 1
        const vig = vignette(u, v, 0.62)
        const k = g * board * vig
        return [k, k * 0.95, k * 0.9]
      })
      break
    case "backdrop":
      // Dark slate at the top, a slightly lighter horizon at table height,
      // darker again toward the floor; baked radial vignette; faint mottling.
      t = makeTexture(128, 128, (u, v) => {
        // v = 0 at the bottom edge of the backdrop.
        const horizon = 0.47
        const d = (v - horizon) / (v > horizon ? 0.53 : 0.47)
        const lift = Math.exp(-d * d * 4)
        const mottle = 0.03 * (fbm(u, v, 4, 3, 91, 3) - 0.5)
        const k = (0.62 + 0.38 * lift + mottle) * vignette(u, v, 0.55)
        return [0.2 * k + 0.06 * lift, 0.24 * k + 0.06 * lift, 0.3 * k + 0.05 * lift].map((c) => c / 0.36) as [number, number, number]
      })
      break
    case "floor":
      t = makeTexture(128, 128, (u, v) => {
        const k = (0.78 + 0.18 * fbm(u, v, 8, 8, 101, 4)) * vignette(u, v, 0.5)
        return [k, k * 0.97, k * 0.94]
      })
      break
    default:
      t = makeTexture(4, 4, () => grey(1))
  }
  texCache[name] = t
  return t
}

// ── Materials ───────────────────────────────────────────────────────────────

export class EchoesLook {
  constructor(private pbr: Material, private unlit: Material, private shadow: Material) {}

  /**
   * Soft contact shadow: a flat quad (w × d footprint plus a soft margin) lying
   * at local height y under its parent, drawn with the soft-shadow shader.
   * Real-time shadow maps did not render in the SPECS Preview (Increment 22
   * finding), so the key light's shadows are drawn this way instead. They are
   * dark and translucent: on the additive display they only dim what is under
   * them, and nothing depends on them being seen.
   */
  contactShadow(parent: SceneObject, w: number, d: number, y: number, strength: number = 0.42, margin: number = 3) {
    const m = this.shadow.clone()
    m.mainPass.baseColor = new vec4(0.16, 0.1, 0.06, strength)
    const so = global.scene.createSceneObject("Contact Shadow")
    so.setParent(parent)
    so.getTransform().setLocalPosition(new vec3(0, y, 0))
    const v = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    v.mesh = panelMesh(w + 2 * margin, d + 2 * margin, "up")
    v.mainMaterial = m
    return so
  }

  /** A fresh PBR material with the given finish and tint. */
  finishMaterial(finish: Finish, color: vec4): Material {
    const m = this.pbr.clone()
    this.applyFinish(m, finish, color)
    return m
  }

  /** Re-skins an existing PBR material (the candidate card reuses one). */
  applyFinish(m: Material, finish: Finish, color: vec4) {
    const p = FINISH_PBR[finish]
    m.mainPass.baseColor = color
    m.mainPass.baseTex = texture(finish)
    m.mainPass.roughness = p.roughness
    m.mainPass.metallic = p.metallic
  }

  pieceFinish(pieceId: string): Finish {
    return PIECE_FINISH[pieceId] || "plastic"
  }

  private surface(name: string, color: vec4, roughness: number): Material {
    const m = this.pbr.clone()
    m.mainPass.baseColor = color
    m.mainPass.baseTex = texture(name)
    m.mainPass.roughness = roughness
    m.mainPass.metallic = 0
    return m
  }

  private visual(parent: SceneObject, name: string, mesh: RenderMesh, mat: Material, pos: vec3) {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    so.getTransform().setLocalPosition(pos)
    const v = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    v.mesh = mesh
    v.mainMaterial = mat
    return so
  }

  /** Inlaid FRONT arrow on the base (shaft + head), with a recessed groove under it. */
  buildFrontArrow(parent: SceneObject, pos: vec3) {
    const arrow = (shaftHalf: number, shaftFrom: number, headHalf: number, headFrom: number, tip: number, y: number) => {
      const m = new MeshAccumulator()
      const p = (x: number, z: number) => new vec3(x, y, z)
      const below = new vec3(0, y - 1, 0)
      m.poly([p(-shaftHalf, shaftFrom), p(shaftHalf, shaftFrom), p(shaftHalf, headFrom + 0.05), p(-shaftHalf, headFrom + 0.05)], below)
      m.poly([p(-headHalf, headFrom), p(headHalf, headFrom), p(0, tip)], below)
      return m.build()
    }
    const groove = this.surface("slate", new vec4(0.22, 0.24, 0.29, 1), 0.9)
    this.visual(parent, "Front Arrow Groove", arrow(0.95, -0.35, 2.45, 1.65, 4.95, 0.03), groove, pos)
    const inlay = this.unlit.clone()
    inlay.mainPass.baseColor = new vec4(1, 1, 1, 1)
    this.visual(parent, "Front Arrow Inlay", arrow(0.6, 0, 2.0, 2.0, 4.5, 0.06), inlay, pos)
  }

  /** The workshop set. Environment only: no colliders, no interactables. */
  buildWorkshop(parent: SceneObject): SceneObject {
    const root = global.scene.createSceneObject("Workshop (environment only)")
    root.setParent(parent)
    const W = WORKSHOP

    // Felt build mat under the supplied base.
    const felt = this.surface("plastic", new vec4(0.42, 0.5, 0.52, 1), 0.95)
    this.visual(root, "Build Mat", boxMesh(W.mat.w, W.mat.h, W.mat.d), felt, new vec3(0, W.matTop - W.mat.h, W.mat.z))
    const matShadow = global.scene.createSceneObject("Build Mat Shadow")
    matShadow.setParent(root)
    matShadow.getTransform().setLocalPosition(new vec3(0, 0, W.mat.z))
    this.contactShadow(matShadow, W.mat.w, W.mat.d, W.tableTop + 0.02, 0.35, 4)

    // Table: slab (apron and edges) plus a separately textured top.
    const t = W.table
    const tableZ = t.front - t.d / 2
    const apron = this.surface("wood", new vec4(0.6, 0.45, 0.33, 1), 0.7)
    this.visual(root, "Table Slab", boxMesh(t.w, t.h, t.d, 24), apron, new vec3(0, W.tableTop - t.h, tableZ))
    const top = this.surface("table", new vec4(0.74, 0.57, 0.42, 1), 0.72)
    this.visual(root, "Table Top", panelMesh(t.w, t.d, "up"), top, new vec3(0, W.tableTop + 0.01, tableZ))
    const legTop = W.tableTop - t.h
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = sx * (t.w / 2 - 4)
        const z = tableZ + sz * (t.d / 2 - 4)
        this.visual(root, "Table Leg", boxMesh(4, W.legH, 4, 24), apron, new vec3(x, legTop - W.legH, z))
      }
    }

    // Floor.
    const floorY = legTop - W.legH
    const floor = this.surface("floor", new vec4(0.46, 0.44, 0.42, 1), 0.9)
    this.visual(root, "Floor", panelMesh(W.floor.w, W.floor.d, "up"), floor, new vec3(0, floorY, W.backdrop.z + W.floor.d / 2))

    // Backdrop.
    const b = W.backdrop
    const bh = b.top - floorY
    const backdrop = this.surface("backdrop", new vec4(0.26, 0.26, 0.26, 1), 1.0)
    this.visual(root, "Backdrop", panelMesh(b.w, bh, "front"), backdrop, new vec3(0, floorY + bh / 2, b.z))
    return root
  }
}
