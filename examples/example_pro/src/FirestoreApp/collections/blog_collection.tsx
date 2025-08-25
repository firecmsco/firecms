import { buildCollection, buildProperty } from "@firecms/core";
import { BlogEntryPreview } from "../custom_entity_view/BlogEntryPreview";

export type BlogEntry = {
    name: string,
    header_image: string,
    content: any[],
    created_on: Date,
    publish_date: Date,
    reviewed: boolean,
    status: string,
    tags: string[]
}

export const blogCollection = buildCollection<BlogEntry>({
    slug: "blog",
    dbPath: "blog",
    name: "Blog",
    singularName: "Blog entry",
    group: "Demo collections",
    openEntityMode: "full_screen",
    icon: "Article",
    description: "A blog entry with a quirky humorist tone. Each entry should have at least 5 text pieces of around 100 words each and a quote at least. The quote can be anywhere.",
    textSearchEnabled: true,
    defaultSize: "l",
    entityViews: [{
        key: "preview",
        name: "Preview",
        Builder: BlogEntryPreview
    }],
    properties: {
        name: buildProperty({
            name: "Name",
            validation: { required: true },
            type: "string"
        }),
        header_image: buildProperty({
            name: "Header image",
            type: "string",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            }
        }),
        content: buildProperty({
            name: "Content",
            description: "Example of a complex array with multiple properties as children",
            validation: { required: true },
            type: "array",
            columnWidth: 400,
            oneOf: {
                typeField: "type",
                valueField: "value",
                properties: {
                    text: {
                        type: "string",
                        name: "Text",
                        markdown: true
                    },
                    quote: {
                        type: "string",
                        name: "Quote",
                        multiline: true
                    },
                    images: {
                        name: "Images",
                        type: "array",
                        of: buildProperty<string>({
                            type: "string",
                            storage: {
                                storagePath: "images",
                                acceptedFiles: ["image/*"],
                                metadata: {
                                    cacheControl: "max-age=1000000"
                                }
                            }
                        }),
                        description: "This fields allows uploading multiple images at once and reordering"
                    },
                    products: {
                        name: "Products",
                        type: "array",
                        of: {
                            type: "reference",
                            path: "products",
                            previewProperties: ["name", "main_image"]
                        }
                    }
                }
            }
        }),
        created_on: {
            name: "Created on",
            type: "date",
            autoValue: "on_create"
        },
        status: buildProperty(({ values }) => ({
            name: "Status",
            validation: { required: true },
            type: "string",
            columnWidth: 140,
            enum: {
                published: {
                    id: "published",
                    label: "Published",
                    disabled: !values.header_image
                },
                draft: "Draft"
            },
            defaultValue: "draft"
        })),
        publish_date: buildProperty({
            name: "Publish date",
            type: "date",
            clearable: true
        }),
        reviewed: buildProperty({
            name: "Reviewed",
            type: "boolean"
        }),
        tags: {
            name: "Tags",
            description: "Example of generic array",
            type: "array",
            of: {
                type: "string",
                previewAsTag: true
            },
            defaultValue: ["default tag"]
        }
    },
    filter: {
        status: ["==", "published"]
    }
});
