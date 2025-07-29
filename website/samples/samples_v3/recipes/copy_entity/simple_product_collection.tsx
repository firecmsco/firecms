import { buildCollection, buildProperties } from "@firecms/core";

export type Product = {
    name: string;
    price: number;
}

// Common properties of our target and source collections
export const properties = buildProperties<Product>({
    name: {
        name: "Name",
        validation: { required: true },
        dataType: "string"
    },
    price: {
        name: "Price",
        validation: {
            required: true,
            min: 0
        },
        dataType: "number"
    }
});

// Source collection
export const productsCollection = buildCollection<Product>({
    name: "Products",
    slug: "products",
    dbPath: "products",
    properties
});

// Target collection
export const productsCollectionCopy = buildCollection<Product>({
    name: "Products copy target",
    slug: "products_copied",
    dbPath: "products_copied",
    properties
});
