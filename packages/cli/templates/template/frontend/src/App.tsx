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
    useBuildCMSUrlController,
    useBuildCollectionRegistryController,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationStateController
} from "@rebasepro/core";
import { collections } from "virtual:rebase-collections";
import { Route, Outlet } from "react-router-dom";
import { createRebaseClient } from "@rebasepro/client";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const modeController = useBuildModeController();
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
        data: rebaseClient.data,
        collectionRegistryController,
        cmsUrlController,
        userManagement
    });

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <Rebase
                    client={rebaseClient}
                    apiUrl={API_URL}
                    collectionRegistryController={collectionRegistryController}
                    cmsUrlController={cmsUrlController}
                    navigationStateController={navigationStateController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    storageSource={rebaseClient.storage}
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
