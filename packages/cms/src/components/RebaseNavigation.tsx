import React, { useMemo, lazy, Suspense } from "react";
import {
    useRebaseRegistry,
    useRebaseContext,
    useAuthController,
    useAdminModeController,
    useBuildLocalConfigurationPersistence,
    useInternalUserManagementController,
    useRebaseClient,
    StudioBridgeRegistryProvider,
    useBridgeRegistration,
} from "@rebasepro/core";
import { CircularProgressCenter } from "@rebasepro/ui";
import type { AppView, CollectionEditorOptions } from "@rebasepro/types";

import { useBuildNavigationStateController } from "../hooks/navigation/useBuildNavigationStateController";
import { useBuildUrlController } from "../hooks/navigation/useBuildUrlController";
import { useBuildCollectionRegistryController } from "../hooks/navigation/useBuildCollectionRegistryController";

import { CollectionRegistryContext } from "../hooks/navigation/contexts/CollectionRegistryContext";
import { UrlContext } from "../hooks/navigation/contexts/UrlContext";
import { NavigationStateContext } from "../hooks/navigation/contexts/NavigationStateContext";

import { SideEntityProvider } from "./SideEntityProvider";

// Collection editor internals — used when collectionEditor is enabled
import { useLocalCollectionsConfigController } from "../collection_editor/useLocalCollectionsConfigController";
import { ConfigControllerProvider } from "../collection_editor/ConfigControllerProvider";

// Lazy-load the schema view — only fetched when studio schema tool is active
const CollectionsStudioView = lazy(() =>
    import("../collection_editor/ui/collection_editor/CollectionsStudioView")
        .then(m => ({ default: m.CollectionsStudioView }))
);

export interface RebaseNavigationProps {
    children: React.ReactNode;
}

/**
 * Navigation layer — builds and provides all CMS navigation controllers:
 * collection registry, URL controller, navigation state, side entity,
 * and the self-assembling Studio bridge.
 *
 * Also handles the collection editor config controller when enabled.
 *
 * **Independently usable**: Use this when you need CMS navigation
 * (entity tables, side panels) in a custom layout.
 *
 * @example
 * ```tsx
 * <RebaseNavigation>
 *   <MyCustomLayout>
 *     <EntityCollectionView ... />
 *   </MyCustomLayout>
 * </RebaseNavigation>
 * ```
 */
export function RebaseNavigation({ children }: RebaseNavigationProps) {
    const registry = useRebaseRegistry();
    const context = useRebaseContext();
    const adminModeController = useAdminModeController();
    const userManagement = useInternalUserManagementController();
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // ── Collection Editor resolution ──────────────────────────────────
    const collectionEditorConfig = registry.cmsConfig?.collectionEditor;
    const collectionEditorEnabled = Boolean(collectionEditorConfig);
    const collectionEditorOptions: CollectionEditorOptions | undefined = useMemo(() => {
        if (!collectionEditorConfig) return undefined;
        if (collectionEditorConfig === true) return {};
        return collectionEditorConfig;
    }, [collectionEditorConfig]);

    // ── Combine CMS and Studio Configs ────────────────────────────────
    const cmsCollections = registry.cmsConfig?.collections ?? [];

    // ── Build the navigation controllers ──────────────────────────────
    const collectionsBuilder = useMemo(() => Array.isArray(cmsCollections) ? () => [...cmsCollections] : cmsCollections, [cmsCollections]);

    const collectionRegistryController = useBuildCollectionRegistryController({ userConfigPersistence });

    const urlController = useBuildUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    // ── Build config controller internally when collection editor is enabled ──
    const rebaseClient = useRebaseClient();
    const authController = useAuthController();
    const resolvedCollections = useMemo(
        () => Array.isArray(cmsCollections) ? cmsCollections : [],
        [cmsCollections]
    );

    const internalConfigController = useLocalCollectionsConfigController(
        rebaseClient,
        resolvedCollections,
        collectionEditorEnabled ? {
            readOnly: collectionEditorOptions?.readOnly,
            getAuthToken: collectionEditorOptions?.getAuthToken ?? authController?.getAuthToken
        } : { readOnly: true }
    );

    // ── Auto-inject schema view into Studio devViews ──────────────────
    const schemaView: AppView | undefined = useMemo(() => {
        if (!collectionEditorEnabled) return undefined;
        // Only inject when Studio is registered and includes "schema" tool (or all tools)
        const studioTools = registry.studioConfig?.tools ?? ["sql", "js", "rls", "schema", "storage"];
        if (!registry.studioConfig || !studioTools.includes("schema")) return undefined;
        return {
            slug: "schema",
            name: "Edit collections",
            group: "Schema",
            icon: "view_list",
            nestedRoutes: true,
            view: (
                <Suspense fallback={<CircularProgressCenter />}>
                    <CollectionsStudioView configController={internalConfigController} />
                </Suspense>
            ),
        };
    }, [collectionEditorEnabled, registry.studioConfig, internalConfigController]);

    const devViews = useMemo(() => {
        const base = registry.studioConfig?.devViews ?? [];
        if (schemaView) return [...base, schemaView];
        return base;
    }, [registry.studioConfig?.devViews, schemaView]);

    const navigationStateController = useBuildNavigationStateController({
        plugins: registry.cmsConfig?.plugins ?? [],
        collections: collectionsBuilder,
        views: devViews,
        authController: context.authController!,
        data: context.data,
        collectionRegistryController,
        urlController,
        adminMode: adminModeController?.mode,
        userManagement: userManagement as any
    });

    // ── Inner content with all context providers ──────────────────────
    const navigationContent = (
        <StudioBridgeRegistryProvider>
            <CollectionRegistryContext.Provider value={collectionRegistryController}>
                <UrlContext.Provider value={urlController}>
                    <NavigationStateContext.Provider value={navigationStateController}>
                        <SideEntityProvider>
                            <BridgeAutoRegistrar
                                collectionRegistryController={collectionRegistryController}
                                urlController={urlController}
                                navigationStateController={navigationStateController}
                            />
                            {children}
                        </SideEntityProvider>
                    </NavigationStateContext.Provider>
                </UrlContext.Provider>
            </CollectionRegistryContext.Provider>
        </StudioBridgeRegistryProvider>
    );

    // ── Wrap with ConfigControllerProvider when collection editor is enabled ──
    if (collectionEditorEnabled) {
        return (
            <ConfigControllerProvider
                collectionConfigController={internalConfigController}
                pathSuggestions={collectionEditorOptions?.pathSuggestions}
            >
                {navigationContent}
            </ConfigControllerProvider>
        );
    }

    return navigationContent;
}

/**
 * Internal component that auto-registers CMS controllers into the
 * self-assembling Studio bridge. Must be rendered inside both the
 * navigation contexts and the StudioBridgeRegistryProvider.
 */
function BridgeAutoRegistrar({
    collectionRegistryController,
    urlController,
    navigationStateController,
}: {
    collectionRegistryController: any;
    urlController: any;
    navigationStateController: any;
}) {
    useBridgeRegistration("collectionRegistry", collectionRegistryController);
    useBridgeRegistration("urlController", urlController);
    useBridgeRegistration("navigationState", navigationStateController);
    return null;
}
