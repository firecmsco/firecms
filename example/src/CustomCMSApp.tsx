import React from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";

import "typeface-rubik";
import "typeface-space-mono";

import {
    AuthDelegate,
    Authenticator,
    buildCollection,
    buildSchema,
    CircularProgressCenter,
    createCMSDefaultTheme,
    FirebaseLoginView,
    FireCMS,
    NavigationBuilder,
    NavigationBuilderProps,
    NavigationRoutes,
    Scaffold,
    SideEntityDialogs,
    useFirebaseAuthDelegate,
    useFirebaseStorageSource,
    useFirestoreDataSource,
    useInitialiseFirebase
} from "@camberi/firecms";

import { firebaseConfig } from "./firebase_config";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

const productSchema = buildSchema({
    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        price: {
            title: "Price",
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
            title: "Status",
            validation: { required: true },
            dataType: "string",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            config: {
                enumValues: {
                    private: "Private",
                    public: "Public"
                }
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

    const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
        collections: [
            buildCollection({
                path: "products",
                schema: productSchema,
                name: "Products",
                permissions: ({ user }) => ({
                    edit: true,
                    create: true,
                    delete: true
                })
            })
        ]
    });

    const myAuthenticator: Authenticator = ({ user }) => {
        console.log("Allowing access to", user?.email);
        return true;
    };

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({ firebaseConfig });

    const authDelegate: AuthDelegate = useFirebaseAuthDelegate({
        firebaseApp,
    });

    const dataSource = useFirestoreDataSource({
        firebaseApp: firebaseApp
        // You can add your `FirestoreTextSearchController` here
    });
    const storageSource = useFirebaseStorageSource({ firebaseApp: firebaseApp });

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
            <FireCMS navigation={navigation}
                     authDelegate={authDelegate}
                     authentication={myAuthenticator}
                     dataSource={dataSource}
                     storageSource={storageSource}
                     entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
            >
                {({ context, mode, loading }) => {

                    const theme = createCMSDefaultTheme({ mode });

                    let component;
                    if (loading) {
                        component = <CircularProgressCenter/>;
                    } else if (!context.authController.canAccessMainView) {
                        component = (
                            <FirebaseLoginView
                                skipLoginButtonEnabled={false}
                                signInOptions={DEFAULT_SIGN_IN_OPTIONS}
                                firebaseApp={firebaseApp}
                                authDelegate={authDelegate}/>
                        );
                    } else {
                        component = (
                            <Scaffold name={"My Online Shop"}>
                                <NavigationRoutes/>
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
        </Router>
    );

}
