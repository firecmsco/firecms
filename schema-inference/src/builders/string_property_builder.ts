import { FileType, StringProperty } from "@camberi/firecms";
import {PropertyBuilderProps, ValuesCountEntry} from "../models";
import {findCommonInitialStringInPath, unslugify} from "../util";

const IMAGE_EXTENSIONS = [".jpg", ".png", ".webp", ".gif"];
const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".opus", ".aac"];
const VIDEO_EXTENSIONS = [".avi", ".mp4"];

export function buildStringProperty({
                                        name,
                                        totalDocsCount,
                                        valuesResult
                                    }: PropertyBuilderProps): StringProperty {

    let stringProperty: StringProperty = {
        dataType: "string"
    };

    if (valuesResult) {

        const totalEntriesCount = valuesResult.values.length;
        const totalValues = Array.from(valuesResult.valuesCount.keys()).length;

        const config:Partial<StringProperty> = {};

        const probablyAURL = valuesResult.values
            .filter((value) => typeof value === "string" &&
                value.toString().startsWith("http")).length > totalDocsCount / 3 * 2;

        console.log(name, totalDocsCount, totalValues, totalEntriesCount)
        if (!probablyAURL
            && totalValues < totalEntriesCount / 3
        ) {
            const enumValues = Array.from(valuesResult.valuesCount.keys())
                .map((value) => ({[value]: unslugify(value)}))
                .reduce((a, b) => ({
                    ...a,
                    ...b
                }));
            config.enumValues = enumValues;
        }

        if (!config.enumValues) {
            const fileType = probableFileType(valuesResult, totalDocsCount);

            if (probablyAURL) {
                config.url = true;
            } else if (fileType) {
                config.storage = {
                    acceptedFiles: [fileType as FileType],
                    storagePath: findCommonInitialStringInPath(valuesResult) ?? "/"
                };
            }
        }

        if (Object.keys(config).length > 0)
            stringProperty = { ...stringProperty, ...config  };
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

    const fileType: boolean | FileType = probablyAnImage ? "image/*" :
        probablyAudio ? "audio/*" :
            probablyVideo ? "video/*" : false;
    return fileType;
}


