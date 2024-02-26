import React, { useMemo } from "react";
import { BrowserRouter } from "react-router-dom";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import "@fontsource/roboto"

import { CenteredView } from "@firecms/ui";
import {
    CircularProgressCenter,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
} from "@firecms/core";
import {
    FirebaseAuthController,
    FirebaseSignInProvider,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase,
    useInitializeAppCheck,
    useValidateAuthenticator
} from "@firecms/firebase";
import { FirebaseLoginView } from "@firecms/firebase_pro";

import { firebaseConfig } from "./firebase-config";
import { productsCollection } from "./collections/products";

function App() {
    return <BrowserRouter>
        <AppInner/>
    </BrowserRouter>
}

function AppInner() {

    const name = "My CMS app";

    // is is important to memoize the collections and views
    const collections = useMemo(() => [productsCollection], []);
    const views = useMemo(() => [], []);

    const signInOptions: FirebaseSignInProvider[] = ["google.com"];

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

    /**
     * Delegate used for fetching and saving data in Firestore
     */
    const firestoreDelegate = useFirestoreDelegate({
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
        collections,
        views,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp || appCheckLoading) {
        return <CircularProgressCenter/>;
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

export default App;
