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
    id: "blog",
    path: "blog",
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
            dataType: "string"
        }),
        header_image: buildProperty({
            name: "Header image",
            dataType: "string",
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
            dataType: "array",
            columnWidth: 400,
            oneOf: {
                typeField: "type",
                valueField: "value",
                properties: {
                    text: {
                        dataType: "string",
                        name: "Text",
                        markdown: true
                    },
                    quote: {
                        dataType: "string",
                        name: "Quote",
                        multiline: true
                    },
                    images: {
                        name: "Images",
                        dataType: "array",
                        of: buildProperty<string>({
                            dataType: "string",
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
                        dataType: "array",
                        of: {
                            dataType: "reference",
                            path: "products",
                            previewProperties: ["name", "main_image"]
                        }
                    }
                }
            }
        }),
        created_on: {
            name: "Created on",
            dataType: "date",
            autoValue: "on_create"
        },
        status: buildProperty(({ values }) => ({
            name: "Status",
            validation: { required: true },
            dataType: "string",
            columnWidth: 140,
            enumValues: {
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
            dataType: "date",
            clearable: true
        }),
        reviewed: buildProperty({
            name: "Reviewed",
            dataType: "boolean"
        }),
        tags: {
            name: "Tags",
            description: "Example of generic array",
            dataType: "array",
            of: {
                dataType: "string",
                previewAsTag: true
            },
            defaultValue: ["default tag"]
        }
    },
    initialFilter: {
        status: ["==", "published"]
    }
});
