// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { WindowOverlay } from "./WindowOverlay";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.replaceChildren(); });

it("owns responsive launchers, cross-side tab moves, minimize/restore, and Location search", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let width = 1200;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const apply = vi.fn();
  const click = async (selector: string) => {
    const button = host.querySelector<HTMLButtonElement>(selector);
    expect(button).not.toBeNull();
    await act(async () => button!.click());
  };
  const open = async (side: string, label: string) => {
    await click(`[aria-label="Open ${side} panel"]`);
    const item = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(button => button.textContent === label)!;
    await act(async () => item.click());
  };
  await act(async () => root.render(<WindowOverlay
    getViewState={() => ({ latDeg: 45, lonDeg: -93 })}
    setViewState={apply}
    additionalTabs={[{ id: "aircraft", label: "Aircraft" }]}
    renderAdditionalTab={() => <p>Aircraft controls</p>}
  />));
  try {
    expect(host.querySelector('[aria-label="Open left panel"]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Open right panel"]')).not.toBeNull();
    await open("left", "Location");
    await open("right", "Aircraft");
    const right = host.querySelector<HTMLElement>('[data-side="right"]')!;
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", { value: { getData: () => "location" } });
    await act(async () => right.dispatchEvent(drop));
    expect(host.querySelector('[aria-label="Open left panel"]')).not.toBeNull();
    expect(right.querySelectorAll(".foss-earth-tab-button")).toHaveLength(2);
    await click('[data-side="right"] .foss-earth-tab-shell-selected .foss-earth-tab-button');
    expect(right.dataset.collapsed).toBe("true");
    await click('[data-side="right"] .foss-earth-tab-shell-selected .foss-earth-tab-button');
    expect(right.dataset.collapsed).toBe("false");
    await click('[aria-label="Close Location tab"]');
    await open("left", "Location");
    width = 700;
    await act(async () => window.dispatchEvent(new Event("resize")));
    expect(host.querySelector('[aria-label="Open left panel"]')).toBeNull();
    expect(host.querySelector('[data-side="left"]')).toBeNull();
    expect(right.querySelectorAll(".foss-earth-tab-button")).toHaveLength(2);
    const locationTab = Array.from(right.querySelectorAll<HTMLButtonElement>(".foss-earth-tab-button")).find(button => button.textContent === "Location")!;
    if (!host.querySelector(".foss-earth-location-panel")) await act(async () => locationTab.click());
    const query = host.querySelector<HTMLInputElement>('.foss-earth-location-panel input')!;
    expect(query.disabled).toBe(false);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(query, "46, -92");
      query.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => query.form!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    const result = Array.from(host.querySelectorAll("button")).find(button => button.textContent === "46, -92")!;
    await act(async () => result.click());
    expect(apply).toHaveBeenLastCalledWith({ latDeg: 46, lonDeg: -92 });
    width = 1200;
    await act(async () => window.dispatchEvent(new Event("resize")));
    expect(host.querySelector('[aria-label="Open left panel"]')).not.toBeNull();
    await click('[aria-label="Close Location tab"]');
    await click('[aria-label="Close Aircraft tab"]');
    expect(host.querySelector('[aria-label="Open right panel"]')).not.toBeNull();
  } finally { await act(async () => root.unmount()); }
  expect(disconnect).toHaveBeenCalledOnce();
});
