// Placement validation for Echoes. Pure functions over authored task data.
//
// Correction priority (approved default): target → piece → orientation.
// Every correction names the actual mismatch and the required alternative in
// words, so it never depends on color.

import {normalizeRotation, PieceDef, TargetDef, TaskDef} from "./SignalArchTask"

export type Mismatch = "none" | "incomplete" | "target" | "piece" | "orientation" | "finished"

export interface Attempt {
  pieceId: string | null
  rotation: number
  targetId: string | null
}

export interface Verdict {
  accepted: boolean
  mismatch: Mismatch
  /** Every attribute that differs, in priority order (for logs/tests). */
  differing: Mismatch[]
  message: string
}

function pieceById(task: TaskDef, id: string | null): PieceDef | null {
  if (!id) return null
  for (const p of task.pieces) if (p.id === id) return p
  return null
}

function targetById(task: TaskDef, id: string | null): TargetDef | null {
  if (!id) return null
  for (const t of task.targets) if (t.id === id) return t
  return null
}

function capitalize(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/**
 * Judge one confirmation at the given step index (0-based).
 * Does not mutate anything; the caller decides what to do with the verdict.
 */
export function evaluateAttempt(task: TaskDef, stepIndex: number, attempt: Attempt): Verdict {
  if (stepIndex >= task.placements.length) {
    return {accepted: false, mismatch: "finished", differing: ["finished"], message: "All placements are done."}
  }
  const step = task.placements[stepIndex]
  const wantPiece = pieceById(task, step.pieceId)
  const wantTarget = targetById(task, step.targetId)

  if (!attempt.pieceId) {
    return {
      accepted: false,
      mismatch: "incomplete",
      differing: ["incomplete"],
      message: `Pick a piece first: choose the ${wantPiece ? wantPiece.noun : step.pieceId}.`,
    }
  }
  if (!attempt.targetId) {
    return {
      accepted: false,
      mismatch: "incomplete",
      differing: ["incomplete"],
      message: `Pick an attachment first: use ${wantTarget ? wantTarget.phrase : step.targetId}.`,
    }
  }

  const rotation = normalizeRotation(attempt.rotation)
  const differing: Mismatch[] = []
  if (attempt.targetId !== step.targetId) differing.push("target")
  if (attempt.pieceId !== step.pieceId) differing.push("piece")
  // Orientation is only meaningful for the required piece; a different piece
  // has its own (irrelevant) orientation, so it is reported as a piece error.
  if (attempt.pieceId === step.pieceId && step.validRotations.indexOf(rotation) < 0) {
    differing.push("orientation")
  }

  if (differing.length === 0) {
    return {accepted: true, mismatch: "none", differing, message: "Placed."}
  }

  const first = differing[0]
  let message = ""
  if (first === "target") {
    const chosen = targetById(task, attempt.targetId)
    message =
      `Not yet: that is ${chosen ? chosen.phrase : attempt.targetId}. ` +
      `Use ${wantTarget ? wantTarget.phrase : step.targetId} first.`
  } else if (first === "piece") {
    const chosen = pieceById(task, attempt.pieceId)
    message =
      `Not this piece: that is the ${chosen ? chosen.noun : attempt.pieceId}. ` +
      `Choose the ${wantPiece ? wantPiece.noun : step.pieceId}.`
  } else {
    const noun = wantPiece ? wantPiece.noun : step.pieceId
    message = `Wrong turn: at ${rotation}° the ${noun} ${step.describeRotation(rotation)}. ${step.orientationHint}`
  }
  return {accepted: false, mismatch: first, differing, message: capitalize(message)}
}
