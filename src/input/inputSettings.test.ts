// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT_SETTINGS,
  GLOBE_ANCHOR_ROTATION_STORAGE_KEY,
  loadGlobeAnchorRotationPreference,
} from "./inputSettings";

describe("loadGlobeAnchorRotationPreference", () => {
  afterEach(() => {
    window.localStorage.removeItem(GLOBE_ANCHOR_ROTATION_STORAGE_KEY);
  });

  it("defaults to enabled when no preference is stored", () => {
    expect(loadGlobeAnchorRotationPreference()).toBe(true);
    expect(DEFAULT_INPUT_SETTINGS.globeAnchorRotation).toBe(true);
  });

  it("respects an explicit false preference", () => {
    window.localStorage.setItem(GLOBE_ANCHOR_ROTATION_STORAGE_KEY, "false");
    expect(loadGlobeAnchorRotationPreference()).toBe(false);
  });

  it("respects an explicit true preference", () => {
    window.localStorage.setItem(GLOBE_ANCHOR_ROTATION_STORAGE_KEY, "true");
    expect(loadGlobeAnchorRotationPreference()).toBe(true);
  });
});
