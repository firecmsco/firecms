import { buildCollection, buildProperty, EntityReference, Permissions } from "@firecms/core";
import { ArticlePreview } from "./views/ArticlePreview";
import { getExtendedCountryNameFromLocale, getIso2FromLocale } from "../locales";
import BodyPartsField from "./fields/body/BodyPartsField";
import BodyPartsPreview from "./fields/body/BodyPartsPreview";

export type Article = {
    name: string,
    description: string,
    header_image: string,
    content: any[],
    created_on: Date,
    publish_date: Date,
    reviewed: boolean,
    order: number,
    status: string,
    total_reading_time: number,
    total_words_count: number,
    tags: string[],
    category_ref: EntityReference,
    body_parts: string[],
    related_diseases: EntityReference[],
    related_podcasts: EntityReference[],
    related_articles: EntityReference[],
}


export const getArticlesCollection = (locale: string) => buildCollection<Article>({
    id: "content_articles",
    path: `content/${locale}/articles`,
    name: "Articles" + " - " + getIso2FromLocale(locale).toUpperCase(),
    group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
    singularName: "Article",
    icon: "Article",
    textSearchEnabled: true,
    defaultSize: "l",
    entityViews: [{
        key: "preview",
        name: "Preview",
        Builder: ArticlePreview
    }],
    properties: {
        name: buildProperty({
            name: "Name",
            validation: { required: true },
            dataType: "string"
        }),
        description: {
            name: "Description",
            dataType: "string",
            multiline: true
        },
        order: {
            name: "Order",
            dataType: "number",
        },
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
                }
            }
        }),
        category_ref: {
            dataType: "reference",
            name: "Category",
            path: `content/${locale}/categories`
        },
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
                draft: "Draft",
                content_research: "Content research",
                is_written: "Is written",
                is_reviewed: "Is reviewed",
                on_hold: "On hold",
                published: {
                    id: "published",
                    label: "Published",
                    disabled: !values.header_image
                },
            },
            defaultValue: "draft"
        })),
        total_reading_time: {
            name: "Total reading time",
            dataType: "number",
            readOnly: true
        },
        total_words_count: {
            name: "Total words count",
            dataType: "number",
            readOnly: true
        },
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
        },
        body_parts: {
            name: "Body parts",
            dataType: "array",
            Field: BodyPartsField,
            customProps: {
                mapped: false,
                multiSelect: true
            },
            Preview: BodyPartsPreview,
            description:
                "The body parts this podcasts refers to",
            of: {
                dataType: "string"
            }
        },
        related_diseases: {
            dataType: "array",
            name: "Related diseases",
            of: {
                dataType: "reference",
                path: "diagnosis"
            }
        },
        related_podcasts: {
            dataType: "array",
            name: "Related podcasts",
            of: {
                dataType: "reference",
                path: `content/${locale}/podcasts`
            }
        },
        related_articles: {
            dataType: "array",
            name: "Related articles",
            of: {
                dataType: "reference",
                path: `content/${locale}/articles`
            }
        },
    }
});
