import { EntityCallbacks, EnumValues } from "../src/types";
import { buildCollection, buildProperty } from "../src";

const locales: EnumValues = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

export const productsCollection = buildCollection({
    slug: "products",
    dbPath: "products",
    name: "Products",
    singularName: "Product",
    entityViews: [
        {
            key: "custom_view",
            name: "Test custom view",
            Builder: ({}) => null
        }
    ],
    properties: {
        name: buildProperty({
            type: "string",
            name: "Name",
            multiline: true,
            validation: { required: true }
        }),
        main_image: buildProperty({
            type: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        }),
        available: buildProperty({
            type: "boolean",
            name: "Available",
            columnWidth: 100
        }),
        price: ({ values }) => ({
            type: "number",
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
            description: "Price with range validation"
        }),
        currency: buildProperty({
            type: "string",
            name: "Currency",
            enumValues: {
                EUR: "Euros",
                DOL: "Dollars"
            },
            validation: {
                required: true
            },
            defaultValue: "EUR"
        }),
        public: buildProperty({
            type: "boolean",
            name: "Public",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        }),
        brand: buildProperty({
            type: "string",
            name: "Brand",
            validation: {
                required: true
            }
        }),
        description: buildProperty({
            type: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true
        }),
        amazon_link: buildProperty({
            type: "string",
            name: "Amazon link",
            url: true
        }),
        images: buildProperty({
            type: "array",
            name: "Images",
            of: {
                type: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
        }),
        related_products: buildProperty({
            type: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                type: "reference",
                path: "products"
            }
        }),
        publisher: buildProperty({
            name: "Publisher",
            description: "This is an example of a map property",
            type: "map",
            properties: {
                name: {
                    title: "Name",
                    type: "string",
                    defaultValue: "Default publisher"
                },
                external_id: {
                    title: "External id",
                    type: "string"
                }
            }
        }),
        available_locales: buildProperty({
            name: "Available locales",
            description:
                "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            type: "array",
            readOnly: true,
            of: {
                type: "string",
                enumValues: locales
            }
        }),
        uppercase_name: buildProperty({
            name: "Uppercase Name",
            type: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback"
        }),
        added_on: buildProperty({
            type: "date",
            name: "Added on",
            autoValue: "on_create"
        })

    },
});


const localeCollection = buildCollection({
    slug: "locales",
    dbPath: "locales",
    customId: locales,
    name: "Locales",
    singularName: "Locale",
    properties: {
        title: buildProperty({
            title: "Title",
            validation: { required: true },
            type: "string"
        }),
        selectable: buildProperty({
            title: "Selectable",
            description: "Is this locale selectable",
            type: "boolean"
        }),
        video: buildProperty({
            title: "Video",
            type: "string",
            validation: { required: false },
            storage: {
                storagePath: "videos",
                acceptedFiles: ["video/*"]
            }
        })
    }
});

const pricesCollection = buildCollection({
    slug: "product_price",
    dbPath: "prices",
    name: "Prices",
    properties: {
        value: buildProperty({
            title: "Value",
            validation: { required: true },
            type: "number"
        })
    }
});

const productCallbacks: EntityCallbacks<any> = {
    onPreSave: ({
                    collection,
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

export const usersCollection = buildCollection({
    slug: "users",
    dbPath: "users",
    name: "Users",
    singularName: "User",
    group: "Main",
    description: "Registered users",
    textSearchEnabled: true,
    properties: {
        first_name: buildProperty({
            title: "First name",
            type: "string"
        }),
        last_name: buildProperty({
            title: "Last name",
            type: "string"
        }),
        email: buildProperty({
            title: "Email",
            type: "string",
            email: true
        }),
        phone: buildProperty({
            title: "Phone",
            type: "string"
        }),
        liked_products: buildProperty({
            type: "array",
            title: "Liked products",
            description: "Products this user has liked",
            of: {
                type: "reference",
                path: "products"
            }
        }),
        picture: buildProperty({
            title: "Picture",
            type: "map",
            properties: {
                thumbnail: {
                    title: "Thumbnail",
                    type: "string",
                    url: true
                },
                large: {
                    title: "Large",
                    type: "string",
                    url: true
                }
            },
            previewProperties: ["large"]
        })
    }
});

export const siteConfig = {
    name: "Test site",
    collections: [
        buildCollection({
            ...productsCollection,
            dbPath: "products",
            callbacks: productCallbacks,
            singularName: "Products",
            subcollections: [localeCollection]
        }),
        buildCollection({
            ...productsCollection,
            slug: "p",
            dbPath: "sites/es/products",
            callbacks: productCallbacks,
            singularName: "Products",
            subcollections: [localeCollection, pricesCollection]
        }),
        buildCollection({
            ...productsCollection,
            dbPath: "products/id/subcollection_inline",
            callbacks: productCallbacks,
            singularName: "Products",
            subcollections: [localeCollection]
        }),
        buildCollection({
            ...usersCollection,
            dbPath: "users",
            slug: "u",
            singularName: "Users",
            subcollections: [buildCollection({
                ...productsCollection,
                slug: "p"
            })]
        })
    ],
};
