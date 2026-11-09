# Echoes asset and package record

## Guide geometry

The generated guide geometry derives from LDraw's official parts library, CC BY 4.0, with triangulation and quantization. See [credits](guide-credits.md) and [per-file attribution](ldraw-attribution.json) for eight source parts, 132 dependencies and 19 authors. The official LEGO instruction PDF is an external reference only; its page artwork is not packaged.

To regenerate meshes, obtain the LDraw source library separately, then run build_guide_meshes.py with the library root and output TypeScript path. This is not required to run the project: generated mesh data is included. The JSON section manifest provides part poses and step data.

## Snap template and packages

The project began with SPECS Base Template 5.23.0 from Snap's Lens Studio Asset Library. Template scene/render assets include the camera texture, render target and Echopark environment map. The guide does not read physical camera frames.

- Spectacles Interaction Kit: 2.0.0 (SIK 0.18.0), input and interactables.
- Spectacles UI Kit: 2.0.0, buttons and panels.
- LEAF: 2.0.2, registered automated test scenarios.
- Bitmoji 3D: 10.0.1, retained as LEAF's dependency; not used by guide code.

Packages are preserved unchanged. Their terms remain their own; this document grants no new license or relicensing of third-party components.

## Project-authored material

Guide logic, authored text, poses and controls are project work. The disabled earlier Signal Arch module, its synthesized cue sounds, procedural shaders and tests remain to preserve scene dependencies. They are not the current demonstration. No third-party music or voice is added to the guide. The guide uses no network service, physical recognition, hand tracking or AI operator.
