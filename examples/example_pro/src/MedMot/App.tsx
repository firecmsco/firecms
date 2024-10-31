import React, { useCallback } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";
import {
    AppBar,
    CircularProgressCenter,
    CMSViewsBuilder,
    Drawer,
    EntityCollection,
    EntityCollectionsBuilder,
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
    buildExternalSearchController,
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    performAlgoliaTextSearch,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";

import { firebaseConfig } from "./firebase_config";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@firecms/user_management";
import { useImportPlugin } from "@firecms/data_import";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import { useCollectionEditorPlugin } from "@firecms/collection_editor";
import { adminsCollection } from "./collections/admins_collection";
import { buildExercisesCollection } from "./collections/exercise_collection";
import { buildCustomersCollection } from "./collections/customers_collection";
import { getMediaCollection } from "./collections/media";
import { buildMedicoCollections } from "./collections/medico_collections";
import { askForCodeSchemas } from "./collections/ask_for_code_collection";
import { askForCodeWebsiteSchemas } from "./collections/ask_for_code_website_collection";
import { contactUsWebsiteSchemas } from "./collections/contact_us_website_collection";
import { buildSurveysCollection } from "./collections/survey";
import { buildDiagnosisCollection } from "./collections/diagnosis_collection";
import { buildBreathingExercisesCollection } from "./collections/breathing_exercise";
import { buildInsurancesCollection } from "./collections/insurances_collection";
import { buildWorkTypesCollection } from "./collections/work_types_collection";
import { buildSportsCollection } from "./collections/sports_collections";
import { buildMetaCollection } from "./collections/software_releases_collection";
import { shortActionsCollection } from "./collections/short_actions";
import { getAuthorCollection, getMeditationCollection, getPodcastsSchema } from "./collections/content";
import { getArticlesCollection } from "./collections/articles_collection";
import { getCategorySchema } from "./collections/category";
import { getMeditationCategorySchema } from "./collections/meditation_category";
import { InvoicesExport } from "./custom_views/InvoicesExport";
import { useExportPlugin } from "@firecms/data_export";

// import { algoliasearch, SearchClient } from "algoliasearch/dist/browser";
import { algoliasearch, SearchClient } from "algoliasearch";

// import {
//     performAlgoliaTextSearch,
//     FirestoreTextSearchController,
//     buildCollection,
//     EntityCollectionsBuilder
// } from "@firecms/core";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");
const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products")
            return performAlgoliaTextSearch(client, " products", searchString);
        return undefined;
    }
});

export function MedMotApp() {

    const title = "MedicalMotion CMS";

    if (!firebaseConfig?.projectId) {
        throw new Error("Firebase config not found. Please check your `firebase_config.ts` file and make sure it is correctly set up.");
    }

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig,
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

    const views: CMSViewsBuilder = useCallback(async ({
                                                          user,
                                                          dataSource
                                                      }) => {

        if (!user?.email) {
            console.error("User must be authenticated with an email to use this app");
            return [];
        }

        // const permissions: string[] | undefined = await dataSource.fetchEntity({
        //     path: "admins",
        //     entityId: user?.email,
        //     collection: adminsCollection
        // })
        //     .then((entity) => entity?.values.permissions)
        //     .catch((e) => {
        //         console.error(e);
        //         return undefined as any;
        //     });
        // const isAdmin = hasPermission(permissions, "admin");
        //
        // if (isAdmin) {
        return ([{
            path: "invoicing",
            name: "Invoicing",
            view: <InvoicesExport/>,
            group: "Admin"
        }]);
        // }

        return [];
    }, []);

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
        textSearchControllerBuilder: algoliaSearchController,
        localTextSearchEnabled: true
    })

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });
    const baseAuthController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions,
    });
    /**
     * Controller in charge of user management
     */
    const userManagement = useBuildUserManagement({
        authController: baseAuthController,
        dataSourceDelegate: firestoreDelegate
    });

    const authController = userManagement.authController;

    console.log("userManagement", userManagement);
    /**
     * Controller for managing authentication
     */

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
        authController,
        disabled: userManagement.loading,
        authenticator: userManagement.authenticator, // you can define your own authenticator here
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const collectionsBuilder: EntityCollectionsBuilder = useCallback(async ({
                                                                                user,
                                                                                dataSource
                                                                            }): Promise<EntityCollection[]> => {

        console.log("collectionsBuilder", user);
        if (!user?.email) {
            console.error("User must be authenticated with an email to use this app");
            return [];
        }

        const collections: EntityCollection[] = [];

        collections.push(buildExercisesCollection());

        collections.push(buildCustomersCollection());

        collections.push(getMediaCollection());

        collections.push(...buildMedicoCollections());

        collections.push(askForCodeSchemas());
        collections.push(askForCodeWebsiteSchemas());
        collections.push(contactUsWebsiteSchemas());

        collections.push(buildSurveysCollection());

        collections.push(buildDiagnosisCollection());

        collections.push(buildBreathingExercisesCollection());

        collections.push(buildInsurancesCollection());

        collections.push(buildWorkTypesCollection());

        collections.push(buildSportsCollection());

        collections.push(...buildMetaCollection());

// de-DE
        collections.push(shortActionsCollection("de-DE"));
        collections.push(getMeditationCollection("de-DE"));
        collections.push(getArticlesCollection("de-DE"));
        collections.push(getAuthorCollection("de-DE"));
        collections.push(getPodcastsSchema("de-DE"));
        collections.push(getCategorySchema("de-DE"));
        collections.push(getMeditationCategorySchema("de-DE"));

// en-US
        collections.push(shortActionsCollection("en-US"));
        collections.push(getMeditationCollection("en-US"));
        collections.push(getArticlesCollection("en-US"));
        collections.push(getAuthorCollection("en-US"));
        collections.push(getPodcastsSchema("en-US"));
        collections.push(getCategorySchema("en-US"));
        collections.push(getMeditationCategorySchema("en-US"));

// fr-FR
        collections.push(shortActionsCollection("fr-FR"));
        collections.push(getMeditationCollection("fr-FR"));
        collections.push(getArticlesCollection("fr-FR"));
        collections.push(getAuthorCollection("fr-FR"));
        collections.push(getPodcastsSchema("fr-FR"));
        collections.push(getCategorySchema("fr-FR"));
        collections.push(getMeditationCategorySchema("fr-FR"));

// es-ES
        collections.push(shortActionsCollection("es-ES"));
        collections.push(getMeditationCollection("es-ES"));
        collections.push(getArticlesCollection("es-ES"));
        collections.push(getAuthorCollection("es-ES"));
        collections.push(getPodcastsSchema("es-ES"));
        collections.push(getCategorySchema("es-ES"));
        collections.push(getMeditationCategorySchema("es-ES"));

        collections.push(adminsCollection);
        console.log("collectionsBuilder returning", collections.length);

        return collections;
    }, []);

    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder,
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
    const importPlugin = useImportPlugin();
    const exportPlugin = useExportPlugin();

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
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
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                    plugins={[dataEnhancementPlugin, importPlugin, exportPlugin, userManagementPlugin, collectionEditorPlugin]}
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
                                        authController={authController}
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
    );
}

function hasPermission(permissions: string[] | undefined, permission: string) {
    if (!permissions)
        return false;
    return permissions.includes(permission);
}

