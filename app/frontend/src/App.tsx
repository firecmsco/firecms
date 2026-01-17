import React, { useCallback, useEffect, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useBackendStorageSource
} from "@firecms/core";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { usePostgresClientDataSource } from "@firecms/postgresql";
import {
    useCustomAuthController,
    CustomLoginView,
    useBackendUserManagement,
    createUserManagementAdminViews
} from "@firecms/auth";
import {
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";
import { collections } from "shared";
import { firestoreCollections } from "./collections";
import { firebaseConfig } from "./firebase_config";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    // Controller used to manage the dark or light color mode
    const modeController = useBuildModeController();

    // Controller for saving some user preferences locally
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Custom auth controller (replaces Firebase auth)
    const authController = useCustomAuthController({
        apiUrl: API_URL,
        googleClientId: GOOGLE_CLIENT_ID
    });

    // Backend storage source (replaces Firebase Storage)
    const storageSource = useBackendStorageSource({
        apiUrl: API_URL,
        getAuthToken: authController.getAuthToken
    });

    // User management for admin views
    const userManagement = useBackendUserManagement({
        apiUrl: API_URL,
        getAuthToken: authController.getAuthToken,
        currentUser: authController.user
    });

    // Admin views for user/role management
    const adminViews = useMemo(() =>
        createUserManagementAdminViews({
            userManagement,
            apiUrl: API_URL,
            getAuthToken: authController.getAuthToken
        }),
        [userManagement, authController.getAuthToken]
    );

    // Initialize Firebase for Firestore
    const { firebaseApp, firebaseConfigLoading } = useInitialiseFirebase({
        firebaseConfig
    });

    // Firestore delegate for Firestore collections
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        localTextSearchEnabled: true
    });

    // PostgreSQL delegate with WebSocket connection - pass auth token getter
    // Only create with getAuthToken once auth is ready to prevent premature connections
    const postgresDelegate = usePostgresClientDataSource({
        websocketUrl: API_URL.replace(/^http/, "ws"),
        getAuthToken: authController.initialLoading ? undefined : authController.getAuthToken
    });

    // Authenticate WebSocket when user is available (and auth loading is complete)
    useEffect(() => {
        const authenticateWebSocket = async () => {
            if (authController.user && !authController.initialLoading && postgresDelegate.client) {
                try {
                    const token = await authController.getAuthToken();
                    await postgresDelegate.client.authenticate(token);
                    console.log("WebSocket authenticated successfully");
                } catch (error) {
                    console.error("Failed to authenticate WebSocket:", error);
                }
            }
        };
        authenticateWebSocket();
    }, [authController.user, authController.initialLoading, postgresDelegate.client, authController.getAuthToken]);

    const dataEnhancementPlugin = useDataEnhancementPlugin();

    // Build collections from both PostgreSQL and Firestore sources
    const collectionsBuilder = useCallback(() => {
        // PostgreSQL collections (default datasource)
        const postgresCollections = [...collections];

        // Firestore collections with datasource override
        const firestoreCollectionsWithOverride = firestoreCollections.map(c => ({
            ...c,
            overrides: { dataSourceDelegate: firestoreDelegate }
        }));

        return [
            ...postgresCollections,
            ...firestoreCollectionsWithOverride
        ];
    }, [firestoreDelegate]);

    const navigationController = useBuildNavigationController({
        plugins: [dataEnhancementPlugin],
        collections: collectionsBuilder,
        views: adminViews,
        authController,
        dataSourceDelegate: postgresDelegate
    });

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={postgresDelegate}
                    storageSource={storageSource}
                >
                    {({ loading }) => {
                        // Show loading while initializing
                        if (loading || authController.initialLoading || firebaseConfigLoading) {
                            return <CircularProgressCenter size={"large"} />;
                        }

                        // Show login if no user (backend handles auth validation)
                        if (!authController.user) {
                            return (
                                <CustomLoginView
                                    authController={authController}
                                    googleEnabled={!!GOOGLE_CLIENT_ID}
                                    googleClientId={GOOGLE_CLIENT_ID}
                                />
                            );
                        }

                        // User is authenticated - show main app
                        return (
                            <Scaffold autoOpenDrawer={false}>
                                <AppBar title={"PostgreSQL Backend Demo"} />
                                <Drawer />
                                <NavigationRoutes />
                                <SideDialogs />
                            </Scaffold>
                        );
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
