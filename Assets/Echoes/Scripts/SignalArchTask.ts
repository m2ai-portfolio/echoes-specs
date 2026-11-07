// Signal Arch v1 — authored task data for the Echoes brick-build proof.
//
// Pure data + validation. No Lens runtime dependencies, so the rules can be
// reasoned about (and later LEAF-tested) independently of the scene.
//
// Coordinate convention (build-local, centimeters):
//   origin = bottom-center of the supplied base, +X = viewer's right,
//   +Y = up, +Z = toward the viewer (the base's authored FORWARD arrow).
// Rotation convention: yaw around the upright (+Y) axis in 90-degree steps,
//   measured clockwise when seen from above. 0 = as authored below.

export type Vec3Tuple = [number, number, number]
export type RgbTuple = [number, number, number]

export type PieceForm = "box" | "wedge" | "pointed-wedge"

export interface PieceDef {
  id: string
  /** Short palette label. */
  label: string
  /** Name used in instructions and corrections ("the long beam"). */
  noun: string
  form: PieceForm
  /** Width (X), height (Y), depth (Z) in cm at rotation 0. */
  size: Vec3Tuple
  /** Orientation the candidate has when first selected from the palette. */
  stagingRotation: number
  /** Light color for the additive display; reinforcement only, never the sole cue. */
  color: RgbTuple
}

export interface TargetDef {
  id: string
  /** Visible label on the attachment target. */
  label: string
  /** Phrase used in corrections ("the left pillar attachment"). */
  phrase: string
  /** Bottom-center of a piece placed here, build-local cm. */
  position: Vec3Tuple
  /** Enlarged selectable volume (w, h, d) in cm, centered over the attachment. */
  pickSize: Vec3Tuple
  /** Targets that must already be filled before this one is offered. */
  requires: string[]
}

export interface PlacementDef {
  id: string
  pieceId: string
  targetId: string
  /** Authored valid yaw set (degrees, clockwise from above). */
  validRotations: number[]
  /** Next-action instruction shown during this step. */
  instruction: string
  /** Correction when the right piece is at the right target but turned wrong. */
  orientationHint: string
  /** Plain description of an orientation, used to name the actual mismatch. */
  describeRotation: (rotation: number) => string
  /** Help: which turns are valid and how the candidate arrives. */
  turnHelp: string
}

export interface TaskDef {
  id: string
  version: number
  title: string
  goal: string
  base: {size: Vec3Tuple; color: RgbTuple}
  pieces: PieceDef[]
  targets: TargetDef[]
  placements: PlacementDef[]
}

export const ROTATION_STEPS = [0, 90, 180, 270]

export function normalizeRotation(deg: number): number {
  const r = Math.round(deg / 90) * 90
  return ((r % 360) + 360) % 360
}

// ── Geometry (cm) ────────────────────────────────────────────────────────────
// Completed model ≈ 30 W × 18.5 H × 14 D, matching the brief's ~30 × 18 × 14.
const BASE_H = 2
const PILLAR = {w: 5, h: 8, d: 5}
const BEAM = {w: 26, h: 3, d: 5}
const PEDESTAL = {w: 6, h: 2.5, d: 6}
const MARKER = {w: 5, h: 3, d: 6}
const PILLAR_X = 10.5
const BEAM_Y = BASE_H + PILLAR.h // 10
const PEDESTAL_Y = BEAM_Y + BEAM.h // 13
const MARKER_Y = PEDESTAL_Y + PEDESTAL.h // 15.5

function beamDescription(rotation: number): string {
  const r = normalizeRotation(rotation)
  return r === 0 || r === 180 ? "spans left to right" : "runs front to back"
}

function markerDescription(rotation: number): string {
  switch (normalizeRotation(rotation)) {
    case 0:
      return "points to FRONT"
    case 90:
      return "points left"
    case 180:
      return "points away from FRONT"
    default:
      return "points right"
  }
}

function squareDescription(_rotation: number): string {
  return "any turn fits"
}

export const SIGNAL_ARCH_V1: TaskDef = {
  id: "signal-arch",
  version: 1,
  title: "Signal Arch",
  goal: "Build the Signal Arch: two pillars, a beam across them, a pedestal, and a marker pointing to the front arrow.",
  base: {size: [30, BASE_H, 14], color: [0.82, 0.84, 0.9]},
  pieces: [
    {
      id: "pillar",
      label: "Pillar",
      noun: "square pillar",
      form: "box",
      size: [PILLAR.w, PILLAR.h, PILLAR.d],
      stagingRotation: 0,
      color: [0.98, 0.86, 0.6],
    },
    {
      id: "beam",
      label: "Beam",
      noun: "long beam",
      form: "box",
      size: [BEAM.w, BEAM.h, BEAM.d],
      // Arrives turned front-to-back so the orientation choice is real.
      stagingRotation: 90,
      color: [0.62, 0.82, 1.0],
    },
    {
      id: "pedestal",
      label: "Pedestal",
      noun: "flat square pedestal",
      form: "box",
      size: [PEDESTAL.w, PEDESTAL.h, PEDESTAL.d],
      stagingRotation: 0,
      color: [0.66, 0.96, 0.72],
    },
    {
      id: "marker",
      label: "Marker",
      noun: "wedge marker",
      // Pointed wedge: an arrowhead in plan (thin tip at the front) with a flat
      // top carrying a light arrow, so its direction reads from the front view.
      form: "pointed-wedge",
      size: [MARKER.w, MARKER.h, MARKER.d],
      // Arrives pointing away from the front arrow.
      stagingRotation: 180,
      color: [1.0, 0.72, 0.62],
    },
  ],
  targets: [
    {
      id: "left-pad",
      label: "Left pad",
      phrase: "the left pillar attachment",
      position: [-PILLAR_X, BASE_H, 0],
      pickSize: [6.5, 8, 6],
      requires: [],
    },
    {
      id: "right-pad",
      label: "Right pad",
      phrase: "the right pillar attachment",
      position: [PILLAR_X, BASE_H, 0],
      pickSize: [6.5, 8, 6],
      requires: [],
    },
    {
      id: "beam-seat",
      label: "Beam seat",
      phrase: "the beam seat across the pillar tops",
      position: [0, BEAM_Y, 0],
      pickSize: [26, 5, 6],
      requires: ["left-pad", "right-pad"],
    },
    {
      id: "pedestal-seat",
      label: "Pedestal seat",
      phrase: "the pedestal seat on the beam center",
      position: [0, PEDESTAL_Y, 0],
      pickSize: [8, 5, 7],
      requires: ["beam-seat"],
    },
    {
      id: "marker-seat",
      label: "Marker seat",
      phrase: "the marker seat on the pedestal",
      position: [0, MARKER_Y, 0],
      pickSize: [7, 5, 7],
      requires: ["pedestal-seat"],
    },
  ],
  placements: [
    {
      id: "p1-left-pillar",
      pieceId: "pillar",
      targetId: "left-pad",
      validRotations: [0, 90, 180, 270],
      instruction: "Put a square pillar on the left pad.",
      orientationHint: "Any turn fits a square pillar.",
      describeRotation: squareDescription,
      turnHelp: "any turn fits a square pillar.",
    },
    {
      id: "p2-right-pillar",
      pieceId: "pillar",
      targetId: "right-pad",
      validRotations: [0, 90, 180, 270],
      instruction: "Put a square pillar on the right pad.",
      orientationHint: "Any turn fits a square pillar.",
      describeRotation: squareDescription,
      turnHelp: "any turn fits a square pillar.",
    },
    {
      id: "p3-beam",
      pieceId: "beam",
      targetId: "beam-seat",
      validRotations: [0, 180],
      instruction: "Lay the long beam across both pillar tops.",
      orientationHint: "Turn the beam so it spans both pillars.",
      describeRotation: beamDescription,
      turnHelp: "0° or 180°, so it spans left to right. It arrives at 90°, so turn it once.",
    },
    {
      id: "p4-pedestal",
      pieceId: "pedestal",
      targetId: "pedestal-seat",
      validRotations: [0, 90, 180, 270],
      instruction: "Set the flat square pedestal on the beam's center.",
      orientationHint: "Any turn fits the square pedestal.",
      describeRotation: squareDescription,
      turnHelp: "any turn fits the square pedestal.",
    },
    {
      id: "p5-marker",
      pieceId: "marker",
      targetId: "marker-seat",
      validRotations: [0],
      instruction: "Set the wedge marker on the pedestal, tip to FRONT.",
      orientationHint: "Turn it so its tip points to FRONT.",
      describeRotation: markerDescription,
      turnHelp: "0° only, tip pointing to the FRONT arrow. It arrives at 180°, so turn it twice.",
    },
  ],
}

/**
 * Validates authored task data. Any returned error means the task must not
 * start and must not accept progress (cannot-start state).
 */
export function validateTask(task: TaskDef | null | undefined): string[] {
  const errors: string[] = []
  if (!task) {
    return ["no task data"]
  }
  if (!task.id || !(task.version > 0)) {
    errors.push("missing task identity/version")
  }
  if (!task.pieces || task.pieces.length === 0) {
    errors.push("no piece definitions")
  }
  if (!task.targets || task.targets.length === 0) {
    errors.push("no attachment targets")
  }
  if (!task.placements || task.placements.length === 0) {
    errors.push("empty required sequence")
  }
  const pieceIds: {[id: string]: boolean} = {}
  for (const p of task.pieces || []) {
    if (pieceIds[p.id]) errors.push(`duplicate piece '${p.id}'`)
    pieceIds[p.id] = true
    if (!p.size || p.size.length !== 3 || p.size.some((v) => !(v > 0))) {
      errors.push(`piece '${p.id}' has invalid size`)
    }
  }
  const targetIds: {[id: string]: boolean} = {}
  for (const t of task.targets || []) {
    if (targetIds[t.id]) errors.push(`duplicate target '${t.id}'`)
    targetIds[t.id] = true
  }
  for (const t of task.targets || []) {
    for (const r of t.requires || []) {
      if (!targetIds[r]) errors.push(`target '${t.id}' requires missing target '${r}'`)
    }
  }
  const usedTargets: {[id: string]: boolean} = {}
  for (const pl of task.placements || []) {
    if (!pieceIds[pl.pieceId]) errors.push(`placement '${pl.id}' references missing piece '${pl.pieceId}'`)
    if (!targetIds[pl.targetId]) errors.push(`placement '${pl.id}' references missing target '${pl.targetId}'`)
    if (usedTargets[pl.targetId]) errors.push(`target '${pl.targetId}' used by more than one placement`)
    usedTargets[pl.targetId] = true
    if (!pl.validRotations || pl.validRotations.length === 0) {
      errors.push(`placement '${pl.id}' has no valid rotations`)
    } else if (pl.validRotations.some((r) => ROTATION_STEPS.indexOf(r) < 0)) {
      errors.push(`placement '${pl.id}' has a rotation outside 0/90/180/270`)
    }
  }
  return errors
}
