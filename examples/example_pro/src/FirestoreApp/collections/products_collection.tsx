import { AdditionalFieldDelegate, AsyncPreviewComponent, buildCollection, EntityCallbacks } from "@firecms/core";

import PriceTextPreview from "../custom_field_preview/PriceTextPreview";
import { SampleCollectionActions } from "../collection_actions/SampleCollectionActions";
import { Locale, Product } from "../types";
import { categories, currencies, locales } from "./enums";
import CustomColorTextField from "../custom_field/CustomColorTextField";
import { ProductDetailPreview } from "../custom_entity_view/ProductDetailPreview";
import { ProductsSecondaryForm } from "../custom_entity_view/ProductsSecondaryForm";
import { SyncIcon } from "@firecms/ui";

export const localeCollection = buildCollection<Locale>({
    id: "product_locales",
    path: "locales",
    icon: "Translate",
    customId: locales,
    name: "Locales",
    singularName: "Locale",
    entityViews: [
        {
            key: "sec",
            name: "Secondary form",
            includeActions: true,
            Builder: ProductsSecondaryForm
        }
    ],
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            name: "Description",
            validation: { required: true },
            dataType: "string",
            markdown: true
        },
        selectable: {
            name: "Selectable",
            description: "Is this locale selectable",
            longDescription: "Changing this value triggers a cloud function that updates the parent product",
            dataType: "boolean"
        },
        video: {
            name: "Video",
            dataType: "string",
            validation: { required: false },
            storage: {
                storagePath: "videos",
                acceptedFiles: ["video/*"],
                fileName: (context) => {
                    return context.file.name;
                }
            },
            columnWidth: 400
        }
    }
});

export const localeCollectionGroup = buildCollection({
    ...localeCollection,
    name: "Product locales group",
    description: "This is a collection group that allows you to see all locales of all products at once",
    group: "Collection group demo",
    collectionGroup: true
});

const productAdditionalField: AdditionalFieldDelegate<Product> = {
    key: "spanish_title",
    name: "Spanish title",
    Builder: ({
                  entity,
                  context
              }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: `${entity.path}/${entity.id}/locales`,
                entityId: "es",
                collection: localeCollection
            }).then((entity) => entity?.values.name)
        }/>
};

export const productCallbacks: EntityCallbacks<Product> = {
    onPreSave: ({
                    collection,
                    path,
                    entityId,
                    values,
                    status
                }) => {
        values.uppercase_name = values?.name?.toUpperCase();
        return values;
    },

    onSaveSuccess: (props) => {
        console.log("onSaveSuccess", props);
    },

    onDelete: (props) => {
        console.log("onDelete", props);
    },

    onPreDelete: (props) => {
        const email = props.context.authController.user?.email;
        if (!email || !email.endsWith("@camberi.com"))
            throw Error("Product deletion not allowed in this demo");
    }
};

export const productsCollection = buildCollection<Product>({
    path: "products",
    id: "products",
    callbacks: productCallbacks,
    name: "Products",
    singularName: "Product",
    group: "Demo collections",
    icon: "shopping_cart",
    // openEntityMode: "full_screen",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    permissions: ({ authController }) => ({
        edit: true,
        create: true,
        delete: true
    }),
    includeJsonView: true,
    Actions: [SampleCollectionActions],
    subcollections: [localeCollection],
    // defaultSelectedView: "sample_custom_view",
    entityViews: [
        {
            key: "sample_custom_view",
            name: "Custom preview",
            Builder: ProductDetailPreview
        },
        {
            key: "sec",
            name: "Secondary form",
            includeActions: true,
            Builder: ProductsSecondaryForm
        }
    ],
    entityActions: [{
        key: "sync_price",
        name: "Sync price",
        icon: <SyncIcon/>,
        onClick: async ({
                            entity,
                            context
                        }) => {
            context.snackbarController.open({
                type: "info",
                message: `Syncing price for locale ${entity?.id}`,
            })
        }
    }],
    additionalFields: [productAdditionalField],
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            }
        },
        main_image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                maxSize: 1024 * 1024,
                metadata: {
                    cacheControl: "max-age=1000000"
                },
                imageCompression: {
                    maxHeight: 200
                }
            },
            description: "Upload field for images",
        },
        category: {
            dataType: "string",
            name: "Category",
            clearable: true,
            enumValues: categories
        },
        available: {
            dataType: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website"
        },
        price: ({ values }) => ({
            dataType: "number",
            name: "Price",
            validation: {
                required: values.available,
                requiredMessage: "You must set a price between 0 and 10000",
                min: 0,
                max: 10000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            Preview: PriceTextPreview,
            description: "Price with range validation",
            widthPercentage: 50
        }),
        currency: {
            dataType: "string",
            name: "Currency",
            enumValues: currencies,
            widthPercentage: 50,
            validation: {
                required: true
            }
        },
        public: {
            dataType: "boolean",
            name: "Public",
            description: "Should this product be visible in the website"
            // longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        },
        brand: {
            dataType: "string",
            name: "Brand",
            validation: {
                required: true
            },
            description: "This field uses a custom component defined by the developer",
            Field: CustomColorTextField,
            customProps: {
                color: "gold"
            }
        },
        description: {
            dataType: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true
        },
        amazon_link: {
            dataType: "string",
            name: "Amazon link",
            url: true
        },
        images: {
            dataType: "array",
            name: "Images",
            hideFromCollection: true,
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
        },
        related_products: {
            dataType: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "products",
                forceFilter: {
                    "selectable": ["==", true]
                },
            }
        },
        publisher: {
            name: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                },
                external_id: {
                    name: "External id",
                    dataType: "string"
                }
            }
        },
        available_locales: {
            name: "Available locales",
            description:
                "This is an example of a disabled field that gets updated trough a Cloud Function, try changing a locale 'selectable' value",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "array",
            readOnly: true,
            of: {
                dataType: "string",
                enumValues: locales
            },
            defaultValue: ["es"]
        },
        metadata: {
            name: "Metadata",
            dataType: "map",
            keyValue: true
        },
        uppercase_name: {
            name: "Uppercase Name",
            dataType: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback"
        },
        added_on: {
            dataType: "date",
            name: "Added on",
            autoValue: "on_create"
        },
        tags: {
            dataType: "array",
            name: "Tags",
            of: {
                dataType: "string"

            }
        }
    }

});
export const productsSimpleCollection = buildCollection<any>({
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    icon: "ShoppingCart",
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            }
        },
        category: {
            dataType: "string",
            name: "Category",
            clearable: true,
            enumValues: categories
        },
        price: {
            dataType: "number",
            name: "Price"
        },
        brand: {
            dataType: "string",
            name: "Brand",
            validation: {
                required: true
            }
        },
        description: {
            dataType: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true
        },
        metadata: {
            dataType: "map",
            name: "Metadata",
            description: "This is a field that allows arbitrary key-value input"

        },
        tags: {
            dataType: "array",
            name: "Tags",
            of: {
                dataType: "string"
            }
        },
        added_on: {
            dataType: "date",
            name: "Added on",
            autoValue: "on_create"
        }

    }

});

export const productsCollection2 = buildCollection({
    path: "products",
    name: "Products 2",
    id: "products_2",
    // openEntityMode: "full_screen",
    subcollections: [
        buildCollection({
            id: "product_locales_2",
            path: "locales",
            icon: "Translate",
            customId: locales,
            name: "Locales",
            singularName: "Locale",
            entityViews: [
                {
                    key: "sec",
                    name: "Secondary form",
                    includeActions: true,
                    Builder: ProductsSecondaryForm
                }
            ],
            properties: {
                name: {
                    name: "Name",
                    validation: { required: true },
                    dataType: "string"
                }
            }
        })
    ],
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            }
        }
    }
});
//
//
// export const localeWithAlias = buildCollection({
//     ...localeCollection,
//     path: "products/B000P0MDMS/locales",
//     collectionGroup: false,
//     name: "Product locale with alias",
//     description: "This is a collection group that allows you to see all locales of all products at once",
// });
