import {
    CollectionsConfigController,
    DeleteCollectionParams,
    PersistedCollection,
    SaveCollectionParams
} from "@firecms/collection_editor";

export function useBuildMockCollectionsConfigController(): CollectionsConfigController {

    return {
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

export const productsCollection: PersistedCollection = {
    ownerId: "",
    path: "products",
    id: "ppp",
    name: "Products",
    singularName: "Product",
    group: "Main",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
            clearable: true,
            validation: {
                required: true
            },
            editable: true,
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
            validation: {
                required: true
            },
            editable: true,
        },
        category: {
            dataType: "string",
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
            editable: true,
        },
        available: {
            dataType: "boolean",
            name: "Available",
            columnWidth: 100,
            description: "Is this product available in the website",
            editable: true,
        },
        price: {
            dataType: "number",
            name: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            editable: true,
        },
        currency: {
            dataType: "string",
            name: "Currency",
            validation: {
                required: true
            },
            editable: true,
        },
        public: {
            dataType: "boolean",
            name: "Public",
            description: "Should this product be visible in the website",
            editable: true,
            // longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros."
        },
        brand: {
            dataType: "string",
            name: "Brand",
            validation: {
                required: true
            },
            description: "This field uses a custom component defined by the developer",
            editable: true,
        },
        description: {
            dataType: "string",
            name: "Description",
            description: "Example of a markdown field",
            markdown: true,
            editable: true,
        },
        amazon_link: {
            dataType: "string",
            name: "Amazon link",
            url: true,
            editable: true,
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
            description: "This fields allows uploading multiple images at once",
            editable: true,
        },
        related_products: {
            dataType: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "ppp"
            },
            editable: true,
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
            },
            editable: true,
        },
        uppercase_name: {
            name: "Uppercase Name",
            dataType: "string",
            readOnly: true,
            description: "This field gets updated with a preSave callback",
            editable: true,
        },
        added_on: {
            dataType: "date",
            name: "Added on",
            autoValue: "on_create",
            editable: true,
        },
        tags: {
            dataType: "array",
            name: "Tags",
            of: {
                dataType: "string",
            },
            editable: true,
        }
    }

};
