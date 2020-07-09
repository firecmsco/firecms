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
            title: "Name"
        },
        price: {
            title: "Price",
            validation: { required: true },
            dataType: "number"
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            config: {
                enumValues: status
            }
        },
        categories: {
            title: "Categories",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    enumValues: categories
                }
            }
        },
        tags: {
            title: "Tags",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        description: {
            title: "Description",
            description: "Not mandatory but it'd be awesome if you filled this up",
            dataType: "string"
        },
        published: {
            title: "Published",
            dataType: "boolean"
        },
        added_on: {
            title: "Published",
            dataType: "timestamp"
        },
        publisher: {
            title: "Publisher",
            dataType: "map",
            properties: {
                morning: {
                    title: "Name",
                    dataType: "number"
                },
                midday: {
                    title: "External id",
                    dataType: "number"
                },
                locale: {
                    title: "Locale",
                    dataType: "string",
                    config: {
                        enumValues: locales
                    }
                }
            },
            previewProperties: ["morning", "midday", "locale"]
        },
        available_locales: {
            title: "Available locales",
            description:
                "This field is set automatically by Cloud Functions and can't be edited here",
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            }
        }
    }
};

const subcollections = [
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
            subcollections: subcollections,
            previewProperties: ["name", "price", "status", "categories", "tags", "description", "published", "added_on", "publisher", "available_locales", "image"]
        }
    ]
};

