import { buildCollection, buildProperty } from "@firecms/core";

export const showcaseCollection = buildCollection({
    id: "showcase",
    path: "showcase",
    description: "Collection to showcase different field types",
    customId: false,
    icon: "bento",
    name: "Showcase",
    properties: {
        name: buildProperty({
            type: "string",
            name: "Name",
            validation: {
                // ...
            }
        }),
        age: buildProperty({
            type: "number",
            name: "Age",
            validation: {
                // ...
            }
        }),
        description: buildProperty({
            type: "string",
            name: "Description",
            multiline: true,
            validation: {
                // ...
            }
        }),
        text: buildProperty({
            type: "string",
            name: "Blog text",
            markdown: true,
            validation: {
                // ...
            }
        }),
        amazon_link: buildProperty({
            type: "string",
            name: "Amazon link",
            url: true,
            validation: {
                // ...
            }
        }),

        count: buildProperty({
            type: "number",
            name: "Count",
            validation: {
                min: 0,
                max: 10
            }
        }),

        // build a dynamic property based on the `count` value
        dynamic: buildProperty(({ values }) => {
            const newVar = Math.max(0, Math.min(values.count ?? 0, 10));
            return {
                type: "map",
                name: "Dynamic",
                description: "Modify the count to update this field",
                properties: Array(newVar)
                    .fill(0)
                    .map((_, index) => {
                        return buildProperty({
                            type: "string",
                            name: "Dynamic " + index,
                        });
                    })
                    .reduce((acc, property, currentIndex) => {
                        return {
                            ...acc,
                            ["dynamic_" + currentIndex]: property // keep in mind your key can't be just a number
                        }
                    }, {})
            };
        }),
        user_email: buildProperty({
            type: "string",
            name: "User email",
            email: true,
            validation: {
                // ...
            }
        }),
        category: buildProperty({
            type: "string",
            name: "Category",
            enumValues: {
                art_design_books: "Art and design books",
                backpacks: "Backpacks and bags",
                bath: "Bath",
                bicycle: "Bicycle",
                books: "Books"
            }
        }),
        locale: buildProperty({
            name: "Available locales",
            type: "array",
            of: {
                type: "string",
                enumValues: {
                    es: "Spanish",
                    en: "English",
                    fr: {
                        id: "fr",
                        label: "French",
                        disabled: true
                    }
                }
            },
            defaultValue: ["es"]
        }),
        expiry: buildProperty({
            type: "date",
            name: "Expiry date",
            mode: "date"
        }),
        arrival_time: buildProperty({
            type: "date",
            name: "Arrival time",
            mode: "date_time"
        }),
        created_at: buildProperty({
            type: "date",
            name: "Created at",
            autoValue: "on_create"
        }),
        updated_on: buildProperty({
            type: "date",
            name: "Updated at",
            autoValue: "on_update"
        }),
        main_image: buildProperty({
            type: "string",
            name: "Main image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                maxSize: 1024 * 1024,
                metadata: {
                    cacheControl: "max-age=1000000"
                },
                fileName: (context) => {
                    return context.file.name;
                }
            }
        }),
        images: buildProperty({
            type: "array",
            name: "Images",
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
            description: "This fields allows uploading multiple images at once"
        }),
        address: buildProperty({
            name: "Address",
            type: "map",
            properties: {
                street: {
                    name: "Street",
                    type: "string"
                },
                postal_code: {
                    name: "Postal code",
                    type: "number"
                }
            },
            expanded: true
        }),
        client: buildProperty({
            type: "reference",
            path: "users",
            name: "Related client"
        }),
        related_products: buildProperty({
            type: "array",
            name: "Related products",
            of: {
                type: "reference",
                path: "products"
            }
        }),
        tags: buildProperty({
            type: "array",
            name: "Tags",
            of: {
                type: "string",
                previewAsTag: true
            },
            expanded: true
        }),
        selectable: buildProperty({
            name: "Selectable",
            type: "boolean"
        }),
        metadata: buildProperty({
            name: "Metadata",
            type: "map",
            keyValue: true
        }),
        content: buildProperty({
            name: "Content",
            type: "array",
            oneOf: {
                typeField: "type",
                valueField: "value",
                properties: {
                    images: {
                        type: "string",
                        name: "Image",
                        storage: {
                            storagePath: "images",
                            acceptedFiles: ["image/*"]
                        }
                    },
                    text: {
                        type: "string",
                        name: "Text",
                        markdown: true
                    },
                    products: {
                        name: "Products",
                        type: "array",
                        of: {
                            type: "reference",
                            path: "products"
                        }
                    }
                }
            }
        }),
    }
});
