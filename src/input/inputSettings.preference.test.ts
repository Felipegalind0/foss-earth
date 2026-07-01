// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import {
  INPUT_MODE_STORAGE_KEY,
  INPUT_SENSITIVITY_STORAGE_KEY,
  INPUT_SENSITIVITY_VERSION_KEY,
  loadInputModePreference,
  loadInputSensitivityPreference,
  saveInputModePreference,
} from "./inputSettings";

describe("input mode preferences", () => {
  afterEach(() => {
    window.localStorage.removeItem(INPUT_MODE_STORAGE_KEY);
    window.localStorage.removeItem(INPUT_SENSITIVITY_STORAGE_KEY);
    window.localStorage.removeItem(INPUT_SENSITIVITY_VERSION_KEY);
    window.localStorage.removeItem("moir-park.map-input-mode");
    window.localStorage.removeItem("moir-park.map-input-sensitivity");
    window.localStorage.removeItem("moir-park.map-input-sensitivity-version");
  });

  it("loads a saved mode when available", () => {
    saveInputModePreference("mouse");
    expect(loadInputModePreference(new Set(["mouse", "trackpad"]))).toBe("mouse");
  });

  it("migrates legacy Fundfolio mode keys", () => {
    window.localStorage.setItem("moir-park.map-input-mode", "touch");
    expect(loadInputModePreference(new Set(["mouse", "touch"]))).toBe("touch");
  });

  it("loads saved sensitivity settings", () => {
    const settings = loadInputSensitivityPreference();
    expect(settings.mouse.pan).toBe(1);
  });
});
