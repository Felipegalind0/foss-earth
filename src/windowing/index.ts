export type {
  WindowSlotId,
  WindowSlotState,
  WindowTabDefinition,
  WindowWorkspaceState,
} from "./core/types";

export type {
  WindowWorkspaceStateInit,
} from "./core/workspaceState";

export {
  allWorkspaceOpenTabs,
  closeTabInWorkspace,
  createWindowSlotState,
  createWindowWorkspaceState,
  openTabAndExpandWorkspaceSlot,
  openTabInWorkspace,
  selectTabAndExpandWorkspaceSlot,
  selectTabInWorkspace,
  setWorkspaceSlotCollapsed,
  setWorkspaceSlotSize,
} from "./core/workspaceState";

export {
  availableWindowTabs,
  buildTabConflictMap,
  conflictingTabsFor,
} from "./core/tabRules";

export type {
  DockPanelLayout,
  DockPanelLayoutInput,
  DockPanelLayoutOptions,
} from "./layout/panelLayout";

export {
  computeDockPanelLayout,
  DEFAULT_DOCK_PANEL_LAYOUT_OPTIONS,
} from "./layout/panelLayout";

export type {
  WindowViewportPolicy,
  WindowViewportPolicyInput,
} from "./layout/viewportPolicy";

export {
  DEFAULT_MIN_SECONDARY_ASPECT_RATIO,
  DEFAULT_MIN_SECONDARY_WIDTH,
  resolveWindowViewportPolicy,
} from "./layout/viewportPolicy";

export type {
  DockPanelClassNames,
  DockPanelProps,
} from "./react/DockPanel";
export { DockPanel } from "./react/DockPanel";

export type {
  FloatingWindowClassNames,
  FloatingWindowProps,
} from "./react/FloatingWindow";
export { FloatingWindow } from "./react/FloatingWindow";

export type {
  PanelLauncherClassNames,
  PanelLauncherProps,
  PanelLauncherStrings,
} from "./react/PanelLauncher";
export { PanelLauncher } from "./react/PanelLauncher";

export type {
  TabStripClassNames,
  TabStripProps,
  TabStripStrings,
} from "./react/TabStrip";
export { TabStrip } from "./react/TabStrip";

export type {
  WorkspaceDockPanelOverrides,
  WorkspaceDockSlotClassNames,
  WorkspaceDockSlotProps,
  WorkspaceDockSlotStrings,
} from "./react/WorkspaceDockSlot";
export { WorkspaceDockSlot } from "./react/WorkspaceDockSlot";

export type {
  UseWindowWorkspaceOptions,
  WindowWorkspaceController,
} from "./react/useWindowWorkspace";
export { useWindowWorkspace } from "./react/useWindowWorkspace";

export { LocationPanel } from "./react/LocationPanel";
export type { GeodeticLocation, LocationPanelProps, LocationSearchProvider, LocationSearchResult } from "./react/LocationPanel";
