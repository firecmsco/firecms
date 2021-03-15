import React from "react";
import CustomColorTextField from "../custom_field/CustomColorTextField";
import CustomBooleanPreview from "../custom_preview/CustomBooleanPreview";
import { buildSchema } from "@camberi/firecms";

export const blogSchema = buildSchema({
    name: "Blog entry",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        gold_text: {
            title: "Gold text",
            description: "This field is using a custom component defined by the developer",
            dataType: "string",
            config: {
                field: CustomColorTextField,
                fieldProps: {
                    color: "gold"
                }
            }
        },
        long_text: {
            title: "Long text",
            description: "Example of a long text",
            validation: { required: true },
            dataType: "string",
            config: {
                multiline: true
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
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            },
            description: "This fields allows uploading multiple images at once and reordering"
        },
        publish_date: {
            title: "Publish date",
            dataType: "timestamp"
        },
        priority: {
            title: "Priority",
            description: "This field allows the selection of Infinity as a value",
            dataType: "number",
            config: {
                fieldProps: {
                    allowInfinity: true
                }
            }
        },
        reviewed: {
            title: "Reviewed",
            dataType: "boolean",
            config: {
                customPreview: CustomBooleanPreview
            }
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            config: {
                enumValues: {
                    published: "Published",
                    draft: "Draft"
                }
            }
        },
        content: {
            title: "Content",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        products: {
            title: "Products",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "reference",
                collectionPath: "products",
                previewProperties: ["name", "main_image"]
            }
        },
        tags: {
            title: "Tags",
            description: "Example of generic array",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    previewAsTag: true
                }
            }
        }
    },
    defaultValues: {
        status: "draft",
        tags: ["default tag"]
    }
});
