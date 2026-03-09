import React, { useCallback } from "react";

import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import {
    FireCMSLoginView,
    useBackendUserManagement,
    useFireCMSAuthController
} from "@firecms/auth";
import {
    AdminModeControllerProvider,
    AdminModeSyncer,
    AppBar,
    CircularProgressCenter,
    DefaultHomePage,
    Drawer,
    FireCMS,
    HomePageRoute,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBackendStorageSource,
    useBuildAdminModeController,
    useBuildCMSUrlController,
    useBuildCollectionRegistryController,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationStateController
} from "@firecms/core";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { usePostgresClientDataSource } from "@firecms/postgresql";
import { CollectionsStudioView, RLSEditor, SQLEditor, useCollectionEditorPlugin, useLocalCollectionsConfigController } from "@firecms/studio";
import { CMSView } from "@firecms/types";
import { collections } from "virtual:firecms-collections";
import { Route } from "react-router-dom";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const modeController = useBuildModeController();
    const adminModeController = useBuildAdminModeController();
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const authController = useFireCMSAuthController({
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
                    <FireCMS
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
                                    <FireCMSLoginView
                                        authController={authController}
                                        googleEnabled={!!GOOGLE_CLIENT_ID}
                                        googleClientId={GOOGLE_CLIENT_ID}
                                    />
                                );
                            }

                            return (
                                <Scaffold autoOpenDrawer={false}>
                                    <AdminModeSyncer devViews={devViews} />
                                    <AppBar title={"Rebase"} />
                                    <Drawer />
                                    <NavigationRoutes
                                        homePage={<DefaultHomePage />}
                                    />
                                    <SideDialogs />
                                </Scaffold>
                            );
                        }}
                    </FireCMS>
                </AdminModeControllerProvider>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
