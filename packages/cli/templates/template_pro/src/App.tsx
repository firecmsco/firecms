import React, { useCallback, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";
import {
    AppBar,
    CircularProgressCenter,
    CMSView,
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
    useBuildUserManagement,
    userManagementAdminViews,
    useUserManagementPlugin
} from "@firecms/user_management";
import { useImportPlugin } from "@firecms/data_import";
import { useExportPlugin } from "@firecms/data_export";
import { useEntityHistoryPlugin } from "@firecms/entity_history";
import { ExampleCMSView } from "./views/ExampleCMSView";
import { buildCollectionInference, useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";

export function App() {

    const title = "My CMS app";

    if (!firebaseConfig?.projectId) {
        throw new Error("Firebase config not found. Please check your `firebase_config.ts` file and make sure it is correctly set up.");
    }

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    // Uncomment this to enable App Check
    // const { error: appCheckError } = useAppCheck({
    //     firebaseApp,
    //     options: {
    //         provider: new ReCaptchaEnterpriseProvider(process.env.VITE_RECAPTCHA_SITE_KEY as string)
    //     }
    // });

    /**
     * Controller used to save the collection configuration in Firestore.
     * Note that this is optional and you can define your collections in code.
     */
    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    const collectionsBuilder = useCallback(() => {
        // Here we define a sample collection in code.
        const collections = [
            productsCollection
            // Your collections here
        ];
        // You can merge collections defined in the collection editor (UI) with your own collections
        return mergeCollections(collections, collectionConfigController.collections ?? []);
    }, [collectionConfigController.collections]);

    // Here you define your custom top-level views
    const views: CMSView[] = useMemo(() => ([{
        path: "example",
        name: "Example CMS view",
        view: <ExampleCMSView/>
    }]), []);

    const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    /**
     * Delegate used for fetching and saving data in Firestore
     */
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        // The products collection sets `textSearchEnabled`, and without a search controller
        // (Algolia, Typesense…) or this flag the search box is permanently disabled. Local
        // search filters the rows already loaded, which is enough for a small collection.
        localTextSearchEnabled: true
    })

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });


    /**
     * Controller for managing authentication
     */
    const firebaseAuthController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions,
    });

    /**
     * Controller in charge of user management
     */
    const userManagementController = useBuildUserManagement({
        authController: firebaseAuthController,
        dataSourceDelegate: firestoreDelegate
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Use the authenticator to control access to the main view
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController: userManagementController,
        disabled: userManagementController.loading,
        authenticator: userManagementController.authenticator, // you can define your own authenticator here
        dataSourceDelegate: firestoreDelegate,
        storageSource
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
    const userManagementPlugin = useUserManagementPlugin({ userManagement: userManagementController });

    /**
     * Allow import and export data plugin
     */
    const importPlugin = useImportPlugin();
    const exportPlugin = useExportPlugin();

    // Keeps a version of every saved entity, with who saved it, under a History tab.
    // @firecms/entity_history is a dependency of this template and PRO pauses "history"
    // when a licence lapses, but nothing mounted it, so the tab never appeared.
    const entityHistoryPlugin = useEntityHistoryPlugin({
        defaultEnabled: true,
        getUser: userManagementController.getUser
    });

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        collectionInference: buildCollectionInference(firebaseApp),
    });

    /**
     * Plugins go to the navigation controller, which is where they can
     * modify collections and add views and navigation entries.
     */
    const plugins = [
        dataEnhancementPlugin,
        importPlugin,
        exportPlugin,
        userManagementPlugin,
        entityHistoryPlugin,
        collectionEditorPlugin
    ];

    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder,
        collectionPermissions: userManagementController.collectionPermissions,
        views,
        adminViews: userManagementAdminViews,
        plugins,
        authController: userManagementController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (configError) {
        return <>{configError}</>;
    }


    return (
        <FireCMSi18nProvider>
            <SnackbarProvider>
                <ModeControllerProvider value={modeController}>

                <FireCMS
                    apiKey={import.meta.env.VITE_FIRECMS_API_KEY}
                    navigationController={navigationController}
                    authController={userManagementController}
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
                                component = (
                                    <FirebaseLoginView
                                        allowSkipLogin={false}
                                        signInOptions={signInOptions}
                                        firebaseApp={firebaseApp}
                                        authController={userManagementController}
                                        notAllowedError={notAllowedError}/>
                                );
                            } else {
                                component = (
                                    <Scaffold
                                        // logo={...}
                                        autoOpenDrawer={false}>
                                        <AppBar title={title}/>
                                        <Drawer/>
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
        </FireCMSi18nProvider>
    );
}
