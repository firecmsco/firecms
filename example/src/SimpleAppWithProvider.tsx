import React from "react";

import {
    Authenticator,
    createCMSDefaultTheme,
    useFirebaseAuthHandler,
    buildCollection,
    buildSchema,
    useFirestoreDataSource,
    useFirebaseStorageSource,
    CMSAppProvider,
    CMSMainView,
    NavigationBuilder,
    NavigationBuilderProps,
    User,
    AuthController,
    FirebaseLoginView,
    initCMSFirebase,
    EntityLinkBuilder
} from "@camberi/firecms";
import { Box, CircularProgress } from "@material-ui/core";

import  { FirebaseApp } from "firebase/app";

import "typeface-rubik";
import "typeface-space-mono";

import { firebaseConfig } from "./firebase_config";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import {GoogleAuthProvider} from "firebase/auth";

import { BrowserRouter as Router } from "react-router-dom";

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

export function SimpleAppWithProvider() {

    const [
        firebaseConfigInitialized,
        setFirebaseConfigInitialized
    ] = React.useState<boolean>(false);

    const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
        collections: [
            buildCollection({
                relativePath: "products",
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

    const myAuthenticator: Authenticator = (user?: User) => {
        console.log("Allowing access to", user?.email);
        return true;
    };

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = initCMSFirebase({ firebaseConfig });

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
        return <Box
            display="flex"
            width={"100%"} height={"100vh"}>
            <Box m="auto">
                <CircularProgress/>
            </Box>
        </Box>;
    }

    const mode: "light" | "dark" = "light";
    const theme = createCMSDefaultTheme({
        mode
    });

    const authController: AuthController = useFirebaseAuthHandler({
        firebaseApp: firebaseApp as FirebaseApp,
        authentication: myAuthenticator
    });

    const dataSource = useFirestoreDataSource(firebaseApp!);
    const storageSource = useFirebaseStorageSource(firebaseApp!);
    const entityLinkBuilder:EntityLinkBuilder = ({entity}) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <CMSAppProvider navigation={navigation}
                                authController={authController}
                                entityLinkBuilder={entityLinkBuilder}
                                dataSource={dataSource}
                                storageSource={storageSource}>
                    {({  context }) => {
                        if (!context.authController.canAccessMainView) {
                            return (
                                <FirebaseLoginView
                                    skipLoginButtonEnabled={false}
                                    signInOptions={DEFAULT_SIGN_IN_OPTIONS}
                                    firebaseApp={firebaseApp}/>
                            );
                        }
                        return <CMSMainView name={"My Online Shop"}/>;
                    }}
                </CMSAppProvider>
            </Router>
        </ThemeProvider>
    );
}
