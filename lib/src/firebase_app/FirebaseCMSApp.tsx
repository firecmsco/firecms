import React, { useEffect, useMemo } from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

import {
    CircularProgressCenter,
    createCMSDefaultTheme,
    FireCMS,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController
} from "../core";

import { FirebaseCMSAppProps } from "./FirebaseCMSAppProps";
import { useFirebaseAuthController } from "./hooks/useFirebaseAuthController";
import { useFirestoreDataSource } from "./hooks/useFirestoreDataSource";
import { useFirebaseStorageSource } from "./hooks/useFirebaseStorageSource";
import { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";
import { FirebaseLoginView } from "./components/FirebaseLoginView";
import { FirebaseAuthController } from "./models/auth";
import { useValidateAuthenticator } from "./hooks/useValidateAuthenticator";
import { useBrowserTitleAndIcon } from "../hooks";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

/**
 * This is the default implementation of a FireCMS app using the Firebase services
 * as a backend.
 * You can use this component as a full app, by specifying collections and
 * entity collections.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * If you are building a larger app and need finer control, you can use
 * {@link FireCMS}, {@link Scaffold}, {@link SideDialogs}
 * and {@link NavigationRoutes} instead.
 *
 * @param props
 * @constructor
 * @category Firebase
 */
export function FirebaseCMSApp({
                                   name,
                                   logo,
                                   logoDark,
                                   toolbarExtraWidget,
                                   authentication,
                                   collectionOverrideHandler,
                                   collections,
                                   views,
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
                                   LoginView,
    CollectionActions
                               }: FirebaseCMSAppProps) {

    useBrowserTitleAndIcon(name, logo);

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({
        onFirebaseInit,
        firebaseConfig
    });

    /**
     * Controller for managing authentication
     */
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useFirestoreDataSource({
        firebaseApp,
        textSearchController
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
        authentication,
        dataSource,
        storageSource
    });

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    const theme = useMemo(() => createCMSDefaultTheme({
        mode: modeController.mode,
        primaryColor,
        secondaryColor,
        fontFamily
    }), [fontFamily, modeController.mode, primaryColor, secondaryColor]);

    if (configError) {
        return <div> {configError} </div>;
    }

    if (firebaseConfigError) {
        return <div>
            <p>It seems like the provided Firebase config is not correct. If you
                are using the credentials provided automatically by Firebase
                Hosting, make sure you link your Firebase app to Firebase
                Hosting.</p>
            <p>{String(firebaseConfigError)}</p>
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
            <SnackbarProvider>
                <FireCMS
                    collections={collections}
                    views={views}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    collectionOverrideHandler={collectionOverrideHandler}
                    modeController={modeController}
                    dateTimeFormat={dateTimeFormat}
                    dataSource={dataSource}
                    storageSource={storageSource}
                    entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                    locale={locale}
                    basePath={basePath}
                    baseCollectionPath={baseCollectionPath}>
                    {({ context, loading }) => {

                        let component;
                        if (loading || authLoading) {
                            component = <CircularProgressCenter/>;
                        } else {
                            const usedLogo = modeController.mode === "dark" && logoDark ? logoDark : logo;
                            if (!canAccessMainView) {
                                const LoginViewUsed = LoginView ?? FirebaseLoginView;
                                component = (
                                    <LoginViewUsed
                                        logo={usedLogo}
                                        allowSkipLogin={allowSkipLogin}
                                        signInOptions={signInOptions ?? DEFAULT_SIGN_IN_OPTIONS}
                                        firebaseApp={firebaseApp}
                                        authController={authController}
                                        notAllowedError={notAllowedError}/>
                                );
                            } else {
                                component = (
                                    <Scaffold
                                        name={name}
                                        logo={usedLogo}
                                        toolbarExtraWidget={toolbarExtraWidget}>
                                        <NavigationRoutes HomePage={HomePage}/>
                                        <SideDialogs/>
                                    </Scaffold>
                                );
                            }
                        }

                        return (
                            <ThemeProvider theme={theme}>
                                <CssBaseline/>
                                {component}
                            </ThemeProvider>
                        );
                    }}
                </FireCMS>
            </SnackbarProvider>
        </BrowserRouter>
    );
}
