import React from "react";
import { buildSchema, EntitySaveProps } from "@camberi/firecms";
import { locales } from "./products_schema";


export const testEntitySchema = buildSchema({
    customId: true,
    name: "Test entity",
    properties: {
        empty_string: {
            title: "empty_string",
            dataType: "string"
        },
        imageUrls: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        storeUrl: true
                    }
                }
            }
        },
        available_locales: {
            title: "Available locales",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    enumValues: locales
                }
            }
        },
        title: ({ values, entityId }) => {
            if (values?.available_locales && Array.isArray(values.available_locales) && values.available_locales.includes("de"))
                return ({
                    dataType: "string",
                    title: "Title disabled",
                    disabled: {
                        clearOnDisabled: true,
                        tooltip: "Disabled because German is selected"
                    }
                });
            return ({
                dataType: "string",
                title: "Title"
            });
        },
        tags: {
            title: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        product: {
            title: "Product",
            dataType: "reference",
            collectionPath: "products",
            previewProperties: ["name", "main_image"]
        },
        available_dates: {
            dataType: "array",
            title: "Available Dates",
            of: {
                dataType: "timestamp"
            }
        },
        images: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: "images",
                        acceptedFiles: ["image/*"]
                    }
                }
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "test",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        mark: {
            title: "Mark",
            dataType: "string",
            config: {
                markdown: true
            }
        },
        test_date: {
            title: "Test date",
            dataType: "timestamp"
        },
        created_at: {
            title: "Created at",
            dataType: "timestamp",
            autoValue: "on_create"
        },
        updated_on: {
            title: "Updated on",
            dataType: "timestamp",
            autoValue: "on_update"
        },
        description: {
            title: "Description",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        search_adjacent: {
            title: "Search adjacent",
            dataType: "boolean"
        },
        difficulty: {
            title: "Difficulty",
            dataType: "number"
        },
        range: {
            title: "Range",
            validation: {
                min: 0,
                max: 3
            },
            dataType: "number"
        },
        pdf: {
            title: "Pdf",
            dataType: "string",
            config: {
                storageMeta: {
                    storagePath: "test"
                }
            }
        }
    },
    defaultValues: {
        // empty_string: "",
    }
});
testEntitySchema.onPreSave = ({
                                  schema,
                                  collectionPath,
                                  id,
                                  values,
                                  status
                              }: EntitySaveProps<typeof testEntitySchema>) => {
    console.log("custom onPreSave");
    if (!values.empty_string) values.empty_string = "";
    return values;
};


