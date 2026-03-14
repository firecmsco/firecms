"use client";
import React, { useCallback } from "react";

import "@/app/common/index.css"
import "typeface-rubik";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    Rebase,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useValidateAuthenticator
} from "@rebasepro/core";
import {
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDataSource,
    useInitialiseFirebase
} from "@rebasepro/firebase";

import { firebaseConfig } from "../common/firebase_config";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@rebasepro/user_management";
import { useImportPlugin } from "@rebasepro/data_import";
import { useExportPlugin } from "@rebasepro/data_export";
import logo from "@/app/common/logo.svg";
import { productsCollection } from "./collections/products";
import { blogCollection } from "@/app/cms/collections/blog";
import Link from "next/link";
import { Button, OpenInNewIcon } from "@rebasepro/ui";

export function App() {

    const title = "Rebase e-commerce and blog demo";

    if (!firebaseConfig?.projectId) {
        throw new Error("Firebase config not found. Please check your `firebase_config.ts` file and make sure it is correctly set up.");
    }

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig,
        name: "Rebase",
    });

    const collectionsBuilder = useCallback(() => {
        return [
            productsCollection,
            blogCollection
        ];
    }, []);

    // // Here you define your custom top-level views
    // const views: CMSView[] = useMemo(() => ([{
    //     path: "example",
    //     name: "Example CMS view",
    //     view: <ExampleCMSView/>
    // }]), []);

    const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    /**
     * Delegate used for fetching and saving data in Firestore
     */
    const firestoreDelegate = useFirestoreDataSource({
        firebaseApp,
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
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });
    /**
     * Controller in charge of user management
     */
    const userManagement = useBuildUserManagement({
        dataSource: firestoreDelegate,
        authController
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
        authController: userManagement,
        disabled: userManagement.loading,
        authenticator: userManagement.authenticator, // you can define your own authenticator here
        dataSource: firestoreDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        disabled: authLoading,
        collections: collectionsBuilder,
        // collectionPermissions: userManagement.collectionPermissions, // TODO: enable this
        // views,
        adminViews: userManagementAdminViews,
        authController,
        dataSource: firestoreDelegate
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

    if (firebaseConfigLoading || !firebaseApp) {
        return <CircularProgressCenter />;
    }

    if (configError) {
        return <>{configError}</>;
    }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>

                <Rebase
                    navigationController={navigationController}
                    authController={userManagement}
                    userConfigPersistence={userConfigPersistence}
                    dataSource={firestoreDelegate}
                    storageSource={storageSource}
                    plugins={[
                        dataEnhancementPlugin,
                        importPlugin,
                        exportPlugin,
                        userManagementPlugin
                    ]}
                >
                    {({
                        context,
                        loading
                    }) => {

                        let component;
                        if (loading || authLoading) {
                            component = <CircularProgressCenter size={"large"} />;
                        } else {
                            if (!canAccessMainView) {
                                component = (
                                    <div className={"bg-white rounded-2xl max-w-[500px] w-full h-fit"}>
                                        <FirebaseLoginView
                                            logo={logo.src}
                                            allowSkipLogin={false}
                                            signInOptions={signInOptions}
                                            firebaseApp={firebaseApp}
                                            authController={userManagement}
                                            notAllowedError={notAllowedError} />
                                    </div>

                                );
                            } else {
                                component = (
                                    <Scaffold
                                        logo={logo.src}
                                        autoOpenDrawer={false}>
                                        <AppBar title={title}
                                            endAdornment={<Link href={"/"} target={"_blank"}>
                                                <Button variant={"text"}>
                                                    <OpenInNewIcon />
                                                    Go to website
                                                </Button>
                                            </Link>} />
                                        <Drawer />
                                        <NavigationRoutes />
                                        <SideDialogs />
                                    </Scaffold>
                                );
                            }
                        }

                        return component;
                    }}
                </Rebase>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
