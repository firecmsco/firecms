import React from "react";

import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import {
    RebaseLoginView,
    useBackendUserManagement,
    useRebaseAuthController
} from "@rebasepro/auth";
import {
    AdminModeControllerProvider,
    AdminModeSyncer,
    AppBar,
    CircularProgressCenter,
    ContentHomePage,
    StudioHomePage,
    Drawer,
    Rebase,
    RebaseRoute,
    ModeControllerProvider,
    NotFoundPage,
    RebaseI18nProvider,
    RolesView,
    Scaffold,
    SideDialogs,
    RebaseRoutes,
    SnackbarProvider,
    UserSettingsView,
    UsersView,
    useBuildAdminModeController,
    useBuildCMSUrlController,
    useBuildCollectionRegistryController,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationStateController,
    UIReferenceView,
    CustomCMSRoute
} from "@rebasepro/core";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { CollectionsStudioView, JSEditor, RLSEditor, SQLEditor, StorageView, useCollectionEditorPlugin, useLocalCollectionsConfigController } from "@rebasepro/studio";
import { CMSView } from "@rebasepro/types";
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
    const cmsUrlController = useBuildCMSUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    const devViews: CMSView[] = React.useMemo(() => [
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
        cmsUrlController,
        adminMode: adminModeController.mode,
        userManagement: userManagement
    });

    return (
        <RebaseI18nProvider>
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <AdminModeControllerProvider value={adminModeController}>
                    <Rebase
                        apiUrl={API_URL}
                        client={rebaseClient}
                        collectionRegistryController={collectionRegistryController}
                        cmsUrlController={cmsUrlController}
                        navigationStateController={navigationStateController}
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
                                                    <Route key={slug} path={slug} element={<CustomCMSRoute cmsView={view} />} />
                                                ];
                                                if (view.nestedRoutes) {
                                                    routes.push(
                                                        <Route key={slug + "/*"} path={slug + "/*"} element={<CustomCMSRoute cmsView={view} />} />
                                                    );
                                                }
                                                return routes;
                                            });
                                        })}

                                        <Route path={"*"} element={<NotFoundPage />} />
                                    </Route>
                                </RebaseRoutes>
                            );
                        }}
                    </Rebase>
                </AdminModeControllerProvider>
            </ModeControllerProvider>
        </SnackbarProvider>
        </RebaseI18nProvider>
    );
}
