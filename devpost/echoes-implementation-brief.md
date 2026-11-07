# Echoes implementation brief for Claude Opus 5.5

> **HISTORICAL — SUPERSEDED.** This museum mystery concept was superseded on 2026-11-04 by the approved brick-building proof in `devpost/design-brief.md`, tested by `devpost/echoes-acceptance-matrix.md`. Do not implement from this document. It is retained for history only.

Prepared November 2, 2026. **Codex and Claude Opus 5.5 aligned after four review rounds.** Ready for the setup and greybox gates; implementation and official plan-lens approval remain pending.

## Outcome and constraints

Build **Echoes: The Last Memory**, a short, accessible spatial mystery for Learn AR with SPECS. A player investigates a frozen memory of an empty museum display, changes viewpoint to identify the missing artifact inside a conservation case, then combines this with a dry footprint on a wet display to infer when it was removed. Physical perspective changes what the player can establish.

Matthew confirmed: prioritize a polished November 9 hackathon submission; budget 30 working hours; no SPECS glasses; desktop Preview only; curator/artifact setting with no horror. Lens Studio and CLAD readiness are unknown. Assume a solo builder and a general teen/adult audience. Target a complete 2–4 minute first play, with no minimum duration or padding.

This is a preparatory implementation specification. It is not a Lens Studio project, a completed official plan-lens workflow, user approval of every design detail, or evidence of successful playtests. Implementation starts with the setup gate below. No external publication, purchase, or submission is authorized by this planning request.

## Product and story

**Player role:** investigate the gallery's last recorded memory for the curator. Do not introduce a missing-person subplot that this small case cannot resolve.

**Opening:** “The display is empty. Look through the gallery's last memory. Find the artifact before deciding what happened.”

The scene is a stylized memory reconstructed at physical scale within a compact virtual exhibit. It contains an empty plinth/display with a wet surface surrounding a dry footprint matching the artifact's base, a frozen leak entering that display, a bright filled virtual divider, and an open padded conservation case partly obscured from the starting view. A distinctive edge of the artifact or case remains visible as an invitation to investigate. A short sideways movement exposes the artifact inside the case. A B marker is optional identification, not essential evidence.

**Direct observations:** the matching artifact is inside the padded case; water has reached the empty display around a matching dry footprint. These facts support the account that the artifact sheltered that area before being removed. They do not prove actor identity, intent, innocence or exact timing.

**Final question:** “Which account best fits these clues?” Choices: “Removed before the leak began” and “Removed after water reached the display.” Prefer the second as the best-supported inference within this small authored case. The dry footprint admits alternative explanations; do not present this as deductive certainty. Never say an intact lock rules out theft, a label proves honesty, or that the artifact must have been moved while the leak was still ongoing.

The six-second ending resumes a few existing drop animations away from the dry patch, changes the vase from its cool memory tint to a warm color, and acknowledges the conclusion. Caption: “The clues suggest it was moved after water reached the display. The artifact is intact in the case.” Replay follows. Do not animate water flowing across a still-dry footprint. Do not introduce evidence needed to answer the preceding question; label the animation as a stylized memory acknowledgment, not a verified reconstruction of the past.

## Essential play loop

1. **Start:** place the experience once relative to the initial camera using the template's coordinate convention; show one brief instruction. Keep the experience fixed in world space afterward.
2. **Investigate:** inspect the matching dry footprint and the artifact-in-case relationship using standard SIK pinch/selection. Either observation may be registered first. The frozen drops provide context without becoming a third required interaction. Exploration stays available throughout.
3. **Change viewpoint:** move sideways to resolve the partial shape into the intact artifact inside case B. Continuous parallax provides the reveal. The camera position may enable an observation acknowledgement, but never creates the evidence.
4. **Conclude:** present the two timing accounts above. Unsupported selection gives a specific non-punitive correction and permits immediate retry: “The dry shape matches the vase's base. Which account better explains that patch?”
5. **Resolve and replay:** a short highlight/annotation using existing geometry, conclusion text, and a dependable Replay control.

A help control is always available during play. Use state-aware hints: for the footprint, “Compare the dry shape with the vase's base”; for the case, “The first view is incomplete,” then “Look around the side of the display,” then “Inspect the whole vase inside the padded case.” Do not auto-complete observations. A gentle help affordance may appear after inactivity; no countdown, score, failure timer, or forced interruption.

## Scope

**P0:** one authored scene; one fixed experience root; two observation targets; meaningful parallax; conclusion and correction; ending; captions/text for essential information; hints; replay; tests and a real Preview walkthrough; submission materials.

**P1 only after P0 passes and the four-hour presentation reserve remains intact:** quiet ambient audio, small inspection animation, improved original materials. Add no mechanic just to display technical complexity.

**Excluded:** fragment inventory, freeform assembly, physics puzzles, animated human characters, generated narrative at runtime, Claude/API calls during gameplay, backend, login, payments, GPS, multiplayer, persistent anchors, arbitrary-room recognition, historic-building registration, custom gestures, and a citywide route. The long-term self-guided event engine is outside this submission.

## Scene and visual contract

Proposed hierarchy; these are project object names, not claimed SDK APIs:

```text
ExperienceRoot
  ExhibitBase
  EmptyDisplay
    WetSurface
    DryFootprint
  LeakTrace
  DividerPanel
  ConservationCaseB
    Artifact
    Padding
    CaseMarker
  ObservationTargets
  ConclusionTargets
  Guidance
  EndingFeedback
```

Use a small original low-poly vase with a distinctive asymmetrical handle or rim and a recognizable base footprint. Match identity through shape and color, never color alone. Use bright filled flat-shaded surfaces with emissive edges and sufficient depth separation. Black is transparent in the simulated additive display. Test virtual-to-virtual depth ordering immediately; outlines alone may expose hidden evidence through the divider. A bright virtual panel can depth-occlude other virtual objects; it does not physically block the real world. No real-room occlusion claims.

Evidence transforms, visibility, and materials stay constant while the player moves during investigation. Render inspection highlights on separate overlays. Avoid billboarding geometry, moving shards into alignment, fading evidence in at a hotspot, or putting the answer in a newly spawned panel. Labels may face the camera if they do not reveal unobserved facts.

Starting design targets, to tune in Preview: approximately 0.4–0.6 m lateral movement; no crouching; no backward movement required; primary content within a comfortable forward viewing area. These are desktop composition targets, not verified ergonomic limits. Unit conversion must follow the installed Lens project; do not assume engine units equal meters.

## Architecture and interfaces

Keep implementation small: one controller/store, scene binding, observation evaluator, and UI presenter. TypeScript is preferred when supported by the installed project. Use the SPECS Base Template and installed SIK/UI Kit components. Resolve current imports, events, and camera APIs from package examples and MCP documentation before coding; never invent an API because a name appears plausible.

Suggested responsibilities:

| Module | Responsibility |
|---|---|
| ExperienceController | Own state, legal transitions, observation IDs, retry, replay, hint level |
| SceneBindings | Cache named scene objects, establish the root, restore authored baseline |
| ObservationEvaluator | Pure geometry/pose predicates; no rendering mutations |
| InteractionAdapter | Translate standard SIK actions into domain events |
| Presentation | Render prompts and feedback from state; never own progression |

Keep configuration separate from logic: root placement, observation positions, visibility sample points, look-angle allowance, highlight duration, and copy. Do not build a content-authoring platform.

```text
READY --Start--> INVESTIGATE
INVESTIGATE --both observations acknowledged--> CONCLUDE
CONCLUDE --unsupported choice--> CORRECTION --Continue--> CONCLUDE
CONCLUDE --supported choice--> RESOLVED
RESOLVED --ending finished--> COMPLETE
Any playable state --Replay--> READY
```

State contains a set of observation IDs, hint level, ending status and current stage. Duplicate events are idempotent. Out-of-state events do nothing. Observe footprint and case in either order; do not require leaving and re-entering a viewpoint merely because another clue was registered later. Both explanation targets remain hidden or inactive until both observations are registered. A separate session-level placed flag and stored root transform survive Replay. Start establishes the root only on the first run; later replays never recapture camera pose for placement.

Replay cancels pending feedback and animation, clears observation/hint state, and restores original transforms/materials/controls without relocating the experience. Restarting Preview establishes fresh placement. If replay leaves the camera at the revealing side, direct the player back to the authored front view; do not teleport the user camera or reorient the root silently.

## Perspective acknowledgement

Prefer **explicit pinch on the revealed artifact/case** over gaze-only auto-completion. A permissive pose guard can prevent acknowledgement through the plinth, but it must match actual visibility, not enforce a theatrical walk to a secret exact point.

The evaluator works in root-local coordinates, with the camera pose transformed using the root inverse. Initial pose must fail the case observation guard while leaving the footprint visible and selectable. A genuinely unobstructed side view should pass. Both observation targets must reject selection through obstructing virtual geometry; the footprint must also be visible before it can register. Use current camera forward direction, not eye-tracking claims. Keep logic independent of UI and rendering.

There is no mandatory gaze dwell. Standard pinch is the deliberate acknowledgement. Do not enforce a large start-exclusion radius that also excludes the intended short sidestep. Treat numeric tolerances as configuration awaiting composition tests.

Do not build a general image-visibility engine. Use a small authored guard: segments from the camera to three named identity points near the vase's rim, distinctive handle and body, checked against the root-local divider and case-wall bounds; also check that the relevant points are in view. Locate endpoints just outward from the vase toward the case opening to avoid self-intersection; tune the offsets to the mesh. This is a project-owned geometry function, not an assumed Lens API. Calibrate which points must pass using actual front/side screenshots; an arbitrary point-count threshold does not prove legibility. Record the chosen rule and passing/failing pose captures in the repository and freeze them by November 7. The greybox must prove that a click-through from the front fails and that several visibly clear side poses succeed. Use opaque/depth-writing settings for the virtual divider, verified in the installed renderer.

## Thirty-hour execution budget

| Phase | Hours | Completion gate |
|---|---:|---|
| Toolchain and official planning | 3 | Project opens, MCP connects, CLAD makes a visible change, SIK action works; run official planning workflow |
| Perspective greybox | 4 | Static geometry and footprint/base match read clearly; human comprehension check passes |
| Complete playable loop | 8 | Two observations, conclusion/retry, ending, hint, replay |
| Clarity and visual polish | 4 | Readable cues, coherent staging, captions, clean transitions |
| Tests and fresh-viewer checks | 4 | Automated logic/integration evidence and real walkthroughs |
| Video and submission package | 4 | Actual Preview capture, repository package, written submission draft |
| Contingency | 3 | Setup repair or defects, not extra features |
| **Total** | **30** | |

Target checkpoints: November 2 setup; November 3 geometry; November 4–5 complete loop; November 6 testing; November 7 feature freeze; November 8 recording/package; November 9 noon Central target submission, ahead of the 4 PM deadline. Rearrange work sessions to fit availability while preserving gates and presentation time.

At hour 3, unresolved core setup consumes at most the three-hour contingency; report the exact blocker rather than continuing speculative content work. Test LEAF early, but distinguish a LEAF integration failure from a core CLAD/Preview failure. Formal toolchain requirements cannot be replaced with an unrelated web demo.

At hour 7, simplify the reveal to one clear artifact/case relationship around a fixed virtual divider if the richer composition fails. Preserve real parallax; do not rescue it with camera-triggered object spawning. If even the simple version fails, return for a scope decision with recorded evidence.

## Setup and official planning handoff

1. Inventory Lens Studio, Node/Git, Claude Code and project prerequisites; do not assume the installed version or authentication works.
2. Follow official Snap setup for a SPECS Base Template. Open Lens Studio and start Claude inside the project folder; connect the correct project's Lens Studio MCP and CLAD.
3. Prove one CLAD scene change and standard SIK selection in Preview. Record tool versions and concise evidence.
4. Install/load the official Devpost Learn skill pack and run plan-lens from the valid project. Supply this brief and Matthew's confirmed answers. Let it ask any remaining consequential learner questions and obtain its required sign-off. Do not fabricate generated planning documents or label this draft approved.
5. Preserve actual generated documents in devpost/. Build from the approved brief through CLAD, with checkpoints after each P0 increment.

Current Devpost guidance identifies Lens Studio 5.23.2 as a fallback for 5.24 authentication trouble. It is not a blanket instruction to downgrade a working installation.

## Acceptance tests and evidence

All criteria below are planned tests, not completed results.

| Area | Pass condition |
|---|---|
| Scene stability | Camera movement during investigation does not change evidence transforms, visibility flags or materials |
| Front view | The partial cue invites exploration; artifact-in-case relationship is not yet unambiguous |
| Footprint clarity | Wet region and dry footprint are distinguishable without black-dependent contrast; footprint visibly matches the vase base, not merely the rim or handle |
| Side view | Matching artifact and padding are readable through physical camera translation |
| Rotation-only negative | Looking around from the original camera position does not produce the same reveal |
| Guard boundaries | Front/occluded/out-of-scene actions fail; several clear side poses succeed without pixel-perfect alignment |
| Observation order | Footprint-first and case-first both reach conclusion; one observation alone cannot unlock choices; repeated selections do not duplicate progress |
| Root transform | Translating/rotating the root preserves local observation behavior |
| Recovery | Wrong answer explains evidence and permits retry; hint never increments observations |
| Reset | Replay works from investigation, correction, ending and completion; old timers cannot change the new run |
| Repeatability | Two complete Preview runs succeed after resetting; no debug shortcuts required |
| Runtime independence | Full gameplay completes without product network/API calls and without script errors; editor tooling may still require its own connection |
| Comprehension | At least two of three fresh viewers explain what became clear and what remains unknown after a short unnarrated capture |
| Submission truth | Video shows actual working Preview; no mocked interface is represented as Lens footage |

Use pure tests for reducer and evaluator edge cases. Use LEAF for supported SIK interactions/state assertions, with awaited actions and the required scene indexing setup. Verify camera-control support in the installed tooling; if pose injection tests the evaluator, label it a unit-level check. It does not establish navigability. Always include a real keyboard/mouse Preview walkthrough.

If three viewers are unavailable, record the actual smaller sample and its limitation. Never count the two planning agents as independent human playtesters. Desktop results do not establish headset comfort, tracking reliability or performance on glasses.

## Demonstration and packaging

Aim for a 2:30–2:45 public video, safely below three minutes. Suggested sequence: first 10 seconds show the spatial moment; next 20 introduce the player question; next 65 show the real investigation and viewpoint change; next 25 show conclusion/ending/replay; next 25 explain design and CLAD workflow; final 15 state what works and the desktop-only limitation. Cut the introduction before cutting evidence of functionality.

Package the Lens Studio project, actual devpost planning outputs, setup/run instructions, asset attribution/license records, validation record and known limitations. Use original primitive assets or clearly licensed assets. Remove credentials, local API history and unrelated workspace files before any public repository is created. Obtain authorization for public repository/video publication and the final submission.

## Claude model and API guidance

Use the exact requested model, **claude-opus-5-5**, for planning/implementation; do not silently substitute a different model. Anthropic documents adaptive thinking as always enabled for this model. Use effort to control depth and avoid forced tool selection. For a direct Messages API planning conversation, preserve returned content blocks and the preceding system/tools/messages unchanged when extending the conversation. Read stop_reason and handle incomplete responses explicitly. Keep credentials in the environment, never the Lens or repository.

For implementation, prefer Claude Code's existing CLAD/MCP integration over building a new Messages API orchestrator. The API is a development option, not a product feature. This planning consultation used the authenticated Claude web app after the configured direct API credential was rejected. API connectivity is not established by the successful web conversation.

## Sources and review record

- [Competition overview](https://learn-specs.devpost.com/) and [formal rules](https://learn-specs.devpost.com/rules): deadline, required tooling, judging and submission requirements. Include planning docs to reconcile their differing optional/required wording.
- [Official planning pack](https://github.com/challengepost/learn-specs), [plan-lens instructions](https://raw.githubusercontent.com/challengepost/learn-specs/main/skills/plan-lens/SKILL.md), [Preview limits](https://raw.githubusercontent.com/challengepost/learn-specs/main/skills/plan-lens/references/preview-limits.md).
- [Snap Claude Code setup](https://developers.specs.com/docs/clad/setup/setup-ai/claude-code-setup), [Lens Studio setup](https://developers.specs.com/docs/clad/setup/setup-lens-studio), [LEAF testing](https://developers.specs.com/docs/clad/tools/test-your-lens-with-leaf).
- [SIK manipulation reference](https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Components_Interaction_InteractableManipulation_InteractableManipulation.html): optional manipulation only; verify installed version.
- [Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview), [Messages API](https://platform.claude.com/docs/en/api/http/messages/create), [preserved thinking](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking), [programmatic Claude Code](https://code.claude.com/docs/en/headless).
- Actual Claude planning conversation [private Claude conversation link removed, 2026-11-04]: four completed review rounds; Claude explicitly agreed subject to the setup and greybox gates. See review-decisions.txt for the resolved disagreements. Earlier proposals in the conversation are superseded by this brief.

