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

The orbit compass resolves anchor height through a small quantized cache. Layers can provide cheap precomputed `anchorHeightSamples` as part of their layer state:

```ts
return {
	anchorHeightSamples: [
		{ latDeg: 44.977753, lonDeg: -93.265011, heightMeters: 264 },
	],
};
```

Tracked POIs keep their exact mesh position. Normal camera anchors use layer samples when available; otherwise the app performs a low-frequency local ray sample against currently loaded Google tile meshes for the viewed location cell. The sampler uses the lowest hit from a small neighborhood around the anchor as a stable local support plane, caches successful heights, and retries misses slowly while tiles are still loading. If no tile height is available, the anchor falls back to the WGS84 ellipsoid height.

Resolved compass height is also vertically smoothed, so moving the anchor across city geometry does not instantly snap the compass between street level and rooftops.

## Deployment

GitHub Pages deployment is available in two forms.

For quick device testing from your current checkout, publish the built app to the `gh-pages` branch:

```sh
npm run deploy
```

The first run creates the `gh-pages` branch automatically. In the repository settings, set Pages to deploy from the `gh-pages` branch root if it is not already configured.

Current Pages URL:

```text
https://felipegalind0.github.io/foss-earth-babylon.js/
```

The CI workflow in [.github/workflows/ci.yml](.github/workflows/ci.yml) also builds and deploys on pushes to `main` using GitHub's Pages artifact flow.

The Vite base path is set automatically in GitHub Actions from `GITHUB_REPOSITORY`, so Pages builds are emitted under `/<repo-name>/`. Local builds continue to use `/`.

To build and push the branch artifact locally:

```sh
npm run deploy
```

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
