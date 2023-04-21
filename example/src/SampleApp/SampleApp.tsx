import React, { useCallback } from "react";

import { getAnalytics, logEvent } from "firebase/analytics";
import { User as FirebaseUser } from "firebase/auth";

import {
    AppCheckOptions,
    Authenticator,
    CMSView,
    FirebaseCMSApp
} from "firecms";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import { IconButton, Tooltip } from "@mui/material";
import { GitHub } from "@mui/icons-material";

import { firebaseConfig } from "../firebase_config";
import { publicRecaptchaKey } from "../appcheck_config";
import { ExampleCMSView } from "./ExampleCMSView";
import logo from "./images/demo_logo.png";
import { testCollection } from "./collections/test_collection";
import { usersCollection } from "./collections/users_collection";
import {
    productsCollection
} from "./collections/products_collection";
import { blogCollection } from "./collections/blog_collection";
import { showcaseCollection } from "./collections/showcase_collection";

import { textSearchController } from "./text_search";

import {
    customCollectionOverrideHandler
} from "./collections/custom_collection_resolver";
import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { CustomLoginView } from "./CustomLoginView";
import { cryptoCollection } from "./collections/crypto_collection";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import { booksCollection } from "./collections/books_collection";

function SampleApp() {
    const appCheckOptions: AppCheckOptions = {
        providerKey: publicRecaptchaKey,
        useEnterpriseRecaptcha: false,
        isTokenAutoRefreshEnabled: true,
        // debugToken: appCheckDebugToken,
        forceRefresh: false
    };

    const githubLink = (
        <Tooltip
            title="See this project on GitHub. This button is only present in this demo">
            <IconButton
                href={"https://github.com/Camberi/firecms"}
                rel="noopener noreferrer"
                target="_blank"
                component={"a"}
                size="large">
                <GitHub/>
            </IconButton>
        </Tooltip>
    );

    const customViews: CMSView[] = [{
        path: "additional",
        name: "Additional",
        group: "Content",
        description: "This is an example of an additional view that is defined by the user",
        view: <ExampleCMSView/>
    }];

    const onFirebaseInit = (config: object) => {
        // Just calling analytics enables screen tracking
        getAnalytics();
    };

    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        // This is an example of retrieving async data related to the user
        // and storing it in the user extra field
        const idTokenResult = await user?.getIdTokenResult();
        const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@camberi.com");
        authController.setExtra({
            roles: {
                admin: userIsAdmin
            }
        });

        console.log("Allowing access to", user);
        return true;
    }, []);

    const collections = [
        productsCollection,
        booksCollection,
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
            return false;
        }
    });

    return <FirebaseCMSApp
        name={"My Online Shop"}
        // appCheckOptions={appCheckOptions}
        authentication={myAuthenticator}
        allowSkipLogin={true}
        plugins={[dataEnhancementPlugin]}
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
        textSearchController={textSearchController}
        logo={logo}
        collections={(params) => collections}
        views={customViews}
        collectionOverrideHandler={customCollectionOverrideHandler}
        firebaseConfig={firebaseConfig}
        onFirebaseInit={onFirebaseInit}
        toolbarExtraWidget={githubLink}
        LoginView={CustomLoginView}
        onAnalyticsEvent={onAnalyticsEvent}
        // autoOpenDrawer={true}
        fields={{
            test_custom_field: {
                name: "Test custom field",
                dataType: "string",
                Field: CustomColorTextField
            }
        }}
    />;

}

export default SampleApp;
