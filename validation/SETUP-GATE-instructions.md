# Echoes setup gate: instructions for the Claude Code session on AlienPC

You run inside the Lens Studio project folder on AlienPC (Windows 11, cmd or PowerShell, no Linux commands). You have no memory of the planning sessions. This file and `C:\Users\matth\echoes-handoff\implementation-brief.md` are your context. Read that brief completely before acting.

## Authority

Matthew authorized the setup gate on AlienPC on 2026-11-02. That covers this file only.

Not authorized: pushing to any remote, creating a public repository, publishing a video, registering on or submitting to Devpost, purchases, or changes outside this project folder. Do not start the greybox until Matthew says so after reading the gate report.

## Model

Use `claude-opus-5-5`. Check with `/status` or by asking Matthew to read the model line. If the session is on another model, stop and say so. Do not substitute silently.

## Confirmed by Matthew

Polished November 9, 2026 Devpost Learn AR with SPECS entry. 30 working hours. Windows desktop Preview. No glasses. Accessible museum mystery, no horror. Lens Studio and CLAD readiness was unknown at planning time.

Everything else in the implementation brief came from a Codex and Claude design review. Treat it as a proposal Matthew has not individually confirmed. Model agreement is design review, not approval.

## Budget

At most three working hours, with up to three contingency hours for setup repair only. At the limit, report the exact blocker and stop. Do not continue speculative content work. A LEAF failure is separate from a core CLAD or Preview failure: record it and continue.

## Already established from ProBook on 2026-11-02

- Lens Studio was not installed on AlienPC before this gate. Current release per Snap: 5.24.1. Snap requires 5.22 or later. Use 5.23.2 only if 5.24 authentication fails.
- Claude Code on AlienPC was updated from 2.1.207 to 2.1.316. It reported `loggedIn: false` over SSH until Matthew logs in.
- Hackathon deadline: 2026-11-09 22:00 UTC (4 PM Central).
- Official skill pack: `https://github.com/challengepost/learn-specs`. Official plugin: `ls-clad@ls-extensions`.

Re-verify anything you rely on. These are prior-session claims.

## Steps

Stop at the first failure you cannot fix inside the project folder, and report the exact error.

1. **Inventory.** Record Lens Studio, Node, Git and Claude Code versions, the OS, and the model. Confirm the `.esproj` and `.mcp.json` are in the current folder. Confirm `lens-studio` MCP tools are callable and CLAD skills or agents are visible. Call a read-only MCP tool to confirm you reach this project, not another window.
2. **Baseline.** Run `git init` in this folder if needed, add a `.gitignore` suited to Lens Studio caches, and commit the untouched template as `chore: add SPECS Base Template baseline`. Local commits only. Never add a remote.
3. **CLAD scene proof.** Through CLAD and the Lens Studio MCP, add one visible primitive named `SetupProof` in front of the start camera. Confirm it in the scene hierarchy and in a Preview capture if the tools allow one.
4. **SIK proof.** Make `SetupProof` a standard SIK interactable whose pinch changes something visible. Find imports and events in the installed package examples and MCP documentation. Never invent an API because a name looks plausible. Ask Matthew to click it in Preview with the mouse and tell you what he saw. His observation is the evidence. Do not claim it yourself.
5. **LEAF attempt.** Attempt one LEAF test that presses the `SetupProof` interactable and asserts the state change. Record pass, fail or unsupported, with the exact output.
6. **Remove the proof.** Delete `SetupProof` and its script from the scene and project, confirm the hierarchy is back to baseline, and keep the proof's evidence only in the record.
7. **Gate record.** Write `validation/setup-gate.md` with versions, each proof's outcome (built, tested, inferred or unverified, using those words), exact errors, and time spent. Copy `C:\Users\matth\echoes-handoff\implementation-brief.md` to `devpost/echoes-implementation-brief.md`, and this file to `validation/SETUP-GATE.md`. Commit locally.
8. **Report to Matthew**, then ask him to run `plan-lens` in a cleared chat. Do not fabricate its outputs.

## plan-lens rules

The official skill governs. It is learner-led and asks open-ended questions one at a time. It writes `devpost/design-brief.md`, and only Matthew's clear "looks good" sets `status: approved`.

Give it the implementation brief and the confirmed constraints above. Use those answers rather than repeating them. Where the brief supplies a decision Matthew has not confirmed (spatial moment, placement, hand interaction, timing, done criteria), the skill still asks him. Do not answer for him and do not write the design brief by hand.

## After approval

The official build prompt reads only `devpost/design-brief.md`. The bounded order requires a greybox first, so when Matthew authorizes it, in a cleared chat, he pastes:

> Read devpost/design-brief.md and build it for SPECS. Also read devpost/echoes-implementation-brief.md for the scene contract, guard and state machine; where they differ, the design brief wins and you tell me. Build only the four-hour perspective greybox first: fixed world geometry, a matching dry footprint on a wet display, frozen leak droplets, and a partial glimpse that becomes the whole vase inside its padded case when the player moves sideways. Prove front fail, side pass and rotation-only fail. Write and run LEAF tests for each criterion, tell me which pass, and stop for review.
