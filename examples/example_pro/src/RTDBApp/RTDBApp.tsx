import React from "react";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import "@fontsource/roboto"

import {
    CenteredView,
    CircularProgressCenter,
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useFirebaseAuthController,
    useFirebaseRTDBDelegate,
    useFirebaseStorageSource,
    useInitialiseFirebase,
    useInitializeAppCheck,
    useValidateAuthenticator
} from "@firecms/firebase_pro";

import { BrowserRouter } from "react-router-dom";
import { productsCollection } from "./collections/products_collection";

const firebaseConfig = {
    apiKey: "AIzaSyCIZxRC_0uy9zU2sQrEo88MigD4Z9ktYzo",
    authDomain: "rtdb-test-eb959.firebaseapp.com",
    databaseURL: "https://rtdb-test-eb959-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rtdb-test-eb959",
    storageBucket: "rtdb-test-eb959.appspot.com",
    messagingSenderId: "380781473867",
    appId: "1:380781473867:web:94e8457d48c642b1655dce"
};

function RTDBApp() {

    const name = "Culturalyst";

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    const {
        appCheckLoading,
        getAppCheckToken
    } = useInitializeAppCheck({
        firebaseApp,
    });

    const signInOptions: FirebaseSignInProvider[] = ["google.com"];
    /**
     * Controller for managing authentication
     */
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const firestoreDelegate = useFirebaseRTDBDelegate({
        firebaseApp
    })

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    /**
     * Validate authenticator
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        authentication: () => true,
        getAppCheckToken,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        collections: [productsCollection],
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp || appCheckLoading) {
        return <>
            <CircularProgressCenter/>
        </>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    return (
            <SnackbarProvider>
                <ModeControllerProvider value={modeController}>

                    <FireCMS
                        navigationController={navigationController}
                        authController={authController}
                        userConfigPersistence={userConfigPersistence}
                        dataSourceDelegate={firestoreDelegate}
                        storageSource={storageSource}

                    >
                        {({
                              context,
                              loading
                          }) => {

                            let component;
                            if (loading || authLoading) {
                                component = <CircularProgressCenter size={"large"}/>;
                            } else {
                                if (!canAccessMainView) {
                                    const LoginViewUsed = FirebaseLoginView;
                                    component = (
                                        <LoginViewUsed
                                            allowSkipLogin={false}
                                            signInOptions={signInOptions}
                                            firebaseApp={firebaseApp}
                                            authController={authController}
                                            notAllowedError={notAllowedError}/>
                                    );
                                } else {
                                    component = (
                                        <Scaffold
                                            name={name}
                                            fireCMSAppBarProps={{
                                                endAdornment: <div>Project select here</div>
                                            }}
                                            autoOpenDrawer={false}>
                                            <NavigationRoutes/>
                                            <SideDialogs/>
                                        </Scaffold>
                                    );
                                }
                            }

                            return component;
                        }}
                    </FireCMS>
                </ModeControllerProvider>
            </SnackbarProvider>
    );
}

export default RTDBApp;
