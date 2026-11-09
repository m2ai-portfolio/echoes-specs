/** Echoes 40897 guide: printed steps 1-7 of the lower assembly, one step at a time.
 * Attached to "Echoes 40897 Guide" in Scene.scene (Signal Arch kept, disabled).
 * Rotate, Explode and Inspect Connection show each incoming part at its authored pose.
 * "I placed it" is the user's own statement about their bricks; Echoes never senses them.
 * Preview evidence and LEAF scenarios: validation/guide-hero/.
 */
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {boxMesh} from "../Scripts/EchoesMeshes"
import {GUIDE_SECTION} from "./GuideData"
import {buildGuidePartMesh, guidePartVertices} from "./GuideMeshFactory"
import {GuideState, OrbitDragSession, ZOOM_MAX, ZOOM_STEP} from "./GuideState"

const PIECE_MAT = requireAsset("../Materials/EchoesPiece.mat") as Material
const GHOST_MAT = requireAsset("../Materials/EchoesGhostFresnel.mat") as Material
const LDU_CM = 0.04
const DEG = Math.PI / 180
/** Model window in guide-root cm: between the rails (inner edges ±17) and below the
 * heading plate (bottom y 20). The visible model's bounding sphere is scaled to this
 * radius at ZOOM_MAX, with margin for perspective at 90 cm. */
const WINDOW_CENTER = new vec3(0, -0.5, 0)
const WINDOW_RADIUS_CM = 13

type PartView = {solid: SceneObject; ghost: SceneObject | null; cue: SceneObject | null; vertices: number[]}

export type GuideHeroTestState = {
  started: boolean
  step: number
  lastStep: number
  confirmed: number[]
  finished: boolean
  exploded: boolean
  inspecting: boolean
  focusKey: string
  inspectIndex: number
  yaw: number
  pitch: number
  zoom: number
  turntableRotation: number[]
  turntableScale: number
  fitScale: number
  framingRadiusCm: number
  windowRadiusCm: number
  shownParts: string[]
  shownGhosts: string[]
  shownCues: string[]
  fixed: {[key: string]: number[]}
  fixedExpected: {[key: string]: number[]}
  incoming: {[key: string]: {solid: number[]; ghost: number[]; ghostShown: boolean; expectedSeparated: number[]; expectedFinal: number[]}}
  axisCueShown: boolean
  titleText: string
  statusText: string
  detailText: string
  confirmText: string
  explodeLabel: string
  inspectLabel: string
  sideLabel: string
  confirmLabel: string
}

@component
export class EchoesGuideHero extends BaseScriptComponent {
  private state: GuideState
  private guideRoot: SceneObject | null = null
  private turntable: SceneObject
  private modelPivot: SceneObject
  private parts: {[key: string]: PartView} = {}
  private framingCenter = new vec3(0, 0, 0)
  private framingRadius = 1
  private fitScale = 1
  private title: Text
  private status: Text
  private detail: Text
  private confirmLine: Text
  private explodeLabel: Text
  private inspectLabel: Text
  private sideLabel: Text
  private confirmLabel: Text
  private drag = new OrbitDragSession()

  onAwake() {
    try {
      this.buildGuide()
    } catch (error) {
      if (this.guideRoot) {
        try { this.guideRoot.destroy() }
        catch (cleanupError) { print(`ECHOES GUIDE cleanup-failed: ${String(cleanupError)}`) }
      }
      this.guideRoot = null
      this.showCannotStart(error)
    }
  }

  private buildGuide() {
    this.state = new GuideState(GUIDE_SECTION, 1)
    this.guideRoot = this.child(this.sceneObject, "Echoes 40897 guide")
    this.turntable = this.child(this.guideRoot, "Guide orbit root", WINDOW_CENTER)
    this.modelPivot = this.child(this.turntable, "Canonical assembly pivot")
    const incoming = this.state.steps.flatMap((step) => step.explodeKeys)
    for (const step of this.state.steps) {
      for (const key of step.parts) this.addPart(key, incoming.includes(key), step)
    }
    this.buildControls()
    this.applyStep()
    this.createEvent("TouchStartEvent").bind((event: TouchStartEvent) => {
      const p = event.getTouchPosition()
      this.drag.start(p.x, p.y)
    })
    this.createEvent("TouchMoveEvent").bind((event: TouchMoveEvent) => {
      const p = event.getTouchPosition()
      const delta = this.drag.move(p.x, p.y)
      if (delta) {
        this.state.orbit(delta[0], delta[1])
        this.applyOrbit()
      }
    })
    this.createEvent("TouchEndEvent").bind(() => {
      this.drag.end()
      print(`ECHOES GUIDE touch-end yaw=${this.state.yawDegrees.toFixed(1)} pitch=${this.state.pitchDegrees.toFixed(1)} zoom=${this.state.zoom.toFixed(2)}`)
    })
    print(`ECHOES GUIDE hero-start steps=${this.state.lastStep} parts=${Object.keys(this.parts).length} incoming=${incoming.length}`)
  }

  /** Read-only snapshot for LEAF: state plus what the scene actually shows. */
  testState(): GuideHeroTestState {
    const local = (so: SceneObject): number[] => {
      const p = so.getTransform().getLocalPosition()
      return [p.x, p.y, p.z]
    }
    const cm = (v: number[]): number[] => v.map((x) => x * LDU_CM)
    const fixed: {[key: string]: number[]} = {}
    const fixedExpected: {[key: string]: number[]} = {}
    for (const key of this.state.fixedKeys) {
      fixed[key] = local(this.parts[key].solid)
      fixedExpected[key] = cm(this.state.position(key, false))
    }
    const incoming: GuideHeroTestState["incoming"] = {}
    for (const key of this.state.activeKeys) {
      const view = this.parts[key]
      incoming[key] = {
        solid: local(view.solid),
        ghost: local(view.ghost),
        ghostShown: view.ghost.enabled,
        expectedSeparated: cm(this.state.position(key, true)),
        expectedFinal: cm(this.state.position(key, false)),
      }
    }
    const keys = Object.keys(this.parts)
    const r = this.turntable.getTransform().getLocalRotation()
    return {
      started: this.guideRoot !== null,
      step: this.state.stepNumber,
      lastStep: this.state.lastStep,
      confirmed: this.state.confirmed.slice(),
      finished: this.state.finished,
      exploded: this.state.exploded,
      inspecting: this.state.inspecting,
      focusKey: this.state.focusKey,
      inspectIndex: this.state.inspectIndex,
      yaw: this.state.yawDegrees,
      pitch: this.state.pitchDegrees,
      zoom: this.state.zoom,
      turntableRotation: [r.w, r.x, r.y, r.z],
      turntableScale: this.turntable.getTransform().getLocalScale().x,
      fitScale: this.fitScale,
      framingRadiusCm: this.framingRadius,
      windowRadiusCm: WINDOW_RADIUS_CM,
      shownParts: keys.filter((k) => this.parts[k].solid.enabled),
      shownGhosts: keys.filter((k) => this.parts[k].ghost && this.parts[k].ghost.enabled),
      shownCues: keys.filter((k) => this.parts[k].cue && this.parts[k].cue.enabled),
      fixed,
      fixedExpected,
      incoming,
      axisCueShown: this.state.activeKeys.every((k) => this.parts[k].cue.enabled),
      titleText: this.title.text,
      statusText: this.status.text,
      detailText: this.detail.text,
      confirmText: this.confirmLine.text,
      explodeLabel: this.explodeLabel.text,
      inspectLabel: this.inspectLabel.text,
      sideLabel: this.sideLabel.text,
      confirmLabel: this.confirmLabel.text,
    }
  }

  private showCannotStart(error: unknown) {
    const detail = error instanceof Error ? error.message : String(error)
    print(`ECHOES GUIDE cannot-start: ${detail}`)
    try {
      const panel = this.child(this.sceneObject, "Guide cannot start", new vec3(0, 6, 0))
      panel.createComponent("Component.Canvas")
      const plate = this.child(panel, "Error plate").createComponent(BackPlate.getTypeName()) as BackPlate
      plate.size = new vec2(30, 9)
      this.text(panel, "Error message", "Cannot start 40897 guide: source or mesh invalid. Check Lens logs.",
        new vec3(0, 0, 0.3), 48, [-14, 14, -3.5, 3.5])
    } catch (panelError) {
      print(`ECHOES GUIDE cannot-display-error: ${String(panelError)}`)
    }
  }

  private child(parent: SceneObject, name: string, pos?: vec3): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    if (pos) so.getTransform().setLocalPosition(pos)
    return so
  }

  private material(color: vec4, ghost: boolean = false): Material {
    const m = (ghost ? GHOST_MAT : PIECE_MAT).clone()
    m.mainPass.baseColor = color
    return m
  }

  private pieceColor(key: string): vec4 {
    const name = this.state.pieces[key].color
    if (name === "dark-bluish-gray") return new vec4(0.32, 0.38, 0.44, 1)
    if (name === "red") return new vec4(0.92, 0.16, 0.18, 1)
    if (name === "bright-purple") return new vec4(0.92, 0.31, 0.66, 1)
    return new vec4(0.72, 0.77, 0.8, 1)
  }

  private visual(parent: SceneObject, mesh: RenderMesh, mat: Material): RenderMeshVisual {
    const view = parent.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    view.mesh = mesh
    view.mainMaterial = mat
    return view
  }

  private addPart(key: string, incoming: boolean, step: {connections: {incomingKey: string}[]}) {
    const part = this.state.pieces[key]
    const mesh = buildGuidePartMesh(part)
    const solid = this.child(this.modelPivot, `Part ${key}`)
    this.visual(solid, mesh, this.material(this.pieceColor(key)))
    let ghost: SceneObject | null = null
    let cue: SceneObject | null = null
    if (incoming) {
      ghost = this.child(this.modelPivot, `Final pose ghost ${key}`)
      this.visual(ghost, mesh, this.material(new vec4(0.44, 0.93, 1, 0.5), true))
      cue = this.addAxisCue(key, step)
    }
    this.parts[key] = {solid, ghost, cue, vertices: guidePartVertices(part)}
  }

  /** Thin bar along the authored insertion path, from the separated pose to the seat. */
  private addAxisCue(key: string, step: {connections: {incomingKey: string}[]}): SceneObject {
    const connection = (step.connections as any[]).find((c) => c.incomingKey === key)
    const axis: number[] = connection.insertionAxis
    const focal: number[] = connection.focalPointLdu
    const length = -(axis[0] * this.state.pieces[key].explodeLdu[0] + axis[1] * this.state.pieces[key].explodeLdu[1] +
      axis[2] * this.state.pieces[key].explodeLdu[2])
    const start = focal.map((v) => v * LDU_CM)
    const end = focal.map((v, i) => (v - axis[i] * length) * LDU_CM)
    const lengthCm = length * LDU_CM
    const width = 0.045
    const mesh = Math.abs(axis[0]) === 1 ? boxMesh(lengthCm, width, width)
      : Math.abs(axis[1]) === 1 ? boxMesh(width, lengthCm, width) : boxMesh(width, width, lengthCm)
    // boxMesh is centred in x and z and rests on y=0; offset so the bar spans start..end.
    const midX = (start[0] + end[0]) / 2
    const midZ = (start[2] + end[2]) / 2
    const position = Math.abs(axis[1]) === 1
      ? new vec3(start[0], Math.min(start[1], end[1]), start[2])
      : new vec3(midX, start[1] - width / 2, midZ)
    const cue = this.child(this.modelPivot, `Insertion path ${key}`, position)
    this.visual(cue, mesh, this.material(new vec4(0.42, 0.92, 1, 0.75), true))
    return cue
  }

  private text(parent: SceneObject, name: string, value: string, pos: vec3,
               size: number, bounds: [number, number, number, number]): Text {
    const so = this.child(parent, name, pos)
    const t = so.createComponent("Component.Text") as Text
    t.text = value
    t.size = size
    t.depthTest = true
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Wrap
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(bounds[0], bounds[1], bounds[2], bounds[3])
    t.textFill.color = new vec4(0.95, 0.98, 1, 1)
    return t
  }

  private button(parent: SceneObject, name: string, label: string, x: number, y: number,
                 action: () => void): Text {
    const so = this.child(parent, name, new vec3(x, y, 0))
    const button = so.createComponent(Button.getTypeName()) as Button
    button.size = new vec3(7, 4.3, 1)
    const text = this.text(so, "Label", label, new vec3(0, 0, 0.3), 40, [-3.3, 3.3, -1.8, 1.8])
    button.onTriggerUp.add(() => {
      action()
      this.refresh()
    })
    return text
  }

  private buildControls() {
    // Everything readable lives in the heading plate, above the model window.
    const heading = this.child(this.guideRoot, "Guide heading", new vec3(0, 27.5, 0))
    heading.createComponent("Component.Canvas")
    const plate = this.child(heading, "Heading plate").createComponent(BackPlate.getTypeName()) as BackPlate
    plate.size = new vec2(35, 15)
    this.title = this.text(heading, "Section title", "", new vec3(0, 5.7, 0.3), 49, [-16.5, 16.5, -1.0, 1.0])
    this.status = this.text(heading, "Step instruction", "", new vec3(0, 2.7, 0.3), 40, [-16.5, 16.5, -1.6, 1.6])
    this.detail = this.text(heading, "Input hint", "", new vec3(0, -0.5, 0.3), 35, [-16.5, 16.5, -1.0, 1.0])
    this.confirmLine = this.text(heading, "Confirmation", "", new vec3(0, -3.0, 0.3), 35, [-16.5, 16.5, -1.0, 1.0])
    this.text(heading, "Preview disclosure",
      "Desktop mouse • enlarged guide • Echoes can't see your bricks", new vec3(0, -5.6, 0.3), 30,
      [-16.5, 16.5, -0.8, 0.8])

    const controls = this.child(this.guideRoot, "Guide control rail", new vec3(0, 0, 0))
    controls.createComponent("Component.Canvas")
    this.button(controls, "Turn", "Turn 45°", -20.5, 10, () => this.state.orbit(45, 0))
    this.sideLabel = this.button(controls, "Underside", "Underside", -20.5, 4.8, () => this.state.toggleUnderside())
    this.button(controls, "Home", "Home view", -20.5, -0.4, () => this.state.home())
    this.button(controls, "Zoom in", "Zoom +", -20.5, -5.6, () => this.state.changeZoom(ZOOM_STEP))
    this.button(controls, "Zoom out", "Zoom −", -20.5, -10.8, () => this.state.changeZoom(-ZOOM_STEP))
    this.explodeLabel = this.button(controls, "Explode", "Reassemble", 20.5, 10, () => this.state.toggleExplode())
    this.inspectLabel = this.button(controls, "Inspect", "Inspect joint", 20.5, 4.8, () => this.state.toggleInspect())
    this.button(controls, "Back", "Back", 20.5, -0.4, () => this.changeStep(() => this.state.back()))
    this.confirmLabel = this.button(controls, "Placed", "I placed it", 20.5, -5.6, () => this.changeStep(() => this.state.confirmStep()))
    this.button(controls, "Restart", "Restart", 20.5, -10.8, () => this.changeStep(() => this.state.restart()))
  }

  private changeStep(action: () => void) {
    const before = this.state.stepNumber
    action()
    this.applyStep()
    print(`ECHOES GUIDE step ${before}->${this.state.stepNumber} confirmed=[${this.state.confirmed.join(",")}] finished=${this.state.finished}`)
  }

  /** Show this step's pieces and frame them. The framing uses the separated pose, so
   * Explode/Reassemble and orbiting never move or rescale the model. */
  private applyStep() {
    const visible = this.state.visibleKeys
    for (const key of Object.keys(this.parts)) {
      this.parts[key].solid.enabled = visible.includes(key)
    }
    let min = [Infinity, Infinity, Infinity]
    let max = [-Infinity, -Infinity, -Infinity]
    const points: number[] = []
    for (const key of visible) {
      const p = this.state.position(key, true).map((v) => v * LDU_CM)
      const v = this.parts[key].vertices
      for (let i = 0; i < v.length; i += 3) {
        const x = p[0] + v[i], y = p[1] + v[i + 1], z = p[2] + v[i + 2]
        points.push(x, y, z)
        min = [Math.min(min[0], x), Math.min(min[1], y), Math.min(min[2], z)]
        max = [Math.max(max[0], x), Math.max(max[1], y), Math.max(max[2], z)]
      }
    }
    const c = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
    let r2 = 0
    for (let i = 0; i < points.length; i += 3) {
      const dx = points[i] - c[0], dy = points[i + 1] - c[1], dz = points[i + 2] - c[2]
      r2 = Math.max(r2, dx * dx + dy * dy + dz * dz)
    }
    this.framingCenter = new vec3(c[0], c[1], c[2])
    this.framingRadius = Math.sqrt(r2)
    this.fitScale = WINDOW_RADIUS_CM / (this.framingRadius * ZOOM_MAX)
    this.refresh()
  }

  private applyOrbit() {
    const yaw = quat.angleAxis(this.state.yawDegrees * DEG, vec3.up())
    const pitch = quat.angleAxis(this.state.pitchDegrees * DEG, vec3.right())
    // In the runtime's quaternion product, rightmost rotation applies first:
    // yaw aligns the authored eye's X component, then pitch levels its Y.
    this.turntable.getTransform().setLocalRotation(pitch.multiply(yaw))
    const s = this.fitScale * this.state.zoom
    this.turntable.getTransform().setLocalScale(new vec3(s, s, s))
  }

  private refresh() {
    const c = this.framingCenter
    this.modelPivot.getTransform().setLocalPosition(new vec3(-c.x, -c.y, -c.z))
    const active = this.state.activeKeys
    for (const key of this.state.visibleKeys) {
      const view = this.parts[key]
      const actual = this.state.position(key).map((v) => v * LDU_CM)
      view.solid.getTransform().setLocalPosition(new vec3(actual[0], actual[1], actual[2]))
    }
    for (const key of Object.keys(this.parts)) {
      const view = this.parts[key]
      if (!view.ghost) continue
      const isActive = active.includes(key)
      if (isActive) {
        const finalPose = this.state.position(key, false).map((v) => v * LDU_CM)
        view.ghost.getTransform().setLocalPosition(new vec3(finalPose[0], finalPose[1], finalPose[2]))
      }
      // While inspecting, only the joint being inspected keeps its ghost and path.
      const shown = isActive && this.state.exploded && (!this.state.inspecting || key === this.state.focusKey)
      view.ghost.enabled = shown
      view.cue.enabled = shown
    }
    this.applyOrbit()

    const step = this.state.heroStep
    const n = this.state.stepNumber
    this.title.text = `40897 • lower assembly • step ${n} / ${this.state.lastStep}`
    this.status.text = this.state.finished ? "Lower assembly complete: all seven steps shown assembled." : step.instruction
    const connection = this.state.connection()
    const joints = this.state.activeKeys.length
    const jointTag = joints > 1 ? ` (joint ${this.state.inspectIndex + 1} of ${joints})` : ""
    this.detail.text = this.state.inspecting
      ? `Inspect${jointTag}: ${connection.matingFeature}.`
      : this.state.exploded
        ? "Explode shows where each piece goes in • drag to orbit"
        : "Assembled view • Explode to see the joint again"
    if (this.state.finished) {
      this.confirmLine.text = "You marked all 7 steps placed • Back reviews, Restart clears"
    } else if (this.state.isConfirmed()) {
      this.confirmLine.text = `You already marked step ${n} placed • I placed it moves on`
    } else {
      this.confirmLine.text = `Done on your bricks? Press I placed it • ${this.state.confirmed.length} of ${this.state.lastStep} marked by you`
    }
    this.explodeLabel.text = this.state.exploded ? "Reassemble" : "Explode"
    this.inspectLabel.text = !this.state.inspecting ? "Inspect joint" : this.state.hasNextJoint ? "Next joint" : "Return"
    this.sideLabel.text = this.state.homePitch() > 0 ? "Underside" : "Top side"
    this.confirmLabel.text = this.state.finished ? "All marked" : "I placed it"
    print(`ECHOES GUIDE view step=${n} exploded=${this.state.exploded} inspect=${this.state.inspecting} yaw=${this.state.yawDegrees.toFixed(1)} pitch=${this.state.pitchDegrees.toFixed(1)} zoom=${this.state.zoom.toFixed(2)} fit=${this.fitScale.toFixed(3)} radius=${this.framingRadius.toFixed(2)}`)
  }
}
