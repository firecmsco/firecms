import React from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

import { CMSAppProps } from "./CMSAppProps";
import { CMSMainView } from "./CMSMainView";
import { CMSAppProvider } from "./CMSAppProvider";
import { BrowserRouter as Router } from "react-router-dom";
import CircularProgressCenter from "./internal/CircularProgressCenter";
import CssBaseline from "@material-ui/core/CssBaseline";

import { ThemeProvider } from "@material-ui/core/styles";
import { createCMSDefaultTheme } from "./theme";
import { initCMSFirebase } from "./initCMSFirebase";
import { LoginView } from "./LoginView";
import { FirestoreDatasource } from "../models/data/firestore_datasource";

const DEFAULT_SIGN_IN_OPTIONS = [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
];


/**
 * Main entry point for FireCMS. You can use this component as a full app,
 * by specifying collections and entity schemas.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * If you are building a larger app and need finer control, you can use
 * {@link CMSAppProvider} and {@link CMSMainView} instead.
 *
 * @param props
 * @constructor
 * @category Core
 */
export function CMSApp({
                           name,
                           logo,
                           toolbarExtraWidget,
                           authentication,
                           schemaResolver,
                           navigation,
                           allowSkipLogin,
                           signInOptions,
                           firebaseConfig,
                           onFirebaseInit,
                           primaryColor,
                           secondaryColor,
                           fontFamily,
                           dateTimeFormat,
                           locale
                       }: CMSAppProps) {

    const {
        firebaseConfigLoading,
        usedFirebaseConfig,
        configError,
        firebaseConfigError
    } = initCMSFirebase(onFirebaseInit, firebaseConfig);

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

    if (firebaseConfigLoading || !usedFirebaseConfig) {
        return <CircularProgressCenter/>;
    }

    const mode: "light" | "dark" = "light";
    const theme = createCMSDefaultTheme({
        mode,
        primaryColor,
        secondaryColor,
        fontFamily
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <CMSAppProvider navigation={navigation}
                                authentication={authentication}
                                firebaseConfig={usedFirebaseConfig}
                                schemaResolver={schemaResolver}
                                dateTimeFormat={dateTimeFormat}
                                dataSource={FirestoreDatasource}
                                locale={locale}>
                    {({ authController, cmsAppContext }) => {
                        if (!authController.canAccessMainView) {
                            return (
                                <LoginView
                                    logo={logo}
                                    skipLoginButtonEnabled={allowSkipLogin}
                                    signInOptions={signInOptions ?? DEFAULT_SIGN_IN_OPTIONS}
                                    firebaseConfig={usedFirebaseConfig}/>
                            );
                        }
                        return <CMSMainView name={name}
                                            logo={logo}
                                            toolbarExtraWidget={toolbarExtraWidget}/>;
                    }}
                </CMSAppProvider>
            </Router>
        </ThemeProvider>
    );
}
