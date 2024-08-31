"use client";
import React, { useCallback } from "react";

import "./index.css";
import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    buildCollection,
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
    useFirestoreDelegate,
    useInitialiseFirebase,
} from "@firecms/firebase";
import { useImportPlugin } from "@firecms/data_import";
import { useExportPlugin } from "@firecms/data_export";
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@firecms/user_management";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";

//TODO: replace with your own Firebase config
export const firebaseConfig = {
    //...
};

const categories = {
    fiction: "Fiction",
    drama: "Drama",
    "fantasy-fiction": "Fantasy fiction",
    history: "History",
    religion: "Religion",
    "self-help": "Self-Help",
    "comics-graphic-novels": "Comics & Graphic Novels",
    "juvenile-fiction": "Juvenile Fiction",
    philosophy: "Philosophy",
    fantasy: "Fantasy",
    education: "Education",
    science: "Science",
    medical: "Medical",
    cooking: "Cooking",
    travel: "Travel"
};

const booksCollection = buildCollection({
    name: "Books",
    singularName: "Book",
    id: "books",
    path: "books",
    icon: "MenuBook",
    group: "Content",
    textSearchEnabled: true,
    description: "Example of a books collection that allows data enhancement through the use of the **OpenAI plugin**",
    properties: {
        title: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        authors: {
            name: "Authors",
            dataType: "string"
        },
        description: {
            name: "Description",
            dataType: "string",
            multiline: true
        },
        spanish_description: {
            name: "Spanish description",
            dataType: "string",
            multiline: true
        },
        thumbnail: {
            name: "Thumbnail",
            dataType: "string",
            url: "image"
        },
        category: {
            name: "Category",
            dataType: "string",
            enumValues: categories
        },
        tags: {
            name: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        published_year: {
            name: "Published Year",
            dataType: "number",
            validation: {
                integer: true,
                min: 0
            }
        },
        num_pages: {
            name: "Num pages",
            dataType: "number"
        },
        created_at: {
            name: "Created at",
            dataType: "date",
            autoValue: "on_create"
        }
    }
});

export function FireCMSApp() {

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

    // Delegate used for fetching and saving data in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    // Controller used for saving and fetching files in storage
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    // controller in charge of user management
    const userManagement = useBuildUserManagement({
        dataSourceDelegate: firestoreDelegate,
    });

    // Controller for managing authentication
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions,
        loading: userManagement.loading,
        defineRolesFor: userManagement.defineRolesFor
    });

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: userManagement.loading,
        authenticator: userManagement.authenticator,
        authController,
        // authenticator: myAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const collectionsBuilder = useCallback(() => {
        const collections = [
            booksCollection,
            // Your collections here
        ];
        return mergeCollections(collections, collectionConfigController.collections ?? []);
    }, [collectionConfigController.collections]);

    const navigationController = useBuildNavigationController({
        basePath: "/",
        collections: collectionsBuilder,
        collectionPermissions: userManagement.collectionPermissions,
        adminViews: userManagementAdminViews,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    const importPlugin = useImportPlugin();
    const exportPlugin = useExportPlugin();

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <><CircularProgressCenter/></>;
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
                    plugins={[importPlugin, exportPlugin, userManagementPlugin, collectionEditorPlugin]}
                >
                    {({
                          context,
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
                            <AppBar title={"My demo app"}/>
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

