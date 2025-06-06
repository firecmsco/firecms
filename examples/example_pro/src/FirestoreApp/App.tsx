import React, { useCallback, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/comic-neue"; // Defaults to weight 400
import "@fontsource/noto-serif"; // Defaults to weight 400
import "@fontsource/jetbrains-mono";

import logo from "./images/demo_logo.png";

import { getAnalytics, logEvent } from "@firebase/analytics";

import { CenteredView, GitHubIcon, IconButton, Tooltip } from "@firecms/ui";
import {
    AppBar,
    Authenticator,
    CircularProgressCenter,
    CMSView,
    Drawer,
    EntityCollection,
    EntityCollectionsBuilder,
    ErrorView,
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
    useValidateAuthenticator
} from "@firecms/core";
import {
    FirebaseAuthController,
    FirebaseSignInProvider,
    FirebaseUserWrapper,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@firecms/user_management";

import { firebaseConfig, secondaryFirebaseConfig } from "../firebase_config";
// import { publicRecaptchaKey } from "../appcheck_config";
import { ExampleCMSView } from "./views/ExampleCMSView";
import { dataUkSubCollection, testCollection } from "./collections/test_collection";
import { usersCollection } from "./collections/users_collection";
import { localeCollectionGroup, productsCollection } from "./collections/products_collection";
import { blogCollection } from "./collections/blog_collection";
import { showcaseCollection } from "./collections/showcase_collection";

import { CustomLoginView } from "./CustomLoginView";
import { cryptoCollection } from "./collections/crypto_collection";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import { booksCollection } from "./collections/books_collection";
import { FirebaseApp } from "@firebase/app";
import { TestEditorView } from "./views/TestEditorView";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import { useExportPlugin } from "@firecms/data_export";
import { useImportPlugin } from "@firecms/data_import";
import { DemoImportAction } from "./DemoImportAction";
import { algoliaSearchControllerBuilder } from "./text_search";
import ClientUIComponentsShowcase from "./views/ClientUIComponentsShowcase";
import { useEntityHistoryPlugin } from "@firecms/entity_history";
import { TestBoardView } from "./BoardView/TestBoardView";

const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

export function App() {

    const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                       user,
                                                                                       authController
                                                                                   }) => {

        console.log("Authenticating user", user);

        if (user?.email?.includes("flanders")) {
            // You can throw an error to prevent access
            throw Error("Stupid Flanders!");
        }

        const idTokenResult = await user?.firebaseUser?.getIdTokenResult();
        const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@firecms.co");

        authController.setExtra({ userIsAdmin });

        console.log("Allowing access to", user);

        // we allow access to every user in this case
        return true;
    }, []);

    const githubLink = (
        <Tooltip
            asChild={true}
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
        // import { getFirestore, connectFirestoreEmulator } from "@firebase/firestore";
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

    // const appCheckResult = useAppCheck({
    //     firebaseApp,
    //     options: {
    //         provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY as string)
    //     }
    // });

    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });
    // Example of adding a custom field
    const propertyConfigs: Record<string, PropertyConfig> = {
        // markdown: {
        //     key: "markdown",
        //     name: "Custom markdown field",
        //     property: {
        //         dataType: "string",
        //         Field: CustomColorTextField
        //     }
        // },
        markdown_custom: {
            key: "markdown_custom",
            name: "Markdown field",
            property: {
                dataType: "map",
                properties: {
                    type: {
                        dataType: "string",
                        defaultValue: "markdown",
                        Field: () => null
                    },
                    markdown_text: {
                        dataType: "string",
                        markdown: true
                    }
                }
            }
        },
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

    // Controller for saving some user preferences locally.
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Delegate used for fetching and saving data in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        localTextSearchEnabled: true,
        textSearchControllerBuilder: algoliaSearchControllerBuilder
    });

    const {
        firebaseApp: secondaryFirebaseApp,
        firebaseConfigLoading: secondaryFirebaseConfigLoading
    } = useInitialiseFirebase({
        firebaseConfig: secondaryFirebaseConfig,
        name: "secondary",
        onFirebaseInit
    });

    // Delegate used for fetching and saving data in Firestore
    const secondaryFirestoreDelegate = useFirestoreDelegate({
        firebaseApp: secondaryFirebaseApp
    });

    // It is important to memoize the collections and views
    const collections: EntityCollectionsBuilder = useCallback(async ({
                                                                         authController
                                                                     }) => {

        const sourceCollections: EntityCollection[] = [
            productsCollection,
            // productsCollection2,

            booksCollection,
            usersCollection,
            blogCollection,
            showcaseCollection,
            cryptoCollection,
            localeCollectionGroup,
            // carsCollection(secondaryFirestoreDelegate)
        ];
        if (process.env.NODE_ENV !== "production") {
            sourceCollections.push(testCollection);
            sourceCollections.push(dataUkSubCollection);
        }

        // return sourceCollections;
        return mergeCollections(
            sourceCollections,
            collectionConfigController.collections ?? []
        );
    }, [collectionConfigController.collections, secondaryFirestoreDelegate]);

    const views: CMSView[] = useMemo(() => ([
        {
            path: "additional",
            name: "Additional",
            group: "Custom views",
            description: "This is an example of an additional view that is defined by the user",
            view: <ExampleCMSView/>
        },
        // {
        //     path: "typography",
        //     name: "Typography demo",
        //     group: "Custom views",
        //     description: "This is an example of an additional view that is defined by the user",
        //     view: <TypographyDemo/>
        // },
        {
            path: "board_test",
            name: "Board test",
            group: "Content",
            view: <TestBoardView/>
        },
        {
            path: "editor_demo",
            name: "The FireCMS editor",
            description: "This view showcases a custom advanced editor",
            group: "Custom views",
            view: <TestEditorView/>
        },
        {
            path: "ui_components",
            description: "This view showcases some of the UI components available in FireCMS",
            name: "UI components showcase",
            group: "Custom views",
            view: <ClientUIComponentsShowcase docsUrl={"https://firecms.co"} linksInNewTab={true}/>
        }
    ]), []);

    // Controller used for saving and fetching files in storage
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    // Controller for managing authentication
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    const userManagement = useBuildUserManagement({
        dataSourceDelegate: firestoreDelegate,
        authController: authController
    });

    const userManagementPlugin = useUserManagementPlugin({ userManagement: userManagement });

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });

    const importPlugin = useImportPlugin();
    const exportPlugin = useExportPlugin();

    const entityHistoryPlugin = useEntityHistoryPlugin({
        defaultEnabled: true,
        getUser: userManagement.getUser
    });

    const demoPlugin = useMemo(() => ({
        key: "demo",
        collectionView: {
            CollectionActions: [DemoImportAction]
        }
    }), []);

    /**
     * Check if the user is allowed to access the main view
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: userManagement.loading,
        authController: authController,
        authenticator: myAuthenticator,
        // authenticator: userManagement.authenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const plugins = [
        userManagementPlugin,
        dataEnhancementPlugin,
        exportPlugin,
        entityHistoryPlugin,
        demoPlugin,
        collectionEditorPlugin
    ];

    const navigationController = useBuildNavigationController({
        disabled: authLoading || collectionConfigController.loading,
        // basePath: "cms",
        collections,
        plugins,
        // collectionPermissions: userManagement.collectionPermissions,
        views,
        adminViews: userManagementAdminViews,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || secondaryFirebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    // if (appCheckResult.error) {
    //     return <CenteredView>{appCheckResult.error}</CenteredView>;
    // }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <FireCMS
                    apiKey={import.meta.env.VITE_FIRECMS_API_KEY as string}
                    navigationController={navigationController}
                    authController={authController}
                    entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                    plugins={plugins}
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
                        if (userManagement.user === null || !canAccessMainView) {
                            return <CustomLoginView authController={authController}
                                                    firebaseApp={firebaseApp}
                                                    signInOptions={signInOptions}
                                                    notAllowedError={notAllowedError}/>
                        }

                        if (userManagement.usersError) {
                            return <CenteredView><ErrorView
                                error={userManagement.usersError}/></CenteredView>;
                        }

                        return <Scaffold logo={logo}>
                            <AppBar
                                title={"My demo app"}
                                endAdornment={githubLink}/>
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
