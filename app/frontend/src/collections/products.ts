import { EntityCollection } from "@firecms/types";

/**
 * Products collection for Firestore
 */
export const firestoreProductsCollection: EntityCollection = {
    slug: "firestore_products",
    name: "Products (Firestore)",
    dbPath: "products",
    group: "Firestore",
    icon: "ShoppingCart",
    singularName: "Product",
    properties: {
        name: {
            type: "string",
            name: "Name",
            validation: { required: true }
        },
        description: {
            type: "string",
            name: "Description",
            markdown: true
        },
        price: {
            type: "number",
            name: "Price",
            validation: {
                min: 0,
                max: 100000
            }
        },
        category: {
            type: "string",
            name: "Category",
            enum: [
                { id: "electronics", label: "Electronics" },
                { id: "clothing", label: "Clothing" },
                { id: "home", label: "Home & Garden" },
                { id: "sports", label: "Sports & Outdoors" },
                { id: "other", label: "Other" }
            ]
        },
        available: {
            type: "boolean",
            name: "Available",
            defaultValue: true
        },
        image: {
            type: "string",
            name: "Image",
            storage: {
                storagePath: "products",
                acceptedFiles: ["image/*"]
            }
        },
        tags: {
            type: "array",
            name: "Tags",
            of: {
                type: "string"
            }
        },
        created_at: {
            type: "date",
            name: "Created At",
            autoValue: "on_create"
        },
        updated_at: {
            type: "date",
            name: "Updated At",
            autoValue: "on_update"
        }
    }
};

