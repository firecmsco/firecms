import React, { useMemo } from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import {
    buildCollection,
    CircularProgressCenter,
    createCMSDefaultTheme,
    FirebaseAuthController,
    FirebaseLoginView,
    FireCMS,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildModeController,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDataSource,
    useInitialiseFirebase,
    useValidateAuthenticator
} from "firecms";

import { firebaseConfig } from "../firebase_config";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

const productsCollection = buildCollection({
    path: "products",
    permissions: ({ user }) => ({
        edit: true,
        create: true,
        delete: true
    }),
    name: "Products",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        price: {
            name: "Price",
            validation: {
                required: true,
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            description: "Price with range validation",
            dataType: "number"
        },
        status: {
            name: "Status",
            validation: { required: true },
            dataType: "string",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            enumValues: {
                private: "Private",
                public: "Public"
            }
        }
    }
});

/**
 * This is an example of how to use the components provided by FireCMS for
 * a better customisation.
 * @constructor
 */
export function CustomCMSApp() {

    const signInOptions = DEFAULT_SIGN_IN_OPTIONS;

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({ firebaseConfig });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    const dataSource = useFirestoreDataSource({
        firebaseApp
        // You can add your `FirestoreTextSearchController` here
    });

    const storageSource = useFirebaseStorageSource({ firebaseApp });

    const modeController = useBuildModeController();
    const theme = useMemo(() => createCMSDefaultTheme({ mode: modeController.mode }), [modeController.mode]);

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        authentication: async ({ user }) => {
            console.log("Allowing access to", user?.email);
            return true;
        },
        dataSource,
        storageSource
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

    return (
        <Router>
            <SnackbarProvider>
                <ModeControllerProvider
                    value={modeController}>
                    <FireCMS authController={authController}
                             collections={[productsCollection]}
                             dataSource={dataSource}
                             storageSource={storageSource}
                             entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                    >
                        {({ context, loading }) => {

                            let component;
                            if (loading) {
                                component = <CircularProgressCenter/>;
                            } else if (!canAccessMainView) {
                                component = (
                                    <FirebaseLoginView
                                        allowSkipLogin={false}
                                        signInOptions={signInOptions}
                                        firebaseApp={firebaseApp}
                                        authController={authController}/>
                                );
                            } else {
                                component = (
                                    <Scaffold name={"My Online Shop"}>
                                        <NavigationRoutes/>
                                        <SideDialogs/>
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
                </ModeControllerProvider>
            </SnackbarProvider>
        </Router>
    );

}
