import { buildCollection, buildProperty } from "firecms";

export const showcaseCollection = buildCollection({
    path: "showcase",
    customId: false,
    icon: "ShowChart",
    name: "Showcase",
    properties: {
        name: buildProperty({
            dataType: "string",
            name: "Name",
            validation: {
                // ...
            }
        }),
        age: buildProperty({
            dataType: "number",
            name: "Age",
            validation: {
                // ...
            }
        }),
        description: buildProperty({
            dataType: "string",
            name: "Description",
            multiline: true,
            validation: {
                // ...
            }
        }),
        text: buildProperty({
            dataType: "string",
            name: "Blog text",
            markdown: true,
            validation: {
                // ...
            }
        }),
        amazon_link: buildProperty({
            dataType: "string",
            name: "Amazon link",
            url: true,
            validation: {
                // ...
            }
        }),
        user_email: buildProperty({
            dataType: "string",
            name: "User email",
            email: true,
            validation: {
                // ...
            }
        }),
        category: buildProperty({
            dataType: "string",
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
            dataType: "array",
            of: {
                dataType: "string",
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
            dataType: "date",
            name: "Expiry date",
            mode: "date"
        }),
        arrival_time: buildProperty({
            dataType: "date",
            name: "Arrival time",
            mode: "date_time"
        }),
        created_at: buildProperty({
            dataType: "date",
            name: "Created at",
            autoValue: "on_create"
        }),
        updated_on: buildProperty({
            dataType: "date",
            name: "Updated at",
            autoValue: "on_update"
        }),
        main_image: buildProperty({
            dataType: "string",
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
            dataType: "array",
            name: "Images",
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
        }),
        address: buildProperty({
            name: "Address",
            dataType: "map",
            properties: {
                street: {
                    name: "Street",
                    dataType: "string"
                },
                postal_code: {
                    name: "Postal code",
                    dataType: "number"
                }
            },
            expanded: true
        }),
        client: buildProperty({
            dataType: "reference",
            path: "users",
            name: "Related client"
        }),
        related_products: buildProperty({
            dataType: "array",
            name: "Related products",
            of: {
                dataType: "reference",
                path: "products"
            }
        }),
        tags: buildProperty({
            dataType: "array",
            name: "Tags",
            of: {
                dataType: "string",
                previewAsTag: true
            },
            expanded: true
        }),
        // selectable: buildProperty({
        //     name: "Selectable",
        //     dataType: "boolean"
        // }),
        content: buildProperty({
            name: "Content",
            dataType: "array",
            oneOf: {
                typeField: "type",
                valueField: "value",
                properties: {
                    images: {
                        dataType: "string",
                        name: "Image",
                        storage: {
                            storagePath: "images",
                            acceptedFiles: ["image/*"]
                        }
                    },
                    text: {
                        dataType: "string",
                        name: "Text",
                        markdown: true
                    },
                    products: {
                        name: "Products",
                        dataType: "array",
                        of: {
                            dataType: "reference",
                            path: "products"
                        }
                    }
                }
            }
        }),
        count: buildProperty({
            dataType: "number",
            name: "Count"
        }),

        // build a dynamic property based on the `count` value
        dynamic: buildProperty(({ values }) =>
            ({
                dataType: "map",
                name: "Dynamic",
                description: "Modify the count to update this field",
                properties: Array(values.count ?? 0)
                    .fill(0)
                    .map((_, index) => {
                        return buildProperty({
                            dataType: "string",
                            name: "Dynamic " + index,
                        });
                    })
                    .reduce((acc, property, currentIndex) => {
                        return {
                            ...acc,
                            ["dynamic_" + currentIndex]: property // keep in mind your key can't be just a number
                        }
                    }, {})
            })),
    }
});
