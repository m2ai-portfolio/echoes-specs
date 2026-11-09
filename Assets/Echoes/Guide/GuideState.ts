/** Pure guide state for 40897 steps 1-7. Canonical LDraw poses are immutable and never accumulated. */
export type Vec3Numbers = [number, number, number]
export type GuidePart = {
  key: string
  ldrawPart: string
  color: string
  positionLdu: number[]
  rotation: number[]
  explodeLdu: number[]
}
export type GuideConnection = {
  incomingKey: string
  receiverKeys: string[]
  insertionAxis: number[]
  insertionDepthLdu: number
  focalPointLdu: number[]
  guideEyeOffsetLdu: number[]
  matingFeature: string
}
export type GuideStep = {
  number: number
  parts: string[]
  explodeKeys: string[]
  connections: GuideConnection[]
  instruction: string
}
export type GuideSection = {parts: GuidePart[]; steps: GuideStep[]}

function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function cross(a: number[], b: number[]): Vec3Numbers {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function finiteTriple(values: number[]): boolean {
  return values.length === 3 && values.every((value) => Number.isFinite(value))
}

function validRotation(values: number[]): boolean {
  if (values.length !== 9 || !values.every((value) => Number.isFinite(value))) return false
  const columns = [0, 1, 2].map((i) => [values[i], values[i + 3], values[i + 6]])
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (Math.abs(dot(columns[i], columns[j]) - (i === j ? 1 : 0)) > 1e-6) return false
    }
  }
  return Math.abs(dot(columns[0], cross(columns[1], columns[2])) - 1) < 1e-6
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value))
}

/** Central model hit zone; the button rails sit outside this normalized band. */
export function canStartOrbitDrag(x: number, y: number): boolean {
  return x >= 0.27 && x <= 0.73 && y >= 0.15 && y <= 0.86
}

/** A rejected press cannot become a drag on a later move. */
export class OrbitDragSession {
  private last: [number, number] | null = null
  private dragging = false

  start(x: number, y: number): void {
    this.dragging = canStartOrbitDrag(x, y)
    this.last = this.dragging ? [x, y] : null
  }

  move(x: number, y: number): [number, number] | null {
    if (!this.dragging || !this.last) return null
    const delta: [number, number] = [(x - this.last[0]) * 360, (y - this.last[1]) * 250]
    this.last = [x, y]
    return delta
  }

  end(): void {
    this.dragging = false
    this.last = null
  }
}


/** View constants. ZOOM_MAX is the framing limit: at ZOOM_MAX the hero scales the
 * step's whole visible model so its bounding sphere fits the model window, so no
 * zoom level can cover the heading text or the control rails. */
export const ZOOM_MIN = 0.65
export const ZOOM_MAX = 1.3
export const ZOOM_STEP = 0.15
export const HOME_YAW = 28
export const HOME_PITCH = 26
export const OTHER_SIDE_PITCH = 110
/** Inspect keeps the authored eye's side and heading but limits elevation, so a piece
 * separated along a vertical axis does not hide the seat it is approaching. */
export const INSPECT_PITCH_LIMIT = 30

function zeroTriple(values: number[]): boolean {
  return values.every((value) => value === 0)
}

/** Validates every step of the section; malformed data throws before any view exists. */
function validateSection(pieces: {[key: string]: GuidePart}, steps: GuideStep[]): void {
  if (!steps.length) throw new Error("section has no steps")
  steps.forEach((step, i) => {
    if (step.number !== i + 1) throw new Error(`steps must be numbered 1..${steps.length} in order (found ${step.number} at ${i + 1})`)
  })
  const placed: string[] = []
  for (const step of steps) {
    if (!step.parts.length) throw new Error(`step ${step.number} has no parts`)
    for (const key of step.parts) {
      if (!pieces[key]) throw new Error(`missing geometry ${key}`)
      if (placed.includes(key)) throw new Error(`piece ${key} appears in more than one step`)
    }
    const explode = step.explodeKeys
    if (!explode.length) throw new Error(`step ${step.number} has no incoming piece`)
    if (new Set(explode).size !== explode.length || new Set(step.parts).size !== step.parts.length)
      throw new Error(`step ${step.number} repeats a piece`)
    if (step.connections.length !== explode.length)
      throw new Error("every active piece needs one explode pose and connection")
    const anchors = step.parts.filter((key) => !explode.includes(key))
    for (const key of anchors) {
      if (!zeroTriple(pieces[key].explodeLdu)) throw new Error(`anchor ${key} in step ${step.number} must not move`)
    }
    const receivers = [...placed, ...anchors]
    if (!receivers.length) throw new Error(`step ${step.number} has nothing to receive its pieces`)
    for (const key of explode) {
      if (!step.parts.includes(key)) throw new Error(`non-incoming explosion ${key}`)
      const matches = step.connections.filter((c) => c.incomingKey === key)
      if (matches.length !== 1) throw new Error(`missing or repeated connection ${key}`)
      const connection = matches[0]
      if (!connection.receiverKeys.length || !connection.receiverKeys.every((receiver) => receivers.includes(receiver)))
        throw new Error(`invalid receiver ${key}`)
      if (!finiteTriple(connection.insertionAxis) || Math.abs(dot(connection.insertionAxis, connection.insertionAxis) - 1) > 1e-6 ||
          !finiteTriple(connection.focalPointLdu) || !finiteTriple(connection.guideEyeOffsetLdu) ||
          !Number.isFinite(connection.insertionDepthLdu) || connection.insertionDepthLdu <= 0)
        throw new Error(`invalid connection geometry ${key}`)
      const axis = connection.insertionAxis
      if (axis.filter((value) => Math.abs(value) === 1).length !== 1 ||
          axis.filter((value) => value === 0).length !== 2)
        throw new Error(`non-cardinal insertion axis ${key}`)
      const displacement = pieces[key].explodeLdu
      const reverse = -dot(axis, displacement)
      const lateral = cross(axis, displacement)
      if (reverse < connection.insertionDepthLdu || dot(lateral, lateral) > 1e-6)
        throw new Error(`invalid separation path ${key}`)
    }
    placed.push(...step.parts)
  }
}

export class GuideState {
  readonly pieces: {[key: string]: GuidePart} = {}
  readonly steps: GuideStep[]
  readonly lastStep: number
  heroStep: GuideStep
  /** Earlier steps' pieces plus this step's anchors (e.g. the step-1 gear). Never move. */
  fixedKeys: string[] = []
  /** This step's incoming pieces: the only pieces Explode moves. */
  activeKeys: string[] = []
  focusKey: string
  exploded = true
  inspecting = false
  /** Which incoming piece's joint Inspect is showing (0-based, into activeKeys). */
  inspectIndex = 0
  yawDegrees = HOME_YAW
  pitchDegrees = HOME_PITCH
  zoom = 1
  /** Steps the user marked as physically placed. User-asserted; never sensed. */
  confirmed: number[] = []
  finished = false
  private savedView: [number, number, number] | null = null
  private savedUnderPitch: number | null = null
  private savedUnderPitchBeforeInspect: number | null = null

  constructor(section: GuideSection, stepNumber: number = 1) {
    for (const piece of section.parts) {
      if (this.pieces[piece.key]) throw new Error(`duplicate piece ${piece.key}`)
      if (!finiteTriple(piece.positionLdu) || !finiteTriple(piece.explodeLdu) || !validRotation(piece.rotation))
        throw new Error(`invalid pose ${piece.key}`)
      this.pieces[piece.key] = piece
    }
    validateSection(this.pieces, section.steps)
    this.steps = section.steps
    this.lastStep = section.steps.length
    this.goToStep(stepNumber)
  }

  get stepNumber(): number {
    return this.heroStep.number
  }

  /** Every piece shown at this step: earlier steps plus this step. */
  get visibleKeys(): string[] {
    return this.steps.filter((step) => step.number <= this.stepNumber).flatMap((step) => step.parts)
  }

  goToStep(stepNumber: number): void {
    const step = this.steps.find((item) => item.number === stepNumber)
    if (!step) throw new Error(`missing step ${stepNumber}`)
    this.heroStep = step
    const anchors = step.parts.filter((key) => !step.explodeKeys.includes(key))
    this.fixedKeys = [...this.steps.filter((item) => item.number < stepNumber).flatMap((item) => item.parts), ...anchors]
    this.activeKeys = step.explodeKeys.slice()
    this.focusKey = step.explodeKeys[0]
    this.exploded = true
    this.home()
  }

  isConfirmed(stepNumber: number = this.stepNumber): boolean {
    return this.confirmed.includes(stepNumber)
  }

  /** Manual confirmation: the user says this step is placed. Advances, or finishes on the last step. */
  confirmStep(): void {
    if (this.finished) return
    if (!this.isConfirmed()) this.confirmed = [...this.confirmed, this.stepNumber].sort((a, b) => a - b)
    if (this.stepNumber < this.lastStep) {
      this.goToStep(this.stepNumber + 1)
    } else {
      this.finished = true
      this.exploded = false
      this.home()
    }
  }

  /** Backtrack one step for review. Confirmations are kept; Restart clears them. */
  back(): void {
    if (this.finished) {
      this.finished = false
      this.exploded = true
      this.home()
      return
    }
    if (this.stepNumber > 1) this.goToStep(this.stepNumber - 1)
  }

  restart(): void {
    this.confirmed = []
    this.finished = false
    this.goToStep(1)
  }

  connection(key: string = this.focusKey): GuideConnection {
    const found = this.heroStep.connections.find((item) => item.incomingKey === key)
    if (!found) throw new Error(`missing connection ${key}`)
    return found
  }

  insertionPath(key: string = this.focusKey): {start: Vec3Numbers; end: Vec3Numbers; lengthLdu: number} {
    const connection = this.connection(key)
    const start = connection.focalPointLdu as Vec3Numbers
    const lengthLdu = -dot(connection.insertionAxis, this.pieces[key].explodeLdu)
    const end: Vec3Numbers = [0, 1, 2].map((i) => start[i] - connection.insertionAxis[i] * lengthLdu) as Vec3Numbers
    return {start: [start[0], start[1], start[2]], end, lengthLdu}
  }

  /** The receiving geometry and ghost always use canonical poses. */
  position(key: string, separated: boolean = this.exploded): Vec3Numbers {
    const p = this.pieces[key]
    if (!p) throw new Error(`missing piece ${key}`)
    const offset = separated && this.heroStep.explodeKeys.includes(key) ? p.explodeLdu : [0, 0, 0]
    return [p.positionLdu[0] + offset[0], p.positionLdu[1] + offset[1], p.positionLdu[2] + offset[2]]
  }

  /** Steps built before the manual's flip (eye below the model) get a home view from below. */
  homePitch(): number {
    return this.connection(this.heroStep.explodeKeys[0]).guideEyeOffsetLdu[1] < 0 ? -HOME_PITCH : HOME_PITCH
  }

  orbit(deltaYawDegrees: number, deltaPitchDegrees: number): void {
    this.yawDegrees = (this.yawDegrees + deltaYawDegrees) % 360
    this.pitchDegrees = clamp(this.pitchDegrees + deltaPitchDegrees, -170, 170)
  }

  /** Look at the other side from this step's home view, then back. */
  toggleUnderside(): void {
    if (this.savedUnderPitch !== null) {
      this.pitchDegrees = this.savedUnderPitch
      this.savedUnderPitch = null
    } else {
      this.savedUnderPitch = this.pitchDegrees
      this.pitchDegrees = this.homePitch() > 0 ? -OTHER_SIDE_PITCH : OTHER_SIDE_PITCH
    }
  }

  changeZoom(amount: number): void {
    this.zoom = clamp(Math.round((this.zoom + amount) * 1000) / 1000, ZOOM_MIN, ZOOM_MAX)
  }

  toggleExplode(): void {
    this.exploded = !this.exploded
  }

  /** True when the next Inspect press shows another joint rather than returning. */
  get hasNextJoint(): boolean {
    return this.inspecting && this.inspectIndex < this.activeKeys.length - 1
  }

  /** Inspect cycles: first press shows joint 1, each further press the next incoming
   * piece's joint, and the press after the last joint restores the saved view. */
  toggleInspect(): void {
    if (this.inspecting && this.hasNextJoint) {
      this.inspectIndex++
      this.aimAtJoint()
      return
    }
    if (this.inspecting) {
      if (this.savedView) [this.yawDegrees, this.pitchDegrees, this.zoom] = this.savedView
      this.savedUnderPitch = this.savedUnderPitchBeforeInspect
      this.savedView = null
      this.savedUnderPitchBeforeInspect = null
      this.inspecting = false
      this.inspectIndex = 0
      this.focusKey = this.activeKeys[0]
      return
    }
    this.savedView = [this.yawDegrees, this.pitchDegrees, this.zoom]
    this.savedUnderPitchBeforeInspect = this.savedUnderPitch
    this.savedUnderPitch = null
    this.inspectIndex = 0
    this.inspecting = true
    this.aimAtJoint()
  }

  private aimAtJoint(): void {
    this.focusKey = this.activeKeys[this.inspectIndex]
    const eye = this.connection().guideEyeOffsetLdu
    this.yawDegrees = -Math.atan2(eye[0], eye[2]) * 180 / Math.PI
    this.pitchDegrees = clamp(Math.atan2(eye[1], Math.hypot(eye[0], eye[2])) * 180 / Math.PI,
      -INSPECT_PITCH_LIMIT, INSPECT_PITCH_LIMIT)
    this.zoom = ZOOM_MAX
  }

  home(): void {
    this.inspecting = false
    this.inspectIndex = 0
    this.focusKey = this.activeKeys[0]
    this.savedView = null
    this.savedUnderPitch = null
    this.savedUnderPitchBeforeInspect = null
    this.yawDegrees = HOME_YAW
    this.pitchDegrees = this.homePitch()
    this.zoom = 1
  }
}
