import React, { useMemo } from "react";
import { Route, Outlet } from "react-router-dom";
import {
    useRebaseRegistry,
    useRebaseContext,
    useAdminModeController,
    RebaseRoutes,
    useBuildLocalConfigurationPersistence,
    UserSettingsView,
    UIReferenceView,
    NotFoundPage,
    useInternalUserManagementController,
    StudioBridgeProvider,
} from "@rebasepro/core";
import { CircularProgressCenter } from "@rebasepro/ui";
import { LoginView } from "@rebasepro/core";

import { useBuildNavigationStateController } from "../hooks/navigation/useBuildNavigationStateController";
import { useBuildUrlController } from "../hooks/navigation/useBuildUrlController";
import { useBuildCollectionRegistryController } from "../hooks/navigation/useBuildCollectionRegistryController";

import { CollectionRegistryContext } from "../hooks/navigation/contexts/CollectionRegistryContext";
import { UrlContext } from "../hooks/navigation/contexts/UrlContext";
import { NavigationStateContext } from "../hooks/navigation/contexts/NavigationStateContext";

import { SideEntityProvider } from "./SideEntityProvider";
import { Scaffold } from "./app/Scaffold";
import { AppBar } from "./app/AppBar";
import { Drawer } from "./app/Drawer";
import { SideDialogs } from "./SideDialogs";
import { CollectionEditorDialogs } from "./CollectionEditorDialogs";
import { AdminModeSyncer } from "./AdminModeSyncer";
import { ContentHomePage } from "./HomePage/ContentHomePage";
import { UsersView } from "./admin/UsersView";
import { RolesView } from "./admin/RolesView";
import { RebaseRoute } from "../routes/RebaseRoute";
import { CustomViewRoute } from "../routes/CustomViewRoute";
import { useSideEntityController } from "../hooks/useSideEntityController";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import type { AppView } from "@rebasepro/types";

export interface RebaseShellProps {
    title?: string;
    appBar?: React.ReactNode;
    drawer?: React.ReactNode;
    autoOpenDrawer?: boolean;
    children?: React.ReactNode;
}

export function RebaseShell(props: RebaseShellProps) {
    const {
        title = "Rebase",
        appBar,
        drawer,
        autoOpenDrawer = false,
        children
    } = props;

    const registry = useRebaseRegistry();
    const context = useRebaseContext();
    const adminModeController = useAdminModeController();
    const userManagement = useInternalUserManagementController();
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // 1. Combine CMS and Studio Configs
    const devViews = registry.studioConfig?.devViews ?? [];
    const cmsCollections = registry.cmsConfig?.collections ?? [];
    const cmsViews = registry.cmsConfig?.entityViews ?? [];
    const cmsHomePage = registry.cmsConfig?.homePage ?? <ContentHomePage />;
    const studioHomePage = registry.studioConfig?.homePage;

    // 2. Build the navigation controllers
    const collectionsBuilder = useMemo(() => Array.isArray(cmsCollections) ? () => [...cmsCollections] : cmsCollections, [cmsCollections]);

    const collectionRegistryController = useBuildCollectionRegistryController({ userConfigPersistence });
    
    // NOTE: basePath and baseCollectionPath would need to be read from Rebase props, 
    // but we can default them for now.
    const urlController = useBuildUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    const navigationStateController = useBuildNavigationStateController({
        plugins: registry.cmsConfig?.plugins ?? [],
        collections: collectionsBuilder,
        views: devViews,
        authController: context.authController!,
        data: context.data,
        collectionRegistryController,
        urlController,
        adminMode: adminModeController.mode,
        userManagement: userManagement as any
    });

    const combinedViews = useMemo(() => [
        ...(navigationStateController.views ?? []),
        ...(navigationStateController.adminViews ?? [])
    ], [navigationStateController.views, navigationStateController.adminViews]);

    // Auth gate and loading logic
    const authController = context.authController;
    if (authController?.initialLoading) {
        return <CircularProgressCenter size={"large"} />;
    }

    if (!authController?.user) {
        // Use custom login view if provided, otherwise default to RebaseLoginView
        const ActiveLoginView = registry.authConfig?.loginView ?? (
            <LoginView authController={authController as any} />
        );
        return <>{ActiveLoginView}</>;
    }

    // Render AppBar and Drawer, allowing overrides
    // We import AppBar and Drawer directly from within this package just as the user App.tsx did.
    // In cms/components/index.ts we export `AppBar` and `Drawer`. Let's assume standard names.
    const ActiveAppBar = appBar ?? <AppBar />;
    // We need to pass props to Drawer. In React we can clone element or just render it if it's already an element.
    // The user App.tsx did `<Drawer title={"Rebase"} logoDestination={adminModeController.mode === "studio" ? "/s" : "/"} />`
    // We'll wrap it or let the user provide the completely rendered element. If they didn't, we use the default.
    const ActiveDrawer = drawer ?? (
        <Drawer 
            title={title} 
            logoDestination={adminModeController.mode === "studio" ? "/s" : "/"} 
        />
    );

    return (
        <CollectionRegistryContext.Provider value={collectionRegistryController}>
            <UrlContext.Provider value={urlController}>
                <NavigationStateContext.Provider value={navigationStateController}>
                    <SideEntityProvider>
                        <StudioBridgeAutoProvider
                            collectionRegistryController={collectionRegistryController}
                            urlController={urlController}
                            navigationStateController={navigationStateController}
                        >
                        <RebaseRoutes>
                            {/* Inner App Shell Route */}
                            <Route element={
                                <Scaffold autoOpenDrawer={autoOpenDrawer}>
                                    <AdminModeSyncer devViews={devViews} />
                                    {ActiveAppBar}
                                    {ActiveDrawer}
                                    <Outlet />
                                    <SideDialogs />
                                </Scaffold>
                            }>
                                {/* Core CMS Routes */}
                                <Route path={"/"} element={cmsHomePage} />
                                {registry.studioConfig && (
                                    <Route path={"/s"} element={studioHomePage} />
                                )}

                                <Route path={"/c/*"} element={<RebaseRoute />} />
                                <Route path={"/settings"} element={<UserSettingsView />} />
                                {userManagement && <Route path={"/roles"} element={<RolesView userManagement={userManagement} />} />}
                                {userManagement && <Route path={"/users"} element={<UsersView userManagement={userManagement} />} />}

                                {/* Hidden debug route */}
                                <Route path={"/debug/ui"} element={<UIReferenceView />} />

                                {/* Custom Registered Views */}
                                {combinedViews.map(view => {
                                    const slugs = Array.isArray(view.slug) ? view.slug : [view.slug];
                                    return slugs.flatMap(slug => {
                                        const routes = [
                                            <Route key={slug} path={slug} element={<CustomViewRoute view={view} />} />
                                        ];
                                        if (view.nestedRoutes) {
                                            routes.push(
                                                <Route key={slug + "/*"} path={slug + "/*"} element={<CustomViewRoute view={view} />} />
                                            );
                                        }
                                        return routes;
                                    });
                                })}

                                {/* User Provided Custom Routes */}
                                {children}

                                <Route path={"*"} element={<NotFoundPage />} />
                            </Route>
                        </RebaseRoutes>
                        </StudioBridgeAutoProvider>
                        <CollectionEditorDialogs />
                    </SideEntityProvider>
                </NavigationStateContext.Provider>
            </UrlContext.Provider>
        </CollectionRegistryContext.Provider>
    );
}

/**
 * Internal component that reads CMS controllers from context and feeds them
 * into the Studio Bridge. This enables Studio tools (SQL/JS/RLS editors)
 * to optionally use CMS features (side entity forms, collection registry, etc.).
 */
function StudioBridgeAutoProvider({
    collectionRegistryController,
    urlController,
    navigationStateController,
    children,
}: {
    collectionRegistryController: any;
    urlController: any;
    navigationStateController: any;
    children: React.ReactNode;
}) {
    const sideEntity = useSideEntityController();
    const breadcrumbs = useBreadcrumbsController();
    
    const bridgeValue = useMemo(() => ({
        collectionRegistry: collectionRegistryController,
        sideEntityController: sideEntity,
        urlController,
        navigationState: navigationStateController,
        breadcrumbs,
    }), [collectionRegistryController, sideEntity, urlController, navigationStateController, breadcrumbs]);
    
    return (
        <StudioBridgeProvider value={bridgeValue}>
            {children}
        </StudioBridgeProvider>
    );
}
