import React, { useCallback, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import { getAnalytics, logEvent } from "firebase/analytics";

import { CenteredView, GitHubIcon, IconButton, Tooltip, } from "@firecms/ui";
import {
    Authenticator,
    CircularProgressCenter,
    CMSView,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    PropertyConfig,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useValidateAuthenticator,
} from "@firecms/core";
import {
    FirebaseAuthController,
    FirebaseSignInProvider,
    FirebaseUserWrapper,
    useAppCheck,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { useImportExportPlugin } from "@firecms/data_import_export";
import {
    useFirestoreUserManagement,
    userManagementAdminViews,
    useUserManagementPlugin
} from "@firecms/user_management";

import { firebaseConfig } from "../firebase_config";
// import { publicRecaptchaKey } from "../appcheck_config";
import { ExampleCMSView } from "./ExampleCMSView";
import { testCollection } from "./collections/test_collection";
import { usersCollection } from "./collections/users_collection";
import { localeCollectionGroup, productsCollection } from "./collections/products_collection";
import { blogCollection } from "./collections/blog_collection";
import { showcaseCollection } from "./collections/showcase_collection";

import { CustomLoginView } from "./CustomLoginView";
import { cryptoCollection } from "./collections/crypto_collection";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import { booksCollection } from "./collections/books_collection";
import { FirebaseApp } from "firebase/app";
import { TestEditorView } from "./TestEditorView";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import { DataTalk } from "@firecms/datatalk";
import { ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";

const signInOptions: FirebaseSignInProvider[] = ["google.com"];

function App() {

    console.debug("Render App");

    const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                       user,
                                                                                       authController
                                                                                   }) => {

        if (user?.email?.includes("flanders")) {
            // You can throw an error to prevent access
            throw Error("Stupid Flanders!");
        }

        const idTokenResult = await user?.firebaseUser?.getIdTokenResult();
        const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@firecms.co");

        console.log("Allowing access to", user);

        // we allow access to every user in this case
        return true;
    }, []);

    const githubLink = (
        <Tooltip
            title="See this project on GitHub. This button is only present in this demo">
            <IconButton
                href={"https://github.com/firecmsco/firecms"}
                rel="noopener noreferrer"
                target="_blank"
                component={"a"}
                size="large">
                <GitHubIcon/>
            </IconButton>
        </Tooltip>
    );

    const onFirebaseInit = (config: object, app: FirebaseApp) => {
        // Just calling analytics enables screen tracking
        // getAnalytics(app);

        // This is an example of connecting to a local emulator (move import to top)
        // import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
        // connectFirestoreEmulator(getFirestore(app), '127.0.0.1', 8080);
    };

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig,
        onFirebaseInit
    });

    const appCheckResult = useAppCheck({
        firebaseApp,
        options: {
            provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY as string)
        }
    });

    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    // It is important to memoize the collections and views
    const collections = useCallback(() => {
        const sourceCollections = [
            productsCollection,
            booksCollection,
            localeCollectionGroup,
            usersCollection,
            blogCollection,
            showcaseCollection,
            cryptoCollection
        ];
        if (process.env.NODE_ENV !== "production") {
            sourceCollections.push(testCollection);
        }
        return mergeCollections(
            sourceCollections,
            collectionConfigController.collections ?? []
        )
    }, [collectionConfigController.collections]);

    const views: CMSView[] = useMemo(() => ([
        {
            path: "additional",
            name: "Additional",
            group: "Content",
            description: "This is an example of an additional view that is defined by the user",
            view: <ExampleCMSView/>
        },
        // {
        //     path: "board_test",
        //     name: "Board test",
        //     group: "Content",
        //     view: <TestBoardView/>
        // },
        {
            path: "editor_test",
            name: "Editor test",
            group: "Content",
            view: <TestEditorView/>
        }
    ]), []);

    // Example of adding a custom field
    const propertyConfigs: Record<string, PropertyConfig> = {
        test_custom_field: {
            key: "test_custom_field",
            name: "Test custom field",
            property: {
                dataType: "string",
                Field: CustomColorTextField
            }
        }
    };

    const onAnalyticsEvent = useCallback((event: string, data?: object) => {
        const analytics = getAnalytics();
        logEvent(analytics, event, data);
    }, []);

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        getConfigForPath: ({ path }) => {
            if (process.env.NODE_ENV !== "production")
                return true;
            if (path === "books")
                return true;
            if (path === "blog")
                return true;
            return false;
        }
    });

    // Controller used to manage the dark or light color mode
    const modeController = useBuildModeController();

    const userManagement = useFirestoreUserManagement({
        firebaseApp,
    });

    // Controller for managing authentication
    const authController: FirebaseAuthController = useFirebaseAuthController({
        loading: userManagement.loading,
        firebaseApp,
        signInOptions,
        defineRolesFor: userManagement.defineRolesFor
    });

    // Controller for saving some user preferences locally.
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Delegate used for fetching and saving data in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    // Controller used for saving and fetching files in storage
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });

    const importExportPlugin = useImportExportPlugin();

    /**
     * Check if the user is allowed to access the main view
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: userManagement.loading,
        authController,
        authenticator: myAuthenticator,
        // authenticator: userManagement.authenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        collections,
        // collectionPermissions: userManagement.collectionPermissions,
        views,
        adminViews: userManagementAdminViews,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    if (appCheckResult.error) {
        return <CenteredView>{appCheckResult.error}</CenteredView>;
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
                    plugins={[userManagementPlugin, dataEnhancementPlugin, importExportPlugin,
                        // collectionEditorPlugin
                    ]}
                    onAnalyticsEvent={onAnalyticsEvent}
                    propertyConfigs={propertyConfigs}
                >
                    {({
                          context,
                          loading
                      }) => {

                        if (loading || authLoading) {
                            return <CircularProgressCenter size={"large"}/>;
                        }
                        if (authController.user === null || !canAccessMainView) {
                            return <CustomLoginView authController={authController}
                                                    firebaseApp={firebaseApp}
                                                    signInOptions={signInOptions}
                                                    notAllowedError={notAllowedError}/>
                        }

                        return <Scaffold
                            name={"My demo app"}
                            fireCMSAppBarProps={{
                                endAdornment: githubLink
                            }}
                            autoOpenDrawer={false}>
                            <NavigationRoutes/>
                            <SideDialogs/>
                        </Scaffold>;
                    }}
                </FireCMS>
            </ModeControllerProvider>
        </SnackbarProvider>
    );

}

export default App;
