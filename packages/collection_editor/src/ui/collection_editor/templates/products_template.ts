import { EntityCollection, makePropertiesEditable } from "@firecms/core";

export const productsCollectionTemplate: EntityCollection = {
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    icon: "shopping_cart",
    description: "List of the products currently sold in your shop",
    properties: makePropertiesEditable({
        name: {
            type: "string",
            name: "Name",
            description: "Name of this product",
            validation: {
                required: true
            }
        },
        brand: {
            type: "string",
            name: "Brand",
            validation: {
                required: true
            }
        },
        description: {
            type: "string",
            name: "Description",
            description: "Description of this product, supports markdown",
            markdown: true
        },
        main_image: {
            type: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
            },
            description: "Upload field for images"
        },
        available: {
            type: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website"
        },
        price: {
            type: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a positive price",
                min: 0
            }
        },
        images: {
            type: "array",
            name: "Images",
            hideFromCollection: true,
            of: {
                type: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        related_products: {
            type: "array",
            name: "Related products",
            description: "Products related to this one",
            of: {
                type: "reference",
                path: "products"
            }
        },
        metadata: {
            name: "Metadata",
            description: "This is an example of a map property",
            type: "map",
            keyValue: true
        },
        added_on: {
            type: "date",
            name: "Added on",
            autoValue: "on_create"
        }
    })
};
