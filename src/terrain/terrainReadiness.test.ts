import { describe, expect, it } from "vitest";
import {
  evaluateTerrainReadiness,
  terrainReadinessSamples,
  validateTerrainPreparation,
} from "./terrainReadiness";
import type { SurfaceHit } from "./surfaceQuery";

function surface(heightMeters: number, options: Partial<SurfaceHit> = {}): SurfaceHit {
  return {
    point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 1 },
    distanceMeters: 1, heightMeters, meshId: "terrain", revision: 1, quality: 14,
    ...options,
  };
}

describe("flight terrain readiness", () => {
  it("samples the center and two complete rings inside the requested safe zone", () => {
    const samples = terrainReadinessSamples(44.977753, -93.265011, 1000);
    expect(samples).toHaveLength(25);
    expect(samples[0]).toEqual({ latDeg: 44.977753, lonDeg: -93.265011 });
    expect(new Set(samples.map(sample => `${sample.latDeg.toFixed(8)},${sample.lonDeg.toFixed(8)}`)).size).toBe(25);
  });

  it("does not release flight until every local raster sample has refined geometry", () => {
    const samples = Array.from({ length: 25 }, () => surface(300));
    samples[24] = surface(300, { quality: 9 });
    const blocked = evaluateTerrainReadiness({ latDeg: 45, lonDeg: -93, radiusMeters: 1000 }, samples, false);
    expect(blocked.result).toBeNull();
    expect(blocked.progress).toMatchObject({ phase: "refining", readySamples: 24, totalSamples: 25 });

    const ready = evaluateTerrainReadiness({
      latDeg: 45, lonDeg: -93, altitudeAboveGroundMeters: 1524, clearanceMeters: 1000,
    }, samples.map(() => surface(300)), false);
    expect(ready.result).toEqual({ groundHeightMeters: 300, altitudeMeters: 1824 });
  });

  it("rejects Google mesh samples until their tile error is safe, then clears local relief", () => {
    const coarse = Array.from({ length: 25 }, () => surface(300, { geometricErrorMeters: 26 }));
    expect(evaluateTerrainReadiness({ latDeg: 45, lonDeg: -93 }, coarse, true).result).toBeNull();

    const refined = coarse.map((_, index) => surface(index === 5 ? 850 : 300, { geometricErrorMeters: 25 }));
    const result = evaluateTerrainReadiness({
      latDeg: 45, lonDeg: -93, altitudeMeters: 1000, clearanceMeters: 1000,
    }, refined, true).result;
    // Google error is included in the minimum clearance, so an incoming coarse
    // triangle cannot still intersect the aircraft's 1 km protection zone.
    expect(result).toEqual({ groundHeightMeters: 300, altitudeMeters: 1875 });
  });

  it("validates geographic and distance inputs before starting any tile work", () => {
    expect(() => validateTerrainPreparation({ latDeg: 91, lonDeg: 0 })).toThrow("latitude");
    expect(() => validateTerrainPreparation({ latDeg: 0, lonDeg: 181 })).toThrow("latitude");
    expect(() => validateTerrainPreparation({ latDeg: 0, lonDeg: 0, radiusMeters: -1 })).toThrow("distances");
  });
});
