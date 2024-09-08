import { AdditionalFieldDelegate, buildCollection, buildEnumValueConfig, EntityReference, EnumValues, Permissions, UploadedFileContext } from "@firecms/core";
import { locales } from "../locales";
import MediaLocalePreview from "./fields/MediaLocalePreview";
import MediaThumbnailsPreview from "./fields/MediaThumbnailsUrls";

export type Media = {
    image: string,
    altDescription?: string,
    width?: number,
    height?: number,
}

export type MediaLocale = {
    image: string,
    altDescription?: string,
    width?: number,
    height?: number,
}

const mediaLocalePreview: AdditionalFieldDelegate = {
    key: "locales",
    name: "Locales",
    width: 300,
    Builder: ({ entity }) => (
        <MediaLocalePreview entity={entity}/>
    )
};

const mediaThumbnailsPreview: AdditionalFieldDelegate = {
    key: "thumbs_urls",
    name: "Thumbnails URLs",
    width: 300,
    Builder: ({ entity }) => (
        <MediaThumbnailsPreview entity={entity}/>
    )
};



const mediaLocaleCollection = buildCollection<MediaLocale>({
    name: "Media Translations",
    id: 'locales',
    path: 'locales',
    customId: locales,
    additionalFields: [mediaThumbnailsPreview],
    properties: {
        image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                fileName: (entity: UploadedFileContext) => {
                    if(!entity.path)
                        throw new Error("Path not found")
                    const path = entity.path.split("/")
                    const mediaId = path[1]
                    const filename = entity.file.name.split(".")
                    const extension = filename[filename.length - 1]
                    return entity.entityId != null ? `${mediaId}_${entity.entityId}.${extension}` : entity.file.name
                },
                acceptedFiles: ["image/*"]
            }
        },
        altDescription: {
            dataType: "string",
            name: "Alt Description"
        },
        width: {
            dataType: "number",
            name: "Width"
        },
        height: {
            dataType: "number",
            name: "Height"
        },
    }
})






export function getMediaCollection() {
    return buildCollection<Media>({
        name: "Media",
        group: `Core`,
        icon: "InsertPhoto",
        id: `media`,
        path: `media`,
        additionalFields: [mediaLocalePreview, mediaThumbnailsPreview],
        propertiesOrder: [
            'image',
// @ts-ignore
            'locales',
// @ts-ignore
            'thumbs_urls',
            'altDescription',
            'width',
            'height'
        ],
        subcollections: [
            {
                ...mediaLocaleCollection,
            }
        ],
        properties: {
            image: {
                dataType: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    fileName: (entity: UploadedFileContext) => {
                        const filename = entity.file.name.split(".")
                        const extension = filename[filename.length - 1]
                        return entity.entityId != null ? `${entity.entityId}.${extension}` : entity.file.name
                    },
                }
            },
            altDescription: {
                dataType: "string",
                name: "Alt Description"
            },
            width: {
                dataType: "number",
                name: "Width"
            },
            height: {
                dataType: "number",
                name: "Height"
            },
        }
    });

}
