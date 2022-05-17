import React from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";

import "typeface-rubik";
import "typeface-space-mono";

import {
    Authenticator,
    buildCollection,
    CircularProgressCenter,
    createCMSDefaultTheme,
    FirebaseAuthDelegate,
    FirebaseLoginView,
    FireCMS, NavigationRoutes,
    Scaffold,
    SideDialogs,
    useFirebaseAuthDelegate,
    useFirebaseStorageSource,
    useFirestoreDataSource,
    useInitialiseFirebase
} from "@camberi/firecms";

import { firebaseConfig } from "./firebase_config";
import { CollectionEditorsProvider } from "./CollectionEditorProvider";
import { ConfigPermissions } from "./config_permissions";
import { SassDrawer } from "./components/SassDrawer";
import {
    useBuildFirestoreConfigController
} from "./useBuildFirestoreConfigController";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { productsCollection } from "./products_collection";
import {
    SassEntityCollectionView
} from "./components/SassEntityCollectionView";
import { SassHomePage } from "./components/SassHomePage";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

/**
 * This is an example of how to use the components provided by FireCMS for
 * a better customisation.
 * @constructor
 */
export function SassCMSApp() {

    const signInOptions = DEFAULT_SIGN_IN_OPTIONS;

    const myAuthenticator: Authenticator = ({ user }) => {
        console.log("Allowing access to", user?.email);
        return true;
    };

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({ firebaseConfig });

    const authDelegate: FirebaseAuthDelegate = useFirebaseAuthDelegate({
        firebaseApp,
        signInOptions
    });

    const dataSource = useFirestoreDataSource({
        firebaseApp
    });

    const storageSource = useFirebaseStorageSource({ firebaseApp: firebaseApp });

    const collectionsController = useBuildFirestoreConfigController({
        firebaseApp,
        // configPath,
        collections: [productsCollection]
    });

    if (configError) {
        return <div> {configError} </div>;
    }

    if (firebaseConfigError) {
        return <div>
            It seems like the provided Firebase config is not correct. If you
            are using the credentials provided automatically by Firebase
            Hosting, make sure you link your Firebase app to Firebase
            Hosting.
        </div>;
    }

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter/>;
    }

    const configPermissions: ConfigPermissions = {
        createCollections: true,
        editCollections: true,
        deleteCollections: true
    }

    return (
        <Router>
            <FireCMS authDelegate={authDelegate}
                     collections={collectionsController.collections}
                     authentication={myAuthenticator}
                     dataSource={dataSource}
                     storageSource={storageSource}
                     EntityCollectionViewComponent={SassEntityCollectionView}
                     entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}>
                {({ context, mode, loading }) => {

                    const theme = createCMSDefaultTheme({ mode });

                    let component;
                    if (loading || collectionsController.loading) {
                        component = <CircularProgressCenter/>;
                    } else if (!context.authController.canAccessMainView) {
                        component = (
                            <FirebaseLoginView
                                allowSkipLogin={false}
                                signInOptions={signInOptions}
                                firebaseApp={firebaseApp}
                                authDelegate={authDelegate}/>
                        );
                    } else {
                        component = (
                            <Scaffold name={"My Online Shop"}
                                      Drawer={SassDrawer}>
                                <NavigationRoutes HomePage={SassHomePage}/>
                                <SideDialogs/>
                            </Scaffold>
                        );
                    }

                    return (
                        <ThemeProvider theme={theme}>
                            <ConfigControllerProvider
                                collectionsController={collectionsController}>
                                <CollectionEditorsProvider
                                    saveCollection={collectionsController.saveCollection}
                                    configPermissions={configPermissions}>
                                    <CssBaseline/>
                                    {component}
                                </CollectionEditorsProvider>
                            </ConfigControllerProvider>
                        </ThemeProvider>
                    );
                }}
            </FireCMS>
        </Router>
    );

}
