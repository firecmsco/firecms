import { EnumValues, InferSchemaType } from "../models";
import { FirebaseCMSAppProps } from "../firebase_app";
import { buildCollection, buildProperty, buildSchema } from "../core";
import { EntityCallbacks } from "../models/entity_callbacks";

const locales: EnumValues = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

export const productSchema = buildSchema({
    name: "Product",
    views: [
        {
            path: "custom_view",
            name: "Test custom view",
            builder: ({}) => undefined
        }
    ],
    properties: {
        name: buildProperty({
            dataType: "string",
            title: "Name",
            config: {
                multiline: true
            },
            validation: { required: true }
        }),
        main_image: buildProperty({
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
        }),
        available: buildProperty({
            dataType: "boolean",
            title: "Available",
            columnWidth: 100
        }),
        price: buildProperty(({ values }) => ({
            dataType: "number",
            title: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            config: {
                // Preview: PriceTextPreview
            },
            description: "Price with range validation"
        })),
        currency: buildProperty({
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
        }),
        public: buildProperty({
            dataType: "boolean",
            title: "Public",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        }),
        brand: buildProperty({
            dataType: "string",
            title: "Brand",
            validation: {
                required: true
            }
        }),
        description: buildProperty({
            dataType: "string",
            title: "Description",
            description: "Example of a markdown field",
            config: {
                markdown: true
            }
        }),
        amazon_link: buildProperty({
            dataType: "string",
            title: "Amazon link",
            validation: {
                url: true
            },
            config: {
                url: true
            }
        }),
        images: buildProperty({
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
        }),
        related_products: buildProperty({
            dataType: "array",
            title: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "products"
            }
        }),
        publisher: buildProperty({
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
        }),
        available_locales: buildProperty({
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
        }),
        uppercase_name: buildProperty({
            title: "Uppercase Name",
            dataType: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback"
        }),
        added_on: buildProperty({
            dataType: "timestamp",
            title: "Added on",
            autoValue: "on_create"
        })

    },
    defaultValues: {
        currency: "EUR",
        publisher: {
            name: "Default publisher"
        }
    }
});


const subcollections = [
    buildCollection({
        name: "Locales",
        path: "locales",
        schema: {
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
        }
    })
];

const productCallbacks: EntityCallbacks<InferSchemaType<typeof productSchema>> = {
    onPreSave: ({
                    schema,
                    path,
                    entityId,
                    values,
                    previousValues,
                    status
                }) => {
        console.log(previousValues);
        values.uppercase_name = (values.name as string).toUpperCase();
        return values;
    },

    onSaveSuccess: (props) => {
        console.log("onSaveSuccess", props);
    },

    onDelete: (props) => {
        console.log("onDelete", props);
    },
    onPreDelete: () => {
        throw Error("Product deletion not allowed in this demo");
    }
};

export const siteConfig: FirebaseCMSAppProps = {
    name: "Test site",
    navigation: [
        buildCollection({
            path: "products",
            schema: productSchema,
            callbacks: productCallbacks,
            name: "Products",
            subcollections: subcollections
        }),
        buildCollection({
            path: "sites/es/products",
            schema: productSchema,
            callbacks: productCallbacks,
            name: "Products",
            subcollections: subcollections
        }),
        buildCollection({
            path: "products/id/subcollection_inline",
            schema: productSchema,
            callbacks: productCallbacks,
            name: "Products",
            subcollections: subcollections
        })
    ]
};



