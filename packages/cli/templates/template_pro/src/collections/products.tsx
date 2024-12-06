import { buildCollection } from "@firecms/core";
import { localeCollection } from "./locales";
import { Product } from "../types";
import { ProductDetailPreview } from "./entity_views/ProductDetailPreview";

export const productsCollection = buildCollection<Product>({
    name: "Products",
    singularName: "Product",
    id: "products",
    path: "products",
    group: "E-commerce",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    // Here you can override the user permissions
    // permissions: ({ authController }) => ({
    //     read: true,
    //     edit: true,
    //     create: true,
    //     delete: true
    // }),
    subcollections: [localeCollection],
    entityViews: [
        {
            key: "preview",
            name: "Sample preview",
            Builder: ProductDetailPreview
        }
    ],
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
                electronics: "Electronics",
                books: "Books",
                furniture: "Furniture",
                clothing: "Clothing",
                food: "Food"
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
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
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
                required: true,
                requiredMessage: "You must set a price between 0 and 10000",
                min: 0,
                max: 10000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            }
        }),
        currency: {
            dataType: "string",
            name: "Currency",
            enumValues: [
                {
                    id: "EUR",
                    label: "Euros",
                    color: "blueDark"
                },
                {
                    id: "DOL",
                    label: "Dollars",
                    color: "greenLight"
                }
            ],
            validation: {
                required: true
            }
        },
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
            }
        },
        added_on: {
            dataType: "date",
            name: "Added on",
            autoValue: "on_create"
        },
        tags: {
            dataType: "array",
            name: "Tags",
            of: {
                dataType: "string"
            }
        }
    }
});
