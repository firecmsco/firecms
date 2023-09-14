import { FirebaseCMSAppProps } from "../firebase_app";
import { buildCollection, buildProperty } from "../core";
import { EntityCallbacks, EnumValues } from "../types";

const locales: EnumValues = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};


export const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    singularName: "Product",
    views: [
        {
            path: "custom_view",
            name: "Test custom view",
            Builder: ({}) => null
        }
    ],
    properties: {
        name: buildProperty({
            dataType: "string",
            name: "Name",
            multiline: true,
            validation: { required: true }
        }),
        main_image: buildProperty({
            dataType: "string",
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
            dataType: "boolean",
            name: "Available",
            columnWidth: 100
        }),
        price: ({ values }) => ({
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
            description: "Price with range validation"
        }),
        currency: buildProperty({
            dataType: "string",
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
            dataType: "boolean",
            name: "Public",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        }),
        brand: buildProperty({
            dataType: "string",
            name: "Brand",
            validation: {
                required: true
            }
        }),
        description: buildProperty({
            dataType: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true
        }),
        amazon_link: buildProperty({
            dataType: "string",
            name: "Amazon link",
            url: true
        }),
        images: buildProperty({
            dataType: "array",
            name: "Images",
            of: {
                dataType: "string",
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
            dataType: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "products"
            }
        }),
        publisher: buildProperty({
            name: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    dataType: "string",
                    defaultValue: "Default publisher"
                },
                external_id: {
                    title: "External id",
                    dataType: "string"
                }
            }
        }),
        available_locales: buildProperty({
            name: "Available locales",
            description:
                "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "array",
            readOnly: true,
            of: {
                dataType: "string",
                enumValues: locales
            }
        }),
        uppercase_name: buildProperty({
            name: "Uppercase Name",
            dataType: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback"
        }),
        added_on: buildProperty({
            dataType: "date",
            name: "Added on",
            autoValue: "on_create"
        })

    },
});


const localeCollection = buildCollection({
    path: "locales",
    customId: locales,
    name: "Locales",
    singularName: "Locale",
    properties: {
        title: buildProperty({
            title: "Title",
            validation: { required: true },
            dataType: "string"
        }),
        selectable: buildProperty({
            title: "Selectable",
            description: "Is this locale selectable",
            dataType: "boolean"
        }),
        video: buildProperty({
            title: "Video",
            dataType: "string",
            validation: { required: false },
            storage: {
                storagePath: "videos",
                acceptedFiles: ["video/*"]
            }
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
    path: "users",
    name: "Users",
    singularName: "User",
    group: "Main",
    description: "Registered users",
    textSearchEnabled: true,
    properties: {
        first_name: buildProperty({
            title: "First name",
            dataType: "string"
        }),
        last_name: buildProperty({
            title: "Last name",
            dataType: "string"
        }),
        email: buildProperty({
            title: "Email",
            dataType: "string",
            email: true
        }),
        phone: buildProperty({
            title: "Phone",
            dataType: "string"
        }),
        liked_products: buildProperty({
            dataType: "array",
            title: "Liked products",
            description: "Products this user has liked",
            of: {
                dataType: "reference",
                path: "products"
            }
        }),
        picture: buildProperty({
            title: "Picture",
            dataType: "map",
            properties: {
                thumbnail: {
                    title: "Thumbnail",
                    dataType: "string",
                    url: true
                },
                large: {
                    title: "Large",
                    dataType: "string",
                    url: true
                }
            },
            previewProperties: ["large"]
        })
    }
});

export const siteConfig: FirebaseCMSAppProps = {
    name: "Test site",
    collections: [
        buildCollection({
            ...productsCollection,
            path: "products",
            callbacks: productCallbacks,
            singularName: "Products",
            subcollections: [localeCollection]
        }),
        buildCollection({
            ...productsCollection,
            path: "sites/es/products",
            callbacks: productCallbacks,
            singularName: "Products",
            subcollections: [localeCollection]
        }),
        buildCollection({
            ...productsCollection,
            path: "products/id/subcollection_inline",
            callbacks: productCallbacks,
            singularName: "Products",
            subcollections: [localeCollection]
        }),
        buildCollection({
            ...usersCollection,
            path: "users",
            alias: "u",
            singularName: "Users",
            subcollections: [buildCollection({
                ...productsCollection,
                alias: "p"
            })]
        })
    ],
};
