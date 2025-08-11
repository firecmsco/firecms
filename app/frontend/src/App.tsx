import React, { useCallback } from "react";

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
    useValidateAuthenticator
} from "@firecms/core";
import {
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useInitialiseFirebase
} from "@firecms/firebase";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

// Import our PostgreSQL delegate and shared collections
import { usePostgresDelegate } from "./usePostgresDelegate";
import { allCollections } from "./collections";

export const firebaseConfig = {
    apiKey: "AIzaSyBzt-JvcXvpDrdNU7jYX3fC3v0EAHjTKEw",
    authDomain: "demo.firecms.co",
    databaseURL: "https://firecms-demo-27150.firebaseio.com",
    projectId: "firecms-demo-27150",
    storageBucket: "firecms-demo-27150.appspot.com",
    messagingSenderId: "837544933711",
    appId: "1:837544933711:web:75822ffc0840e3ae01ad3a",
    measurementId: "G-8HRE8MVXZJ"
};

function CustomBackendSample() {

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    // Controller used to manage the dark or light color mode
    const modeController = useBuildModeController();

    const signInOptions: FirebaseSignInProvider[] = ["google.com"];

    // Controller for saving some user preferences locally.
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Replace Firestore delegate with PostgreSQL delegate
    const postgresDelegate = usePostgresDelegate({
        baseUrl: "http://localhost:3001",
        websocketUrl: "ws://localhost:3001"
    });

    // Controller used for saving and fetching files in storage
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    // Controller for managing authentication
    const firebaseAuthController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    const authController = firebaseAuthController;

    const dataEnhancementPlugin = useDataEnhancementPlugin();

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        dataSourceDelegate: postgresDelegate, // Use PostgreSQL delegate
        storageSource
    });

    const collectionsBuilder = useCallback(() => {
        return [
            ...allCollections // Use all shared collections
        ];
    }, []);

    const navigationController = useBuildNavigationController({
        plugins: [dataEnhancementPlugin],
        collections: collectionsBuilder,
        authController,
        dataSourceDelegate: postgresDelegate // Use PostgreSQL delegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (configError) {
        return <>{configError}</>;
    }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={postgresDelegate} // Use PostgreSQL delegate
                    storageSource={storageSource}
                >
                    {({
                          loading
                      }) => {

                        if (loading || authLoading) {
                            return <CircularProgressCenter size={"large"}/>;
                        }
                        if (!canAccessMainView) {
                            return <FirebaseLoginView authController={authController}
                                                      firebaseApp={firebaseApp}
                                                      signInOptions={signInOptions}
                                                      notAllowedError={notAllowedError}/>;
                        }

                        return <Scaffold
                            autoOpenDrawer={false}>
                            <AppBar title={"PostgreSQL Backend Demo"}/>
                            <Drawer/>
                            <NavigationRoutes/>
                            <SideDialogs/>
                        </Scaffold>;
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );

}

export default CustomBackendSample;
