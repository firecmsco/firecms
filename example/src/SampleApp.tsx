import React from "react";
import {
    AdditionalColumnDelegate,
    AdditionalView,
    AsyncPreviewComponent,
    Authenticator,
    buildAdditionalColumnDelegate,
    buildCollection,
    buildSchema,
    CMSApp,
    Entity,
    EntityCollection,
    EntitySaveProps,
    EntitySchema,
    EnumValues,
    ExtraActionsParams,
    SchemaResolver
} from "@camberi/firecms";
import firebase from "firebase";
import { IconButton, Tooltip } from "@material-ui/core";
import { GitHub } from "@material-ui/icons";

import { firebaseConfig } from "./firebase_config";
import { ExampleAdditionalView } from "./ExampleAdditionalView";
import { SampleExtraActions } from "./SampleExtraActions";
import PriceTextPreview from "./custom_preview/PriceTextPreview";
import CustomColorTextField from "./custom_field/CustomColorTextField";
import CustomBooleanPreview from "./custom_preview/CustomBooleanPreview";
import logo from "./images/test_shop_logo.png";
import {
    blogSearchDelegate,
    productsSearchDelegate,
    usersSearchDelegate
} from "./algolia_utils";


function SampleApp() {

    const locales: EnumValues<string> = {
        "es": "Spanish",
        "de": "German",
        "en": "English",
        "it": "Italian",
        "fr": {
            label: "French",
            disabled: true
        }
    };

    const categories: EnumValues<string> = {
        art_and_decoration: "Art and decoration",
        art_design_books: "Art and design books",
        babys: "Babies and kids",
        backpacks: "Backpacks and bags",
        bath: "Bath",
        bicycle: "Bicycle",
        books: "Books",
        cameras: "Cameras",
        clothing_man: "Clothing man",
        clothing_woman: "Clothing woman",
        coffee_and_tea: "Coffee and tea",
        cookbooks: "Cookbooks",
        delicatessen: "Delicatessen",
        desk_accessories: "Desk accessories",
        exercise_equipment: "Exercise equipment",
        furniture: "Furniture",
        gardening: "Gardening",
        headphones: "Headphones",
        home_accessories: "Home accessories",
        home_storage: "Home storage",
        kitchen: "Kitchen",
        lighting: "Lighting",
        music: "Music",
        outdoors: "Outdoors",
        personal_care: "Personal care",
        photography_books: "Photography books",
        serveware: "Serveware",
        smart_home: "Smart Home",
        sneakers: "Sneakers",
        speakers: "Speakers",
        sunglasses: "Sunglasses",
        toys_and_games: "Toys and games",
        watches: "Watches"
    };

    const productSchema: EntitySchema = buildSchema({
        name: "Product",
        properties: {
            name: {
                dataType: "string",
                title: "Name",
                validation: {
                    required: true
                }
            },
            main_image: {
                dataType: "string",
                title: "Image",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                },
                description: "Upload field for images",
                validation: {
                    required: true
                }
            },
            category: {
                dataType: "string",
                title: "Category",
                config: {
                    enumValues: categories
                }
            },
            available: {
                dataType: "boolean",
                title: "Available",
                columnWidth: 100
            },
            price: ({ values }) => ({
                dataType: "number",
                title: "Price",
                validation: {
                    requiredMessage: "You must set a price between 0 and 1000",
                    min: 0,
                    max: 1000
                },
                disabled: values.available ?
                    false
                    : {
                        clearOnDisabled: true,
                        disabledMessage: "You can only set the price on available items"
                    },
                config: {
                    customPreview: PriceTextPreview
                },
                description: "Price with range validation"
            }),
            currency: {
                dataType: "string",
                title: "Currency",
                config: {
                    enumValues: {
                        EUR: "Euros",
                        DOL: "Dollars"
                    }
                },
                validation: {
                    required: true
                }
            },
            public: {
                dataType: "boolean",
                title: "Public",
                description: "Should this product be visible in the website",
                longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
            },
            brand: {
                dataType: "string",
                title: "Brand",
                validation: {
                    required: true
                }
            },
            description: {
                dataType: "string",
                title: "Description",
                description: "Example of a markdown field",
                config: {
                    markdown: true
                }
            },
            amazon_link: {
                dataType: "string",
                title: "Amazon link",
                config: {
                    url: true
                }
            },
            added_on: {
                dataType: "timestamp",
                title: "Added on",
                readOnly: true,
                autoValue: "on_create"
            },
            images: {
                dataType: "array",
                title: "Images",
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
            related_products: {
                dataType: "array",
                title: "Related products",
                description: "Reference to self",
                of: {
                    dataType: "reference",
                    collectionPath: "products"
                }
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
            min_known_price: {
                dataType: "number",
                title: "Min known price",
                readOnly: true,
                description: "Minimum price this product has ever had"
            },
            prime_eligible: {
                dataType: "boolean",
                title: "Prime eligible",
                readOnly: true
            },
            available_locales: {
                title: "Available locales",
                description:
                    "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
                longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
                dataType: "array",
                readOnly: true,
                of: {
                    dataType: "string",
                    config: {
                        enumValues: locales
                    }
                }
            },
            uppercase_name: {
                title: "Uppercase Name",
                dataType: "string",
                readOnly: true,
                description: "This field gets updated with a preSave hook"
            }

        },
        defaultValues: {
            currency: "EUR",
            publisher: {
                name: "Default publisher"
            }
        },
        onPreDelete: () => {
            throw Error("Product deletion not allowed in this demo");
        }
    });

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
                    multiline: true
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
                description: "This fields allows uploading multiple images at once and reordering"
            },
            publish_date: {
                title: "Publish date",
                dataType: "timestamp"
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
                    previewProperties: ["name", "main_image"]
                }
            },
            tags: {
                title: "Tags",
                description: "Example of generic array",
                dataType: "array",
                of: {
                    dataType: "string",
                    config: {
                        previewAsTag: true
                    }
                }
            }
        },
        defaultValues: {
            status: "draft",
            tags: ["default tag"]
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
                            url: "image"
                        },
                        validation: {
                            url: true
                        }
                    },
                    thumbnail: {
                        title: "Thumbnail",
                        dataType: "string",
                        config: {
                            url: "image"
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

    const productAdditionalColumn: AdditionalColumnDelegate = {
        id: "spanish_title",
        title: "Spanish title",
        builder: (entity: Entity<typeof productSchema>) =>
            <AsyncPreviewComponent builder={
                entity.reference.collection("locales")
                    .doc("es")
                    .get()
                    .then((snapshot: any) => snapshot.get("name") as string)
            }/>
    };

    const localeSchema = buildSchema({
        customId: locales,
        name: "Locale",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            },
            description: {
                title: "Description",
                validation: { required: true },
                dataType: "string",
                config: {
                    multiline: true
                }
            },
            selectable: {
                title: "Selectable",
                description: "Is this locale selectable",
                longDescription: "Changing this value triggers a cloud function that updates the parent product",
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
                },
                columnWidth: 400
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

    productSchema.onSaveSuccess = (props) => {
        console.log("onSaveSuccess", props);
    };

    productSchema.onDelete = (props) => {
        console.log("onDelete", props);
    };

    const testEntitySchema = buildSchema({
        customId: true,
        name: "Test entity",
        properties: {
            imageUrls: {
                title: "Images",
                dataType: "array",
                of: {
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
            available_locales: {
                title: "Available locales",
                dataType: "array",
                of: {
                    dataType: "string",
                    config: {
                        enumValues: locales
                    }
                }
            },
            title: ({ values, entityId }) => {
                if (values?.available_locales && Array.isArray(values.available_locales) && values.available_locales.includes("de"))
                    return ({
                        dataType: "string",
                        title: "Title disabled",
                        disabled: {
                            clearOnDisabled: true,
                            tooltip: "Disabled because German is selected"
                        }
                    });
                return ({
                    dataType: "string",
                    title: "Title"
                });
            },
            tags: {
                title: "Tags",
                dataType: "array",
                of: {
                    dataType: "string"
                }
            },
            product: {
                title: "Product",
                dataType: "reference",
                collectionPath: "products",
                previewProperties: ["name", "main_image"]
            },
            available_dates: {
                dataType: "array",
                title: "Available Dates",
                of: {
                    dataType: "timestamp"
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
                            acceptedFiles: ["image/*"]
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
                        storagePath: "test",
                        acceptedFiles: ["image/*"]
                    }
                }
            },
            mark: {
                title: "Mark",
                dataType: "string",
                config: {
                    markdown: true
                }
            },
            created_at: {
                title: "Created at",
                dataType: "timestamp",
                autoValue: "on_create"
            },
            updated_on: {
                title: "Updated on",
                dataType: "timestamp",
                autoValue: "on_update"
            },
            description: {
                title: "Description",
                dataType: "string",
                config: {
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
                    min: 0,
                    max: 3
                },
                dataType: "number"
            },
            pdf: {
                title: "Pdf",
                dataType: "string",
                config: {
                    storageMeta: {
                        storagePath: "test"
                    }
                }
            }
        }
    });



    const productExtraActionBuilder = ({
                                           view,
                                           selectedEntities
                                       }: ExtraActionsParams) => {
        return (
            <SampleExtraActions selectedEntities={selectedEntities}/>
        );
    };

    const localeCollection: EntityCollection<typeof localeSchema> =
        buildCollection({
            name: "Locales",
            relativePath: "locales",
            deleteEnabled: true,
            schema: localeSchema,
            defaultSize: "l"
        })
    ;

    const productsCollection = buildCollection({
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        textSearchDelegate: productsSearchDelegate,
        additionalColumns: [productAdditionalColumn],
        extraActions: productExtraActionBuilder,
        subcollections: [localeCollection],
        excludedProperties: ["images", "related_products"],
        filterableProperties: ["price", "available_locales"]
    });

    const usersCollection = buildCollection<typeof usersSchema>({
        relativePath: "users",
        schema: usersSchema,
        name: "Users",
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
        textSearchDelegate: blogSearchDelegate,
        properties: ["name", "images", "status", "reviewed", "products", "long_text"],
        filterableProperties: ["name", "status"],
        initialFilter: {
            "status": ["==", "published"]
        }
    });

    const navigation: EntityCollection[] = [
        productsCollection,
        usersCollection,
        blogCollection
    ];

    if (process.env.NODE_ENV !== "production") {
        const testCollection: EntityCollection = {
            relativePath: "test_entity",
            schema: testEntitySchema,
            group: "Test group",
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
        navigation.push(buildCollection(testCollection));
    }

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

    const additionalViews: AdditionalView[] = [{
        path: "additional",
        name: "Additional",
        group: "Content",
        view: <ExampleAdditionalView/>
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
        additionalViews={additionalViews}
        schemaResolver={customSchemaResolver}
        // In the production environment, the configuration is fetched from the environment automatically
        firebaseConfig={firebaseConfig}
        // firebaseConfig={process.env.NODE_ENV !== "production" ? firebaseConfig : undefined}
        onFirebaseInit={onFirebaseInit}
        toolbarExtraWidget={githubLink}
    />;
}

export default SampleApp;

