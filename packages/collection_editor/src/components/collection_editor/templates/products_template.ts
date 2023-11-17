import { buildCollection } from "@firecms/core";

export const productsCollectionTemplate = buildCollection({
    path: "products",
    name: "Products",
    singularName: "Product",
    group: "Main",
    icon: "shopping_cart",
    description: "List of the products currently sold in your shop",
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
            validation: {
                required: true
            }
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
            description: "Description of this product, supports markdown",
            markdown: true
        },
        main_image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
            },
            description: "Upload field for images"
        },
        available: {
            dataType: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website"
        },
        price: {
            dataType: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a positive price",
                min: 0
            }
        },
        images: {
            dataType: "array",
            name: "Images",
            hideFromCollection: true,
            of: {
                dataType: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        related_products: {
            dataType: "array",
            name: "Related products",
            description: "Products related to this one",
            of: {
                dataType: "reference",
                path: "products"
            }
        },
        metadata: {
            name: "Metadata",
            description: "This is an example of a map property",
            dataType: "map",
            keyValue: true
        },
        added_on: {
            dataType: "date",
            name: "Added on",
            autoValue: "on_create"
        }
    }

});
