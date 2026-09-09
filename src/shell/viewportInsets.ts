/**
 * Mobile browsers with a dynamic toolbar — Firefox Android's bottom URL bar,
 * Chrome Android's collapsing top bar — keep the *layout* viewport at its
 * largest size and simply paint the toolbar over it. A bottom-anchored
 * `position: fixed` element therefore sits underneath the toolbar and its
 * buttons become untappable.
 *
 * The visual viewport is the region actually on screen, so the difference
 * between the two heights is exactly how much browser chrome is covering the
 * page. We publish that as a CSS custom property and let the HUD stylesheets
 * offset by it.
 */

/** Custom property carrying the height of browser chrome overlaying the page bottom. */
export const VIEWPORT_INSET_BOTTOM_PROPERTY = "--foss-inset-bottom";

/**
 * Soft keyboards shrink the visual viewport far more than any toolbar does.
 * Capping keeps the HUD from leaping halfway up the screen when an input in a
 * panel takes focus.
 */
const MAX_INSET_PX = 200;
const MAX_INSET_FRACTION = 0.25;

/** Pinch zoom also shrinks the visual viewport; the gap means nothing then. */
const SCALE_TOLERANCE = 0.05;

export interface ViewportInsetsHandle {
  /** Recompute immediately — useful after layout changes the events miss. */
  refresh(): void;
  dispose(): void;
}

function resolveBottomInset(target: HTMLElement): number {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  if (Math.abs(viewport.scale - 1) > SCALE_TOLERANCE) return 0;

  const layoutHeight = target.clientHeight;
  if (!(layoutHeight > 0)) return 0;

  const covered = layoutHeight - viewport.height - viewport.offsetTop;
  const limit = Math.min(MAX_INSET_PX, layoutHeight * MAX_INSET_FRACTION);
  return Math.min(Math.max(Math.round(covered), 0), limit);
}

/**
 * Keeps {@link VIEWPORT_INSET_BOTTOM_PROPERTY} on `target` in sync with the
 * browser chrome currently overlaying the bottom of the page.
 */
export function trackViewportInsets(target: HTMLElement = document.documentElement): ViewportInsetsHandle {
  let lastApplied: number | null = null;

  const refresh = (): void => {
    const inset = resolveBottomInset(target);
    if (inset === lastApplied) return;
    lastApplied = inset;
    target.style.setProperty(VIEWPORT_INSET_BOTTOM_PROPERTY, `${inset}px`);
  };

  refresh();

  const viewport = window.visualViewport ?? null;
  viewport?.addEventListener("resize", refresh);
  viewport?.addEventListener("scroll", refresh);
  window.addEventListener("orientationchange", refresh);

  return {
    refresh,
    dispose() {
      viewport?.removeEventListener("resize", refresh);
      viewport?.removeEventListener("scroll", refresh);
      window.removeEventListener("orientationchange", refresh);
      target.style.removeProperty(VIEWPORT_INSET_BOTTOM_PROPERTY);
    },
  };
}
