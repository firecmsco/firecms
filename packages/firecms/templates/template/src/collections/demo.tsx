import { buildCollection, buildProperty } from "@firecms/core";

// This is a demo collection with many of the available properties
export const demoCollection = buildCollection({
    id: "demo",
    name: "Demo collection",
    description: "This is a demo collection with many of the **available properties**",
    path: "demo",
    properties: {

        // string property with validation
        name: {
            dataType: "string",
            name: "Name",
            validation: {
                required: true
            }
        },

        // simple boolean
        available: buildProperty({
            dataType: "boolean",
            name: "Available"
        }),

        // you can define this property dynamically, and modify it based on the values of other properties
        price: ({ values }) => ({
            dataType: "number",
            title: "Price",
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

        // multiline
        description: {
            dataType: "string",
            name: "Description",
            multiline: true,
        },

        // markdown
        text: {
            dataType: "string",
            name: "Blog text",
            markdown: true,
        },

        // array of strings
        ingredients: {
            name: "Ingredients",
            dataType: "array",
            of: {
                dataType: "string",
            }
        },

        // url
        amazon_link: {
            dataType: "string",
            name: "Amazon link",
            url: true,
            validation: {
                required: true,
                requiredMessage: "The amazon link is required",
            }
        },

        // email
        user_email: {
            dataType: "string",
            name: "User email",
            email: true
        },

        // single selection
        category: {
            dataType: "string",
            name: "Category",
            enumValues: {
                art_design_books: "Art and design books",
                backpacks: "Backpacks and bags",
                bath: "Bath",
                bicycle: "Bicycle",
                books: "Books"
            }
        },

        // multiple selection
        locale: {
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
            defaultValue: [
                "es"
            ]
        },

        // date
        expiry: {
            dataType: "date",
            name: "Expiry date",
            mode: "date"
        },

        // date and time
        arrival_time: {
            dataType: "date",
            name: "Arrival time",
            mode: "date_time"
        },

        // auto update on create
        created_at: {
            dataType: "date",
            name: "Created at",
            autoValue: "on_create"
        },

        // auto update on update
        updated_on: {
            dataType: "date",
            name: "Updated at",
            autoValue: "on_update"
        },

        // storing a single image
        main_image: {
            dataType: "string",
            name: "Main image",
            storage: {
                storagePath: "images",
                acceptedFiles: [
                    "image/*"
                ],
                maxSize: 1000000,
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            }
        },

        // storing multiple images
        images: {
            dataType: "array",
            name: "Images",
            of: {
                dataType: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: [
                        "image/*"
                    ],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "This fields allows uploading multiple images at once"
        },

        // group of properties
        address: {
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
        },

        // reference to another collection
        client: {
            dataType: "reference",
            path: "users",
            name: "Related client"
        },

        // multiple references to another collection
        related_products: {
            dataType: "array",
            name: "Related products",
            of: {
                dataType: "reference",
                path: "products"
            }
        },

        // block of content with dynamic properties
        content: {
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
                            acceptedFiles: [
                                "image/*"
                            ]
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
        },
    }
});
