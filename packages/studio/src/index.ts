// ─── Bridge ─────────────────────────────────────────────────────────
// Re-export the Studio Bridge from @rebasepro/core.
// The bridge lives in core so both studio and CMS can access it
// without circular dependencies.
export {
    StudioBridgeProvider,
    StudioBridgeContext,
    useStudioCollectionRegistry,
    useStudioSideEntityController,
    useStudioUrlController,
    useStudioNavigationState,
    useStudioBreadcrumbs,
} from "@rebasepro/core";
export type {
    StudioBridge,
    BreadcrumbEntry,
    BreadcrumbsController,
} from "@rebasepro/core";

// ─── Studio Tools ───────────────────────────────────────────────────
export * from "./components/SQLEditor/SQLEditor";
export * from "./components/JSEditor/JSEditor";
export * from "./components/RLSEditor/RLSEditor";
export * from "./components/RLSEditor/PolicyEditor";
export * from "./components/StorageView/StorageView";
export * from "./components/StudioHomePage";
export * from "./utils/sql_utils";
export * from "./components/RebaseStudio";
