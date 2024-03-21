import { buildCollection } from "@firecms/core";

export const productsCollection = buildCollection<any>({
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    group: "E-commerce",
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
            enumValues: {
                bath: "Bath",
                bicycle: "Bicycle",
                books: "Books",
                cameras: "Cameras",
                clothing_man: "Clothing man",
                clothing_woman: "Clothing woman",
            }
        },
        price: {
            dataType: "number",
            name: "Price",
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
            description: "This is a field that allows arbitrary key-value input",
            keyValue: true
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
