// Echoes — Signal Arch v1 controller.
//
// Increment 1: first placement gate (select → turn → choose attachment → confirm).
// Increment 2: Help, Pause/Resume, Undo latest placement, truthful completion,
// Replay, sequence-integrity guards, and an opt-in state-test suite.
//
// Owns the authored task state and builds the scene at runtime:
//   • supplied base with a FORWARD arrow (build-local origin = base bottom-center)
//   • piece palette (UIKit Buttons), candidate staging area, explicit 90° turn
//     controls and Confirm (UIKit Buttons), attachment targets (SIK Interactable)
//   • task controls: Help, Pause/Resume (left column), Undo, Replay (right column)
//   • next-action guidance panel with progress, instruction, and correction/help
//   • persistent "Virtual build demo" disclosure
//
// ── State machine ────────────────────────────────────────────────────────────
//   canStart = false        → cannot-start; every control inactive, nothing accepted.
//   overlay  ∈ none | help | paused   (help and pause are mutually exclusive)
//   complete = derived: all placements accepted AND the visible placed objects
//              agree with them one-for-one, in sequence order.
//   runId    = incremented by Replay; every delayed callback captures the runId
//              it was scheduled in and is dropped if a Replay happened since.
// Task inputs (palette, turn, target, Confirm) only act when overlay = none and
// the task is not complete. Undo acts when overlay = none and ≥ 1 placement is
// accepted. Replay acts from every state except cannot-start. Blocked presses
// are logged and change nothing.
//
// Every user-facing state change is also printed as an `ECHOES ...` log line
// so runtime logs can serve as before/after state evidence.
//
// Increment 15 (A9 viewers 1–2): after choosing a piece and an attachment, the
// viewers expected the attachment click to place the piece and did not press
// Confirm. While a candidate is fully staged and Confirm would be evaluated
// (active work, piece + attachment chosen, no open correction), the Confirm
// label now pulses gently and the status gains a line "Press Confirm to place".
// The cue is re-evaluated on every refresh: any state change re-phases or stops it.

import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {Attempt, evaluateAttempt} from "./PlacementRules"
import {normalizeRotation, PieceDef, SIGNAL_ARCH_V1, TargetDef, TaskDef, validateTask} from "./SignalArchTask"

const PIECE_MAT = requireAsset("../Materials/EchoesPiece.mat") as Material
const GHOST_MAT = requireAsset("../Materials/EchoesGhost.mat") as Material

const DEG = Math.PI / 180

// ── Layout (build-local cm; this SceneObject sits at the base bottom-center) ──
// Approved defaults: build centered 90 cm ahead, 15 cm below eye level; model
// ≈ 30 × 18.5 × 14 cm, so its center is 9.25 cm above this origin.
//
// Revised at the Increment 1 placement check (brief allows recorded changes):
// the SPECS Preview display measured ≈ ±26 cm wide × ±30 cm tall at 90 cm
// (≈ 32° × 37°), so the brief's 64 cm-wide default (palette 27 cm left,
// staging 24 cm right, controls below the build) fell outside the display.
// The build keeps its default position; palette and staging/controls become
// 7 cm columns flanking it at ±20.5 cm, and the disclosure moves into the
// guidance panel. Every selectable surface stays ≥ 5 × 5 cm with ≥ 1.5 cm gaps.
//
// Increment 2: the guidance panel grows to 34 × 19 (bottom edge unchanged at
// 24.5 build-local, just above the highest target pointer) so help text fits.
// Help/Pause sit above the palette, Undo/Replay above the candidate card.
//
// Increment 4 (A9 capture findings): the UIKit plate rim adds ≈ 0.15 cm per
// side, so the visible gap measured ≈ 1.2 cm for 1.5 cm between button bounds.
// Plate gaps are now 1.8 cm so the visible gap meets 1.5 cm. From a 25° side
// view the base's near end covered Confirm (and, mirrored, the Marker cell), so
// both side columns are raised SIDE_RAISE; net of the extra gaps, Confirm's
// center rises 3.7 cm (-1.0 -> 2.7) and the Marker cell's 3.7 cm (-0.25 -> 3.45).
const MODEL_HEIGHT = 18.5
const SIDE_X = 20.5
const COLUMN_TOP = 25.25 // build-local; = 1 cm above eye level (Increments 1–3 column top)
const SIDE_RAISE = 4.6
const SIDE_COLUMN_TOP = COLUMN_TOP + SIDE_RAISE
const GUIDANCE = {w: 34, h: 19, y: MODEL_HEIGHT + 15.5} // bottom 24.5, top 43.5
const PLATE_GAP = 1.8
const PALETTE_CELL = {w: 7, h: 6, gap: PLATE_GAP}
const STAGING = {w: 7, h: 8}
const CONTROL = {w: 7, h: 5.5, gap: PLATE_GAP}
const TASK_BUTTON = {w: 7, h: 5, gap: PLATE_GAP}
// Lowest task button center: column header (top + 1.2, ±0.7) + 1.5 gap + half height.
const taskRowY = (columnTop: number) => columnTop + 1.2 + 0.7 + 1.5 + TASK_BUTTON.h / 2

/**
 * Confirm cue (Increment 15): the Confirm label's tint and scale ease up and down
 * at 1.2 Hz (well under the 3 Hz flashing threshold; no full-screen effect). Only
 * the label moves, so the plate and its 1.8 cm gaps to neighbors are unchanged.
 */
const CONFIRM_CUE = {hz: 1.2, labelScale: 0.08}
/**
 * Second status line while the cue is on. It is its own line because the
 * one-line form ran past the guidance panel into the side columns (Increment 15
 * capture); while a candidate awaits Confirm the correction area below is empty.
 */
const CONFIRM_CUE_LINE = "\nPress Confirm to place"

/** How long the "Placed: …" note stays before getting out of the way (s). */
const SUCCESS_NOTE_SECONDS = 8

// Text sizes. Text.size is the em-square: em cm = size / 43.886.
// 53 → 1.21 cm em, the floor for essential guidance text at this scale.
const TEXT = {
  disclosure: 38,
  progress: 54,
  instruction: 58,
  status: 46,
  feedback: 54,
  header: 42,
  stagingName: 40,
  stagingDetail: 40,
  button: 46,
  paletteLabel: 44,
  targetLabel: 40,
  base: 40,
}

const WHITE = new vec4(1, 1, 1, 1)
const SOFT = new vec4(1, 1, 1, 0.8)
const DIM = new vec4(0.75, 0.75, 0.75, 0.32)
const OK_TINT = new vec4(0.7, 1.0, 0.75, 1)
const WARN_TINT = new vec4(1.0, 0.88, 0.6, 1)
const HELP_TINT = new vec4(0.75, 0.9, 1.0, 1)
const INFO_TINT = new vec4(0.92, 0.95, 1.0, 1)

type TaskVariant = "valid" | "missing-piece" | "missing-target" | "empty-sequence"
type Overlay = "none" | "help" | "paused"
type FeedbackKind = "none" | "ok" | "warn" | "info"

/** Snapshot returned by EchoesController.testState() for LEAF scenarios. */
export interface EchoesTestState {
  canStart: boolean
  runId: number
  mode: string
  overlay: string
  complete: boolean
  /** 0-based index of the open step (= number of accepted placements). */
  stepIndex: number
  acceptedIds: string[]
  placedCount: number
  /** Names of the SceneObjects actually under "Accepted Pieces". */
  placedNames: string[]
  piece: string | null
  rotation: number
  target: string | null
  feedback: string
  feedbackKind: string
  progressText: string
  instructionText: string
  statusText: string
  /** True while the Confirm cue (pulse + "Press Confirm to place" line) is shown. */
  confirmCue: boolean
  /** What the correction / help / pause / completion area shows. */
  panelText: string
  stagingShown: boolean
  stagingName: string
  stagingDetail: string
  ghostShown: boolean
  targets: {[id: string]: {shown: boolean; selectable: boolean; label: string; pointer: boolean}}
  controls: {[name: string]: {label: string; lit: boolean}}
  palette: {[pieceId: string]: {label: string; lit: boolean}}
  buildWorld: number[]
  stepInstructions: string[]
}

interface TargetView {
  def: TargetDef
  root: SceneObject
  mat: Material
  label: Text
  pointer: SceneObject
  interactable: Interactable
}

interface PaletteView {
  piece: PieceDef
  button: Button
  selectedText: Text
}

interface ButtonView {
  button: Button
  label: Text
}

// ── Mesh construction ────────────────────────────────────────────────────────

class MeshAccumulator {
  verts: number[] = []
  indices: number[] = []
  private count = 0

  quad(a: vec3, b: vec3, c: vec3, d: vec3, n: vec3) {
    // a,b,c,d counter-clockwise when viewed from the side the normal faces.
    const base = this.count
    for (const p of [a, b, c, d]) {
      this.verts.push(p.x, p.y, p.z, n.x, n.y, n.z, 0, 0)
    }
    this.indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    this.count += 4
  }

  tri(a: vec3, b: vec3, c: vec3, n: vec3) {
    const base = this.count
    for (const p of [a, b, c]) {
      this.verts.push(p.x, p.y, p.z, n.x, n.y, n.z, 0, 0)
    }
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
    for (const p of pts) this.verts.push(p.x, p.y, p.z, n.x, n.y, n.z, 0, 0)
    for (let i = 1; i < pts.length - 1; i++) this.indices.push(base, base + i, base + i + 1)
    this.count += pts.length
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
function boxMesh(w: number, h: number, d: number): RenderMesh {
  const x = w / 2
  const z = d / 2
  const m = new MeshAccumulator()
  const v = (a: number, b: number, c: number) => new vec3(a, b, c)
  m.quad(v(-x, 0, z), v(x, 0, z), v(x, h, z), v(-x, h, z), v(0, 0, 1)) // front +Z
  m.quad(v(x, 0, -z), v(-x, 0, -z), v(-x, h, -z), v(x, h, -z), v(0, 0, -1)) // back
  m.quad(v(x, 0, z), v(x, 0, -z), v(x, h, -z), v(x, h, z), v(1, 0, 0)) // right
  m.quad(v(-x, 0, -z), v(-x, 0, z), v(-x, h, z), v(-x, h, -z), v(-1, 0, 0)) // left
  m.quad(v(-x, h, z), v(x, h, z), v(x, h, -z), v(-x, h, -z), v(0, 1, 0)) // top
  m.quad(v(-x, 0, -z), v(x, 0, -z), v(x, 0, z), v(-x, 0, z), v(0, -1, 0)) // bottom
  return m.build()
}

/** Wedge: full height at the back (-Z), thin edge at the front (+Z) — it "points" +Z at rotation 0. */
function wedgeMesh(w: number, h: number, d: number): RenderMesh {
  const x = w / 2
  const z = d / 2
  const m = new MeshAccumulator()
  const v = (a: number, b: number, c: number) => new vec3(a, b, c)
  m.quad(v(-x, 0, -z), v(x, 0, -z), v(x, 0, z), v(-x, 0, z), v(0, -1, 0)) // bottom
  m.quad(v(x, 0, -z), v(-x, 0, -z), v(-x, h, -z), v(x, h, -z), v(0, 0, -1)) // back
  m.quad(v(-x, 0, z), v(x, 0, z), v(x, h, -z), v(-x, h, -z), new vec3(0, d, h).normalize()) // slope
  m.tri(v(x, 0, z), v(x, 0, -z), v(x, h, -z), v(1, 0, 0)) // right
  m.tri(v(-x, 0, -z), v(-x, 0, z), v(-x, h, -z), v(-1, 0, 0)) // left
  return m.build()
}

// Pointed wedge (arrowhead in plan): a rectangle at the back and a 90° tip at
// the front (+Z), with a flat top. The top is deliberately level: on a sloped
// top the arrow drawn below read backwards from the front view (the high back
// edge projects above the low tip), so 180° looked like "toward FRONT".
function pointedWedgeMesh(w: number, h: number, d: number): RenderMesh {
  const x = w / 2
  const zb = -d / 2
  const zt = d / 2
  const zs = zt - x // shoulder where the tip begins
  const m = new MeshAccumulator()
  const v = (a: number, b: number, c: number) => new vec3(a, b, c)
  const inside = v(0, h / 2, 0)
  const bottom = [v(-x, 0, zb), v(x, 0, zb), v(x, 0, zs), v(0, 0, zt), v(-x, 0, zs)]
  const top = bottom.map((p) => v(p.x, h, p.z))
  m.poly(bottom, inside)
  m.poly(top, inside)
  for (let i = 0; i < 5; i++) {
    const j = (i + 1) % 5
    m.poly([bottom[i], bottom[j], top[j], top[i]], inside)
  }
  return m.build()
}

/** Light arrow lying flat on the pointed wedge's top, pointing +Z (same as the base's FRONT arrow at 0°). */
function pointedWedgeArrowMesh(w: number, h: number, d: number): RenderMesh {
  const m = new MeshAccumulator()
  const lift = 0.06
  const tipZ = d / 2 - 0.8
  const backZ = -0.4
  const half = Math.min(1.3, w / 2 - 0.6)
  const p = (x: number, z: number) => new vec3(x, h + lift, z)
  m.tri(p(0, tipZ), p(half, backZ), p(-half, backZ), new vec3(0, 1, 0))
  return m.build()
}

/** Flat triangle in the XY plane pointing down (-Y), tip at origin. */
function pointerMesh(w: number, h: number): RenderMesh {
  const m = new MeshAccumulator()
  m.tri(new vec3(0, 0, 0), new vec3(w / 2, h, 0), new vec3(-w / 2, h, 0), new vec3(0, 0, 1))
  return m.build()
}

/** Flat triangle in the XZ plane pointing +Z (toward the viewer), lying at y = 0. */
function floorArrowMesh(w: number, len: number): RenderMesh {
  const m = new MeshAccumulator()
  m.tri(new vec3(0, 0, len), new vec3(w / 2, 0, 0), new vec3(-w / 2, 0, 0), new vec3(0, 1, 0))
  return m.build()
}

function yaw(rotationDeg: number): quat {
  // Clockwise when seen from above = negative angle about +Y (right-handed).
  return quat.angleAxis(-normalizeRotation(rotationDeg) * DEG, vec3.up())
}

function rgba(c: [number, number, number], a: number = 1): vec4 {
  return new vec4(c[0], c[1], c[2], a)
}

function fmt(v: vec3): string {
  return `(${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)})`
}

// ── Controller ───────────────────────────────────────────────────────────────

@component
export class EchoesController extends BaseScriptComponent {
  @ui.label("Echoes — Signal Arch v1 controller")
  @ui.separator
  @input
  @hint("Task data variant. Keep 'valid' for the demo; the others are deliberately broken configurations used to check the cannot-start state.")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("valid", "valid"),
      new ComboBoxItem("missing-piece", "missing-piece"),
      new ComboBoxItem("missing-target", "missing-target"),
      new ComboBoxItem("empty-sequence", "empty-sequence"),
    ])
  )
  taskVariant: string = "valid"

  @input
  @hint("Test fixture only. When on, the lens runs its focused state assertions at start (logged as 'ECHOES test …') and replays to a clean start. Keep off for the demo.")
  runStateTests: boolean = false

  private task: TaskDef = SIGNAL_ARCH_V1
  private canStart = false
  private taskErrors: string[] = []

  // Task state
  private runId = 1
  private overlay: Overlay = "none"
  private stepIndex = 0
  private acceptedIds: string[] = []
  private placedObjs: SceneObject[] = []
  private selectedPieceId: string | null = null
  private rotation = 0
  private selectedTargetId: string | null = null
  /** "run:step" in which the current piece / target were chosen. */
  private pieceStamp = ""
  private targetStamp = ""
  private feedback = ""
  private feedbackKind: FeedbackKind = "none"
  private feedbackSeq = 0
  private attemptCount = 0
  /** Confirm cue: on/off, the candidate it was raised for, and its phase time (s). */
  private confirmCueOn = false
  private confirmCueKey = ""
  private confirmCueTime = 0

  // Scene
  private meshes: {[pieceId: string]: RenderMesh} = {}
  private decals: {[pieceId: string]: RenderMesh} = {}
  private decalMat: Material
  private buildRoot: SceneObject
  private placedRoot: SceneObject
  private targets: {[id: string]: TargetView} = {}
  private palette: PaletteView[] = []
  private turnButtons: ButtonView[] = []
  private confirmButton: ButtonView
  private helpButton: ButtonView
  private pauseButton: ButtonView
  private undoButton: ButtonView
  private replayButton: ButtonView
  private progressText: Text
  private instructionText: Text
  private feedbackText: Text
  private stagingModel: SceneObject
  private stagingVisual: RenderMeshVisual
  private stagingMat: Material
  private stagingDecal: SceneObject
  private stagingDecalVisual: RenderMeshVisual
  private stagingName: Text
  private stagingDetail: Text
  private statusText: Text
  private previewObj: SceneObject
  private previewVisual: RenderMeshVisual
  private previewDecal: SceneObject
  private previewDecalVisual: RenderMeshVisual
  private previewMat: Material
  private screenProbes: {name: string; obj: SceneObject; offset: vec3}[] = []

  onAwake() {
    this.task = this.resolveTask(this.taskVariant as TaskVariant)
    this.taskErrors = validateTask(this.task)
    this.canStart = this.taskErrors.length === 0

    this.buildRoot = this.child(this.sceneObject, "Build")
    this.placedRoot = this.child(this.buildRoot, "Accepted Pieces")
    this.decalMat = this.ghostMaterial(new vec4(1, 1, 1, 0.92))
    this.buildMeshes()
    this.buildBase()
    this.buildTargets()
    this.buildPreview()
    this.buildGuidance()
    this.buildPalette()
    this.buildStaging()
    this.buildControls()
    this.buildTaskButtons()

    // Input probe: records where touch/mouse presses land (screen space), so
    // injected and human clicks can be matched to the controls they hit.
    this.createEvent("TouchStartEvent").bind((e: TouchStartEvent) => {
      const p = e.getTouchPosition()
      this.log("touch-start", `x=${p.x.toFixed(4)} y=${p.y.toFixed(4)}`)
    })

    this.createEvent("UpdateEvent").bind(() => this.animateConfirmCue())

    this.createEvent("OnStartEvent").bind(() => {
      this.bindTargetEvents()
      this.refresh()
      this.log(
        "start",
        `task=${this.task.id} v${this.task.version} variant=${this.taskVariant} canStart=${this.canStart}` +
          (this.canStart ? "" : ` errors="${this.taskErrors.join("; ")}"`)
      )
      this.logState("initial")
      this.logPose("start")
      this.wait(0.5, () => this.logScreenPositions())
      if (this.runStateTests && this.canStart) this.wait(1.0, () => this.runTests())
    })
  }

  // ── Task data variants (cannot-start checks) ───────────────────────────────

  private resolveTask(variant: TaskVariant): TaskDef {
    const t = SIGNAL_ARCH_V1
    switch (variant) {
      case "missing-piece":
        return {...t, pieces: t.pieces.filter((p) => p.id !== "beam")}
      case "missing-target":
        return {...t, targets: t.targets.filter((x) => x.id !== "pedestal-seat")}
      case "empty-sequence":
        return {...t, placements: []}
      default:
        return t
    }
  }

  // ── Scene construction ─────────────────────────────────────────────────────

  private child(parent: SceneObject, name: string, pos?: vec3): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    if (pos) so.getTransform().setLocalPosition(pos)
    return so
  }

  private litMaterial(color: vec4): Material {
    const m = PIECE_MAT.clone()
    m.mainPass.baseColor = color
    return m
  }

  private ghostMaterial(color: vec4): Material {
    const m = GHOST_MAT.clone()
    m.mainPass.baseColor = color
    return m
  }

  private visual(so: SceneObject, mesh: RenderMesh, mat: Material): RenderMeshVisual {
    const v = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    v.mesh = mesh
    v.mainMaterial = mat
    return v
  }

  /** A piece's visual, plus its direction arrow when the piece has one. */
  private pieceVisual(so: SceneObject, pieceId: string, mat: Material) {
    this.visual(so, this.meshes[pieceId], mat)
    if (this.decals[pieceId]) this.visual(this.child(so, "Tip Arrow"), this.decals[pieceId], this.decalMat)
  }

  private text(
    parent: SceneObject,
    name: string,
    str: string,
    size: number,
    color: vec4,
    pos: vec3,
    rect: [number, number, number, number],
    opts: {wrap?: boolean; h?: HorizontalAlignment; v?: VerticalAlignment} = {}
  ): Text {
    const so = this.child(parent, name, pos)
    const t = so.createComponent("Component.Text") as Text
    t.text = str
    t.size = size
    t.depthTest = true
    t.horizontalAlignment = opts.h !== undefined ? opts.h : HorizontalAlignment.Center
    t.verticalAlignment = opts.v !== undefined ? opts.v : VerticalAlignment.Center
    t.horizontalOverflow = opts.wrap ? HorizontalOverflow.Wrap : HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(rect[0], rect[1], rect[2], rect[3])
    t.textFill.color = color
    return t
  }

  private panel(name: string, pos: vec3, w: number, h: number): SceneObject {
    const root = this.child(this.sceneObject, name, pos)
    root.createComponent("Component.Canvas")
    const plateObj = this.child(root, `${name} Plate`)
    const plate = plateObj.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.size = new vec2(w, h)
    return root
  }

  private button(parent: SceneObject, name: string, label: string, pos: vec3, w: number, h: number): ButtonView {
    const so = this.child(parent, name, pos)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(w, h, 1)
    const text = this.text(so, "Label", label, TEXT.button, WHITE, new vec3(0, 0, 0.3), [-w / 2 + 0.25, w / 2 - 0.25, -h / 2, h / 2])
    this.screenProbes.push({name: `control:${name}`, obj: so, offset: vec3.zero()})
    return {button: btn, label: text}
  }

  private buildMeshes() {
    for (const p of this.task.pieces) {
      const [w, h, d] = p.size
      if (p.form === "pointed-wedge") {
        this.meshes[p.id] = pointedWedgeMesh(w, h, d)
        this.decals[p.id] = pointedWedgeArrowMesh(w, h, d)
      } else if (p.form === "wedge") {
        this.meshes[p.id] = wedgeMesh(w, h, d)
      } else {
        this.meshes[p.id] = boxMesh(w, h, d)
      }
    }
  }

  private buildBase() {
    const b = this.task.base.size
    const base = this.child(this.buildRoot, "Supplied Base")
    this.visual(base, boxMesh(b[0], b[1], b[2]), this.litMaterial(rgba(this.task.base.color)))
    const arrow = this.child(this.buildRoot, "Forward Arrow", new vec3(0, b[1] + 0.05, b[2] / 2 - 5))
    this.visual(arrow, floorArrowMesh(4, 4.5), this.ghostMaterial(new vec4(1, 1, 1, 0.95)))
    this.text(this.buildRoot, "Front Label", "FRONT", TEXT.base, SOFT, new vec3(0, -1.4, b[2] / 2 + 0.2), [-4, 4, -0.8, 0.8])
  }

  private buildTargets() {
    const pMesh = pointerMesh(2.0, 1.5)
    for (const def of this.task.targets) {
      const s = def.pickSize
      const root = this.child(this.buildRoot, `Target ${def.label}`, new vec3(def.position[0], def.position[1], def.position[2]))
      const vol = this.child(root, "Pick Volume")
      const mat = this.ghostMaterial(new vec4(0.75, 0.92, 1, 0.16))
      this.visual(vol, boxMesh(s[0], s[1], s[2]), mat)
      // Box colliders are centered on their object; the mesh origin is at its bottom.
      const colliderHolder = this.child(root, "Collider", new vec3(0, s[1] / 2, 0))
      const collider = colliderHolder.createComponent("Physics.ColliderComponent") as ColliderComponent
      const shape = Shape.createBoxShape()
      shape.size = new vec3(s[0], s[1], s[2])
      collider.shape = shape
      collider.fitVisual = false
      const interactable = colliderHolder.createComponent(Interactable.getTypeName()) as Interactable
      // Label sits just above the pick volume, so the candidate ghost (which
      // fills the volume) never covers it; the next-step pointer sits above that.
      const lw = Math.max(s[0], 12) / 2
      const label = this.text(root, "Label", def.label, TEXT.targetLabel, WHITE, new vec3(0, s[1] + 0.75, s[2] / 2), [-lw, lw, -0.6, 0.6])
      const pointer = this.child(root, "Next Pointer", new vec3(0, s[1] + 1.8, s[2] / 2))
      this.visual(pointer, pMesh, this.ghostMaterial(new vec4(1, 1, 1, 0.9)))
      this.targets[def.id] = {def, root, mat, label, pointer, interactable}
      this.screenProbes.push({name: `target:${def.id}`, obj: root, offset: new vec3(0, s[1] / 2, s[2] / 2)})
    }
  }

  private bindTargetEvents() {
    for (const id in this.targets) {
      const it = this.targets[id].interactable
      it.onHoverEnter.add(() => this.log("hover", `target=${id}`))
      it.onTriggerStart.add(() => this.log("trigger-start", `target=${id}`))
      it.onTriggerEnd.add(() => this.onTargetChosen(id))
    }
  }

  private buildPreview() {
    this.previewObj = this.child(this.buildRoot, "Candidate Preview (not placed)")
    this.previewMat = this.ghostMaterial(new vec4(1, 1, 1, 0.35))
    this.previewVisual = this.visual(this.previewObj, this.meshes[this.task.pieces[0] ? this.task.pieces[0].id : ""] || boxMesh(1, 1, 1), this.previewMat)
    this.previewDecal = this.child(this.previewObj, "Tip Arrow")
    this.previewDecalVisual = this.visual(this.previewDecal, boxMesh(0.1, 0.1, 0.1), this.decalMat)
    this.previewDecal.enabled = false
    this.previewObj.enabled = false
  }

  private buildGuidance() {
    const root = this.panel("Guidance Panel", new vec3(0, GUIDANCE.y, 0), GUIDANCE.w, GUIDANCE.h)
    const content = this.child(root, "Content", new vec3(0, 0, 0.6))
    const half = GUIDANCE.w / 2 - 1
    // Persistent truthfulness label, always first in the panel.
    this.text(content, "Virtual Demo Disclosure", "Virtual build demo · enlarged pieces · no physical bricks are recognized", TEXT.disclosure, SOFT, new vec3(0, 8.4, 0), [-half, half, -0.6, 0.6])
    this.progressText = this.text(content, "Progress", "", TEXT.progress, SOFT, new vec3(0, 6.6, 0), [-half, half, -0.8, 0.8])
    this.instructionText = this.text(content, "Instruction", "", TEXT.instruction, WHITE, new vec3(0, 4.0, 0), [-half, half, -1.6, 1.6], {wrap: true})
    this.statusText = this.text(content, "Candidate Status", "", TEXT.status, SOFT, new vec3(0, 1.5, 0), [-half, half, -0.7, 0.7])
    // Correction / help / pause / completion area: top-aligned, up to five lines.
    this.feedbackText = this.text(content, "Correction", "", TEXT.feedback, WARN_TINT, new vec3(0, -4.0, 0), [-half, half, -4.6, 4.6], {wrap: true, v: VerticalAlignment.Top})
  }

  private buildPalette() {
    const root = this.child(this.sceneObject, "Piece Palette", new vec3(-SIDE_X, 0, 0))
    root.createComponent("Component.Canvas")
    this.text(root, "Header", "Pieces", TEXT.header, SOFT, new vec3(0, SIDE_COLUMN_TOP + 1.2, 0), [-4, 4, -0.7, 0.7])
    this.task.pieces.forEach((piece, i) => {
      const y = SIDE_COLUMN_TOP - PALETTE_CELL.h / 2 - i * (PALETTE_CELL.h + PALETTE_CELL.gap)
      const so = this.child(root, `Palette ${piece.label}`, new vec3(0, y, 0))
      const btn = so.createComponent(Button.getTypeName()) as Button
      btn.size = new vec3(PALETTE_CELL.w, PALETTE_CELL.h, 1)
      // Selection is shown in words ("[ Pillar ]"), color only reinforces it.
      const selectedText = this.text(so, "Label", piece.label, TEXT.paletteLabel, WHITE, new vec3(0, -2.25, 0.3), [-3.3, 3.3, -0.6, 0.6])
      // Miniature, tilted toward the viewer so the shape reads.
      const maxDim = Math.max(piece.size[0], piece.size[1], piece.size[2])
      const s = Math.min(2.8 / maxDim, 0.45)
      const mini = this.child(so, "Miniature", new vec3(0, 0.7 - (piece.size[1] * s) / 2, 1.2))
      mini.getTransform().setLocalScale(new vec3(s, s, s))
      mini.getTransform().setLocalRotation(quat.angleAxis(25 * DEG, vec3.right()))
      this.pieceVisual(mini, piece.id, this.litMaterial(rgba(piece.color)))
      btn.onTriggerUp.add(() => this.onPieceChosen(piece.id))
      this.palette.push({piece, button: btn, selectedText})
      this.screenProbes.push({name: `piece:${piece.id}`, obj: so, offset: vec3.zero()})
    })
  }

  private buildStaging() {
    const root = this.panel("Candidate Staging", new vec3(SIDE_X, SIDE_COLUMN_TOP - STAGING.h / 2, 0), STAGING.w, STAGING.h)
    this.text(root, "Header", "Candidate", TEXT.header, SOFT, new vec3(0, STAGING.h / 2 + 1.2, 0), [-4, 4, -0.7, 0.7])
    const content = this.child(root, "Content", new vec3(0, 0, 0.6))
    this.stagingName = this.text(content, "Candidate Name", "", TEXT.stagingName, WHITE, new vec3(0, 3.0, 0.2), [-3.3, 3.3, -0.6, 0.6])
    this.stagingDetail = this.text(content, "Candidate Orientation", "", TEXT.stagingDetail, SOFT, new vec3(0, -3.0, 0.2), [-3.3, 3.3, -0.6, 0.6])
    this.stagingModel = this.child(content, "Candidate Model", new vec3(0, 0, 2))
    this.stagingMat = this.litMaterial(WHITE)
    this.stagingVisual = this.visual(this.stagingModel, boxMesh(1, 1, 1), this.stagingMat)
    this.stagingDecal = this.child(this.stagingModel, "Tip Arrow")
    this.stagingDecalVisual = this.visual(this.stagingDecal, boxMesh(0.1, 0.1, 0.1), this.decalMat)
    this.stagingDecal.enabled = false
    this.stagingModel.enabled = false
  }

  private buildControls() {
    const root = this.child(this.sceneObject, "Controls", new vec3(SIDE_X, 0, 0))
    root.createComponent("Component.Canvas")
    const firstY = SIDE_COLUMN_TOP - STAGING.h - CONTROL.gap - CONTROL.h / 2
    const step = CONTROL.h + CONTROL.gap
    const left = this.button(root, "Turn Left", "Turn left", new vec3(0, firstY, 0), CONTROL.w, CONTROL.h)
    left.button.onTriggerUp.add(() => this.onTurn(-90))
    const right = this.button(root, "Turn Right", "Turn right", new vec3(0, firstY - step, 0), CONTROL.w, CONTROL.h)
    right.button.onTriggerUp.add(() => this.onTurn(90))
    this.turnButtons = [left, right]
    this.confirmButton = this.button(root, "Confirm", "Confirm", new vec3(0, firstY - 2 * step, 0), CONTROL.w, CONTROL.h)
    this.confirmButton.button.onTriggerUp.add(() => this.onConfirm())
  }

  private buildTaskButtons() {
    const lower = taskRowY(SIDE_COLUMN_TOP)
    const upper = lower + TASK_BUTTON.h + TASK_BUTTON.gap
    const leftRoot = this.child(this.sceneObject, "Task Controls Left", new vec3(-SIDE_X, 0, 0))
    leftRoot.createComponent("Component.Canvas")
    const rightRoot = this.child(this.sceneObject, "Task Controls Right", new vec3(SIDE_X, 0, 0))
    rightRoot.createComponent("Component.Canvas")
    this.helpButton = this.button(leftRoot, "Help", "Help", new vec3(0, upper, 0), TASK_BUTTON.w, TASK_BUTTON.h)
    this.helpButton.button.onTriggerUp.add(() => this.onHelp())
    this.pauseButton = this.button(leftRoot, "Pause", "Pause", new vec3(0, lower, 0), TASK_BUTTON.w, TASK_BUTTON.h)
    this.pauseButton.button.onTriggerUp.add(() => this.onPause())
    this.undoButton = this.button(rightRoot, "Undo", "Undo", new vec3(0, upper, 0), TASK_BUTTON.w, TASK_BUTTON.h)
    this.undoButton.button.onTriggerUp.add(() => this.onUndo())
    this.replayButton = this.button(rightRoot, "Replay", "Replay", new vec3(0, lower, 0), TASK_BUTTON.w, TASK_BUTTON.h)
    this.replayButton.button.onTriggerUp.add(() => this.onReplay())
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  private stamp(): string {
    return `${this.runId}:${this.stepIndex}`
  }

  /** Complete only when every placement is accepted AND the visible assembly agrees. */
  private isComplete(): boolean {
    const total = this.task.placements.length
    if (!this.canStart || total === 0) return false
    if (this.stepIndex !== total || this.acceptedIds.length !== total || this.placedObjs.length !== total) return false
    for (let i = 0; i < total; i++) {
      const id = this.task.placements[i].id
      if (this.acceptedIds[i] !== id) return false
      const so = this.placedObjs[i]
      if (!so || so.name !== `Placed ${id}` || !so.isEnabledInHierarchy) return false
    }
    return true
  }

  private mode(): string {
    if (!this.canStart) return "cannot-start"
    if (this.overlay !== "none") return this.overlay
    if (this.isComplete()) return "complete"
    if (this.feedbackKind === "warn") return "correction"
    return "active"
  }

  /** Task inputs (palette, turn, target, Confirm) are live only in plain active work. */
  private taskInputBlocked(action: string): boolean {
    if (!this.canStart) return true
    if (this.overlay !== "none") {
      this.log(`${action}-blocked`, `reason=${this.overlay}`)
      this.logState(`blocked-${action}`)
      return true
    }
    if (this.isComplete()) {
      this.log(`${action}-blocked`, "reason=complete")
      return true
    }
    return false
  }

  // ── Input handlers ─────────────────────────────────────────────────────────

  private onPieceChosen(pieceId: string) {
    if (this.taskInputBlocked("select-piece")) return
    const piece = this.pieceById(pieceId)
    if (!piece) return
    this.selectedPieceId = pieceId
    this.pieceStamp = this.stamp()
    this.rotation = normalizeRotation(piece.stagingRotation)
    this.setFeedback("", "none")
    this.log("select-piece", `piece=${pieceId} rot=${this.rotation}`)
    this.refresh()
    this.logState("after-select-piece")
  }

  private onTurn(delta: number) {
    if (this.taskInputBlocked("turn")) return
    if (!this.selectedPieceId) {
      this.setFeedback("Pick a piece from the palette first, then turn it.", "warn")
      this.refresh()
      this.log("turn-ignored", "no candidate")
      return
    }
    this.rotation = normalizeRotation(this.rotation + delta)
    this.setFeedback("", "none") // a correction about the previous turn is now stale
    this.log("turn", `delta=${delta} rot=${this.rotation}`)
    this.refresh()
    this.logState("after-turn")
  }

  private onTargetChosen(targetId: string) {
    if (!this.canStart) return
    if (!this.isTargetAvailable(targetId)) {
      // e.g. a late event for an attachment that an earlier step already filled.
      this.log("select-target-ignored", `target=${targetId} reason=unavailable`)
      return
    }
    if (this.taskInputBlocked("select-target")) return
    this.selectedTargetId = targetId
    this.targetStamp = this.stamp()
    this.setFeedback("", "none")
    this.log("select-target", `target=${targetId}`)
    this.refresh()
    this.logState("after-select-target")
  }

  private onConfirm() {
    if (!this.canStart) return
    if (this.overlay !== "none") {
      this.log("confirm-blocked", `reason=${this.overlay} accepted=${this.acceptedIds.length}`)
      this.logState("blocked-confirm")
      return
    }
    if (this.stepIndex >= this.task.placements.length) {
      this.log("confirm-ignored", "all placements accepted")
      return
    }
    // Defense in depth: a selection made in an earlier step or run cannot be
    // used to accept the current step. (Selections are also cleared on every
    // accept, undo, and replay.)
    const now = this.stamp()
    if ((this.selectedPieceId && this.pieceStamp !== now) || (this.selectedTargetId && this.targetStamp !== now)) {
      this.log("stale-selection-dropped", `pieceStamp=${this.pieceStamp} targetStamp=${this.targetStamp} now=${now}`)
      this.selectedPieceId = null
      this.selectedTargetId = null
    }
    this.attemptCount++
    const before = this.acceptedIds.length
    const attempt: Attempt = {pieceId: this.selectedPieceId, rotation: this.rotation, targetId: this.selectedTargetId}
    const verdict = evaluateAttempt(this.task, this.stepIndex, attempt)
    this.log(
      "attempt",
      `n=${this.attemptCount} run=${this.runId} step=${this.stepIndex + 1} piece=${attempt.pieceId} rot=${normalizeRotation(attempt.rotation)} ` +
        `target=${attempt.targetId} accepted=${verdict.accepted} mismatch=${verdict.mismatch} differing=${verdict.differing.join(",")} ` +
        `msg="${verdict.message}"`
    )
    if (verdict.accepted) {
      this.acceptPlacement()
    } else if (verdict.mismatch === "incomplete" && this.feedbackKind === "ok") {
      // A repeated Confirm right after an accept has nothing selected; keep the
      // "Placed: …" confirmation instead of replacing it with "Pick a piece".
      this.log("confirm-ignored", "nothing selected; success note kept")
    } else {
      this.setFeedback(verdict.message, "warn")
    }
    this.refresh()
    this.log("progress", `before=${before} after=${this.acceptedIds.length}`)
    this.logState("after-confirm")
  }

  private acceptPlacement() {
    const step = this.task.placements[this.stepIndex]
    const piece = this.pieceById(step.pieceId)
    const target = this.targetById(step.targetId)
    const so = this.child(this.placedRoot, `Placed ${step.id}`, new vec3(target.position[0], target.position[1], target.position[2]))
    const placedRotation = this.rotation
    so.getTransform().setLocalRotation(yaw(placedRotation))
    this.pieceVisual(so, piece.id, this.litMaterial(rgba(piece.color)))
    this.placedObjs.push(so)
    this.acceptedIds.push(step.id)
    this.stepIndex++
    this.clearCandidate()
    const total = this.task.placements.length
    const next = this.stepIndex < total ? " Next step is shown above." : ""
    const seq = this.setFeedback(`Placed: ${piece.noun} on ${target.label}. ${this.acceptedIds.length} of ${total} accepted.${next}`, "ok")
    this.log("accepted", `placement=${step.id} rot=${placedRotation} count=${this.acceptedIds.length}`)
    if (this.isComplete()) {
      this.log("complete", `run=${this.runId} accepted=${this.acceptedIds.length} placedObjects=${this.placedRoot.getChildrenCount()}`)
    }
    // The success note gets out of the way after a while. This is a delayed
    // callback, so it is run-guarded: a Replay before it fires drops it.
    this.later(SUCCESS_NOTE_SECONDS, "clear-success-note", () => {
      if (this.feedbackSeq !== seq) {
        this.log("callback-superseded", "name=clear-success-note (the note was already replaced)")
        return
      }
      this.setFeedback("", "none")
      this.refresh()
      this.logState("after-success-note-cleared")
    })
  }

  private onHelp() {
    if (!this.canStart) return
    if (this.overlay === "paused") {
      this.log("help-blocked", "reason=paused")
      return
    }
    this.overlay = this.overlay === "help" ? "none" : "help"
    this.log(this.overlay === "help" ? "help-open" : "help-close", `step=${this.stepIndex + 1} accepted=${this.acceptedIds.length}`)
    this.refresh()
    this.logState(this.overlay === "help" ? "after-help-open" : "after-help-close")
  }

  private onPause() {
    if (!this.canStart) return
    if (this.overlay === "help") {
      this.log("pause-blocked", "reason=help")
      return
    }
    if (this.overlay === "none" && this.isComplete()) {
      this.log("pause-blocked", "reason=complete")
      return
    }
    this.overlay = this.overlay === "paused" ? "none" : "paused"
    this.log(this.overlay === "paused" ? "pause" : "resume", `step=${this.stepIndex + 1} accepted=${this.acceptedIds.length}`)
    this.refresh()
    this.logState(this.overlay === "paused" ? "after-pause" : "after-resume")
  }

  private onUndo() {
    if (!this.canStart) return
    if (this.overlay !== "none") {
      this.log("undo-blocked", `reason=${this.overlay}`)
      return
    }
    if (this.acceptedIds.length === 0) {
      this.log("undo-blocked", "reason=no-accepted-placement")
      this.logState("blocked-undo")
      return
    }
    const wasComplete = this.isComplete()
    const before = this.acceptedIds.length
    const id = this.acceptedIds.pop()
    const so = this.placedObjs.pop()
    if (so) so.destroy()
    this.stepIndex--
    const step = this.task.placements[this.stepIndex]
    const piece = this.pieceById(step.pieceId)
    const target = this.targetById(step.targetId)
    this.clearCandidate()
    this.setFeedback(`Undone: removed the ${piece.noun} from ${target.label}. Step ${this.stepIndex + 1} is open again.`, "info")
    this.log("undo", `removed=${id} wasComplete=${wasComplete} before=${before} after=${this.acceptedIds.length}`)
    this.refresh()
    this.logState("after-undo")
  }

  private onReplay() {
    if (!this.canStart) return
    const from = this.mode()
    this.logPose("before-replay")
    this.runId++
    for (const so of this.placedObjs) so.destroy()
    this.placedObjs = []
    this.acceptedIds = []
    this.stepIndex = 0
    this.overlay = "none"
    this.attemptCount = 0
    this.clearCandidate()
    this.setFeedback(`Started over: Step 1 of ${this.task.placements.length}. Pieces and choices are cleared.`, "info")
    this.log("replay", `from=${from} run=${this.runId}`)
    this.refresh()
    this.logState("after-replay")
    this.logPose("after-replay")
  }

  private clearCandidate() {
    this.selectedPieceId = null
    this.selectedTargetId = null
    this.pieceStamp = ""
    this.targetStamp = ""
    this.rotation = 0
  }

  // ── State → view ───────────────────────────────────────────────────────────

  private refresh() {
    const total = this.task.placements.length
    if (!this.canStart) {
      this.progressText.text = "Cannot start"
      this.instructionText.text = "This build's task data is incomplete, so no placement can be accepted."
      this.feedbackText.text = `Problem: ${this.taskErrors.join("; ")}`
      this.feedbackText.textFill.color = WARN_TINT
      for (const b of this.allButtons()) {
        b.button.inactive = true
        b.label.textFill.color = DIM
      }
      for (const p of this.palette) {
        p.button.inactive = true
        p.selectedText.textFill.color = DIM
      }
      for (const id in this.targets) this.targets[id].root.enabled = false
      this.stagingName.text = ""
      this.stagingDetail.text = ""
      this.statusText.text = ""
      this.setConfirmCue(false)
      return
    }

    const complete = this.isComplete()
    const paused = this.overlay === "paused"
    const help = this.overlay === "help"
    const working = this.overlay === "none" && !complete
    const step = this.stepIndex < total ? this.task.placements[this.stepIndex] : null
    const counts = complete ? `Complete · ${total} of ${total} placed` : `Step ${this.stepIndex + 1} of ${total} · ${this.acceptedIds.length} placed`

    // Progress and instruction.
    if (paused) {
      this.progressText.text = `PAUSED · ${counts}`
      this.instructionText.text = "Paused. Nothing can be placed until you press Resume."
    } else {
      this.progressText.text = `${help ? "HELP · " : ""}${this.task.title} v${this.task.version} · ${counts}`
      this.instructionText.text = complete ? `${this.task.title} complete: all ${total} placements accepted.` : step.instruction
    }

    // Candidate status line (kept visible in help and pause: it is preserved).
    const piece = this.pieceById(this.selectedPieceId)
    const target = this.targetById(this.selectedTargetId)
    // Fully staged and Confirm would be evaluated now (not after a correction,
    // which asks for a change first).
    const awaitingConfirm = working && !!piece && !!target && this.feedbackKind !== "warn"
    if (complete && !help) {
      this.statusText.text = "Virtual check only: no physical model was inspected."
    } else {
      const pieceStatus = piece ? `${piece.noun} at ${this.rotation}° (${this.describe(piece.id, this.rotation)})` : "no piece"
      this.statusText.text = `Chosen: ${pieceStatus} · ${target ? target.label : "no attachment"}${awaitingConfirm ? CONFIRM_CUE_LINE : ""}`
    }

    // Correction / help / pause / completion area.
    if (help) {
      this.feedbackText.text = this.helpText()
      this.feedbackText.textFill.color = HELP_TINT
    } else if (paused) {
      const cand = piece ? `, your ${piece.label.toLowerCase()} at ${this.rotation}°` : ""
      this.feedbackText.text = `Kept: ${this.acceptedIds.length} placed, Step ${complete ? total : this.stepIndex + 1}${cand}. Press Resume to go on.`
      this.feedbackText.textFill.color = INFO_TINT
    } else if (complete) {
      this.feedbackText.text = "Undo reopens the last placement. Replay starts a new run."
      this.feedbackText.textFill.color = OK_TINT
    } else {
      this.feedbackText.text = this.feedback
      this.feedbackText.textFill.color =
        this.feedbackKind === "ok" ? OK_TINT : this.feedbackKind === "info" ? INFO_TINT : WARN_TINT
    }

    // Targets: offer unfilled attachments whose supports are in place. Hidden
    // while paused; visible but not selectable while help is open.
    for (const id in this.targets) {
      const view = this.targets[id]
      const available = this.isTargetAvailable(id) && !paused
      view.root.enabled = available
      view.interactable.enabled = available && working
      const selected = this.selectedTargetId === id
      const intended = !!step && step.targetId === id
      view.mat.mainPass.baseColor = selected ? new vec4(0.75, 0.92, 1, 0.38) : new vec4(0.75, 0.92, 1, 0.14)
      view.label.text = selected ? `[ ${view.def.label} ]` : view.def.label
      view.pointer.enabled = intended
    }

    // Palette selection is stated in words, not color alone; dim when inactive.
    for (const p of this.palette) {
      const sel = this.selectedPieceId === p.piece.id
      p.selectedText.text = sel ? `[ ${p.piece.label} ]` : p.piece.label
      p.selectedText.textFill.color = !working ? DIM : sel ? OK_TINT : WHITE
    }
    for (const b of this.turnButtons) this.setButton(b, working)
    this.setButton(this.confirmButton, working)
    this.setConfirmCue(awaitingConfirm)
    this.setButton(this.helpButton, this.overlay !== "paused", help ? "Close help" : "Help")
    this.setButton(this.pauseButton, this.overlay === "paused" || (this.overlay === "none" && !complete), paused ? "Resume" : "Pause")
    this.setButton(this.undoButton, this.overlay === "none" && this.acceptedIds.length > 0)
    this.setButton(this.replayButton, true)

    // Candidate staging.
    if (piece) {
      const maxDim = Math.max(piece.size[0], piece.size[1], piece.size[2])
      const s = Math.min(3.4 / maxDim, 0.45)
      this.stagingVisual.mesh = this.meshes[piece.id]
      this.stagingMat.mainPass.baseColor = rgba(piece.color)
      this.setDecal(this.stagingDecal, this.stagingDecalVisual, piece.id)
      const t = this.stagingModel.getTransform()
      t.setLocalScale(new vec3(s, s, s))
      t.setLocalPosition(new vec3(0, -(piece.size[1] * s) / 2, 2))
      t.setLocalRotation(quat.angleAxis(25 * DEG, vec3.right()).multiply(yaw(this.rotation)))
      this.stagingModel.enabled = true
      this.stagingName.text = piece.label
      this.stagingDetail.text = `Turned ${this.rotation}°`
    } else {
      this.stagingModel.enabled = false
      this.stagingName.text = "None yet"
      this.stagingDetail.text = complete ? "" : "Pick a piece"
    }

    // Preview ghost of the candidate at the chosen attachment (not a placement).
    if (piece && target && !paused) {
      this.previewVisual.mesh = this.meshes[piece.id]
      this.setDecal(this.previewDecal, this.previewDecalVisual, piece.id)
      const pt = this.previewObj.getTransform()
      pt.setLocalPosition(new vec3(target.position[0], target.position[1], target.position[2]))
      pt.setLocalRotation(yaw(this.rotation))
      this.previewObj.enabled = true
    } else {
      this.previewObj.enabled = false
    }
  }

  private helpText(): string {
    const total = this.task.placements.length
    if (this.isComplete()) {
      return `All ${total} placements are accepted. Undo reopens the last one; Replay starts over. Help never places a piece.`
    }
    const step = this.task.placements[this.stepIndex]
    const piece = this.pieceById(step.pieceId)
    const target = this.targetById(step.targetId)
    return (
      `Piece: the ${piece.noun} ("${piece.label}" in Pieces).\n` +
      `Turn: ${step.turnHelp}\n` +
      `Attachment: ${target.phrase} ("${target.label}"), under the white pointer.\n` +
      `Then Confirm. Help never places a piece.`
    )
  }

  /**
   * Starts, re-phases, or stops the Confirm cue. A new candidate (run, step,
   * piece, turn, or attachment changed) restarts the pulse from rest; leaving
   * the staged state stops it and returns the label to rest at once.
   */
  private setConfirmCue(on: boolean) {
    const key = on ? `${this.runId}:${this.stepIndex}:${this.selectedPieceId}:${this.rotation}:${this.selectedTargetId}` : ""
    if (on === this.confirmCueOn && key === this.confirmCueKey) return
    const wasOn = this.confirmCueOn
    this.confirmCueOn = on
    this.confirmCueKey = key
    this.confirmCueTime = 0
    this.confirmButton.label.getSceneObject().getTransform().setLocalScale(vec3.one())
    if (on) this.confirmButton.label.textFill.color = WHITE
    if (on || wasOn) this.log("confirm-cue", on ? `on candidate=${key}` : "off")
  }

  private animateConfirmCue() {
    if (!this.confirmCueOn) return
    this.confirmCueTime += getDeltaTime()
    const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * CONFIRM_CUE.hz * this.confirmCueTime)
    const s = 1 + CONFIRM_CUE.labelScale * w
    const label = this.confirmButton.label
    label.getSceneObject().getTransform().setLocalScale(new vec3(s, s, 1))
    label.textFill.color = vec4.lerp(WHITE, OK_TINT, w)
  }

  private allButtons(): ButtonView[] {
    return [...this.turnButtons, this.confirmButton, this.helpButton, this.pauseButton, this.undoButton, this.replayButton]
  }

  /** Disabled controls keep their collider (so a press is logged as blocked) but read as dimmed. */
  private setButton(b: ButtonView, enabled: boolean, label?: string) {
    if (label !== undefined) b.label.text = label
    b.label.textFill.color = enabled ? WHITE : DIM
  }

  private setDecal(obj: SceneObject, visual: RenderMeshVisual, pieceId: string) {
    const mesh = this.decals[pieceId]
    if (mesh) visual.mesh = mesh
    obj.enabled = !!mesh
  }

  private describe(pieceId: string, rotation: number): string {
    for (const pl of this.task.placements) {
      if (pl.pieceId === pieceId) return pl.describeRotation(rotation)
    }
    return ""
  }

  private setFeedback(msg: string, kind: FeedbackKind): number {
    this.feedback = msg
    this.feedbackKind = kind
    return ++this.feedbackSeq
  }

  // ── Delayed callbacks ──────────────────────────────────────────────────────

  /** Run-guarded delayed callback: dropped if a Replay started a new run meanwhile. */
  private later(seconds: number, name: string, fn: () => void) {
    const run = this.runId
    this.log("callback-scheduled", `name=${name} run=${run} delay=${seconds}s`)
    this.wait(seconds, () => {
      if (run !== this.runId) {
        this.log("stale-callback-dropped", `name=${name} scheduledRun=${run} currentRun=${this.runId}`)
        this.logState("after-stale-callback")
        return
      }
      this.log("callback-due", `name=${name} run=${run}`)
      fn()
    })
  }

  /** Unguarded timer for logging and tests only. */
  private wait(seconds: number, fn: () => void) {
    const ev = this.createEvent("DelayedCallbackEvent") as DelayedCallbackEvent
    ev.bind(fn)
    ev.reset(seconds)
  }

  // ── Lookups ────────────────────────────────────────────────────────────────

  private isTargetAvailable(id: string): boolean {
    if (!this.canStart) return false
    const view = this.targets[id]
    if (!view) return false
    for (const pl of this.task.placements) {
      if (pl.targetId === id && this.acceptedIds.indexOf(pl.id) >= 0) return false
    }
    for (const req of view.def.requires) {
      const pl = this.task.placements.filter((p) => p.targetId === req)[0]
      if (!pl || this.acceptedIds.indexOf(pl.id) < 0) return false
    }
    return true
  }

  private pieceById(id: string | null): PieceDef | null {
    if (!id) return null
    return this.task.pieces.filter((p) => p.id === id)[0] || null
  }

  private targetById(id: string | null): TargetDef | null {
    if (!id) return null
    return this.task.targets.filter((t) => t.id === id)[0] || null
  }

  // ── Logging ────────────────────────────────────────────────────────────────

  private log(event: string, details: string) {
    print(`ECHOES ${event} ${details}`)
  }

  private logState(label: string) {
    const step = this.stepIndex < this.task.placements.length ? this.stepIndex + 1 : "done"
    print(
      `ECHOES state[${label}] run=${this.runId} mode=${this.mode()} overlay=${this.overlay} complete=${this.isComplete()} ` +
        `step=${step} accepted=${this.acceptedIds.length} ids=[${this.acceptedIds.join(",")}] ` +
        `placedObjects=${this.placedObjs.length} piece=${this.selectedPieceId} rot=${this.rotation} ` +
        `target=${this.selectedTargetId} feedback="${this.feedback}"`
    )
  }

  /** World pose of the assembly and the camera: Replay must not move the assembly. */
  private logPose(label: string) {
    const cam = WorldCameraFinderProvider.getInstance().getTransform()
    const t = this.sceneObject.getTransform()
    print(
      `ECHOES pose[${label}] buildWorld=${fmt(t.getWorldPosition())} buildRotY=${(t.getWorldRotation().toEulerAngles().y / DEG).toFixed(1)} ` +
        `camera=${fmt(cam.getWorldPosition())}`
    )
  }

  private logScreenPositions() {
    const cam = WorldCameraFinderProvider.getInstance().getComponent()
    for (const p of this.screenProbes) {
      const world = p.obj.getTransform().getWorldTransform().multiplyPoint(p.offset)
      const s = cam.worldSpaceToScreenSpace(world)
      print(`ECHOES screen ${p.name} x=${s.x.toFixed(4)} y=${s.y.toFixed(4)} enabled=${p.obj.isEnabledInHierarchy}`)
    }
  }

  // ── Read-only view for LEAF scenarios (Increment 3) ────────────────────────
  //
  // Returns a copy of the task state together with what the scene actually
  // shows (texts, placed objects, candidate visuals, which targets can be
  // picked, which controls read as enabled). It changes nothing; scenarios
  // drive the lens only through the SIK/UIKit interactables.

  testState(): EchoesTestState {
    const targets: {[id: string]: {shown: boolean; selectable: boolean; label: string; pointer: boolean}} = {}
    for (const id in this.targets) {
      const v = this.targets[id]
      targets[id] = {
        shown: v.root.isEnabledInHierarchy,
        selectable: v.interactable.enabled && v.interactable.getSceneObject().isEnabledInHierarchy,
        label: v.label.text,
        pointer: v.pointer.isEnabledInHierarchy,
      }
    }
    const controls: {[name: string]: {label: string; lit: boolean}} = {}
    const named: [string, ButtonView][] = [
      ["turn-left", this.turnButtons[0]],
      ["turn-right", this.turnButtons[1]],
      ["confirm", this.confirmButton],
      ["help", this.helpButton],
      ["pause", this.pauseButton],
      ["undo", this.undoButton],
      ["replay", this.replayButton],
    ]
    for (const [name, b] of named) controls[name] = {label: b.label.text, lit: b.label.textFill.color.w > 0.5}
    const palette: {[pieceId: string]: {label: string; lit: boolean}} = {}
    for (const p of this.palette) palette[p.piece.id] = {label: p.selectedText.text, lit: p.selectedText.textFill.color.w > 0.5}
    const placedNames: string[] = []
    for (let i = 0; i < this.placedRoot.getChildrenCount(); i++) placedNames.push(this.placedRoot.getChild(i).name)
    const w = this.sceneObject.getTransform().getWorldPosition()
    return {
      canStart: this.canStart,
      runId: this.runId,
      mode: this.mode(),
      overlay: this.overlay,
      complete: this.isComplete(),
      stepIndex: this.stepIndex,
      acceptedIds: this.acceptedIds.slice(),
      placedCount: this.placedObjs.length,
      placedNames,
      piece: this.selectedPieceId,
      rotation: this.rotation,
      target: this.selectedTargetId,
      feedback: this.feedback,
      feedbackKind: this.feedbackKind,
      progressText: this.progressText.text,
      instructionText: this.instructionText.text,
      statusText: this.statusText.text,
      confirmCue: this.confirmCueOn,
      panelText: this.feedbackText.text,
      stagingShown: this.stagingModel.isEnabledInHierarchy,
      stagingName: this.stagingName.text,
      stagingDetail: this.stagingDetail.text,
      ghostShown: this.previewObj.isEnabledInHierarchy,
      targets,
      controls,
      palette,
      buildWorld: [w.x, w.y, w.z],
      stepInstructions: this.task.placements.map((p) => p.instruction),
    }
  }

  // ── State tests (fixture; runs only when runStateTests is on) ───────────────
  //
  // Focused assertions that drive the same handlers the buttons and targets
  // call. They are "State test" evidence, not Human Preview.

  private testPass = 0
  private testFail = 0

  private check(name: string, ok: boolean, detail: string = "") {
    if (ok) this.testPass++
    else this.testFail++
    print(`ECHOES test ${ok ? "PASS" : "FAIL"} ${name}${detail ? " · " + detail : ""}`)
  }

  private snapshot(): string {
    return JSON.stringify({
      run: this.runId,
      overlay: this.overlay,
      step: this.stepIndex,
      ids: this.acceptedIds,
      placed: this.placedObjs.length,
      piece: this.selectedPieceId,
      rot: this.rotation,
      target: this.selectedTargetId,
    })
  }

  /** Choose a piece, turn it to `rot`, and choose a target, through the handlers. */
  private choose(pieceId: string, rot: number, targetId: string) {
    this.onPieceChosen(pieceId)
    let guard = 0
    while (this.rotation !== normalizeRotation(rot) && guard++ < 4) this.onTurn(90)
    this.onTargetChosen(targetId)
  }

  private placeStep(i: number) {
    const pl = this.task.placements[i]
    this.choose(pl.pieceId, pl.validRotations[0], pl.targetId)
    this.onConfirm()
  }

  private assertBaseline(name: string) {
    const ok =
      this.acceptedIds.length === 0 &&
      this.placedObjs.length === 0 &&
      this.placedRoot.getChildrenCount() === 0 &&
      this.stepIndex === 0 &&
      this.selectedPieceId === null &&
      this.selectedTargetId === null &&
      this.rotation === 0 &&
      this.overlay === "none" &&
      !this.isComplete() &&
      this.feedbackKind === "info" &&
      this.feedback.indexOf("Started over") === 0 &&
      !this.confirmCueOn
    this.check(name, ok, this.snapshot())
  }

  private runTests() {
    print("ECHOES test BEGIN state suite")
    const total = this.task.placements.length
    const startPose = this.sceneObject.getTransform().getWorldPosition()

    // A6 · Undo disabled at zero placements.
    this.onReplay()
    this.onUndo()
    this.check("A6 undo at zero does nothing", this.acceptedIds.length === 0 && this.stepIndex === 0, this.snapshot())

    // A9 · Confirm cue (Increment 15): on only while a candidate is fully staged
    // in active work; any state change re-phases or stops it.
    const CUE = CONFIRM_CUE_LINE
    const cueText = () => this.statusText.text.indexOf(CUE) >= 0
    this.onPieceChosen("pillar")
    this.check("A9 cue off with only a piece chosen", !this.confirmCueOn && !cueText(), this.statusText.text)
    this.onTargetChosen("left-pad")
    const firstKey = this.confirmCueKey
    const st = this.statusText.text
    this.check("A9 cue on when piece and attachment are staged", this.confirmCueOn && st.lastIndexOf(CUE) === st.length - CUE.length, st)
    this.onTargetChosen("right-pad")
    this.check("A9 attachment change re-phases the cue", this.confirmCueOn && this.confirmCueKey !== firstKey, this.confirmCueKey)
    this.onConfirm()
    this.check("A9 cue off during a correction", this.mode() === "correction" && !this.confirmCueOn && !cueText(), this.statusText.text)
    this.onTargetChosen("left-pad")
    this.onHelp()
    this.check("A9 cue off while help is open", this.overlay === "help" && !this.confirmCueOn && !cueText(), this.statusText.text)
    this.onHelp()
    this.onPause()
    this.check("A9 cue off while paused", this.overlay === "paused" && !this.confirmCueOn && !cueText(), this.statusText.text)
    this.onPause()
    this.check("A9 cue returns after resume", this.overlay === "none" && this.confirmCueOn && cueText(), this.statusText.text)
    this.onConfirm()
    this.check("A9 cue stops on accept", this.acceptedIds.length === 1 && !this.confirmCueOn && !cueText(), this.statusText.text)
    this.choose("pillar", 0, "right-pad")
    this.onUndo()
    this.check("A9 cue stops on undo", this.acceptedIds.length === 0 && !this.confirmCueOn && !cueText(), this.statusText.text)
    this.choose("pillar", 0, "left-pad")
    this.onReplay()
    this.check("A9 cue stops on replay", this.acceptedIds.length === 0 && !this.confirmCueOn && !cueText(), this.statusText.text)

    // A4 · Out-of-order target at step 1 (right pad instead of left) does not advance.
    this.choose("pillar", 0, "right-pad")
    this.onConfirm()
    this.check("A4 out-of-order target does not advance", this.acceptedIds.length === 0 && this.stepIndex === 0, this.feedback)

    // A4 · Proper prefixes are incomplete; duplicate confirm advances once.
    this.placeStep(0)
    this.onConfirm()
    this.onConfirm()
    this.check("A4 duplicate confirm advances once", this.acceptedIds.length === 1 && this.stepIndex === 1, this.snapshot())
    this.check("A4 prefix 1 incomplete", !this.isComplete())

    // A4 · An event from the preceding step (left pad, already filled) cannot accept step 2.
    this.onPieceChosen("pillar")
    this.onTargetChosen("left-pad")
    this.check("A4 stale target event ignored", this.selectedTargetId === null, this.snapshot())
    this.onConfirm()
    this.check("A4 stale target cannot accept step 2", this.acceptedIds.length === 1, this.feedback)
    // A selection stamped in the previous step is dropped even if it is still set.
    this.onTargetChosen("right-pad")
    this.targetStamp = `${this.runId}:${this.stepIndex - 1}`
    this.onConfirm()
    this.check("A4 selection stamped in preceding step cannot accept", this.acceptedIds.length === 1 && this.selectedTargetId === null, this.snapshot())

    this.placeStep(1)
    this.check("A4 prefix 2 incomplete", this.acceptedIds.length === 2 && !this.isComplete())
    // Out-of-order at step 3: the pedestal seat is not offered before the beam.
    this.onTargetChosen("pedestal-seat")
    this.check("A4 out-of-order later target not selectable", this.selectedTargetId === null)

    // A5 · Help mid-step with a turned candidate.
    this.choose("beam", 90, "beam-seat")
    const beforeHelp = this.snapshot()
    this.onHelp()
    this.check("A5 help open", this.overlay === "help" && this.feedbackText.text.indexOf("Piece: the long beam") === 0, this.feedbackText.text)
    this.onConfirm()
    this.onTurn(90)
    this.onPieceChosen("pillar")
    this.check("A5 help blocks placement and edits", this.acceptedIds.length === 2 && this.rotation === 90 && this.selectedPieceId === "beam")
    this.onHelp()
    this.check("A5 help close restores exact state", this.snapshot() === beforeHelp, this.snapshot())

    // A5 · Pause with a selected, rotated candidate; attempt placement while paused.
    this.onTurn(90) // beam now at 180, a valid turn
    const beforePause = this.snapshot()
    this.onPause()
    this.check("A5 paused", this.overlay === "paused" && this.progressText.text.indexOf("PAUSED") === 0, this.progressText.text)
    this.onConfirm()
    this.onTurn(90)
    this.onTargetChosen("beam-seat")
    this.onUndo()
    this.onHelp()
    this.check("A5 pause blocks placement, turn, undo, help", this.acceptedIds.length === 2 && this.rotation === 180 && this.overlay === "paused")
    this.onPause()
    this.check("A5 resume restores exact state", this.snapshot() === beforePause, this.snapshot())
    this.onConfirm()
    this.check("A4 prefix 3 incomplete", this.acceptedIds.length === 3 && !this.isComplete())

    // A6 · Undo at an intermediate step.
    const keep = this.placedObjs.slice(0, 2)
    this.onPieceChosen("pedestal")
    this.onUndo()
    this.check(
      "A6 undo intermediate removes only latest",
      this.acceptedIds.join(",") === "p1-left-pillar,p2-right-pillar" &&
        this.placedObjs.length === 2 &&
        this.placedObjs[0] === keep[0] &&
        this.placedObjs[1] === keep[1] &&
        this.stepIndex === 2 &&
        this.selectedPieceId === null &&
        this.instructionText.text === this.task.placements[2].instruction,
      this.snapshot()
    )
    this.placeStep(2)
    this.check("A6 re-place after undo reaches next state once", this.acceptedIds.length === 3 && this.stepIndex === 3)

    // A4 · Complete the sequence.
    this.placeStep(3)
    this.check("A4 prefix 4 incomplete", this.acceptedIds.length === 4 && !this.isComplete())
    this.placeStep(4)
    this.check("A4 complete after all five, scene agrees", this.isComplete() && this.placedRoot.getChildrenCount() === total, this.snapshot())
    this.onConfirm()
    this.onPieceChosen("pillar")
    this.check("A4 completion blocks further input", this.acceptedIds.length === total && this.selectedPieceId === null)

    // A6 · Undo after completion.
    this.onUndo()
    this.check(
      "A6 undo after completion reopens final placement",
      !this.isComplete() && this.acceptedIds.length === total - 1 && this.stepIndex === total - 1 && this.instructionText.text === this.task.placements[total - 1].instruction,
      this.snapshot()
    )
    this.placeStep(4)
    this.check("A6 re-place final reaches completion once", this.isComplete() && this.acceptedIds.length === total)

    // A7 · Replay from completion, active, correction, help, pause.
    this.onReplay()
    this.assertBaseline("A7 replay from completion")
    this.placeStep(0)
    this.onPieceChosen("pillar")
    this.onReplay()
    this.assertBaseline("A7 replay from active")
    this.choose("beam", 90, "left-pad")
    this.onConfirm()
    this.check("A7 correction state reached", this.mode() === "correction", this.feedback)
    this.onReplay()
    this.assertBaseline("A7 replay from correction")
    this.placeStep(0)
    this.onHelp()
    this.onReplay()
    this.assertBaseline("A7 replay from help")
    this.placeStep(0)
    this.choose("pillar", 90, "right-pad")
    this.onPause()
    this.onReplay()
    this.assertBaseline("A7 replay from pause")
    const pose = this.sceneObject.getTransform().getWorldPosition()
    this.check("A7 assembly world position unchanged by replays", pose.distance(startPose) < 0.001, `${fmt(startPose)} -> ${fmt(pose)}`)

    // A7 · Delayed callback from the previous run cannot mutate the new run.
    this.placeStep(0) // schedules the run-guarded success-note clear
    this.onReplay()
    const afterReplay = this.snapshot()
    const replayNote = this.feedback
    this.wait(SUCCESS_NOTE_SECONDS + 1, () => {
      this.check(
        "A7 stale delayed callback cannot mutate new run",
        this.snapshot() === afterReplay && this.feedback === replayNote,
        this.snapshot()
      )
      this.onReplay()
      print(`ECHOES test END pass=${this.testPass} fail=${this.testFail}`)
    })
  }
}
