import React from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

import {
    CircularProgressCenter,
    CMSAppProvider,
    CMSScaffold,
    CMSRoutes,
    createCMSDefaultTheme
} from "../core";
import { AuthController } from "../contexts";
import { EntityLinkBuilder } from "../models";

import { FirebaseCMSAppProps } from "./FirebaseCMSAppProps";
import { useFirebaseAuthController } from "./useFirebaseAuthController";
import { useFirestoreDataSource } from "./useFirestoreDataSource";
import { useFirebaseStorageSource } from "./useFirebaseStorageSource";
import { useInitialiseFirebase } from "./useInitialiseFirebase";
import FirebaseLoginView from "./FirebaseLoginView";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

/**
 * Main entry point for FireCMS. You can use this component as a full app,
 * by specifying collections and entity schemas.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * If you are building a larger app and need finer control, you can use
 * {@link CMSAppProvider} and {@link CMSScaffold} instead.
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
                           schemaResolver,
                           navigation,
                           textSearchDelegateResolver,
                           allowSkipLogin,
                           signInOptions,
                           firebaseConfig,
                           onFirebaseInit,
                           primaryColor,
                           secondaryColor,
                           fontFamily,
                           dateTimeFormat,
                           locale
                       }: FirebaseCMSAppProps) {

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({ onFirebaseInit, firebaseConfig });

    const authController: AuthController = useFirebaseAuthController({
        firebaseApp,
        authentication
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
        return <CircularProgressCenter/>;
    }

    const dataSource = useFirestoreDataSource({
        firebaseApp: firebaseApp!,
        textSearchDelegateResolver
    });
    const storageSource = useFirebaseStorageSource({ firebaseApp: firebaseApp! });

    const mode: "light" | "dark" = "light";
    const theme = createCMSDefaultTheme({
        mode,
        primaryColor,
        secondaryColor,
        fontFamily
    });

    const entityLinkBuilder: EntityLinkBuilder = ({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`;

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>

                <CssBaseline/>

                <CMSAppProvider navigation={navigation}
                                authController={authController}
                                schemaResolver={schemaResolver}
                                dateTimeFormat={dateTimeFormat}
                                dataSource={dataSource}
                                storageSource={storageSource}
                                entityLinkBuilder={entityLinkBuilder}
                                locale={locale}>
                    {({ context }) => {

                        if (context.authController.authLoading || context.navigationLoading) {
                            return <CircularProgressCenter/>;
                        }

                        if (!context.authController.canAccessMainView) {
                            return (
                                <FirebaseLoginView
                                    logo={logo}
                                    skipLoginButtonEnabled={allowSkipLogin}
                                    signInOptions={signInOptions ?? DEFAULT_SIGN_IN_OPTIONS}
                                    firebaseApp={firebaseApp}/>
                            );
                        }

                        return (
                                <CMSScaffold name={name}
                                             logo={logo}
                                             toolbarExtraWidget={toolbarExtraWidget}>
                                    {context.navigation && <CMSRoutes navigation={context.navigation}/>}
                                </CMSScaffold>
                        );
                    }}
                </CMSAppProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
