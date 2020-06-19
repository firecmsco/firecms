import React from "react";
import ReactDOM from "react-dom";

import {
    Authenticator,
    CMSApp,
    EntityCollectionView,
    EntitySchema,
    EnumValues
} from "@camberi/firecms";
import firebase from "firebase";

const status = {
    private: "Private",
    public: "Public"
};

// Replace with your config
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const categories: EnumValues<string> = {
    electronics: "Electronics",
    books: "Books",
    furniture: "Furniture",
    clothing: "Clothing",
    food: "Food"
};

const locales = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

export const productSchema: EntitySchema = {
    customId: true,
    name: "Product",
    properties: {
        name: {
            title: "Name",
            includeInListView: true,
            validation: { required: true },
            dataType: "string"
        },
        price: {
            title: "Price",
            includeInListView: true,
            validation: { required: true },
            dataType: "number"
        },
        status: {
            title: "Status",
            includeInListView: true,
            validation: { required: true },
            dataType: "string",
            enumValues: status
        },
        categories: {
            title: "Categories",
            includeInListView: true,
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: categories
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            includeInListView: true,
            storageMeta: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        tags: {
            title: "Tags",
            includeInListView: true,
            description: "Example of generic array",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        description: {
            title: "Description",
            description: "Not mandatory but it'd be awesome if you filled this up",
            includeInListView: false,
            dataType: "string"
        },
        published: {
            title: "Published",
            includeInListView: true,
            dataType: "boolean"
        },
        expires_on: {
            title: "Expires on",
            includeInListView: false,
            dataType: "timestamp"
        },
        publisher: {
            title: "Publisher",
            includeInListView: true,
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    includeInListView: true,
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    includeInListView: true,
                    dataType: "string"
                }
            }
        },
        available_locales: {
            title: "Available locales",
            description:
                "This field is set automatically by Cloud Functions and can't be edited here",
            includeInListView: true,
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            }
        }
    }
};

const subcollections = [
    {
        name: "Locales",
        relativePath: "locales",
        schema: {
            customId: locales,
            name: "Locale",
            properties: {
                title: {
                    title: "Title",
                    validation: { required: true },
                    includeInListView: true,
                    dataType: "string"
                },
                selectable: {
                    title: "Selectable",
                    description: "Is this locale selectable",
                    includeInListView: true,
                    dataType: "boolean"
                },
                video: {
                    title: "Video",
                    dataType: "string",
                    validation: { required: false },
                    includeInListView: true,
                    storageMeta: {
                        mediaType: "video",
                        storagePath: "videos",
                        acceptedFiles: ["video/*"]
                    }
                }
            }
        }
    }
];

const navigation: EntityCollectionView<any>[] = [
    {
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        subcollections: subcollections
    }
];

const myAuthenticator: Authenticator = (user?: firebase.User) => {
    console.log("Allowing access to", user?.email);
    return true;
};

ReactDOM.render(
    <CMSApp
        name={"Test shop CMS"}
        authentication={myAuthenticator}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />,
    document.getElementById("root")
);

