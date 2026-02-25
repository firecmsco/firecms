import React, { useCallback, useMemo } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    FireCMSLogo,
    ModeControllerProvider,
    NavigationRoutes,
    DeveloperHomePage,
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
    DrawerNavigationItem,
    useApp,
    SQLEditor,
    UIStyleGuide
} from "@firecms/core";
import { useLocalCollectionsConfigController, useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { usePostgresClientDataSource } from "@firecms/postgresql";
import {
    useFireCMSAuthController,
    FireCMSLoginView,
    useBackendUserManagement,
    UsersView,
    RolesView
} from "@firecms/auth";
import { collections } from "virtual:firecms-collections";
import { Container, Typography, StorageIcon, PersonIcon, ShieldIcon, Tooltip, cls } from "@firecms/ui";
import { Link } from "react-router-dom";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


const devNavItems = [
    { url: "/dev/data", name: "Data", icon: <StorageIcon size="small" /> },
    { url: "/dev/ui", name: "UI Guide", icon: <StorageIcon size="small" /> }, // Using StorageIcon as placeholder or a better one if found
    { url: "/dev/users", name: "Users", icon: <PersonIcon size="small" /> },
    { url: "/dev/roles", name: "Roles", icon: <ShieldIcon size="small" /> },
];

/**
 * Developer Mode drawer using the same DrawerNavigationItem system as the CMS.
 */
function DevDrawer() {
    const { drawerOpen, drawerHovered } = useApp();
    const tooltipsOpen = drawerHovered && !drawerOpen;

    return (
        <div className="flex flex-col h-full relative grow w-full">

            {/* Logo matching DrawerLogo */}
            <div
                style={{
                    transition: "padding 100ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                    padding: drawerOpen ? "32px 144px 0px 24px" : "72px 12px 0px 12px"
                }}
                className={cls("cursor-pointer rounded-xs ml-3 mr-1")}>
                <Tooltip title={"Home"}
                    sideOffset={20}
                    side="right">
                    <Link
                        className={"block"}
                        to="/dev">
                        <FireCMSLogo />
                    </Link>
                </Tooltip>
            </div>

            <div className={"mt-4 flex-grow overflow-scroll no-scrollbar"}
                style={{
                    maskImage: "linear-gradient(to bottom, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)",
                }}>

                {/* Group wrapper matching DrawerNavigationGroup container */}
                <div className={"bg-surface-50 dark:bg-surface-800/30 my-4 rounded-lg ml-3 mr-1"}>
                    {devNavItems.map((item) => (
                        <DrawerNavigationItem
                            key={item.url}
                            name={item.name}
                            icon={item.icon}
                            url={item.url}
                            drawerOpen={drawerOpen}
                            tooltipsOpen={tooltipsOpen}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

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

    const collectionRegistryController = useBuildCollectionRegistryController({ userConfigPersistence });

    const cmsUrlController = useBuildCMSUrlController({
        basePath: "/",
        baseCollectionPath: "/c",
        collectionRegistryController
    });

    const navigationStateController = useBuildNavigationStateController({
        plugins: [dataEnhancementPlugin, collectionEditorPlugin],
        collections: collectionsBuilder,
        views: [],
        authController,
        dataSourceDelegate: postgresDelegate,
        collectionRegistryController,
        cmsUrlController,
        adminMode: adminModeController.mode
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

                            return (
                                <AppLayout
                                    adminModeController={adminModeController}
                                    userManagement={userManagement}
                                    authController={authController}
                                />
                            );
                        }}
                    </FireCMS>
                </AdminModeControllerProvider>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}

/**
 * Inner component that uses useLocation() to decide which layout to render.
 * This runs inside the Router so useLocation() works.
 */
function AppLayout({
    adminModeController,
    userManagement,
    authController
}: {
    adminModeController: ReturnType<typeof useBuildAdminModeController>;
    userManagement: ReturnType<typeof useBackendUserManagement>;
    authController: ReturnType<typeof useFireCMSAuthController>;
}) {
    const location = useLocation();
    const isDev = location.pathname === "/dev" || location.pathname.startsWith("/dev/");

    // Keep adminModeController in sync with URL
    React.useEffect(() => {
        if (isDev && adminModeController.mode !== "developer") {
            adminModeController.setMode("developer");
        } else if (!isDev && adminModeController.mode !== "editor") {
            adminModeController.setMode("editor");
        }
    }, [isDev, adminModeController]);

    // Developer Mode: standalone layout with dev-specific drawer
    if (isDev) {
        return (
            <Scaffold autoOpenDrawer={false}>
                <AppBar title={"Developer Console"} />
                <Drawer>
                    <DevDrawer />
                </Drawer>
                <Routes>
                    <Route path="/dev" element={<DeveloperHomePage />} />
                    <Route path="/dev/data" element={<SQLEditor />} />
                    <Route path="/dev/ui" element={<UIStyleGuide />} />
                    <Route path="/dev/users" element={
                        <UsersView
                            userManagement={userManagement}
                            apiUrl={API_URL}
                            getAuthToken={authController.getAuthToken}
                        />
                    } />
                    <Route path="/dev/roles" element={
                        <RolesView userManagement={userManagement} />
                    } />
                    <Route path="*" element={<Navigate to="/dev" replace />} />
                </Routes>
                <SideDialogs />
            </Scaffold>
        );
    }

    // Editor Mode: standard CMS with Drawer
    return (
        <Scaffold autoOpenDrawer={false}>
            <AppBar title={"PostgreSQL Backend Demo"} />
            <Drawer />
            <NavigationRoutes />
            <SideDialogs />
        </Scaffold>
    );
}
