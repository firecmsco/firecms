import React from "react";
import {
    Authenticator,
    buildCollection,
    buildSchema,
    CMSApp,
    CMSView,
    EntityCollection,
    Navigation,
    NavigationBuilder,
    NavigationBuilderProps,
    SchemaResolver
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
import { blogSchema } from "./schemas/blog_schema";
import { testEntitySchema } from "./schemas/test_schema";


function SampleApp() {

    const localeCollection: EntityCollection<typeof localeSchema> =
        buildCollection({
            name: "Locales",
            relativePath: "locales",
            schema: localeSchema,
            defaultSize: "l"
        });

    const productsCollection = buildCollection({
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        group: "Main",
        description: "List of the products currently sold in our shop",
        textSearchDelegate: productsSearchDelegate,
        additionalColumns: [productAdditionalColumn],
        permissions: ({ user }) => ({
            edit: true,
            create: false
        }),
        extraActions: productExtraActionBuilder,
        subcollections: [localeCollection],
        excludedProperties: ["images", "related_products"],
        filterableProperties: ["price", "available_locales"]
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

    const blogCollection = buildCollection({
        relativePath: "blog",
        schema: blogSchema,
        name: "Blog",
        group: "Content",
        description: "Collection of blog entries included in our [awesome blog](https://www.google.com)",
        textSearchDelegate: blogSearchDelegate,
        properties: ["name", "images", "status", "reviewed", "products", "gold_text", "long_text"],
        filterableProperties: ["name", "status"],
        initialFilter: {
            "status": ["==", "published"]
        }
    });

    const testCollection: EntityCollection = {
        relativePath: "test_entity",
        schema: testEntitySchema,
        name: "Test entity",
        filterableProperties: ["difficulty", "search_adjacent", "description"],
        initialSort: ["title", "desc"],
        subcollections: [{
            relativePath: "test_subcollection",
            schema: testEntitySchema,
            name: "Test entity",
            filterableProperties: ["difficulty", "search_adjacent", "description"]
        }]
    };

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
        path: "additional",
        name: "Additional",
        group: "Content",
        description: "This is an example of an additional view that is defined by the user",
        view: <ExampleCMSView/>
    }];

    const customSchemaResolver: SchemaResolver = ({
                                                      entityId,
                                                      collectionPath
                                                  }: {
        entityId?: string;
        collectionPath: string;
    }) => {

        if (entityId === "B0017TNJWY" && collectionPath === "products") {
            const customProductSchema = buildSchema({
                name: "Custom product",
                properties: {
                    name: {
                        title: "Name",
                        description: "This entity is using a schema overridden by a schema resolver",
                        validation: { required: true },
                        dataType: "string"
                    }
                }
            });

            console.log("Using custom schema resolver", collectionPath, entityId);
            return { schema: customProductSchema };
        }
    };

    const onFirebaseInit = (config: Object) => {
        // models.firestore().useEmulator("localhost", 8080);
    };

    const navigation: NavigationBuilder = ({user}: NavigationBuilderProps) => {
        const navigation:Navigation = {
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

