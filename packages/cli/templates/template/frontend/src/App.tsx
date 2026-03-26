import React, { useCallback } from "react";

import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import {
    RebaseLoginView,
    useBackendUserManagement,
    useRebaseAuthController
} from "@rebasepro/auth";
import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    Rebase,
    RebaseRoute,
    ModeControllerProvider,
    NotFoundPage,
    Scaffold,
    SideDialogs,
    RebaseRoutes,
    SnackbarProvider,
    ContentHomePage,
    useBackendStorageSource,
    useBuildCMSUrlController,
    useBuildCollectionRegistryController,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationStateController
} from "@rebasepro/core";
import { usePostgresClientDataSource } from "@rebasepro/postgresql";
import { collections } from "virtual:rebase-collections";
import { Route, Outlet } from "react-router-dom";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const modeController = useBuildModeController();
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

    const collectionsBuilder = useCallback(() => {
        return [...collections];
    }, []);

    const collectionRegistryController = useBuildCollectionRegistryController({ userConfigPersistence });
    const cmsUrlController = useBuildCMSUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    const navigationStateController = useBuildNavigationStateController({
        collections: collectionsBuilder,
        authController,
        dataSource: postgresDelegate,
        collectionRegistryController,
        cmsUrlController,
        userManagement
    });

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
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
                            return <CircularProgressCenter />;
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
                                        <AppBar />
                                        <Drawer />
                                        <Outlet />
                                        <SideDialogs />
                                    </Scaffold>
                                }>
                                    <Route path={"/"} element={<ContentHomePage />} />
                                    <Route path={"/c/*"} element={<RebaseRoute />} />
                                    <Route path={"*"} element={<NotFoundPage />} />
                                </Route>
                            </RebaseRoutes>
                        );
                    }}
                </Rebase>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
