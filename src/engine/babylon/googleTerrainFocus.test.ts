import { describe, expect, it } from "vitest";
import { createGoogleTerrainFocusRegion, type BabylonGoogleTile } from "./googleTerrainFocus";

describe("Google flight terrain focus", () => {
  it("keeps a vertical 1 km destination column eligible for refinement", () => {
    const region = createGoogleTerrainFocusRegion({
      latDeg: 44.977753, lonDeg: -93.265011, radiusMeters: 1000, maxGeometricErrorMeters: 25,
    });
    const near = { engineData: { boundingVolume: { distanceToPoint: () => 0 } } } as BabylonGoogleTile;
    const far = { engineData: { boundingVolume: { distanceToPoint: () => 100_000 } } } as BabylonGoogleTile;
    // A tileset ancestor has no Babylon bounding volume until it has been
    // processed; it must remain traversable so its children can be discovered.
    expect(region.intersects({} as BabylonGoogleTile)).toBe(true);
    expect(region.intersects(near)).toBe(true);
    expect(region.intersects(far)).toBe(false);
  });
});
