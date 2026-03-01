import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

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
    useBuildCollectionRegistryController,
    useBuildCMSUrlController,
    useBuildNavigationStateController,
    useBackendStorageSource,
    useBuildAdminModeController,
    AdminModeControllerProvider,
    SQLEditor,
    DefaultHomePage,
    NavigationCard,
    IconForView
} from "@firecms/core";
import { useLocalCollectionsConfigController, useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { usePostgresClientDataSource } from "@firecms/postgresql";
import {
    useFireCMSAuthController,
    FireCMSLoginView,
    useBackendUserManagement
} from "@firecms/auth";
import { collections } from "virtual:firecms-collections";
import { StorageIcon, PersonIcon, ShieldIcon } from "@firecms/ui";
import { CMSView, HomePageSection } from "@firecms/types";

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
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions: () => ({ createCollections: true, editCollections: true, deleteCollections: true })
    });

    const collectionsBuilder = useCallback(() => {
        return [...collections];
    }, []);

    const devViews: CMSView[] = [
        {
            slug: "data",
            name: "Data",
            group: "Developer",
            icon: "storage",
            description: "Execute raw SQL queries",
            view: <SQLEditor />
        }
    ];

    // adminViews are now auto-injected by core based on userManagement

    const collectionRegistryController = useBuildCollectionRegistryController({ userConfigPersistence });

    const navigate = useNavigate();

    const cmsUrlController = useBuildCMSUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    const navigationStateController = useBuildNavigationStateController({
        plugins: [dataEnhancementPlugin, collectionEditorPlugin],
        collections: collectionsBuilder,
        views: adminModeController.mode === "developer" ? devViews : undefined,
        authController,
        dataSourceDelegate: postgresDelegate,
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
                        dataSourceDelegate={postgresDelegate}
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

                            const isDev = adminModeController.mode === "developer";
                            const devSection: HomePageSection = {
                                key: "developer",
                                title: "Developer Dashboard",
                                children: (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {devViews.map(view => (
                                            <NavigationCard
                                                key={view.slug as string}
                                                name={view.name}
                                                description={view.description}
                                                icon={<IconForView collectionOrView={view} />}
                                                actions={null}
                                                onClick={() => navigate(cmsUrlController.buildCMSUrlPath(view.slug as string))}
                                            />
                                        ))}
                                    </div>
                                )
                            };

                            return (
                                <Scaffold autoOpenDrawer={false}>
                                    <AppBar title={"Rebase"} />
                                    <Drawer />
                                    <NavigationRoutes
                                        homePage={<DefaultHomePage
                                            sections={isDev ? [devSection] : undefined}
                                            hiddenGroups={isDev ? ["Developer"] : undefined}
                                        />}
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
