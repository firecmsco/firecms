import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import logo from "./images/test_shop_logo.png";
import algoliasearch, { SearchClient } from "algoliasearch";

import * as serviceWorker from "./serviceWorker";

import {
    AlgoliaTextSearchDelegate,
    CMSApp,
    EntitySchema,
    EnumValues
} from "firecms";

import { firebaseConfig } from "./firebase_config";
import CustomLargeTextField from "./custom_field/CustomLargeTextField";

const locales: EnumValues<string> = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

const productSchema: EntitySchema = {
    customId: true,
    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string",
            includeInListView: true,
            includeAsMapPreview: true
        },
        price: {
            title: "Price",
            validation: {
                required: true,
                requiredMessage: "You must set a price"
            },
            filterable: true,
            dataType: "number",
            includeInListView: true
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            enumValues: {
                private: "Private",
                public: "Public"
            },
            includeInListView: true
        },
        categories: {
            title: "Categories",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: {
                    electronics: "Electronics",
                    books: "Books",
                    furniture: "Furniture",
                    clothing: "Clothing",
                    food: "Food"
                }
            },
            includeInListView: true
        },
        image: {
            title: "Image",
            dataType: "string",
            storageMeta: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"]
            },
            includeInListView: true,
            includeAsMapPreview: true
        },
        tags: {
            title: "Tags",
            description: "Example of generic array",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            },
            includeInListView: true
        },
        description: {
            title: "Description",
            description: "Not mandatory but it'd be awesome if you filled this up",
            dataType: "string",
            includeInListView: false
        },
        published: {
            title: "Published",
            dataType: "boolean",
            includeInListView: true
        },
        expires_on: {
            title: "Expires on",
            dataType: "timestamp",
            includeInListView: true
        },
        publisher: {
            title: "Publisher",
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
            },
            includeInListView: true
        },
        available_locales: {
            title: "Available locales",
            description:
                "This is an example of a disabled field",
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            },
            includeInListView: true
        }
    },
    subcollections: [
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
                        dataType: "string",
                        includeInListView: true
                    },
                    selectable: {
                        title: "Selectable",
                        description: "Is this locale selectable",
                        dataType: "boolean",
                        includeInListView: true
                    },
                    video: {
                        title: "Video",
                        dataType: "string",
                        validation: { required: false },
                        storageMeta: {
                            mediaType: "video",
                            storagePath: "videos",
                            acceptedFiles: ["video/*"]
                        },
                        includeInListView: true
                    }
                }
            }
        }
    ]
};

const blogSchema: EntitySchema = {
    name: "Blog entry",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            filterable: true,
            dataType: "string",
            includeInListView: true
        },
        long_text: {
            title: "Long text",
            description: "This field is using a custom component",
            validation: { required: true },
            dataType: "string",
            customField: CustomLargeTextField,
            additionalProps: {
                rows: 5
            },
            includeInListView: false
        },
        priority: {
            title: "Priority",
            description: "This field allows the selection of Infinity as a value",
            validation: { required: true },
            dataType: "number",
            additionalProps: {
                allowInfinity: true
            },
            includeInListView: false
        },
        content: {
            title: "Content",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            },
            includeInListView: false
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            filterable: true,
            enumValues: {
                published: "Published",
                draft: "Draft"
            },
            includeInListView: true
        },
        products: {
            title: "Products",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "reference",
                collectionPath: "products",
                schema: productSchema
            },
            includeInListView: true
        },

        image: {
            title: "Image",
            dataType: "string",
            storageMeta: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"]
            },
            includeInListView: true
        }
    }
};
const usersSchema: EntitySchema = {
    name: "User",
    properties: {

        first_name: {
            title: "First name",
            dataType: "string",
            includeInListView: true,
            filterable: true
        },
        last_name: {
            title: "Last name",
            dataType: "string",
            includeInListView: true
        },
        picture: {
            title: "Picture",
            dataType: "map",
            properties: {
                large: {
                    title: "Large",
                    dataType: "string",
                    urlMediaType: "image",
                    includeAsMapPreview: true
                },
                medium: {
                    title: "Medium",
                    dataType: "string",
                    urlMediaType: "image"
                },
                thumbnail: {
                    title: "Thumbnail",
                    dataType: "string",
                    urlMediaType: "image"
                }
            },
            includeInListView: true
        },
        email: {
            title: "Email",
            dataType: "string",
            includeInListView: true
        },
        phone: {
            title: "Phone",
            dataType: "string",
            includeInListView: true
        }
    }
};

let client: SearchClient | undefined = undefined;
if (process.env.REACT_APP_ALGOLIA_APP_ID && process.env.REACT_APP_ALGOLIA_SEARCH_KEY) {
    client = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_SEARCH_KEY);
} else {
    console.error("REACT_APP_ALGOLIA_APP_ID or REACT_APP_ALGOLIA_SEARCH_KEY env variables not specified");
    console.error("Text search not enabled");
}

ReactDOM.render(
    <CMSApp
        name={"Test shop CMS"}
        authentication={false}
        logo={logo}
        navigation={[
            {
                relativePath: "products",
                schema: productSchema,
                name: "Products",
                textSearchDelegate: client && new AlgoliaTextSearchDelegate(
                    client,
                    "products")
            },
            {
                relativePath: "users",
                schema: usersSchema,
                name: "Users",
                textSearchDelegate: client && new AlgoliaTextSearchDelegate(
                    client,
                    "users")
            },
            {
                relativePath: "blog",
                schema: blogSchema,
                name: "Blog",
                textSearchDelegate: client && new AlgoliaTextSearchDelegate(
                    client,
                    "blog")
            }
        ]}
        firebaseConfig={firebaseConfig}
    />,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
serviceWorker.unregister();
