import React, { useMemo } from "react";
import { BrowserRouter } from "react-router-dom";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";
import {
    CircularProgressCenter,
    CMSView,
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
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";

import { firebaseConfig } from "./firebase_config";
import { productsCollection } from "./collections/products";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import {
    useFirestoreUserManagement,
    userManagementAdminViews,
    useUserManagementPlugin
} from "@firecms/user_management";
import { useImportExportPlugin } from "@firecms/data_import_export";
import { ExampleCMSView } from "./views/ExampleCMSView";

function App() {
    return <BrowserRouter>
        <AppInner/>
    </BrowserRouter>
}

function AppInner() {

    const name = "My CMS app";

    // Here you define the collections that will be available in your CMS
    const collections = useMemo(() => [
        productsCollection
    ], []);

    // Here you define your custom top-level views
    const views: CMSView[] = useMemo(() => ([{
        path: "example",
        name: "Example CMS view",
        view: <ExampleCMSView/>
    }]), []);

    const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

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

    /**
     * Controller in charge of user management
     */
    const userManagement = useFirestoreUserManagement({
        firebaseApp
    });

    /**
     * Controller for managing authentication
     */
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions,
        loading: userManagement.loading,
        defineRolesFor: userManagement.defineRolesFor
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
     * Use the authenticator to control access to the main view
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        disabled: userManagement.loading,
        authenticator: userManagement.authenticator, // you can define your own authenticator here
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        collections,
        collectionPermissions: userManagement.collectionPermissions,
        views,
        adminViews: userManagementAdminViews,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    /**
     * Data enhancement plugin
     */
    const dataEnhancementPlugin = useDataEnhancementPlugin({
        getConfigForPath: ({ path }) => {
            if (path === "products")
                return true;
            return false;
        }
    });

    /**
     * User management plugin
     */
    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    /**
     * Allow import and export data plugin
     */
    const importExportPlugin = useImportExportPlugin();

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
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                    plugins={[dataEnhancementPlugin, importExportPlugin, userManagementPlugin]}
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
