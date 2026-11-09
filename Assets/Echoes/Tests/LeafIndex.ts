// LEAF scenario index for Echoes (Increment 3): one or more scenarios per
// done criterion in devpost/design-brief.md. Run from the LEAF panel or the
// Lens Studio MCP run_leaf_scenario tool, one at a time.
import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {Dc1PlaceNextPiece} from "./Dc1PlaceNextPiece"
import {Dc2RecoverFromMistake} from "./Dc2RecoverFromMistake"
import {Dc2RotationSets} from "./Dc2RotationSets"
import {Dc3InterruptAndReturn} from "./Dc3InterruptAndReturn"
import {Dc4ReplayCleanly} from "./Dc4ReplayCleanly"
import {Dc4UndoLatest} from "./Dc4UndoLatest"
import {Dc5FullStory} from "./Dc5FullStory"
import {Dc5SequenceGuards} from "./Dc5SequenceGuards"
import {Dg1GuideHeroControls} from "./Dg1GuideHeroControls"
import {Dg2GuideStepFlow} from "./Dg2GuideStepFlow"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "dc1-place-next-piece", typename: Dc1PlaceNextPiece.getTypeName()},
    {id: "dc2-recover-from-mistake", typename: Dc2RecoverFromMistake.getTypeName()},
    {id: "dc2-rotation-sets", typename: Dc2RotationSets.getTypeName()},
    {id: "dc3-interrupt-and-return", typename: Dc3InterruptAndReturn.getTypeName()},
    {id: "dc4-undo-latest", typename: Dc4UndoLatest.getTypeName()},
    {id: "dc4-replay-cleanly", typename: Dc4ReplayCleanly.getTypeName()},
    {id: "dc5-sequence-guards", typename: Dc5SequenceGuards.getTypeName()},
    {id: "dc5-full-story", typename: Dc5FullStory.getTypeName()},
    {id: "dg1-guide-hero-controls", typename: Dg1GuideHeroControls.getTypeName()},
    {id: "dg2-guide-step-flow", typename: Dg2GuideStepFlow.getTypeName()},
  ]
}
