import { buildCollection, buildProperties } from "firecms";

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
    path: "products",
    properties
});

// Target collection
export const productsCollectionCopy = buildCollection<Product>({
    name: "Products copy target",
    path: "products_copied",
    properties
});
