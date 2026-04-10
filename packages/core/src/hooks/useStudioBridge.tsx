import React, { createContext, useContext } from "react";
import type {
    CollectionRegistryController,
    SideEntityController,
    UrlController,
    NavigationStateController,
} from "@rebasepro/types";

// ─── Breadcrumbs (defined here so studio doesn't need CMS) ──────────

export interface BreadcrumbEntry {
    title: string;
    url: string;
    count?: number | null;
    id?: string;
}

export interface BreadcrumbsController {
    breadcrumbs: BreadcrumbEntry[];
    set: (props: { breadcrumbs: BreadcrumbEntry[] }) => void;
    updateCount: (id: string, count: number | null | undefined) => void;
}

// ─── Bridge interface ───────────────────────────────────────────────

/**
 * StudioBridge provides optional CMS capabilities to Studio components.
 * When CMS is present, a bridge provider injects real implementations.
 * When CMS is absent, noop defaults ensure Studio works standalone.
 */
export interface StudioBridge {
    collectionRegistry: CollectionRegistryController;
    sideEntityController: SideEntityController;
    urlController: UrlController;
    navigationState: NavigationStateController;
    breadcrumbs: BreadcrumbsController;
}

// ─── Noop defaults ──────────────────────────────────────────────────

const NOOP_COLLECTION_REGISTRY: CollectionRegistryController = {
    getCollection: () => undefined,
    getRawCollection: () => undefined,
    getParentReferencesFromPath: () => [],
    getParentCollectionIds: () => [],
    convertIdsToPaths: () => [],
    initialised: false,
};

const NOOP_SIDE_ENTITY: SideEntityController = {
    open: () => {},
    replace: () => {},
    close: () => {},
};

const NOOP_URL_CONTROLLER: UrlController = {
    basePath: "/",
    baseCollectionPath: "/c",
    urlPathToDataPath: () => "",
    homeUrl: "/",
    isUrlCollectionPath: () => false,
    buildUrlCollectionPath: () => "",
    buildAppUrlPath: () => "",
    resolveDatabasePathsFrom: () => "",
    navigate: () => {},
};

const NOOP_NAVIGATION_STATE: NavigationStateController = {
    loading: false,
    refreshNavigation: () => {},
};

const NOOP_BREADCRUMBS: BreadcrumbsController = {
    breadcrumbs: [],
    set: () => {},
    updateCount: () => {},
};

const NOOP_BRIDGE: StudioBridge = {
    collectionRegistry: NOOP_COLLECTION_REGISTRY,
    sideEntityController: NOOP_SIDE_ENTITY,
    urlController: NOOP_URL_CONTROLLER,
    navigationState: NOOP_NAVIGATION_STATE,
    breadcrumbs: NOOP_BREADCRUMBS,
};

// ─── Context & Provider ─────────────────────────────────────────────

export const StudioBridgeContext = createContext<StudioBridge>(NOOP_BRIDGE);

/**
 * Provider that injects CMS capabilities into Studio.
 * Accepts partial overrides — any field not provided falls back to noop.
 *
 * Usage (in app wiring, when CMS is present):
 * ```tsx
 * <StudioBridgeProvider value={{
 *     collectionRegistry: useCollectionRegistryController(),
 *     sideEntityController: useSideEntityController(),
 *     urlController: useUrlController(),
 *     navigationState: useNavigationStateController(),
 *     breadcrumbs: useBreadcrumbsController(),
 * }}>
 *     <RebaseStudio ... />
 * </StudioBridgeProvider>
 * ```
 */
export function StudioBridgeProvider({
    value,
    children,
}: {
    value: Partial<StudioBridge>;
    children: React.ReactNode;
}) {
    const merged = React.useMemo(
        () => ({ ...NOOP_BRIDGE, ...value }),
        [value]
    );
    return (
        <StudioBridgeContext.Provider value={merged}>
            {children}
        </StudioBridgeContext.Provider>
    );
}

// ─── Convenience hooks ──────────────────────────────────────────────

/** Collection registry — returns noop if CMS is not present. */
export function useStudioCollectionRegistry(): CollectionRegistryController {
    return useContext(StudioBridgeContext).collectionRegistry;
}

/** Side entity controller — returns noop if CMS is not present. */
export function useStudioSideEntityController(): SideEntityController {
    return useContext(StudioBridgeContext).sideEntityController;
}

/** URL controller — returns noop if CMS is not present. */
export function useStudioUrlController(): UrlController {
    return useContext(StudioBridgeContext).urlController;
}

/** Navigation state — returns noop if CMS is not present. */
export function useStudioNavigationState(): NavigationStateController {
    return useContext(StudioBridgeContext).navigationState;
}

/** Breadcrumbs controller — returns noop if CMS is not present. */
export function useStudioBreadcrumbs(): BreadcrumbsController {
    return useContext(StudioBridgeContext).breadcrumbs;
}
