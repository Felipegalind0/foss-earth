import { describe, expect, it } from "vitest";
import { createRasterQualityController, resolveRasterQualityState } from "./rasterQuality";

describe("raster quality controller", () => {
  it("keeps an explicit quality setting fixed", () => {
    const controller = createRasterQualityController(resolveRasterQualityState("high"));
    expect(controller.getState()).toEqual({ setting: "high", activeProfile: "high" });
    for (let now = 1000; now <= 20_000; now += 1000) {
      expect(controller.observe(now, 40, false)).toBeNull();
    }
    expect(controller.getState().activeProfile).toBe("high");
  });

  it("lowers auto quality only after sustained slow frames", () => {
    const controller = createRasterQualityController({ setting: "auto", activeProfile: "balanced" });
    expect(controller.observe(1, 30, false)).toBeNull();
    expect(controller.observe(1001, 30, false)).toBeNull();
    expect(controller.observe(2001, 30, false)).toEqual({ setting: "auto", activeProfile: "low" });
  });

  it("does not mistake a 60fps cap for spare headroom", () => {
    const controller = createRasterQualityController({ setting: "auto", activeProfile: "balanced" });
    for (let now = 1; now <= 15_000; now += 1000) {
      expect(controller.observe(now, 16.67, false)).toBeNull();
    }
    expect(controller.getState().activeProfile).toBe("balanced");
  });
});
