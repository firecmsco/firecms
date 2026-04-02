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
    useBackendStorageSource,
    useBuildAdminModeController,
    useBuildCMSUrlController,
    useBuildCollectionRegistryController,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationStateController,
    UIReferenceView,
} from "@rebasepro/core";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { usePostgresClientDriver } from "@rebasepro/postgresql";
import { CollectionsStudioView, RLSEditor, SQLEditor, useCollectionEditorPlugin, useLocalCollectionsConfigController } from "@rebasepro/studio";
import { CMSView } from "@rebasepro/types";
import { createRebaseClient } from "@rebasepro/client";
import { buildRebaseData } from "@rebasepro/common";
import { collections } from "virtual:rebase-collections";
import { Route, Outlet } from "react-router-dom";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const modeController = useBuildModeController();
    const adminModeController = useBuildAdminModeController();
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const authController = useRebaseAuthController({
        apiUrl: API_URL,
        googleClientId: GOOGLE_CLIENT_ID
    });

    const storageSource = useBackendStorageSource({
        apiUrl: API_URL,
        getAuthToken: authController.getAuthToken
    });

    const userManagement = useBackendUserManagement({
        apiUrl: API_URL,
        getAuthToken: authController.getAuthToken,
        currentUser: authController.user
    });

    const rebaseClient = React.useMemo(() => createRebaseClient({
        baseUrl: API_URL,
        websocketUrl: API_URL.replace(/^http/, "ws"),
        auth: {
            // We pass the authController's getToken to the client.
            // But wait, createRebaseClient also creates its own auth.
            // For dogfooding, authController could eventually be rewritten
            // to just wrap rebaseClient.auth. For now, since there's custom logic:
        }
    }), [API_URL]);

    // Force the client's auth getter to use the controller if needed
    // Or just assign getAuthToken directly to the WS client if we had a setter.
    // Wait, the client sets `wsClient.getAuthToken = async () => auth.getSession()`.
    // Instead we can overwrite:
    if (rebaseClient.ws) {
         rebaseClient.ws.setAuthTokenGetter(async () => {
             const token = await authController.getAuthToken();
             return token ?? "";
         });
    }

    const postgresDelegate = usePostgresClientDriver({
        wsClient: rebaseClient.ws
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin();
    const collectionConfigController = useLocalCollectionsConfigController(
        API_URL,
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
        }
    ], [collectionConfigController]);

    const plugins = React.useMemo(() => [dataEnhancementPlugin, collectionEditorPlugin], [dataEnhancementPlugin, collectionEditorPlugin]);

    const navigationStateController = useBuildNavigationStateController({
        plugins,
        collections: collectionsBuilder,
        views: devViews,
        authController,
        data: buildRebaseData(postgresDelegate),
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
                        collectionRegistryController={collectionRegistryController}
                        cmsUrlController={cmsUrlController}
                        navigationStateController={navigationStateController}
                        authController={authController}
                        userConfigPersistence={userConfigPersistence}
                        driver={postgresDelegate}
                        storageSource={storageSource}
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
