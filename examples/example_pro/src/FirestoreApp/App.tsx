import React, { useCallback } from "react";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import "@fontsource/roboto"

import { getAnalytics, logEvent } from "firebase/analytics";
import { User as FirebaseUser } from "firebase/auth";

import {
    Authenticator,
    CMSView,
    FireCMSProApp,
    FirestoreIndexesBuilder,
    GitHubIcon,
    IconButton,
    Tooltip
} from "@firecms/firebase_pro";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { useImportExportPlugin } from "@firecms/data_import_export";

import { firebaseConfig } from "../firebase_config";
// import { publicRecaptchaKey } from "../appcheck_config";
import { ExampleCMSView } from "./ExampleCMSView";
import logo from "./images/demo_logo.png";
import { testCollection } from "./collections/test_collection";
import { usersCollection } from "./collections/users_collection";
import { localeCollectionGroup, productsCollection } from "./collections/products_collection";
import { blogCollection } from "./collections/blog_collection";
import { showcaseCollection } from "./collections/showcase_collection";

import { algoliaSearchControllerBuilder } from "./text_search";

import { CustomLoginView } from "./CustomLoginView";
import { cryptoCollection } from "./collections/crypto_collection";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import { booksCollection } from "./collections/books_collection";
import { FirebaseApp } from "firebase/app";
import { TestEditorView } from "./TestEditorView";

function App() {
    // const appCheckOptions: AppCheckOptions = {
    //     providerKey: publicRecaptchaKey,
    //     useEnterpriseRecaptcha: false,
    //     isTokenAutoRefreshEnabled: true,
    //     // debugToken: appCheckDebugToken,
    //     forceRefresh: false
    // };

    const githubLink = (
        <Tooltip
            title="See this project on GitHub. This button is only present in this demo">
            <IconButton
                href={"https://github.com/firecmsco/firecms"}
                rel="noopener noreferrer"
                target="_blank"
                component={"a"}
                size="large">
                <GitHubIcon/>
            </IconButton>
        </Tooltip>
    );

    const customViews: CMSView[] = [
        {
            path: "additional",
            name: "Additional",
            group: "Content",
            description: "This is an example of an additional view that is defined by the user",
            view: <ExampleCMSView/>
        },
        {
            path: "editor_test",
            name: "Editor test",
            group: "Content",
            view: <TestEditorView/>
        },
    ];

    const onFirebaseInit = (config: object, app: FirebaseApp) => {
        // Just calling analytics enables screen tracking
        // getAnalytics(app);

        // This is an example of connecting to a local emulator (move import to top)
        // import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
        // connectFirestoreEmulator(getFirestore(app), '127.0.0.1', 8080);
    };

    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        // This is an example of retrieving async data related to the user
        // and storing it in the controller's extra field
        const idTokenResult = await user?.getIdTokenResult();
        const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@camberi.com");

        console.log("Allowing access to", user);
        return true;
    }, []);

    const collections = [
        booksCollection,
        productsCollection,
        localeCollectionGroup,
        usersCollection,
        blogCollection,
        showcaseCollection,
        cryptoCollection
    ];

    if (process.env.NODE_ENV !== "production") {
        collections.push(testCollection);
    }

    const onAnalyticsEvent = useCallback((event: string, data?: object) => {
        const analytics = getAnalytics();
        logEvent(analytics, event, data);
    }, []);

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        getConfigForPath: ({ path }) => {
            if (process.env.NODE_ENV !== "production")
                return true;
            if (path === "books")
                return true;
            if (path === "blog")
                return true;
            return false;
        }
    });

    const importExportPlugin = useImportExportPlugin();

    const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
        if (path === "products") {
            return [
                {
                    category: "asc",
                    available: "desc"
                },
                {
                    category: "asc",
                    available: "asc"
                },
                {
                    category: "desc",
                    available: "desc"
                },
                {
                    category: "desc",
                    available: "asc"
                }
            ];
        }
        return undefined;
    }

    return <FireCMSProApp
        name={"My Online Shop"}
        // appCheckOptions={appCheckOptions}
        authentication={myAuthenticator}
        allowSkipLogin={true}
        plugins={[importExportPlugin, dataEnhancementPlugin]}
        signInOptions={[
            "password",
            "google.com"
            // 'anonymous',
            // 'phone',
            // 'facebook.com',
            // 'github.com',
            // 'twitter.com',
            // 'microsoft.com',
            // 'apple.com'
        ]}
        textSearchControllerBuilder={algoliaSearchControllerBuilder}
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        logo={logo}
        collections={(params) => collections}
        views={customViews}
        firebaseConfig={firebaseConfig}
        onFirebaseInit={onFirebaseInit}
        toolbarExtraWidget={githubLink}
        components={{
            LoginView: CustomLoginView
        }}
        onAnalyticsEvent={onAnalyticsEvent}
        // autoOpenDrawer={true}
        propertyConfigs={[
            {
                key: "test_custom_field",
                name: "Test custom field",
                property: {
                    dataType: "string",
                    Field: CustomColorTextField
                }
            }

        ]}
    />;

}

export default App;
