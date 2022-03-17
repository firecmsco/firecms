import React from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

import {
    CircularProgressCenter,
    createCMSDefaultTheme,
    FireCMS,
    NavigationRoutes,
    Scaffold,
    SideEntityDialogs,
    useBuildSchemaRegistry
} from "../core";

import { FirebaseCMSAppProps } from "./FirebaseCMSAppProps";
import { useFirebaseAuthDelegate } from "./hooks/useFirebaseAuthDelegate";
import { useFirestoreDataSource } from "./hooks/useFirestoreDataSource";
import { useFirebaseStorageSource } from "./hooks/useFirebaseStorageSource";
import { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";
import { FirebaseLoginView } from "./components/FirebaseLoginView";
import { FirebaseAuthDelegate } from "./models/auth";
import {
    useBuildFirestoreConfigurationPersistence
} from "./hooks/useBuildFirestoreConfigurationPersistence";
import {
    useBuildLocalConfigurationPersistence
} from "../core/internal/useBuildLocalConfigurationPersistence";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

/**
 * This is the default implementation of a FireCMS app using the Firebase services
 * as a backend.
 * You can use this component as a full app, by specifying collections and
 * entity schemas.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * If you are building a larger app and need finer control, you can use
 * {@link FireCMS}, {@link Scaffold}, {@link SideEntityDialogs}
 * and {@link NavigationRoutes} instead.
 *
 * @param props
 * @constructor
 * @category Firebase
 */
export function FirebaseCMSApp({
                                   name,
                                   logo,
                                   toolbarExtraWidget,
                                   authentication,
                                   schemaOverrideHandler,
                                   navigation,
                                   schemas,
                                   enumConfigs,
                                   textSearchController,
                                   allowSkipLogin,
                                   signInOptions = DEFAULT_SIGN_IN_OPTIONS,
                                   firebaseConfig,
                                   onFirebaseInit,
                                   primaryColor,
                                   secondaryColor,
                                   fontFamily,
                                   dateTimeFormat,
                                   locale,
                                   HomePage,
                                   basePath,
                                   baseCollectionPath,
                                   LoginViewProps
                               }: FirebaseCMSAppProps) {

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({
        onFirebaseInit,
        firebaseConfig
    });

    const authDelegate: FirebaseAuthDelegate = useFirebaseAuthDelegate({
        firebaseApp,
        signInOptions
    });

    const configPersistence = useBuildFirestoreConfigurationPersistence({
        firebaseApp
    });
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const schemaRegistry = useBuildSchemaRegistry({
        schemas,
        enumConfigs,
        configPersistence,
        userConfigPersistence
    });

    const dataSource = useFirestoreDataSource({
        firebaseApp: firebaseApp,
        textSearchController,
        schemaRegistry
    });
    const storageSource = useFirebaseStorageSource({
        firebaseApp
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
        return <>
            <CssBaseline/>
            <CircularProgressCenter/>
        </>;
    }

    return (
        <BrowserRouter basename={basePath}>
            <FireCMS
                navigation={navigation}
                authDelegate={authDelegate}
                authentication={authentication}
                schemaRegistry={schemaRegistry}
                userConfigPersistence={userConfigPersistence}
                schemaOverrideHandler={schemaOverrideHandler}
                dateTimeFormat={dateTimeFormat}
                dataSource={dataSource}
                storageSource={storageSource}
                configPersistence={configPersistence}
                entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                locale={locale}
                basePath={basePath}
                baseCollectionPath={baseCollectionPath}>
                {({ context, mode, loading }) => {

                    const theme = createCMSDefaultTheme({
                        mode,
                        primaryColor,
                        secondaryColor,
                        fontFamily
                    });

                    let component;
                    if (loading) {
                        component = <CircularProgressCenter/>;
                    } else if (!context.authController.canAccessMainView) {
                        component = (
                            <FirebaseLoginView
                                logo={logo}
                                skipLoginButtonEnabled={allowSkipLogin}
                                signInOptions={signInOptions ?? DEFAULT_SIGN_IN_OPTIONS}
                                firebaseApp={firebaseApp}
                                authDelegate={authDelegate}
                                {...LoginViewProps}
                                />
                        );
                    } else {
                        component = (
                            <Scaffold name={name}
                                      logo={logo}
                                      toolbarExtraWidget={toolbarExtraWidget}>
                                <NavigationRoutes HomePage={HomePage}/>
                                <SideEntityDialogs/>
                            </Scaffold>
                        );
                    }

                    return (
                        <ThemeProvider theme={theme}>
                            <CssBaseline/>
                            {component}
                        </ThemeProvider>
                    );
                }}
            </FireCMS>
        </BrowserRouter>
    );
}
