import { EntitySchema, EnumValues } from "../models";

const status = {
    private: "Private",
    public: "Public"
};

const categories: EnumValues<string> = {
    electronics: "Electronics",
    books: "Books",
    furniture: "Furniture",
    clothing: "Clothing",
    food: "Food"
};

const locales = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

const productSchema: EntitySchema = {
    customId: true,
    name: "Product",
    properties: {
        name: {
            validation: { required: true },
            dataType: "string",
            title: "Name",
            includeInListView: true,
            includeAsMapPreview:true
        },
        price: {
            title: "Price",
            validation: { required: true },
            dataType: "number",
            includeInListView: true,
            includeAsMapPreview:true
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            enumValues: status,
            includeInListView: true
        },
        categories: {
            title: "Categories",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: categories
            },
            includeInListView: true
        },
        tags: {
            title: "Tags",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            },
            includeInListView: true
        },
        description: {
            title: "Description",
            description: "Not mandatory but it'd be awesome if you filled this up",
            dataType: "string",
            includeInListView: true
        },
        published: {
            title: "Published",
            dataType: "boolean",
            includeInListView: true
        },
        added_on: {
            title: "Published",
            dataType: "timestamp",
            includeInListView: true
        },
        publisher: {
            title: "Publisher",
            dataType: "map",
            properties: {
                morning: {
                    title: "Name",
                    dataType: "number",
                    includeInListView: true
                },
                midday: {
                    title: "External id",
                    dataType: "number",
                    includeInListView: true
                },
                locale: {
                    title: "Locale",
                    includeInListView: true,
                    dataType: "string",
                    enumValues: locales
                }
            },
            includeInListView: true
        },
        available_locales: {
            title: "Available locales",
            description:
                "This field is set automatically by Cloud Functions and can't be edited here",
            includeInListView: true,
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            includeInListView: true,
            storageMeta: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        }
    },
};

const subcollections =  [
    {
        name: "Locales",
        relativePath: "locales",
        schema: {
            customId: locales,
            name: "Locale",
            properties: {
                title: {
                    title: "Title",
                    validation: { required: true },
                    includeInListView: true,
                    dataType: "string"
                },
                selectable: {
                    title: "Selectable",
                    description: "Is this locale selectable",
                    includeInListView: true,
                    dataType: "boolean"
                },
                video: {
                    title: "Video",
                    dataType: "string",
                    validation: { required: false },
                    includeInListView: true,
                    storageMeta: {
                        mediaType: "video",
                        storagePath: "videos",
                        acceptedFiles: ["video/*"]
                    }
                }
            }
        }
    }
];

export const siteConfig = {
    name: "Test site",
    navigation: [
        {
            relativePath: "products",
            schema: productSchema,
            name: "Products",
            subcollections: subcollections
        }
    ]
};

