import { buildCollection, buildProperty, EntityReference } from "@firecms/core";

export type Product = {
    name: string;
    price: number;
    status: string;
    published: boolean;
    related_products: EntityReference[];
    main_image: string;
    tags: string[];
    description: string;
    categories: string[];
    publisher: {
        name: string;
        external_id: string;
    },
    metadata: object,
    expires_on: Date
}

export const productsCollection = buildCollection<Product>({
    name: "Products",
    singularName: "Product",
    slug: "products",
    dbPath: "products",
    icon: "LocalGroceryStore",
    group: "E-commerce",
    permissions: ({ authController, user }) => ({
        read: true,
        edit: true,
        create: true,
        delete: true
    }),
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            type: "string"
        },
        price: {
            name: "Price",
            validation: {
                required: true,
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            description: "Price with range validation",
            type: "number"
        },
        status: {
            name: "Status",
            validation: { required: true },
            type: "string",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            enum: {
                private: "Private",
                public: "Public"
            }
        },
        published: ({ values }) => buildProperty({
            name: "Published",
            type: "boolean",
            columnWidth: 100,
            disabled: values.status === "public"
                ? false
                : {
                    clearOnDisabled: true,
                    disabledMessage: "Status must be public in order to enable this the published flag"
                }

        }),
        related_products: {
            type: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                type: "reference",
                path: "products"
            }
        },
        main_image: buildProperty({ // The `buildProperty` method is a utility function used for type checking
            name: "Image",
            type: "string",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        }),
        tags: {
            name: "Tags",
            description: "Example of generic array",
            validation: { required: true },
            type: "array",
            of: {
                type: "string"
            }
        },
        description: {
            name: "Description",
            description: "This is the description of the product",
            multiline: true,
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            type: "string",
            columnWidth: 300
        },
        categories: {
            name: "Categories",
            validation: { required: true },
            type: "array",
            of: {
                type: "string",
                enumValues: {
                    electronics: "Electronics",
                    books: "Books",
                    furniture: "Furniture",
                    clothing: "Clothing",
                    food: "Food",
                    footwear: "Footwear",
                }
            }
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
            }
        },
        metadata: {
            name: "Metadata",
            type: "map",
            keyValue: true
        },
        expires_on: {
            name: "Expires on",
            type: "date"
        }
    }
});
