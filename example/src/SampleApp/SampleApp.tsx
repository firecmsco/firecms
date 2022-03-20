import React from "react";

import { getAnalytics } from "firebase/analytics";
import { User as FirebaseUser } from "firebase/auth";
import {
    Authenticator,
    buildCollection,
    CMSView,
    FirebaseCMSApp,
    Navigation,
    NavigationBuilder,
    NavigationBuilderProps
} from "@camberi/firecms";

import { IconButton, Tooltip } from "@mui/material";
import { GitHub } from "@mui/icons-material";

import { firebaseConfig } from "../firebase_config";
import { ExampleCMSView } from "./ExampleCMSView";
import logo from "./images/demo_logo.png";
import { textSearchController } from "./text_search";
import { productsCollection } from "./schemas/products_schema";
import { blogCollection } from "./schemas/blog_schema";
import { customSchemaOverrideHandler } from "./schemas/custom_schema_resolver";

import "typeface-rubik";
import "typeface-space-mono";
import { testCollection } from "./schemas/test_schema";
import { usersCollection } from "./schemas/users_schema";

function SampleApp() {

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
        path: ["additional", "additional/:id"],
        name: "Additional",
        group: "Content",
        description: "This is an example of an additional view that is defined by the user",
        view: <ExampleCMSView path={"users"} collection={usersCollection}/>
    }];


    const onFirebaseInit = (config: Object) => {
        // Just calling analytics enables screen tracking
        getAnalytics();
    };

    const myAuthenticator: Authenticator<FirebaseUser> = async ({
                                                                    user,
                                                                    authController
                                                                }) => {

        if(user?.email?.includes("flanders")){
            throw Error("Stupid Flanders!");
        }

        // This is an example of retrieving async data related to the user
        // and storing it in the user extra field
        const sampleUserData = await Promise.resolve({
            roles: ["admin"]
        });

        authController.setExtra(sampleUserData);
        console.log("Allowing access to", user);
        return true;
    };

    const navigation: NavigationBuilder<FirebaseUser> = async ({
                                                                   user,
                                                                   authController
                                                               }: NavigationBuilderProps) => {
        if (authController.extra)
            console.log("Custom data stored in the authController", authController.extra);

        const navigation: Navigation = {
            collections: [
                productsCollection,
                usersCollection,
                blogCollection
            ],
            views: customViews
        };

        if (process.env.NODE_ENV !== "production") {
            navigation.collections!.push(buildCollection(testCollection));
        }

        return navigation;
    };

    return <FirebaseCMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        signInOptions={[
            'password',
            // 'anonymous',
            'google.com',
            // 'facebook.com',
            // 'github.com',
            // 'twitter.com',
            // 'microsoft.com',
            // 'apple.com'
        ]}
        textSearchController={textSearchController}
        allowSkipLogin={true}
        logo={logo}
        navigation={navigation}
        schemaOverrideHandler={customSchemaOverrideHandler}
        firebaseConfig={firebaseConfig}
        onFirebaseInit={onFirebaseInit}
        toolbarExtraWidget={githubLink}
        LoginViewProps={{
            NoUserComponent: <>Sample custom message when no user exists</>,
            disableSignupScreen: false,
        }}
    />;
}

export default SampleApp;

