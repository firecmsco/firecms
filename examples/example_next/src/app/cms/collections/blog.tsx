import { buildCollection } from "@firecms/core";
import { BlogEntry } from "@/app/common/types";
import { CMSBlogPreview } from "@/app/cms/collections/components/CMSBlogPreview";

export const blogCollection = buildCollection<BlogEntry>({
    slug: "blog",
    dbPath: "blog",
    name: "Blog",
    singularName: "Blog entry",
    icon: "article",
    group: "Content",
    description: "A collection of blog entries",
    defaultSize: "l",
    entityViews: [
        {
            key: "blog_preview",
            name: "Blog preview",
            Builder: ({ modifiedValues, entity }) => <CMSBlogPreview
                id={entity?.id ?? "temp"}
                blogEntry={modifiedValues}/>
        }
    ],
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            type: "string"
        },
        header_image: {
            name: "Header image",
            type: "string",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            }
        },
        content: {
            name: "Content",
            description: "Content blocks for the blog entry",
            validation: { required: true },
            type: "array",
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
                },
                propertiesOrder: ["text", "quote", "images", "products"]
            }
        },
        created_on: {
            name: "Created on",
            type: "date",
            autoValue: "on_create"
        },
        status: {
            name: "Status",
            validation: { required: true },
            type: "string",
            enumValues: {
                published: {
                    id: "published",
                    label: "Published",
                },
                draft: "Draft"
            },
            defaultValue: "draft"
        },
        publish_date: {
            name: "Publish date",
            type: "date",
            clearable: true
        },
        reviewed: {
            name: "Reviewed",
            type: "boolean"
        },
        tags: {
            name: "Tags",
            description: "Example of generic array",
            type: "array",
            of: {
                type: "string",
                previewAsTag: true
            }
        }
    },
    initialFilter: {
        status: ["==", "published"]
    }
});
