import React, { useCallback } from "react";

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
    CustomCMSRoute,
    ContentHomePage,
    StudioHomePage,
    Drawer,
    Rebase,
    RebaseRoute,
    ModeControllerProvider,
    NotFoundPage,
    RolesView,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    UserSettingsView,
    UsersView,
    useBackendStorageSource,
    useBuildAdminModeController,
    useBuildCMSUrlController,
    useBuildCollectionRegistryController,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationStateController
} from "@rebasepro/core";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { usePostgresClientDataSource } from "@rebasepro/postgresql";
import { CollectionsStudioView, RLSEditor, SQLEditor, useCollectionEditorPlugin, useLocalCollectionsConfigController } from "@rebasepro/studio";
import { CMSView } from "@rebasepro/types";
import { collections } from "virtual:rebase-collections";
import { Route, Routes, Outlet } from "react-router-dom";

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

    const postgresDelegate = usePostgresClientDataSource({
        websocketUrl: API_URL.replace(/^http/, "ws"),
        getAuthToken: authController.initialLoading ? undefined : authController.getAuthToken
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin();
    const collectionConfigController = useLocalCollectionsConfigController(API_URL, collections);
    const configPermissions = useCallback(() => ({ createCollections: true, editCollections: true, deleteCollections: true }), []);
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions
    });

    const collectionsBuilder = useCallback(() => {
        return [...collections];
    }, []);

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
            slug: ["schema", "schema/*"] as any,
            name: "Edit collections",
            group: "Schema",
            icon: "view_list",
            view: <CollectionsStudioView configController={collectionConfigController} />
        }
    ], [collectionConfigController]);

    const plugins = React.useMemo(() => [dataEnhancementPlugin, collectionEditorPlugin], [dataEnhancementPlugin, collectionEditorPlugin]);

    const navigationStateController = useBuildNavigationStateController({
        plugins,
        collections: collectionsBuilder,
        views: devViews,
        authController,
        dataSource: postgresDelegate,
        collectionRegistryController,
        cmsUrlController,
        adminMode: adminModeController.mode,
        userManagement: userManagement
    });

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <AdminModeControllerProvider value={adminModeController}>
                    <Rebase
                        collectionRegistryController={collectionRegistryController}
                        cmsUrlController={cmsUrlController}
                        navigationStateController={navigationStateController}
                        authController={authController}
                        userConfigPersistence={userConfigPersistence}
                        dataSource={postgresDelegate}
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
                                <Routes>
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

                                        {devViews.flatMap(view =>
                                            (Array.isArray(view.slug) ? view.slug : [view.slug]).map(path => (
                                                <Route key={path} path={path} element={<CustomCMSRoute cmsView={view} />} />
                                            ))
                                        )}

                                        <Route path={"*"} element={<NotFoundPage />} />
                                    </Route>
                                </Routes>
                            );
                        }}
                    </Rebase>
                </AdminModeControllerProvider>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
