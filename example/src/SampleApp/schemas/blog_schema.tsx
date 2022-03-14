import CustomColorTextField from "../custom_field/CustomColorTextField";
import {
    buildProperty, buildPropertyBuilder,
    buildSchema,
    ExportMappingFunction
} from "@camberi/firecms";
import { BlogEntryPreview } from "../custom_schema_view/BlogEntryPreview";

type BlogEntry = {
    name: string,
    header_image: string,
    content: any[],
    gold_text: string,
    created_at: Date,
    publish_date: Date,
    reviewed: boolean,
    status: string,
    tags: string[]
}

export const blogSchema = buildSchema<BlogEntry>({
    id: "blog_entry",
    name: "Blog entry",
    defaultSize: "l",
    views: [{
        path: "preview",
        name: "Preview",
        builder: (props) => <BlogEntryPreview {...props}/>
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
        status: buildPropertyBuilder(({ values }) => ({
            name: "Status",
            validation: { required: true },
            dataType: "string",
            columnWidth: 140,
            enumValues: {
                published: {
                    id: "published",
                    label: "Published",
                    disabled: !values.header_image,
                },
                draft: "Draft"
            },
            defaultValue: "draft"
        })),
        created_at: {
            name: "Created at",
            dataType: "date",
            autoValue: "on_create"
        },
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
                            path: "products",
                            previewProperties: ["name", "main_image"]
                        }
                    }
                }
            }
        }),
        gold_text: buildProperty({
            name: "Gold text",
            description: "This field is using a custom component defined by the developer",
            dataType: "string",
            Field: CustomColorTextField,
            customProps: {
                color: "gold"
            }
        }),
        publish_date: buildProperty({
            name: "Publish date",
            dataType: "date"
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
        "status": ["==", "published"]
    }
});

/**
 * Sample field that will be added to the export
 */
export const sampleAdditionalExportColumn: ExportMappingFunction = {
    key: "extra",
    builder: async ({ entity }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "Additional exported value " + entity.id;
    }
};
