import { afterEach, describe, expect, it, vi } from "vitest";
import type { Scene } from "@babylonjs/core";
const mocks = vi.hoisted(() => ({
  updateURL: vi.fn(),
  dispose: null as (() => void) | null,
  loaded: null as (() => void) | null,
}));
vi.mock("@babylonjs/core", () => ({
  Texture: class {
    static TRILINEAR_SAMPLINGMODE = 3;
    name = "";
    constructor(...args: unknown[]) { mocks.loaded = args[5] as () => void; }
    onDisposeObservable = { add: (callback: () => void) => { mocks.dispose = callback; } };
    updateURL = mocks.updateURL;
  },
}));
import { loadMapTexture } from "./loadMapTexture";
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe("measured raster texture loading", () => {
  it("downloads once, counts payload, and releases the local blob after decoding", async () => {
    const fetch = vi.fn(async () => new Response(new Uint8Array([1, 2, 3])));
    vi.stubGlobal("fetch", fetch);
    const createURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:map-test");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const onLoad = vi.fn();
    const onError = vi.fn();
    const bytes = vi.fn();
    loadMapTexture("https://tiles.example/tile", {} as Scene, onLoad, onError, bytes);
    await vi.waitFor(() => expect(mocks.updateURL).toHaveBeenCalledWith("blob:map-test"));
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]).toEqual(["https://tiles.example/tile", expect.objectContaining({ mode: "cors", signal: expect.any(AbortSignal) })]);
    expect(bytes).toHaveBeenCalledWith(3);
    expect(createURL).toHaveBeenCalledOnce();
    mocks.loaded?.();
    expect(revoke).toHaveBeenCalledWith("blob:map-test");
    expect(onLoad).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it("cancels pending work on disposal and does not create a texture URL afterward", async () => {
    const fetch = vi.fn(async () => new Response("tile"));
    vi.stubGlobal("fetch", fetch);
    const createURL = vi.spyOn(URL, "createObjectURL");
    const bytes = vi.fn();
    const onError = vi.fn();
    loadMapTexture("https://tiles.example/tile", {} as Scene, vi.fn(), onError, bytes);
    mocks.dispose?.();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(createURL).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("reports HTTP errors without attempting image decoding", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("error", { status: 403 })));
    const onError = vi.fn();
    const bytes = vi.fn();
    loadMapTexture("https://tiles.example/tile", {} as Scene, vi.fn(), onError, bytes);
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(mocks.updateURL).not.toHaveBeenCalled();
    expect(bytes).not.toHaveBeenCalled();
  });
});
