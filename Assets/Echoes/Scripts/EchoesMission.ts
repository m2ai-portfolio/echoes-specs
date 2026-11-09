// Echoes — mission layer (Increment 23): the stake, the payoff, motion, and audio.
//
// The relay station fiction wrapped around the unchanged task:
//   • Relay beacon: a cabinet and mast on the table to the right, behind the
//     staging column. Its lamp is dark for the whole task (the broken thing).
//   • Payoff on completion: the lamp ignites with a warm glow, a soft beam
//     extends and sweeps once (one smooth motion), and a hum rises and settles.
//     It reverses (lamp fades dark, hum fades) on Undo after completion and is
//     reset at once on Replay. Nothing flashes: every change is a smooth ramp.
//   • Placement settle: an accepted piece drops 2.5 cm with a 250 ms ease-out,
//     and a soft rectangular ring pulses outward at its seat.
//   • Cue sounds (synthesized, docs/make-sounds.py): select, accept, error.
//
// Nothing here reads or changes task state, has a collider or Interactable,
// or touches the camera. The controller tells it what happened; it only draws
// and plays sound.

import {boxMesh, MeshAccumulator, panelMesh} from "./EchoesMeshes"

const SND_SELECT = requireAsset("../Audio/echoes_select.wav") as AudioTrackAsset
const SND_ACCEPT = requireAsset("../Audio/echoes_accept.wav") as AudioTrackAsset
const SND_ERROR = requireAsset("../Audio/echoes_error.wav") as AudioTrackAsset
const SND_HUM = requireAsset("../Audio/echoes_hum.wav") as AudioTrackAsset

/** Beacon placement (build-local cm): right of the build, behind the staging column, on the table. */
export const BEACON = {
  x: 23,
  z: -7,
  tableTop: -0.6,
  cabinet: {w: 9, h: 9, d: 7},
  pole: {w: 1.8, h: 38},
  collar: {w: 4.6, h: 1},
  glass: {w: 3.4, h: 3.6},
  cap: {w: 4.6, h: 1.1},
  antenna: {w: 0.4, h: 2.5},
}

const SETTLE = {seconds: 0.25, drop: 2.5}
const RING = {seconds: 0.7, delay: 0.18, grow: 0.3, alpha: 0.6, margin: 0.6, thickness: 0.45}

/** Ignition timeline (s from completion). */
const IGNITE = {lamp: 0.9, beamStart: 0.5, beamExtend: 0.8, sweepStart: 1.3, sweep: 2.6}
const DARKEN_SECONDS = 0.5
const BEAM = {length: 40, nearWidth: 1.6, farWidth: 9, pitchDeg: 20, fromYawDeg: -70, toYawDeg: 20, alpha: 0.32}

const LAMP_DEAD = new vec4(0.36, 0.37, 0.4, 1)
const LAMP_LIT = new vec4(1.0, 0.8, 0.46, 1)
const GLOW = new vec3(1.0, 0.78, 0.42)

const DEG = Math.PI / 180

function smooth(x: number): number {
  const t = x < 0 ? 0 : x > 1 ? 1 : x
  return t * t * (3 - 2 * t)
}

function easeOutCubic(x: number): number {
  const t = x < 0 ? 0 : x > 1 ? 1 : x
  return 1 - Math.pow(1 - t, 3)
}

interface Tween {
  t: number
  dur: number
  step: (k: number) => void
  done?: () => void
}

/** Tapered beam along local -Z (0 … 1 cm; scaled to length), two crossed planes, both faces. */
function beamMesh(near: number, far: number): RenderMesh {
  const m = new MeshAccumulator()
  const uv: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  const n0 = near / 2
  const f0 = far / 2
  const v = (x: number, y: number, z: number) => new vec3(x, y, z)
  // Horizontal plane.
  m.quad(v(-n0, 0, 0), v(n0, 0, 0), v(f0, 0, -1), v(-f0, 0, -1), v(0, 1, 0), uv)
  m.quad(v(n0, 0, 0), v(-n0, 0, 0), v(-f0, 0, -1), v(f0, 0, -1), v(0, -1, 0), uv)
  // Vertical plane.
  m.quad(v(0, -n0, 0), v(0, n0, 0), v(0, f0, -1), v(0, -f0, -1), v(1, 0, 0), uv)
  m.quad(v(0, n0, 0), v(0, -n0, 0), v(0, -f0, -1), v(0, f0, -1), v(-1, 0, 0), uv)
  return m.build()
}

/** Flat rectangular frame (outer w × d, band thickness th), lying on y = 0, both faces. */
function frameMesh(w: number, d: number, th: number): RenderMesh {
  const m = new MeshAccumulator()
  const x = w / 2
  const z = d / 2
  const up = new vec3(0, 1, 0)
  const dn = new vec3(0, -1, 0)
  const band = (x0: number, z0: number, x1: number, z1: number) => {
    const v = (a: number, b: number) => new vec3(a, 0, b)
    m.quad(v(x0, z1), v(x1, z1), v(x1, z0), v(x0, z0), up)
    m.quad(v(x1, z1), v(x0, z1), v(x0, z0), v(x1, z0), dn)
  }
  band(-x, z - th, x, z) // front
  band(-x, -z, x, -z + th) // back
  band(-x, -z + th, -x + th, z - th) // left
  band(x - th, -z + th, x, z - th) // right
  return m.build()
}

export class EchoesMission {
  private tweens: Tween[] = []
  private effectsRoot: SceneObject
  private lampMat: Material
  private glowMats: Material[] = []
  private beamPivot: SceneObject
  private beamObj: SceneObject
  private beamMat: Material
  private audio: {[name: string]: AudioComponent} = {}

  /** Beacon: target state (lit = task complete) and the shown level 0…1. */
  beaconLit = false
  beaconLevel = 0
  private beaconTime = 0
  private darkFrom = 0
  private beamYaw = BEAM.fromYawDeg
  private beamExtend = 0

  constructor(
    private pbr: (finish: string, color: vec4) => Material,
    private unlit: Material,
    private soft: Material,
    private log: (event: string, details: string) => void
  ) {}

  private obj(parent: SceneObject, name: string, pos?: vec3): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    if (pos) so.getTransform().setLocalPosition(pos)
    return so
  }

  private visual(so: SceneObject, mesh: RenderMesh, mat: Material): RenderMeshVisual {
    const v = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    v.mesh = mesh
    v.mainMaterial = mat
    return v
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  /** Builds the relay beacon (environment only) and the effects root. */
  build(sceneRoot: SceneObject, buildRoot: SceneObject) {
    this.effectsRoot = this.obj(buildRoot, "Placement Effects (visual only)")
    const B = BEACON
    const root = this.obj(sceneRoot, "Relay Beacon (stake; environment only)", new vec3(B.x, B.tableTop, B.z))
    // Dead hardware: mid-tone gunmetal, never near-black (additive display).
    const metal = this.pbr("metal", new vec4(0.5, 0.52, 0.56, 1))
    const cabinetMat = this.pbr("slate", new vec4(0.46, 0.5, 0.56, 1))
    let y = 0
    this.visual(this.obj(root, "Relay Cabinet", new vec3(0, y, 0)), boxMesh(B.cabinet.w, B.cabinet.h, B.cabinet.d), cabinetMat)
    // A dim status slot on the cabinet front (dead; lights with the lamp).
    const slot = this.obj(root, "Cabinet Status Slot", new vec3(0, B.cabinet.h * 0.62, B.cabinet.d / 2 + 0.02))
    const slotMat = this.unlit.clone()
    slotMat.mainPass.baseColor = LAMP_DEAD
    this.visual(slot, panelMesh(5, 0.8, "front"), slotMat)
    y += B.cabinet.h
    this.visual(this.obj(root, "Mast", new vec3(0, y, 0)), boxMesh(B.pole.w, B.pole.h, B.pole.w), metal)
    y += B.pole.h
    this.visual(this.obj(root, "Lamp Collar", new vec3(0, y, 0)), boxMesh(B.collar.w, B.collar.h, B.collar.w), metal)
    y += B.collar.h
    const glassY = y + B.glass.h / 2
    this.lampMat = this.unlit.clone()
    this.lampMat.mainPass.baseColor = LAMP_DEAD
    this.visual(this.obj(root, "Lamp (dark until the arch is complete)", new vec3(0, y, 0)), boxMesh(B.glass.w, B.glass.h, B.glass.w), this.lampMat)
    y += B.glass.h
    this.visual(this.obj(root, "Lamp Cap", new vec3(0, y, 0)), boxMesh(B.cap.w, B.cap.h, B.cap.w), metal)
    y += B.cap.h
    this.visual(this.obj(root, "Antenna", new vec3(0, y, 0)), boxMesh(B.antenna.w, B.antenna.h, B.antenna.w), metal)

    // Glow halos in front of the lamp (soft quads; alpha 0 while dark).
    for (const [size, z] of [
      [15, 1.9],
      [7, 2.0],
    ]) {
      const g = this.soft.clone()
      g.mainPass.baseColor = new vec4(GLOW.x, GLOW.y, GLOW.z, 0)
      this.visual(this.obj(root, "Lamp Glow", new vec3(0, glassY, z)), panelMesh(size, size, "front"), g)
      this.glowMats.push(g)
    }
    this.glowMats.push(slotMat) // the slot ramps with the lamp too (its alpha stays 1)

    // Beam: pivot at the lamp; pitched up, swept about the vertical.
    this.beamPivot = this.obj(root, "Beacon Beam Pivot", new vec3(0, glassY, 0))
    this.beamObj = this.obj(this.beamPivot, "Beacon Beam")
    this.beamMat = this.soft.clone()
    this.beamMat.mainPass.baseColor = new vec4(GLOW.x, GLOW.y, GLOW.z, 0)
    this.visual(this.beamObj, beamMesh(BEAM.nearWidth, BEAM.farWidth), this.beamMat)
    this.beamObj.enabled = false

    // Audio sources.
    const audioRoot = this.obj(sceneRoot, "Echoes Audio")
    for (const [name, track] of [
      ["select", SND_SELECT],
      ["accept", SND_ACCEPT],
      ["error", SND_ERROR],
      ["hum", SND_HUM],
    ] as [string, AudioTrackAsset][]) {
      const a = this.obj(audioRoot, `Audio ${name}`).createComponent("Component.AudioComponent") as AudioComponent
      a.audioTrack = track
      a.volume = name === "hum" ? 0.7 : 0.6
      a.fadeOutTime = 0.4
      this.audio[name] = a
    }
    this.applyBeacon()
  }

  // ── Sound ──────────────────────────────────────────────────────────────────

  play(name: "select" | "accept" | "error") {
    const a = this.audio[name]
    if (!a) return
    try {
      if (a.isPlaying()) a.stop(false)
      a.play(1)
      this.log("sound", `name=${name}`)
    } catch (e) {
      this.log("sound-failed", `name=${name} error=${e}`)
    }
  }

  // ── Placement settle and pulse ring ───────────────────────────────────────

  /** Drops an accepted piece onto its seat (250 ms ease-out) and pulses a ring there. */
  settle(piece: SceneObject, seat: vec3, yawRot: quat, w: number, d: number) {
    const t = piece.getTransform()
    const from = seat.add(new vec3(0, SETTLE.drop, 0))
    t.setLocalPosition(from)
    this.tweens.push({
      t: 0,
      dur: SETTLE.seconds,
      step: (k) => {
        if (isNull(piece)) return
        t.setLocalPosition(vec3.lerp(from, seat, easeOutCubic(k)))
      },
    })
    const ring = this.obj(this.effectsRoot, "Seat Pulse Ring", seat.add(new vec3(0, 0.05, 0)))
    ring.getTransform().setLocalRotation(yawRot)
    const mat = this.unlit.clone()
    mat.mainPass.baseColor = new vec4(1, 0.93, 0.8, 0)
    this.visual(ring, frameMesh(w + 2 * RING.margin, d + 2 * RING.margin, RING.thickness), mat)
    const rt = ring.getTransform()
    this.tweens.push({
      t: -RING.delay,
      dur: RING.seconds,
      step: (k) => {
        if (isNull(ring)) return
        const s = 1 + RING.grow * easeOutCubic(k)
        rt.setLocalScale(new vec3(s, 1, s))
        mat.mainPass.baseColor = new vec4(1, 0.93, 0.8, RING.alpha * Math.pow(1 - k, 1.5))
      },
      done: () => {
        if (!isNull(ring)) ring.destroy()
      },
    })
  }

  /** Stops every running settle/ring animation (Undo/Replay); pieces keep or lose their own pose. */
  clearEffects(snapPieces: {so: SceneObject; seat: vec3}[]) {
    this.tweens = []
    for (const p of snapPieces) if (!isNull(p.so)) p.so.getTransform().setLocalPosition(p.seat)
    for (let i = this.effectsRoot.getChildrenCount() - 1; i >= 0; i--) this.effectsRoot.getChild(i).destroy()
  }

  // ── Beacon ─────────────────────────────────────────────────────────────────

  /** Drive the beacon from the task: lit exactly while the task is complete. */
  setBeacon(lit: boolean, reason: string) {
    if (lit === this.beaconLit) return
    this.beaconLit = lit
    this.beaconTime = 0
    if (lit) {
      this.beamYaw = BEAM.fromYawDeg
      this.beamExtend = 0
      const hum = this.audio["hum"]
      try {
        if (hum.isPlaying()) hum.stop(false)
        hum.play(1)
      } catch (e) {
        this.log("sound-failed", `name=hum error=${e}`)
      }
      this.log("beacon", `lit reason=${reason}`)
    } else {
      this.darkFrom = this.beaconLevel
      const hum = this.audio["hum"]
      try {
        if (hum.isPlaying()) hum.stop(true)
      } catch (e) {
        this.log("sound-failed", `name=hum error=${e}`)
      }
      this.log("beacon", `dark reason=${reason}`)
    }
  }

  /** Replay: the beacon is dark at once (no fade), the beam retracted. */
  resetBeacon() {
    const was = this.beaconLit
    this.beaconLit = false
    this.beaconLevel = 0
    this.beamExtend = 0
    this.beamYaw = BEAM.fromYawDeg
    this.darkFrom = 0
    try {
      if (this.audio["hum"].isPlaying()) this.audio["hum"].stop(false)
    } catch (e) {
      this.log("sound-failed", `name=hum error=${e}`)
    }
    this.applyBeacon()
    if (was) this.log("beacon", "dark reason=replay")
  }

  private applyBeacon() {
    const L = this.beaconLevel
    this.lampMat.mainPass.baseColor = vec4.lerp(LAMP_DEAD, LAMP_LIT, L)
    this.glowMats[0].mainPass.baseColor = new vec4(GLOW.x, GLOW.y, GLOW.z, 0.42 * L)
    this.glowMats[1].mainPass.baseColor = new vec4(GLOW.x, GLOW.y, GLOW.z, 0.7 * L)
    this.glowMats[2].mainPass.baseColor = vec4.lerp(LAMP_DEAD, LAMP_LIT, L)
    const e = this.beamExtend
    this.beamObj.enabled = e > 0.001
    this.beamObj.getTransform().setLocalScale(new vec3(1, 1, Math.max(0.001, e) * BEAM.length))
    this.beamMat.mainPass.baseColor = new vec4(GLOW.x, GLOW.y, GLOW.z, BEAM.alpha * e)
    this.beamPivot
      .getTransform()
      .setLocalRotation(quat.angleAxis(this.beamYaw * DEG, vec3.up()).multiply(quat.angleAxis(BEAM.pitchDeg * DEG, vec3.right())))
  }

  // ── Per-frame ──────────────────────────────────────────────────────────────

  update(dt: number) {
    if (this.tweens.length) {
      const keep: Tween[] = []
      for (const tw of this.tweens) {
        tw.t += dt
        if (tw.t < 0) {
          keep.push(tw)
          continue
        }
        const k = Math.min(1, tw.t / tw.dur)
        tw.step(k)
        if (k < 1) keep.push(tw)
        else if (tw.done) tw.done()
      }
      this.tweens = keep
    }

    if (this.beaconLit) {
      this.beaconTime += dt
      const t = this.beaconTime
      this.beaconLevel = Math.max(this.beaconLevel, smooth(t / IGNITE.lamp))
      this.beamExtend = smooth((t - IGNITE.beamStart) / IGNITE.beamExtend)
      const s = smooth((t - IGNITE.sweepStart) / IGNITE.sweep)
      this.beamYaw = BEAM.fromYawDeg + (BEAM.toYawDeg - BEAM.fromYawDeg) * s
      this.applyBeacon()
    } else if (this.beaconLevel > 0 || this.beamExtend > 0) {
      this.beaconTime += dt
      const k = smooth(this.beaconTime / DARKEN_SECONDS)
      this.beaconLevel = this.darkFrom * (1 - k)
      this.beamExtend = Math.min(this.beamExtend, this.beaconLevel)
      if (k >= 1) {
        this.beaconLevel = 0
        this.beamExtend = 0
      }
      this.applyBeacon()
    }
  }
}
