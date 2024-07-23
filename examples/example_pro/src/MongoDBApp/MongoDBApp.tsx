import React from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";

import {
    AppBar,
    CircularProgressCenter,
    DataSourceDelegate,
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

import { useFirebaseStorageSource, useInitialiseFirebase, } from "@firecms/firebase";

import { productsCollection } from "./collections/products_collection";
import { CenteredView } from "@firecms/ui";
import {
    MongoAuthController,
    MongoLoginView,
    useInitRealmMongodb,
    useMongoDBAuthController,
    useMongoDBDelegate
} from "@firecms/mongodb";

const firebaseConfig = {
    apiKey: "AIzaSyCIZxRC_0uy9zU2sQrEo88MigD4Z9ktYzo",
    authDomain: "rtdb-test-eb959.firebaseapp.com",
    databaseURL: "https://rtdb-test-eb959-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rtdb-test-eb959",
    storageBucket: "rtdb-test-eb959.appspot.com",
    messagingSenderId: "380781473867",
    appId: "1:380781473867:web:94e8457d48c642b1655dce"
};

const atlasConfig = {
    "appId": "application-0-pipnj",
    "appUrl": "https://services.cloud.mongodb.com/groups/63c475b9c324f74b835685c0/apps/64d63e85667be3b511a93f3a",
    "baseUrl": "https://services.cloud.mongodb.com",
    "clientApiBaseUrl": "https://europe-west1.gcp.services.cloud.mongodb.com",
    "dataApiBaseUrl": "https://europe-west1.gcp.data.mongodb-api.com",
    "dataExplorerLink": "https://cloud.mongodb.com/links/63c475b9c324f74b835685c0/explorer/Cluster0/database/collection/find",
    "dataSourceName": "mongodb-atlas"
}

function MongoDBApp() {

    const name = "My FireCMS App";

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    const { app } = useInitRealmMongodb(atlasConfig);

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const authController: MongoAuthController = useMongoDBAuthController({
        app
    });

    const cluster = "mongodb-atlas"
    const database = "todo"

    const mongoDataSourceDelegate = useMongoDBDelegate({
        app,
        cluster,
        database
    });

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
        authenticator: () => true,
        dataSourceDelegate: mongoDataSourceDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        collections: [productsCollection],
        authController,
        dataSourceDelegate: mongoDataSourceDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
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
                    dataSourceDelegate={mongoDataSourceDelegate}
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
                                    <MongoLoginView
                                        allowSkipLogin={false}
                                        authController={authController}
                                        registrationEnabled={true}
                                        notAllowedError={notAllowedError}/>
                                );
                            } else {
                                component = (
                                    <Scaffold
                                        autoOpenDrawer={false}>
                                        <AppBar
                                            title={name}/>
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

export default MongoDBApp;
