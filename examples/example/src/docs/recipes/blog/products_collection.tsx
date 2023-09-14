import { buildCollection } from "firecms";
import { Product } from "./types";

export const productsCollection = buildCollection<Product>({
    path: "products",
    alias: "ppp",
    name: "Products",
    singularName: "Product",
    group: "Main",
    icon: "ShoppingCart",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            description: "Name of this product",
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
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
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
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            description: "Price with range validation"
        }),
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
                path: "ppp"
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
            },
            expanded: true
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
        }
    }

});
