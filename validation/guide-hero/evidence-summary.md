# Echoes guide technical evidence

## Scope and limits

This is the seven-step desktop Preview guide, not physical recognition or headset validation. I placed it records a manual statement. Physical fit, headset comfort, device hand tracking and real camera overlay are unverified or absent.

## Prior implementation evidence

Guide-specific Lens Preview LEAF suites passed 24/24 controls and 79/79 step-flow checks, including all 17 incoming joints. The last Lens-content commit was 2c868d0. A fresh local checkout at df5e87c, with identical Lens content, compiled and passed both suites. This does not establish that this newly separated export has been opened in Lens Studio.

Included source-level records show 29/29 checks and a deterministic 50,000-action stress pass with zero failures. Included geometric checks cover the underside and step-7 arrangement. They are geometric evidence, not physical fit.

Source and geometric checks have also been run on a previous local draft extraction. Current export verification is recorded separately during packaging; do not treat old result timestamps as fresh runtime evidence.

## Captures and video

The two included JPEGs are actual Lens Studio Preview captures from automated/injected validation, not concept art or physical recognition. Their filenames identify the step-1 joint view and the completed seven-step state.

A separate local 134.2-second silent demo is labeled on every frame as agent-injected input. It is not bundled here and no public video URL is claimed. It is not a human-operated recording.

## Repeating checks

See [run instructions](../../devpost/run-instructions.md). The tests in tools load the actual included TypeScript sources. Lens Preview tests require Lens Studio and LEAF. Do not substitute source-test results for a Preview pass.
