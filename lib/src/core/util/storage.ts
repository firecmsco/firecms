import {
    EntityValues,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    UploadedFileContext
} from "../../types";
import { randomString } from "./strings";

export async function resolveFilenameString<M extends object>(
    input: string | ((context: UploadedFileContext) => Promise<string> | string),
    storage: StorageConfig,
    values: EntityValues<M>,
    entityId: string,
    path: string,
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>,
    file: File,
    propertyKey: string): Promise<string> {
    let result;
    if (typeof input === "function") {
        result = await input({
            path,
            entityId,
            values,
            property,
            file,
            storage,
            propertyKey
        });
        if (!result)
            console.warn("Storage callback returned empty result. Using default name value")
    } else {
        result = replacePlaceholders(file, input, entityId, propertyKey, path);
    }

    if (!result)
        result = randomString() + "_" + file.name;

    return result;
}

export function resolveStoragePathString<M extends object>(
    input: string | ((context: UploadedFileContext) => string),
    storage: StorageConfig,
    values: EntityValues<M>,
    entityId: string,
    path: string,
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>,
    file: File,
    propertyKey: string): string {
    let result;
    if (typeof input === "function") {
        result = input({
            path,
            entityId,
            values,
            property,
            file,
            storage,
            propertyKey
        });
        if (!result)
            console.warn("Storage callback returned empty result. Using default name value")
    } else {
        result = replacePlaceholders(file, input, entityId, propertyKey, path);
    }

    if (!result)
        result = randomString() + "_" + file.name;

    return result;
}

function replacePlaceholders(file: File, input: string, entityId: string, propertyKey: string, path: string) {
    const ext = file.name.split(".").pop();
    let result = input.replace("{entityId}", entityId)
        .replace("{propertyKey}", propertyKey)
        .replace("{rand}", randomString())
        .replace("{file}", file.name)
        .replace("{file.type}", file.type)
        .replace("{path}", path);
    if (ext) {
        result = result.replace("{file.ext}", ext);
        const name = file.name.replace(`.${ext}`, "");
        result = result.replace("{file.name}", name)
    }

    if (!result)
        result = randomString() + "_" + file.name;

    return result;
}
