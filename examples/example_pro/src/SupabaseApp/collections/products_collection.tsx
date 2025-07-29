import { buildCollection, EnumValues } from "@firecms/core";

export const locales: EnumValues = {
    es: "Spanish",
    de: "German",
    en: "English",
    it: "Italian",
    fr: {
        id: "fr",
        label: "French",
        disabled: true
    }
};

export const productsCollection = buildCollection<any>({
    slug: "products",
    dbPath: "products",
    name: "Products",
    singularName: "Product",
    group: "E-commerce",
    icon: "ShoppingCart",
    properties: {
        name: {
            type: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
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
        category: {
            type: "string",
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

        available_locales: {
            name: "Available locales",
            type: "array",
            of: {
                type: "string",
                enumValues: locales
            }
        },
        related_products: {
            type: "array",
            name: "Related products",
            of: {
                type: "reference",
                slug: "products"
            }
        },
        price: {
            type: "number",
            name: "Price",
        },
        description: {
            type: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true
        },
        metadata: {
            type: "map",
            name: "Metadata",
            description: "This is a field that allows arbitrary key-value input",
            keyValue: true
        },
        tags: {
            type: "array",
            name: "Tags",
            of: {
                type: "string"
            }
        },
        added_on: {
            type: "date",
            name: "Added on",
            autoValue: "on_create"
        }

    }

});
