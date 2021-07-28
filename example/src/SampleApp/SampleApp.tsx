import React from "react";
import {
    Authenticator,
    buildCollection,
    CMSApp,
    CMSView,
    EntityCollection,
    Navigation,
    NavigationBuilder,
    NavigationBuilderProps
} from "@camberi/firecms";

import firebase from "firebase";
import { IconButton, Tooltip } from "@material-ui/core";
import { GitHub } from "@material-ui/icons";

import { firebaseConfig } from "../firebase_config";
import { ExampleCMSView } from "./ExampleCMSView";
import logo from "./images/test_shop_logo.png";
import {
    blogSearchDelegate,
    productsSearchDelegate,
    usersSearchDelegate
} from "./algolia_utils";
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

function SampleApp() {

    const localeCollection: EntityCollection<typeof localeSchema> =
        buildCollection({
            name: "Locales",
            relativePath: "locales",
            schema: localeSchema,
            defaultSize: "m"
        });

    const productsCollection = buildCollection<typeof productSchema>({
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        group: "Main",
        description: "List of the products currently sold in our shop",
        textSearchDelegate: productsSearchDelegate,
        additionalColumns: [productAdditionalColumn],
        indexes: [{ category: "desc", available: "desc" }],
        permissions: ({ user, authController }) => ({
            edit: true,
            create: true,
            // we use some custom logic by storing user data in the 'extra;
            // field of the authcontroller while building the main navigation
            // (see below)
            delete: authController.extra.roles.includes("admin")
        }),
        extraActions: productExtraActionBuilder,
        subcollections: [localeCollection],
        excludedProperties: ["images", "related_products"]
    });

    const usersCollection = buildCollection<typeof usersSchema>({
        relativePath: "users",
        schema: usersSchema,
        name: "Users",
        group: "Main",
        description: "Registered users",
        textSearchDelegate: usersSearchDelegate,
        additionalColumns: [
            {
                id: "sample_additional",
                title: "Sample additional",
                builder: () => "Content of a generated column"
            }
        ],
        properties: ["first_name", "last_name", "email", "phone", "sample_additional", "picture"]
    });

    const blogCollection = buildCollection<typeof blogSchema>({
        relativePath: "blog",
        schema: blogSchema,
        name: "Blog",
        group: "Content",
        exportable: {
            additionalColumns: [sampleAdditionalExportColumn]
        },
        defaultSize: "l",
        properties: ["name", "header_image", "status", "content", "reviewed", "products", "gold_text"],
        description: "Collection of blog entries included in our [awesome blog](https://www.google.com)",
        textSearchDelegate: blogSearchDelegate,
        initialFilter: {
            "status": ["==", "published"]
        }
    });

    const testCollection = buildCollection<typeof testEntitySchema>({
        relativePath: "test_entity",
        schema: testEntitySchema,
        name: "Test entity",
        subcollections: [{
            relativePath: "test_subcollection",
            schema: testEntitySchema,
            name: "Test entity"
        }]
    });

    const myAuthenticator: Authenticator = (user?: firebase.User) => {
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
                component={"a"}>
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
                                                     user,
                                                     authController
                                                 }: NavigationBuilderProps) => {

        // This is a fake example of retrieving async data related to the user
        // and storing it in the authController
        const sampleUser = await Promise.resolve({
            name: "John",
            roles: ["admin"]
        });
        authController.setExtra(sampleUser);

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

    return <CMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        signInOptions={[
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ]}
        allowSkipLogin={true}
        logo={logo}
        navigation={navigation}
        schemaResolver={customSchemaResolver}
        firebaseConfig={firebaseConfig}
        onFirebaseInit={onFirebaseInit}
        toolbarExtraWidget={githubLink}
    />;
}

export default SampleApp;

