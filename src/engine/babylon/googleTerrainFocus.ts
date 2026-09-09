import { Vector3, type TransformNode } from "@babylonjs/core";
import type { Tile } from "3d-tiles-renderer/core";
import { DEG_TO_RAD, geodeticToEcef } from "../../camera/cameraMath";
import type { TerrainReadinessFocus } from "../../terrain/terrainReadiness";

// engineData is populated by the installed Babylon adapter but is not yet in
// its public Tile declarations. Keep the adapter-specific shape in one place.
export type BabylonGoogleTile = Tile & { engineData?: {
  boundingVolume?: { distanceToPoint(point: Vector3): number };
  scene?: TransformNode | null;
} };

/** Include the entire local vertical column, including erroneous coarse meshes
 * above the aircraft. Looking only at a sphere at sea level misses those tiles
 * and leaves them unrefined — the original startup collision failure. */
export function createGoogleTerrainFocusRegion(focus: TerrainReadinessFocus) {
  const centers: Vector3[] = [];
  for (let altitude = -1000; altitude <= 21500; altitude += 2500) {
    const point = geodeticToEcef(focus.latDeg * DEG_TO_RAD, focus.lonDeg * DEG_TO_RAD, altitude);
    centers.push(new Vector3(point.x, point.y, point.z));
  }
  const radius = Math.hypot(focus.radiusMeters, 1250);
  return {
    intersects(tile: BabylonGoogleTile): boolean {
      const bounds = tile.engineData?.boundingVolume;
      // Unprocessed ancestors must be traversed to discover the destination.
      return !bounds || centers.some(center => bounds.distanceToPoint(center) <= radius);
    },
  };
}
