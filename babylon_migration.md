# FOSS Earth Babylon Migration Plan

Date: 2026-05-17
Target repo: foss-earth-babylon
Source baseline: foss-earth (Cesium implementation)

## 1. Executive Summary

foss-earth-babylon is currently a React + Vite starter scaffold, while foss-earth contains a full globe runtime with custom interaction semantics, HUD controls, plugin lifecycle support, POI tracking behavior, and domain-layer integration points.

The migration goal is not only to render 3D tiles with Babylon + 3DTilesRendererJS, but to preserve the product behavior users already expect from the Cesium version.

This plan prioritizes:

1. Functional parity first (controls, UX, plugin architecture).
2. Deterministic renderer behavior (WebGPU when available, graceful fallback when not).
3. Performance and stability hardening before release.

---

## 2. Migration Goals

## Primary Goals

1. Rebuild the globe runtime on Babylon + NASA-AMMOS 3DTilesRendererJS.
2. Reach feature parity with the Cesium app across desktop and mobile interactions.
3. Keep a clean plugin interface for downstream repos (for example, foss-earth-oil style layers).
4. Support WebGPU where available while preserving WebGL fallback.
5. Ship with test coverage and clear deployment docs.

## Non-Goals (for parity release)

1. Visual redesign of the entire app.
2. New geospatial features unrelated to current Cesium behavior.
3. Multi-engine runtime (Cesium + Babylon) inside the same repo long-term.

---

## 3. Baseline Feature Inventory and Gap Analysis

| Capability | Cesium Version | Babylon Version (Today) | Parity Target |
|---|---|---|---|
| Globe runtime bootstrap | Implemented | Missing | Implemented with Babylon engine init and render loop |
| Google Photorealistic 3D tiles | Implemented | Missing | Implemented via 3DTilesRendererJS Babylon integration |
| OSM fallback mode + modal | Implemented | Missing | Implemented fallback path + explicit user messaging |
| Trackpad-aware pan/orbit/zoom | Implemented | Missing | Behavior-compatible input semantics |
| Safari GestureEvent support | Implemented | Missing | Safari gesture mapping or equivalent fallback |
| Mobile touch gestures | Implemented | Missing | Two-finger orbit + pinch parity |
| HUD status strip | Implemented | Missing | Lat/Lon/Heading/Pitch/Zoom live readout |
| North-up reset button | Implemented | Missing | One-click heading/pitch reset parity |
| Help/settings modals | Implemented | Missing | Existing UX restored |
| Orbit compass (world anchored) | Implemented | Missing | Babylon implementation with scale rules |
| POI selection and tracking mode | Implemented | Missing | Equivalent track/exit behavior |
| Plugin layer lifecycle | Implemented | Missing | Engine-neutral layer API |
| Hemisphere culling utility | Exists (not fully wired in core demo path) | Missing | Port utility and wire to Babylon entities |
| Unit tests for math helpers | Implemented | Missing | Port and extend tests in Babylon repo |
| Deploy workflow | Implemented | Missing | Build + deploy parity |

---

## 4. Definition of Done for Parity

Parity is complete when all criteria below are true:

1. Globe renders Google 3D tiles with API key query param support.
2. App enters fallback mode without API key and clearly communicates state.
3. Controls matrix matches Cesium behavior:
   - Desktop pan: left drag and two-finger swipe.
   - Orbit: right drag and shift + swipe.
   - Zoom: wheel and pinch.
   - Mobile: touch drag/orbit/pinch.
4. HUD shows stable camera state readout and north-up reset works.
5. Orbit compass tracks anchor point and scales by zoom distance.
6. Plugin lifecycle exists: add layer, remove layer, destroy.
7. POI tracking mode works with clear enter/exit rules.
8. Tests pass for math helpers and interaction classifiers.
9. Build and deploy commands are documented and reproducible.
10. Runtime reports actual renderer mode (webgpu or webgl fallback).

---

## 5. Target Architecture

Use a modular architecture so engine concerns do not leak into app logic.

## Proposed Directory Layout

```text
src/
  main.tsx
  app/
    createGlobeApp.ts
  engine/
    types.ts
    babylon/
      createBabylonRuntime.ts
      createRendererMode.ts
      createTilesRuntime.ts
      cameraAdapter.ts
      pickingAdapter.ts
  camera/
    cameraState.ts
    cameraMath.ts
    cameraController.ts
  input/
    wheelController.ts
    touchController.ts
    safariGestures.ts
    gestureClassifier.ts
  hud/
    statusHud.ts
    northButton.ts
    helpModal.ts
    settingsModal.ts
  layers/
    layerRegistry.ts
    types.ts
    poiTracking.ts
  visualization/
    orbitCompass.ts
  perf/
    culling.ts
    metrics.ts
  styles/
    globe.css
```

## Core Contracts

Create engine-neutral interfaces early:

1. GlobeViewState
   - latDeg, lonDeg, headingDeg, pitchDeg, zoomMeters.
2. GlobeLayer
   - id, setup(ctx), destroy(ctx).
3. GlobeLayerState
   - optional poi handles, optional orbit target resolver.
4. GlobeHandle
   - addLayer, removeLayer, destroy, getViewState, setViewState.

This protects plugin code from direct Babylon internals.

---

## 6. Technical Strategy for Babylon + 3DTilesRendererJS

## Rendering and Device Selection

1. Try WebGPU engine creation first.
2. On failure, create WebGL engine automatically.
3. Publish runtime mode to console and HUD label:
   - requestedRenderer: webgpu
   - actualRenderer: webgpu | webgl

## Tiles Runtime

1. Use 3d-tiles-renderer Babylon package path.
2. Configure Google tiles provider with URL/key handling.
3. Handle tileset lifecycle cleanly on destroy.
4. Add bounded retry/error UI for tileset load failures.

## Camera Model

Keep a state-driven camera model (not raw pointer deltas only):

1. Canonical state: lat/lon/heading/pitch/zoom.
2. All input handlers update canonical state.
3. Single apply function maps state to Babylon camera.

This mirrors the Cesium behavior and avoids control drift.

---

## 7. Phased Implementation Roadmap

## Phase 0: Setup and Scaffolding (2 days)

### Tasks

1. Remove starter UI shell and install globe app structure.
2. Add dependencies:
   - Babylon core packages.
   - 3d-tiles-renderer package.
   - Test runner (Vitest) and type/test tooling.
3. Add app bootstrap and full-screen canvas layout.

### Exit Criteria

1. App launches Babylon scene with render loop.
2. TypeScript and lint pass.

## Phase 1: Tiles and Fallback Modes (3 days)

### Tasks

1. Integrate Google 3D tiles loading path.
2. Parse key from URL query params.
3. Implement no-key fallback mode behavior and messaging.
4. Add initialization error boundaries and logs.

### Exit Criteria

1. 3D tiles render with valid key.
2. Fallback mode is deterministic and visible without key.

## Phase 2: Camera State Engine (4 days)

### Tasks

1. Implement camera state model and conversion math.
2. Implement applyCameraState() and syncCameraStateFromView().
3. Implement north-up reset and initial camera view.

### Exit Criteria

1. Camera state is stable through pan/orbit/zoom cycles.
2. North-up reset returns expected heading/pitch.

## Phase 3: Input Parity (5 days)

### Tasks

1. Port wheel + trackpad behavior classification.
2. Implement shift+swipe orbit semantics.
3. Implement Safari GestureEvent handling/fallback.
4. Implement touch gesture session (pinch + orbit).

### Exit Criteria

1. Desktop control matrix matches Cesium behavior.
2. Mobile touch behavior matches Cesium behavior.

## Phase 4: HUD and Modals (3 days)

### Tasks

1. Implement status strip (lat/lon/heading/pitch/zoom).
2. Implement north button visual heading rotation.
3. Implement help and settings modals.
4. Add renderer mode indicator (webgpu/webgl).

### Exit Criteria

1. HUD updates smoothly and accurately.
2. North and modal controls fully functional.

## Phase 5: Plugin System and POI Tracking (5 days)

### Tasks

1. Add layer registry and lifecycle management.
2. Add POI registration model and selection pipeline.
3. Add tracking enter/exit behavior parity.
4. Add compatibility adapter for migration of existing layer code.

### Exit Criteria

1. Layers can be added/removed at runtime safely.
2. POI tracking behavior mirrors old app expectations.

## Phase 6: Compass + Culling + Perf (4 days)

### Tasks

1. Rebuild orbit compass as Babylon world geometry or hybrid HUD overlay.
2. Port hemisphere culling to engine-neutral module and wire updates.
3. Add frame/memory/tile metrics.
4. Tune culling thresholds and update cadence.

### Exit Criteria

1. Compass anchor behavior is stable at all zoom levels.
2. Culling visibly reduces overdraw and keeps UX smooth.

## Phase 7: Testing, CI, and Deployment (3 days)

### Tasks

1. Port math utility tests and add gesture classifier tests.
2. Add integration smoke tests for startup and control actions.
3. Add build/deploy scripts for GitHub Pages.
4. Update README and migration docs.

### Exit Criteria

1. CI tests pass consistently.
2. Deployment flow is documented and repeatable.

## Phase 8: Hardening and Release Candidate (3 days)

### Tasks

1. Cross-browser QA pass (Chrome, Safari, Firefox).
2. Device QA pass (desktop trackpad/mouse, mobile touch).
3. Performance pass and regression fixes.
4. Freeze parity scope and tag release candidate.

### Exit Criteria

1. No P0/P1 parity regressions open.
2. Release candidate is production deployable.

---

## 8. Critical Path and Dependencies

1. Phase 0 must complete before all other phases.
2. Phase 1 and Phase 2 form the primary critical path.
3. Phase 3 depends on stable camera state from Phase 2.
4. Phase 5 depends on stable picking/camera behavior.
5. Phase 6 should start after baseline controls and layers are stable.
6. Phase 7 and 8 can run partially in parallel with late Phase 6 tuning.

---

## 9. Testing and Validation Plan

## Unit Tests

1. Port existing math helper tests.
2. Add camera conversion math tests.
3. Add gesture intent and threshold tests.

## Integration Tests

1. App boot and tileset load with mock or test key path.
2. North reset behavior.
3. Layer add/remove lifecycle.
4. POI tracking enter/exit.

## Manual Parity QA Matrix

1. Desktop mouse controls.
2. Desktop trackpad controls.
3. Safari gesture handling.
4. Mobile touch gestures.
5. HUD accuracy checks.
6. Fallback mode flow.

---

## 10. Performance Targets

Set explicit success thresholds for parity release:

1. 55-60 FPS steady during idle orbit on desktop mid/high hardware.
2. No sustained frame spikes above 50 ms during normal navigation.
3. Stable memory profile over 10-minute navigation session.
4. No tile thrashing loops due to camera jitter.

Instrument:

1. Frame time percentiles (p50, p95, p99).
2. Tiles loaded/unloaded rates.
3. Draw calls and material count where available.

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WebGPU unsupported on some clients | High | Medium | Auto fallback to WebGL, visible mode indicator |
| Input behavior feels different from Cesium | High | High | Build explicit parity test matrix and tune thresholds |
| Plugin migration breaks downstream projects | Medium | High | Introduce compatibility adapter and migration notes |
| Tileset provider/API changes | Medium | Medium | Encapsulate provider logic and add retry/error states |
| Performance regressions on mobile | Medium | High | Early mobile profiling, dynamic quality knobs |
| Browser-specific gesture differences | High | Medium | Browser-specific handlers with feature detection |

---

## 12. Sprint-Ready Backlog (First 2 Sprints)

## Sprint 1 (Foundation + Render)

1. Replace starter app with full-screen canvas shell.
2. Add Babylon + 3DTilesRendererJS dependencies.
3. Create runtime bootstrap with WebGPU->WebGL fallback.
4. Add query param parser for API key.
5. Render first Google tileset.
6. Add fallback mode UI and error state.

Sprint 1 demo outcome:

1. User can open app and see globe tiles with key.
2. User sees graceful fallback mode without key.

## Sprint 2 (Controls + HUD Baseline)

1. Implement camera state and apply/sync loop.
2. Implement wheel and drag interactions.
3. Implement north-up reset action.
4. Implement status HUD readout.
5. Add initial unit tests for camera math.

Sprint 2 demo outcome:

1. User can navigate globe with stable behavior.
2. User can reset to north-up and read camera telemetry.

---

## 13. Deliverables Checklist

## Code Deliverables

1. Babylon runtime modules.
2. Tiles integration module.
3. Camera/input control modules.
4. HUD/modals modules.
5. Plugin and POI modules.
6. Compass and culling modules.

## Quality Deliverables

1. Unit and integration test suites.
2. Manual QA checklist.
3. Perf baseline report.

## Documentation Deliverables

1. Updated repo README.
2. Layer/plugin migration guide.
3. Deployment guide.
4. Renderer mode support notes.

---

## 14. Suggested Milestone Naming

1. M1 - Runtime boots with tiles.
2. M2 - Camera and controls parity alpha.
3. M3 - HUD and UX parity beta.
4. M4 - Plugin and POI parity beta.
5. M5 - Perf + QA release candidate.
6. M6 - Parity release.

---

## 15. Immediate Next Actions

1. Approve this migration scope and milestone sequence.
2. Create issues from Sprint 1 backlog.
3. Start Phase 0 implementation branch.
4. Define one daily parity checkpoint: controls, HUD, layers, perf.
