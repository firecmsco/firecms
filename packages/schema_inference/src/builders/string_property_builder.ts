import { FileType, Property, StringProperty, unslugify } from "@firecms/core";
import { InferencePropertyBuilderProps, ValuesCountEntry } from "../types";
import { findCommonInitialStringInPath } from "../strings";
import { extractEnumFromValues } from "../util";

const IMAGE_EXTENSIONS = [".jpg", ".png", ".webp", ".gif"];
const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".opus", ".aac"];
const VIDEO_EXTENSIONS = [".avi", ".mp4"];

const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


export function buildStringProperty({
                                        totalDocsCount,
                                        valuesResult
                                    }: InferencePropertyBuilderProps): Property {

    let stringProperty: Property = {
        dataType: "string",

    };

    if (valuesResult) {

        const totalEntriesCount = valuesResult.values.length;
        const totalValues = Array.from(valuesResult.valuesCount.keys()).length;

        const config: Partial<StringProperty> = {};

        const probablyAURL = valuesResult.values
            .filter((value) => typeof value === "string" &&
                value.toString().startsWith("http")).length > totalDocsCount / 3 * 2;
        if (probablyAURL) {
            config.url = true;
        }

        const probablyAnEmail = valuesResult.values
            .filter((value) => typeof value === "string" &&
                emailRegEx.test(value)).length > totalDocsCount / 3 * 2;
        if (probablyAnEmail) {
            config.email = true;
        }

        const probablyUserIds = valuesResult.values
            .filter((value) => typeof value === "string" && value.length === 28 && !value.includes(" "))
            .length > totalDocsCount / 3 * 2;
        if (probablyUserIds)
            config.readOnly = true;

        if (!probablyAnEmail &&
            !probablyAURL &&
            !probablyUserIds &&
            !probablyAURL &&
            totalValues < totalEntriesCount / 3
        ) {
            const enumValues = extractEnumFromValues(Array.from(valuesResult.valuesCount.keys()));

            if (Object.keys(enumValues).length > 1)
                config.enumValues = enumValues;
        }

        // regular string
        if (!probablyAnEmail &&
            !probablyAURL &&
            !probablyUserIds &&
            !probablyAURL &&
            !config.enumValues) {
            const fileType = probableFileType(valuesResult, totalDocsCount);
            if (fileType) {
                config.storage = {
                    acceptedFiles: [fileType as FileType],
                    storagePath: findCommonInitialStringInPath(valuesResult) ?? "/"
                };
            }
        }

        if (Object.keys(config).length > 0)
            stringProperty = {
                ...stringProperty,
                ...config,
                editable: true
            };
    }

    return stringProperty;
}

// TODO: support returning multiple types
function probableFileType(valuesCount: ValuesCountEntry, totalDocsCount: number): boolean | FileType {
    const probablyAnImage = valuesCount.values
        .filter((value) => typeof value === "string" &&
            IMAGE_EXTENSIONS.some((extension) => value.toString().endsWith(extension))).length > totalDocsCount / 3 * 2;

    const probablyAudio = valuesCount.values
        .filter((value) => typeof value === "string" &&
            AUDIO_EXTENSIONS.some((extension) => value.toString().endsWith(extension))).length > totalDocsCount / 3 * 2;

    const probablyVideo = valuesCount.values
        .filter((value) => typeof value === "string" &&
            VIDEO_EXTENSIONS.some((extension) => value.toString().endsWith(extension))).length > totalDocsCount / 3 * 2;

    const fileType: boolean | FileType = probablyAnImage
        ? "image/*"
        : probablyAudio
            ? "audio/*"
            : probablyVideo ? "video/*" : false;
    return fileType;
}
