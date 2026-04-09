import { AdminModeSyncer, AppBar, ContentHomePage, Drawer, RolesView, Scaffold, UsersView } from "@rebasepro/cms";
import { useBuildNavigationStateController } from "@rebasepro/cms";
import { SideDialogs, useBuildUrlController, useBuildCollectionRegistryController } from "@rebasepro/cms";
import React from "react";

import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import {
    RebaseLoginView,
    useBackendUserManagement,
    useRebaseAuthController
} from "@rebasepro/auth";
import { AdminModeControllerProvider, Rebase, ModeControllerProvider, NotFoundPage, RebaseI18nProvider, RebaseRoutes, SnackbarProvider, UserSettingsView, useBuildAdminModeController, useBuildLocalConfigurationPersistence, useBuildModeController, UIReferenceView } from "@rebasepro/core";
import { RebaseRoute, CustomViewRoute, SideEntityProvider, CollectionRegistryContext, UrlContext, NavigationStateContext } from "@rebasepro/cms";
import { CircularProgressCenter } from "@rebasepro/ui";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { CollectionsStudioView, JSEditor, RLSEditor, SQLEditor, StorageView, StudioHomePage, useCollectionEditorPlugin, useLocalCollectionsConfigController } from "@rebasepro/studio";
import { AppView } from "@rebasepro/types";
import { createRebaseClient } from "@rebasepro/client";
import { collections } from "virtual:rebase-collections";
import { Route, Outlet } from "react-router-dom";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const modeController = useBuildModeController();
    const adminModeController = useBuildAdminModeController();
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const rebaseClient = React.useMemo(() => createRebaseClient({
        baseUrl: API_URL,
        websocketUrl: API_URL.replace(/^http/, "ws")
    }), [API_URL]);

    const authController = useRebaseAuthController({
        client: rebaseClient,
        googleClientId: GOOGLE_CLIENT_ID
    });

    const userManagement = useBackendUserManagement({
        client: rebaseClient,
        currentUser: authController.user
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin();
    const collectionConfigController = useLocalCollectionsConfigController(
        rebaseClient,
        collections,
        {
            getAuthToken: authController.getAuthToken
        }
    );
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });

    const collectionsBuilder = () => [...collections];

    const collectionRegistryController = useBuildCollectionRegistryController({ userConfigPersistence });
    const urlController = useBuildUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    const devViews: AppView[] = React.useMemo(() => [
        {
            slug: "sql",
            name: "SQL Console",
            group: "Database",
            icon: "terminal",
            description: "Execute SQL queries",
            view: <SQLEditor />
        },
        {
            slug: "js",
            name: "JS Console",
            group: "Database",
            icon: "code",
            description: "Execute JavaScript with the Rebase SDK",
            view: <JSEditor />
        },
        {
            slug: "rls",
            name: "RLS Policies",
            group: "Database",
            icon: "security",
            description: "Row Level Security",
            view: <RLSEditor />
        },
        {
            slug: "schema",
            name: "Edit collections",
            group: "Schema",
            icon: "view_list",
            nestedRoutes: true,
            view: <CollectionsStudioView configController={collectionConfigController} />
        },
        {
            slug: "storage",
            name: "Storage",
            group: "Storage",
            icon: "cloud",
            description: "Browse and manage storage files",
            view: <StorageView />
        }
    ], [collectionConfigController]);

    const plugins = React.useMemo(() => [dataEnhancementPlugin, collectionEditorPlugin], [dataEnhancementPlugin, collectionEditorPlugin]);

    const navigationStateController = useBuildNavigationStateController({
        plugins,
        collections: collectionsBuilder,
        views: devViews,
        authController,
        data: rebaseClient.data,
        collectionRegistryController,
        urlController,
        adminMode: adminModeController.mode,
        userManagement: userManagement
    });

    return (
        <RebaseI18nProvider>
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <AdminModeControllerProvider value={adminModeController}>
                    <CollectionRegistryContext.Provider value={collectionRegistryController}>
                        <UrlContext.Provider value={urlController}>
                            <NavigationStateContext.Provider value={navigationStateController}>
                                <Rebase
                                    apiUrl={API_URL}
                                    client={rebaseClient}
                                    authController={authController}
                                    userConfigPersistence={userConfigPersistence}
                                    storageSource={rebaseClient.storage}
                                >
                        {({ loading }) => {
                            if (loading || authController.initialLoading) {
                                return <CircularProgressCenter size={"large"} />;
                            }

                            if (!authController.user) {
                                return (
                                    <RebaseLoginView
                                        authController={authController}
                                        googleEnabled={!!GOOGLE_CLIENT_ID}
                                        googleClientId={GOOGLE_CLIENT_ID}
                                    />
                                );
                            }

                            return (
                                <SideEntityProvider>
                                    <RebaseRoutes>
                                        <Route element={
                                            <Scaffold autoOpenDrawer={false}>
                                                <AdminModeSyncer devViews={devViews} />
                                                <AppBar />
                                                <Drawer
                                                    title={"Rebase"}
                                                    logoDestination={adminModeController.mode === "studio" ? "/s" : "/"}
                                                />
                                                <Outlet />
                                                <SideDialogs />
                                            </Scaffold>
                                        }>
                                            <Route path={"/"} element={<ContentHomePage />} />
                                            <Route path={"/s"} element={<StudioHomePage />} />

                                            <Route path={"/c/*"} element={<RebaseRoute />} />
                                            <Route path={"/settings"} element={<UserSettingsView />} />
                                            <Route path={"/roles"} element={<RolesView userManagement={userManagement} />} />
                                            <Route path={"/users"} element={<UsersView userManagement={userManagement} />} />

                                            {/* Hidden debug route — not in sidebar */}
                                            <Route path={"/debug/ui"} element={<UIReferenceView />} />

                                            {[...(navigationStateController.views ?? []), ...(navigationStateController.adminViews ?? [])].map(view => {
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

                                            <Route path={"*"} element={<NotFoundPage />} />
                                        </Route>
                                    </RebaseRoutes>
                                </SideEntityProvider>
                            );
                        }}
                                </Rebase>
                            </NavigationStateContext.Provider>
                        </UrlContext.Provider>
                    </CollectionRegistryContext.Provider>
                </AdminModeControllerProvider>
            </ModeControllerProvider>
        </SnackbarProvider>
        </RebaseI18nProvider>
    );
}
