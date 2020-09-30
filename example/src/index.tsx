import React from "react";
import ReactDOM from "react-dom";
import logo from "./images/test_shop_logo.png";
import algoliasearch, { SearchClient } from "algoliasearch";

import "typeface-rubik";

import * as serviceWorker from "./serviceWorker";

import {
    AdditionalColumnDelegate,
    AlgoliaTextSearchDelegate,
    AsyncPreviewComponent,
    Authenticator,
    buildSchema,
    CMSApp,
    EntityCollectionView,
    EntitySaveProps,
    EnumValues
} from "@camberi/firecms";

import { firebaseConfig } from "./firebase_config";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import { User } from "firebase/app";
import CustomBooleanPreview from "./custom_preview/CustomBooleanPreview";
import { Properties } from "../../src";

const locales: EnumValues<string> = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

const productSchema = buildSchema({
    customId: true,
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
        },
        categories: {
            title: "Categories",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    enumValues: {
                        electronics: "Electronics",
                        books: "Books",
                        furniture: "Furniture",
                        clothing: "Clothing",
                        food: "Food"
                    }
                }
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        tags: {
            title: "Tags",
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
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "string",
            config:{
                multiline: true
            }
        },
        published: {
            title: "Published",
            dataType: "boolean"
        },
        expires_on: {
            title: "Expires on",
            dataType: "timestamp"
        },
        publisher: {
            title: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    dataType: "string"
                }
            }
        },
        available_locales: {
            title: "Available locales",
            description:
                "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            }
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave hook"
        }
    }
});

productSchema.onPreSave = ({
                               schema,
                               collectionPath,
                               id,
                               values,
                               status
                           }: EntitySaveProps<typeof productSchema>) => {
    values.uppercase_name = values.name.toUpperCase();
    return values;
};

productSchema.onSaveSuccess = () => {
    console.log("onSaveSuccess");
};

const blogSchema = buildSchema({
    name: "Blog entry",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        gold_text: {
            title: "Gold text",
            description: "This field is using a custom component defined by the developer",
            dataType: "string",
            config: {
                field: CustomColorTextField,
                fieldProps: {
                    color: "gold"
                }
            }
        },
        long_text: {
            title: "Long text",
            description: "Example of a long text",
            validation: { required: true },
            dataType: "string",
            config: {
                multiline: 4
            }
        },
        images: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
        },
        priority: {
            title: "Priority",
            description: "This field allows the selection of Infinity as a value",
            dataType: "number",
            config: {
                fieldProps: {
                    allowInfinity: true
                }
            }
        },
        reviewed: {
            title: "Reviewed",
            dataType: "boolean",
            config: {
                customPreview: CustomBooleanPreview
            }
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            config: {
                enumValues: {
                    published: "Published",
                    draft: "Draft"
                }
            }
        },
        content: {
            title: "Content",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        products: {
            title: "Products",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "reference",
                collectionPath: "products",
                schema: productSchema,
                previewProperties: ["name", "image"]
            }
        }
    }
});

const usersSchema = buildSchema({
    name: "User",
    properties: {
        first_name: {
            title: "First name",
            dataType: "string"
        },
        last_name: {
            title: "Last name",
            dataType: "string"
        },
        email: {
            title: "Email",
            dataType: "string",
            validation: {
                email: true
            }
        },
        phone: {
            title: "Phone",
            dataType: "string"
        },
        picture: {
            title: "Picture",
            dataType: "map",
            properties: {
                large: {
                    title: "Large",
                    dataType: "string",
                    config: {
                        urlMediaType: "image"
                    },
                    validation: {
                        url: true
                    }
                },
                thumbnail: {
                    title: "Thumbnail",
                    dataType: "string",
                    config: {
                        urlMediaType: "image"
                    },
                    validation: {
                        url: true
                    }
                }
            },
            previewProperties: ["large"]
        }
    }
});

const formQuestions = ["birth_year",
    "living_situation",
    "electricity_monthly",
    "heating_fuels_used",
    "heating_fuels_consumption_monthly"];

export const testEntitySchema = buildSchema({
    customId: true,
    name: "Test entity",
    properties: {
        tags: {
            title: "Tags",
            // validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        product: {
            title: "Product",
            validation: { required: true },
            dataType: "reference",
            collectionPath: "products",
            schema: productSchema,
            previewProperties: ["name", "image"]
        },
        title: {
            title: "Title",
            description: "A catching title is important",
            dataType: "string"
        },
        description: {
            title: "Description",
            dataType: "string",
            config:{
                multiline: true
            }
        },
        search_adjacent: {
            title: "Search adjacent",
            dataType: "boolean"
        },
        difficulty: {
            title: "Difficulty",
            dataType: "number"
        },
        range: {
            title: "Range",
            validation: {
                required: true,
                min: 0,
                max: 3
            },
            dataType: "number"
        },
        created_at: {
            title: "Created at",
            dataType: "timestamp"
        },
        image: {
            title: "Image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "test",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        pdf: {
            title: "Pdf",
            dataType: "string",
            config: {
                storageMeta: {
                    storagePath: "test"
                }
            }
        },
        image_urls: {
            title: "Image URLs",
            dataType: "array",
            of:{
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        storeUrl: true
                    }
                }
            }
        },
        form_conditions: {
            dataType: "array",
            title: "Form conditions",
            of: {
                dataType: "map",
                properties: {
                    type: {
                        dataType: "string",
                        title: "Type",
                        config: {
                            enumValues: {
                                possible_ids: "Possible ids"
                            }
                        },
                        validation: {
                            required: true
                        }
                    },
                    condition: {
                        dataType: "map",
                        title: "Condition",
                        config: {
                            pickOnlySomeKeys: true
                        },
                        properties: formQuestions.map((questionId) => ({
                            [questionId]: {
                                dataType: "array",
                                title: questionId,
                                of: {
                                    dataType: "string",
                                    validation: {
                                        required: true
                                    }
                                }
                            }
                        } as Properties)).reduce((a, b) => ({ ...a, ...b }))
                    }
                }
            }
        }
    }
});

const productAdditionalColumn: AdditionalColumnDelegate<typeof productSchema> = {
    title: "Spanish title",
    builder: (entity) =>
        <AsyncPreviewComponent builder={
            entity.reference.collection("locales")
                .doc("es-ES")
                .get()
                .then((snapshot: any) => snapshot.get("title") as string)
        }/>
};


let client: SearchClient | undefined = undefined;
if (process.env.REACT_APP_ALGOLIA_APP_ID && process.env.REACT_APP_ALGOLIA_SEARCH_KEY) {
    client = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_SEARCH_KEY);
} else {
    console.error("REACT_APP_ALGOLIA_APP_ID or REACT_APP_ALGOLIA_SEARCH_KEY env variables not specified");
    console.error("Text search not enabled");
}

const localeSchema = buildSchema({
    customId: locales,
    name: "Locale",
    properties: {
        title: {
            title: "Title",
            validation: { required: true },
            dataType: "string"
        },
        selectable: {
            title: "Selectable",
            description: "Is this locale selectable",
            dataType: "boolean"
        },
        video: {
            title: "Video",
            dataType: "string",
            validation: { required: false },
            config: {
                storageMeta: {
                    mediaType: "video",
                    storagePath: "videos",
                    acceptedFiles: ["video/*"]
                }
            }
        }
    }
});


const localeCollection: EntityCollectionView<typeof localeSchema> =
    {
        name: "Locales",
        relativePath: "locales",
        deleteEnabled: false,
        schema: localeSchema
    }
;

let navigation: EntityCollectionView<any>[] = [
    {
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        textSearchDelegate: client && new AlgoliaTextSearchDelegate(
            client,
            "products"),
        additionalColumns: [productAdditionalColumn],
        subcollections: [localeCollection],
        properties: ["name", "price", "status", "categories", "image", "tags", "published", "expires_on", "publisher", "available_locales"],
        filterableProperties: ["price"]
    },
    {
        relativePath: "users",
        schema: usersSchema,
        name: "Users",
        textSearchDelegate: client && new AlgoliaTextSearchDelegate(
            client,
            "users"),
        properties: ["first_name", "last_name", "email", "phone", "picture"]
    },
    {
        relativePath: "blog",
        schema: blogSchema,
        name: "Blog",
        textSearchDelegate: client && new AlgoliaTextSearchDelegate(
            client,
            "blog"),
        properties: ["name", "images", "status", "reviewed", "products", "long_text"],
        filterableProperties: ["name", "status"],
        initialFilter: {
            "status": ["==", "published"]
        },
        onEntityDelete: (path, entity) => {
            console.log("Log from onEntityDelete hook", entity);
        }
    }
];

if (process.env.NODE_ENV !== "production") {
    navigation.push({
        relativePath: "test_entity",
        schema: testEntitySchema,
        name: "Test entity"
    });
}


const myAuthenticator: Authenticator = (user?: User) => {
    console.log("Allowing access to", user?.email);
    return true;
};


ReactDOM.render(
    <CMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        allowSkipLogin={true}
        logo={logo}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
serviceWorker.unregister();
