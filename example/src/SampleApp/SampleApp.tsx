import React from "react";

import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import {
    Authenticator,
    buildCollection,
    CMSView,
    EntityCollection,
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
import {
    localeSchema,
    productAdditionalColumn,
    productExtraActionBuilder,
    productSchema
} from "./schemas/products_schema";

import { usersSchema } from "./schemas/users_schema";
import {
    blogSchema,
    sampleAdditionalExportColumn
} from "./schemas/blog_schema";
import { testEntitySchema } from "./schemas/test_schema";
import { customSchemaResolver } from "./schemas/custom_schema_resolver";

import "typeface-rubik";
import "typeface-space-mono";
import { Locale, Product } from "./types";

function SampleApp() {

    const localeCollection: EntityCollection<Locale> =
        buildCollection({
            name: "Locales",
            relativePath: "locales",
            schema: localeSchema,
            defaultSize: "m"
        });

    const productsCollection = buildCollection<Product>({
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        group: "Main",
        description: "List of the products currently sold in our shop",
        textSearchEnabled: true,
        additionalColumns: [productAdditionalColumn],
        indexes: [{ category: "desc", available: "desc" }],
        permissions: ({ user }) => ({
            edit: true,
            create: true,
            // we use some custom logic by storing user data in the `extra`
            // field of the user
            delete: user && user.extra?.roles.includes("admin")
        }),
        extraActions: productExtraActionBuilder,
        subcollections: [localeCollection],
        excludedProperties: ["images"]
    });

    const usersCollection = buildCollection({
        relativePath: "users",
        schema: usersSchema,
        name: "Users",
        group: "Main",
        description: "Registered users",
        textSearchEnabled: true,
        additionalColumns: [
            {
                id: "sample_additional",
                title: "Sample additional",
                builder: () => "Content of a generated column"
            }
        ],
        properties: ["first_name", "last_name", "email", "liked_products", "picture", "phone", "sample_additional"]
    });

    const blogCollection = buildCollection({
        relativePath: "blog",
        schema: blogSchema,
        name: "Blog",
        group: "Content",
        exportable: {
            additionalColumns: [sampleAdditionalExportColumn]
        },
        defaultSize: "l",
        properties: ["name", "header_image", "status", "content", "reviewed", "gold_text"],
        description: "Collection of blog entries included in our [awesome blog](https://www.google.com)",
        textSearchEnabled: true,
        initialFilter: {
            "status": ["==", "published"]
        }
    });

    const testCollection = buildCollection({
        relativePath: "test_entity",
        schema: testEntitySchema,
        name: "Test entity",
        subcollections: [{
            relativePath: "test_subcollection",
            schema: testEntitySchema,
            name: "Test entity"
        }]
    });

    const myAuthenticator: Authenticator = ({ user }) => {
        console.log("Allowing access to", user?.email);
        return true;
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
        path: ["additional", "additional/:id"],
        name: "Additional",
        group: "Content",
        description: "This is an example of an additional view that is defined by the user",
        view: <ExampleCMSView/>
    }];


    const onFirebaseInit = (config: Object) => {
        // models.firestore().useEmulator("localhost", 8080);
    };

    const navigation: NavigationBuilder = async ({
                                                     user
                                                 }: NavigationBuilderProps) => {

        // This is a fake example of retrieving async data related to the user
        // and storing it in the user extra field
        const sampleUserData = await Promise.resolve({
            name: "John",
            roles: ["admin"]
        });
        if (user) user.extra = sampleUserData;

        const navigation: Navigation = {
            collections: [
                productsCollection,
                usersCollection,
                blogCollection
            ],
            views: customViews
        };

        if (process.env.NODE_ENV !== "production") {
            navigation.collections.push(buildCollection(testCollection));
        }

        return navigation;
    };

    return <FirebaseCMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        signInOptions={[
            GoogleAuthProvider.PROVIDER_ID,
            EmailAuthProvider.PROVIDER_ID
        ]}
        textSearchController={textSearchController}
        allowSkipLogin={true}
        // logo={logo}
        navigation={navigation}
        schemaResolver={customSchemaResolver}
        firebaseConfig={firebaseConfig}
        onFirebaseInit={onFirebaseInit}
        toolbarExtraWidget={githubLink}
    />;
}

export default SampleApp;

