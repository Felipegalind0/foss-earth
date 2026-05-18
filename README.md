# FOSS Earth Babylon

Babylon.js migration of the FOSS Earth globe runtime. The app renders Google Photorealistic 3D Tiles when a Maps Tiles API key is provided and falls back to a deterministic local globe scene when no key is available.

## Requirements

- Node.js 22 or newer
- npm
- Optional: a Google Maps Tiles API key with the Maps Tiles API enabled

## Local Development

```sh
npm ci
npm run dev
```

Open the Vite URL printed by the dev server. To enable Google Photorealistic 3D Tiles, append a key query parameter:

```text
http://127.0.0.1:5173/?key=YOUR_GOOGLE_MAPS_API_KEY
```

Without a key, the app starts in fallback mode and shows the fallback notice in the lower-left corner.

## Quality Checks

```sh
npm run lint
npm run test
npm run build
```

For the same sequence used by CI:

```sh
npm run ci
```

The test suite includes camera/geodetic math coverage and jsdom smoke tests for app startup, URL key parsing, north-up reset behavior, layer lifecycle delegation, and cleanup.

## Compass Height Model

The orbit compass resolves anchor height through a small quantized cache backed by a deterministic smooth global elevation model. The default height provider is continuous over the globe and intentionally ignores buildings, trees, and tile LOD geometry, so camera anchors do not jump when moving over dense city geometry. Layers can still provide cheap precomputed `anchorHeightSamples` as part of their layer state:

```ts
return {
	anchorHeightSamples: [
		{ latDeg: 44.977753, lonDeg: -93.265011, heightMeters: 264 },
	],
};
```

Tracked POIs keep their exact mesh position. Normal camera anchors use layer samples when available; otherwise the app uses `smoothSurfaceHeightMeters(lat, lon)` and falls back to the WGS84 ellipsoid only for invalid inputs. `smoothSurfaceEcef(lat, lon, offsetMeters)` is exported for marker layers that need to place sprites or meshes above the same smooth ground model.

Resolved compass height is also vertically smoothed, so moving the anchor across city geometry does not instantly snap the compass between street level and rooftops.

## Deployment

Build and push to the `gh-pages` branch, which GitHub Pages serves directly:

```sh
npm run deploy
```

The first run creates the `gh-pages` branch automatically. In the repository settings, set Pages to deploy from the `gh-pages` branch root if it is not already configured.

Current Pages URL:

```text
https://felipegalind0.github.io/foss-earth-babylon.js/
```

The Vite base path is configured in `vite.config.ts` so the build is emitted under `/<repo-name>/` for Pages and `/` for local dev.

## Manual QA Checklist

- Boot without a key and confirm fallback mode is visible.
- Boot with `?key=...` and confirm Google tiles mode is reported.
- macOS desktop QA passed on Chrome, Firefox, and Safari on 2026-05-17.
- Verify desktop controls: left drag pan, right drag orbit, shift plus trackpad swipe orbit, wheel zoom.
- Verify mobile/touch controls: one-finger pan, two-finger orbit, pinch zoom.
- Confirm HUD lat/lon/heading/pitch/zoom updates while navigating.
- Click the north button and confirm heading resets and POI tracking exits.
- Add/remove a test layer and confirm POI picking/tracking and cleanup behavior.
- Watch the perf pill for stable frame timing and culling/tile counts during normal navigation.
