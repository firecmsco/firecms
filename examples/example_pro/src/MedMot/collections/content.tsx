import { buildCollection, buildEnumValueConfig, EntityReference, EnumValues, Permissions } from "@firecms/core";
import { getExtendedCountryNameFromLocale, getIso2FromLocale } from "../locales";
import { bodyPartsMappedEnum } from "./fields/body/body_parts";

import BodyPartsField from "./fields/body/BodyPartsField";
import BodyPartsPreview from "./fields/body/BodyPartsPreview";
import MsDurationPreview from "./fields/MsDurationPreview";

export type Podcast = {
    title: string,
    audio_file: string,
    status: string,
    image: string,
    category: string,
    category_ref: EntityReference,
    description: string,
    audio_duration_milliseconds: number,
    legacy_id: number,
    prevention_20_only: boolean,
    transcription: string,
    created_at: Date,
    released_at: Date,
    order: number,
    author: EntityReference,
    body_parts: string[],
    related_diseases: EntityReference[],
    related_podcasts: EntityReference[],
}

export type Meditation = {
    title: string,
    audio_file: string,
    status: string,
    duration: number,
    category_ref: EntityReference,
    order: number,
    image: string,
    description: string,
    created_at: Date,
    released_at: Date,
    legacy_id: number,

}

export const contentCategories: EnumValues = {
    daily_tips: "Daily tips",
    movement: "Movement",
    health: "Health",
    stress_management: "Stress management",
    work: "Work",
    basics_about_body: "Basics about the body",
    medicalmotion: "Medicalmotion",
    pain: "Pain",
    prevention: "Prevention",
    other: "Other"
};

const podcastStatus: EnumValues = [
    buildEnumValueConfig({ id: "published", label: "Published", color: "greenDark" }),
    buildEnumValueConfig({ id: "collection_published", label: "Collection published", color: "greenLighter" }),

    // buildEnumValueConfig({ id: "in_progress", label: "In progress", color: "yellowLighter" }),
    // buildEnumValueConfig({ id: "content_to_do", label: "Content to do", color: "yellowLight" }),
    // buildEnumValueConfig({ id: "draft", label: "Draft", color: "yellowDark" }),

    buildEnumValueConfig({ id: "content_research", label: "Content Research", color: "yellowLighter" }),
    buildEnumValueConfig({ id: "is_written", label: "Is written", color: "yellowLight" }),
    buildEnumValueConfig({ id: "will_be_cut", label: "Will be cut", color: "yellowDark" }),
    buildEnumValueConfig({ id: "cut", label: "Cut", color: "orangeDark" }),
    buildEnumValueConfig({ id: "on_hold", label: "On hold", color: "orangeDarker" }),
];

export function getMeditationCollection(locale: string) {
    return buildCollection<Meditation>({
        name: "Meditation" + " - " + getIso2FromLocale(locale).toUpperCase(),
        group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
        icon: "SelfImprovementRounded",
        id: "content_meditations",
        path: `content/${locale}/meditations`,
        properties: {
            audio_file: {
                dataType: "string",
                name: "File",
                validation: {
                    required: true
                },
                storage: {
                    storagePath: "audios",
                    acceptedFiles: ["audio/*"]
                }
            },
            status: {
                dataType: "string",
                name: "Status",
                enumValues: podcastStatus
            },
            duration: {
                dataType: "number",
                name: "Duration",
                disabled: {
                    disabledMessage: "This field gets updated automatically"
                }
            },
            image: {
                dataType: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            title: {
                dataType: "string",
                name: "Title"
            },
            description: {
                dataType: "string",
                name: "Description"
            },
            category_ref: {
                dataType: "reference",
                name: "Category",
                path: `content/${locale}/meditation_categories`
            },
            order: {
                name: "Order",
                dataType: "number",
            },
            legacy_id: {
                dataType: "number",
                name: "Legacy Id",
                disabled: true
            },
            created_at: {
                dataType: "date",
                name: "Created At",
                autoValue: "on_create"
            },
            released_at: {
                dataType: "date",
                name: "Released At",
                autoValue: "on_create"
            }
        }
    });
}


export function getPodcastsSchema(locale: string) {
    return buildCollection<Podcast>({
        name: "Podcasts" + " - " + getIso2FromLocale(locale).toUpperCase(),
        icon: "HeadsetRounded",
        group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
        textSearchEnabled: true,
        singularName: "Podcast",
        id: "content_podcasts",
        path: `content/${locale}/podcasts`,
        properties: {
            title: {
                dataType: "string",
                name: "Title"
            },
            audio_file: {
                dataType: "string",
                name: "Audio file",
                storage: {

                    storagePath: "audios",
                    acceptedFiles: ["audio/*"]

                },
                columnWidth: 320
            },
            category_ref: {
                dataType: "reference",
                name: "Category",
                path: `content/${locale}/categories`
            },
            audio_duration_milliseconds: {
                dataType: "number",
                name: "Duration",
                Preview: MsDurationPreview
            },
            status: {
                dataType: "string",
                name: "Status",
                enumValues: podcastStatus
            },
            order: {
                name: "Order",
                dataType: "number",
            },
            author: {
                dataType: "reference",
                name: "Author",
                path: `content/${locale}/authors`
            },
            image: {
                dataType: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            category: {
                dataType: "string",
                name: "Category",
                enumValues: contentCategories
            },
            body_parts: {
                name: "Body parts",
                dataType: "array",
                Field: BodyPartsField,
                customProps: {
                    mapped: true,
                    multiSelect: true
                },
                Preview: BodyPartsPreview,
                description:
                    "The body parts this podcasts refers to",
                of: {
                    dataType: "string",
                    enumValues: bodyPartsMappedEnum
                }
            },
            description: {
                dataType: "string",
                name: "Description",
                multiline: true
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
            transcription: {
                dataType: "string",
                name: "Transcription",
                multiline: true
            },
            legacy_id: {
                dataType: "number",
                name: "Legacy Id",
                disabled: true
            },
            prevention_20_only: {
                dataType: "boolean",
                name: "Prevention 20 only"
            },
            created_at: {
                dataType: "date",
                name: "Created At",
                autoValue: "on_create"
            },
            released_at: {
                dataType: "date",
                name: "Released At",
                autoValue: "on_create"
            }
        }
    });
}

interface Author {
    image: string,
    name: string,
    description: string,
    legacy_id: number
}

export function getAuthorCollection(locale: string) {
    return buildCollection<Author>({
        name: "Authors" + " - " + getIso2FromLocale(locale).toUpperCase(),
        icon: "Face6Rounded",
        singularName: "Author",
        group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
        id: "content_authors",
        path: `content/${locale}/authors`,
        properties: {
            image: {
                dataType: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            name: {
                dataType: "string",
                name: "Title"
            },
            description: {
                dataType: "string",
                name: "Description"
            },
            legacy_id: {
                dataType: "number",
                name: "Legacy Id",
                disabled: true
            }
        }
    });
}
