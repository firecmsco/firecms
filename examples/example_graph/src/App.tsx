import React, { useMemo, useState } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    AuthController,
    buildCollection,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    FireCMSi18nProvider,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController
} from "@firecms/core";
import { buildGraphDelegate } from "./graph_datasource";

const nodesCollection = buildCollection({
    id: "nodes",
    path: "nodes",
    name: "Graph nodes",
    singularName: "Node",
    description: "IDs here contain slashes, e.g. \"node/42\" — impossible in Firestore.",
    customId: true,
    properties: {
        label: {
            name: "Label",
            dataType: "string"
        },
        kind: {
            name: "Kind",
            dataType: "string",
            enumValues: [
                { id: "person", label: "Person" },
                { id: "edge", label: "Edge" },
                { id: "control", label: "Control" }
            ]
        },
        degree: {
            name: "Degree",
            dataType: "number"
        }
    }
});

/**
 * No Firebase here: a stub auth controller that is always "logged in", so the demo runs
 * with no configuration at all.
 */
function useStubAuthController(): AuthController {
    const [extra, setExtra] = useState<any>(undefined);
    return useMemo(() => ({
        user: { uid: "demo", email: "demo@example.com" } as any,
        initialLoading: false,
        authLoading: false,
        loginSkipped: false,
        signOut: async () => undefined,
        getAuthToken: async () => "demo-token",
        extra,
        setExtra
    }), [extra]);
}

export default function App() {

    const collections = useMemo(() => [nodesCollection], []);
    const dataSourceDelegate = useMemo(() => buildGraphDelegate(), []);

    const modeController = useBuildModeController();
    const authController = useStubAuthController();
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const navigationController = useBuildNavigationController({
        collections,
        authController,
        dataSourceDelegate
    });

    return (
        <FireCMSi18nProvider>
            <SnackbarProvider>
                <ModeControllerProvider value={modeController}>
                    <FireCMS
                        navigationController={navigationController}
                        authController={authController}
                        userConfigPersistence={userConfigPersistence}
                        dataSourceDelegate={dataSourceDelegate}
                        storageSource={{
                            uploadFile: async () => {
                                throw Error("Storage is not available in this demo");
                            },
                            getDownloadURL: async () => {
                                throw Error("Storage is not available in this demo");
                            },
                            getFile: async () => null
                        } as any}
                    >
                        {({ loading }) => {
                            if (loading) {
                                return <CircularProgressCenter size={"large"} />;
                            }
                            return <Scaffold autoOpenDrawer={false}>
                                <AppBar title={"Graph DB demo — slashes in entity IDs"} />
                                <Drawer />
                                <NavigationRoutes />
                                <SideDialogs />
                            </Scaffold>;
                        }}
                    </FireCMS>
                </ModeControllerProvider>
            </SnackbarProvider>
        </FireCMSi18nProvider>
    );
}
