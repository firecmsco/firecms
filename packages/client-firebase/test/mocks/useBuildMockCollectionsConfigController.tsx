import {
    CollectionsConfigController,
    DeleteCollectionParams,
    SaveCollectionParams,
    UpdateCollectionParams
} from "@rebasepro/studio";
import type { EntityCollection } from "@rebasepro/types";

export function useBuildMockCollectionsConfigController(): CollectionsConfigController {

    return {
        deleteProperty(params: any): Promise<void> {
            return Promise.resolve(undefined);
        },
        getCollection(id: string): EntityCollection {
            throw new Error("Function not implemented.");
        },
        saveProperty(params: any): Promise<void> {
            return Promise.resolve(undefined);
        },
        updateCollection<M>(params: UpdateCollectionParams<any>): Promise<void> {
            return Promise.resolve(undefined);
        },
        collections: [productsCollection],
        deleteCollection(props: DeleteCollectionParams): Promise<void> {
            throw new Error("Function not implemented.");
        },
        loading: false,
        saveCollection(params: SaveCollectionParams<any>): Promise<void> {
            throw new Error("Function not implemented.");
        }
    };
}

export const productsCollection: EntityCollection = {
    ownerId: "",
    table: "products",
    slug: "products",
    name: "Products",
    singularName: "Product",
    group: "Main",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    properties: {
        name: {
            type: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            },
        },
        main_image: {
            type: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                maxSize: 1024 * 1024,
                metadata: {
                    cacheControl: "max-age=1000000"
                },
                imageResize: {
                    maxHeight: 200
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            },
        },
        category: {
            type: "string",
            name: "Category",
            clearable: true,
            enumValues: {
                art_and_decoration: "Art and decoration",
                art_design_books: "Art and design books",
                babys: "Babies and kids",
                backpacks: "Backpacks and bags",
                bath: "Bath",
                bicycle: "Bicycle",
            },
        },
        available: {
            type: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website",
        },
        price: {
            type: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
        },
        currency: {
            type: "string",
            name: "Currency",
            validation: {
                required: true
            },
        },
        public: {
            type: "boolean",
            name: "Public",
            description: "Should this product be visible in the website",
        },
        brand: {
            type: "string",
            name: "Brand",
            validation: {
                required: true
            },
            description: "This field uses a custom component defined by the developer",
        },
        description: {
            type: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true,
        },
        amazon_link: {
            type: "string",
            name: "Amazon link",
            url: true,
        },
        images: {
            type: "array",
            name: "Images",
            hideFromCollection: true,
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
            description: "This fields allows uploading multiple images at once",
        },
        related_products: {
            type: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                type: "reference",
                path: "products"
            },
        },
        publisher: {
            name: "Publisher",
            description: "This is an example of a map property",
            type: "map",
            properties: {
                name: {
                    name: "Name",
                    type: "string"
                },
                external_id: {
                    name: "External id",
                    type: "string"
                }
            },
        },
        uppercase_name: {
            name: "Uppercase Name",
            type: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback",
        },
        added_on: {
            type: "date",
            name: "Added on",
            autoValue: "on_create",
        },
        tags: {
            type: "array",
            name: "Tags",
            of: {
                type: "string",
            },
        }
    }

};
