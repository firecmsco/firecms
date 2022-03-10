import React from "react";

import { getAnalytics } from "firebase/analytics";
import { User as FirebaseUser } from "firebase/auth";
import {
    Authenticator,
    buildCollection,
    CMSView,
    EntityCollection,
    FirebaseCMSApp,
    Navigation,
    NavigationBuilder,
    NavigationBuilderProps,
    CollectionTable
} from "@camberi/firecms";

import { IconButton, Tooltip } from "@mui/material";
import { GitHub } from "@mui/icons-material";

import { firebaseConfig } from "../firebase_config";
import { ExampleCMSView } from "./ExampleCMSView";
import logo from "./images/demo_logo.png";
import { textSearchController } from "./text_search";
import {
    localeSchema,
    productCallbacks,
    productExtraActionBuilder,
    productSchema
} from "./schemas/products_schema";

import { usersSchema } from "./schemas/users_schema";
import {
    blogSchema,
    sampleAdditionalExportColumn
} from "./schemas/blog_schema";
import { testCallbacks, testEntitySchema } from "./schemas/test_schema";
import { customSchemaOverrideHandler } from "./schemas/custom_schema_resolver";

import "typeface-rubik";
import "typeface-space-mono";
import { Locale, Product } from "./types";
import { categories, currencies } from "./schemas/enums";

function SampleApp() {

    const localeCollection: EntityCollection<Locale> =
        buildCollection({
            name: "Locales",
            path: "locales",
            schemaId: "locale"
        });

    const productsCollection = buildCollection<Product>({
        path: "products",
        schemaId: "product",
        // inlineEditing: false,
        callbacks: productCallbacks,
        name: "Products",
        group: "Main",
        description: "List of the products currently sold in our shop",
        textSearchEnabled: true,
        permissions: ({ authController }) => ({
            edit: true,
            create: true,
            // we use some custom logic by storing user data in the `extra`
            // field of the user
            delete: authController.extra?.roles.includes("admin")
        }),
        extraActions: productExtraActionBuilder,
        subcollections: [localeCollection]
    });

    const usersCollection = buildCollection({
        path: "users",
        schemaId: "user",
        name: "Users",
        group: "Main",
        description: "Registered users",
        textSearchEnabled: true,
    });

    const blogCollection = buildCollection({
        path: "blog",
        schemaId: "blog_entry",
        name: "Blog",
        group: "Content",
        exportable: {
            additionalColumns: [sampleAdditionalExportColumn]
        },
        description: "Collection of blog entries included in our [awesome blog](https://www.google.com)",
        textSearchEnabled: true,

    });

    const testCollection = buildCollection({
        path: "test_entity",
        schemaId: "test",
        callbacks: testCallbacks,
        name: "Test entity",
        subcollections: [{
            path: "test_subcollection",
            schemaId: "test",
            name: "Test entity"
        }]
    });

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
        schemas={[productSchema, usersSchema, blogSchema, localeSchema, testEntitySchema]}
        enumConfigs={[{ id: "currencies", enumValues: currencies }]}
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

