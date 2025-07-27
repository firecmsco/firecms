import {
    EntityValues,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    UploadedFileContext
} from "../types";
import { randomString } from "./strings";

interface ResolveFilenameStringParams<M extends object> {
    input: string | ((context: UploadedFileContext) => (Promise<string> | string));
    storage: StorageConfig;
    values: EntityValues<M>;
    entityId?: string | number;
    path?: string;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>,
    file: File;
    propertyKey: string;
}

export async function resolveStorageFilenameString<M extends object>(
    {
        input,
        storage,
        values,
        entityId,
        path,
        property,
        file,
        propertyKey
    }: ResolveFilenameStringParams<M>): Promise<string> {
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
        result = replacePlaceholders({
            file,
            input,
            entityId,
            propertyKey,
            path
        });
    }

    if (!result)
        result = randomString() + "_" + file.name;

    return result;
}

interface ResolveStoragePathStringParams<M extends object> {
    input: string | ((context: UploadedFileContext) => string);
    storage: StorageConfig;
    values: EntityValues<M>;
    entityId?: string | number;
    path?: string;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;
    file: File;
    propertyKey: string;
}

export function resolveStoragePathString<M extends object>(
    {
        input,
        storage,
        values,
        entityId,
        path,
        property,
        file,
        propertyKey
    }: ResolveStoragePathStringParams<M>): string {
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
        result = replacePlaceholders({
            file,
            input,
            entityId,
            propertyKey,
            path
        });
    }

    if (!result)
        result = randomString() + "_" + file.name;

    return result;
}

interface Placeholders {
    file: File;
    input: string;
    entityId?: string | number;
    propertyKey: string;
    path?: string;
}

function replacePlaceholders({
                                 file,
                                 input,
                                 entityId,
                                 propertyKey,
                                 path
                             }: Placeholders) {
    const ext = file.name.split(".").pop();
    let result = input
        .replace("{propertyKey}", propertyKey)
        .replace("{rand}", randomString())
        .replace("{file}", file.name)
        .replace("{file.type}", file.type);
    if (entityId) {
        result = result.replace("{entityId}", String(entityId));
    }
    if (path) {
        result = result.replace("{path}", path);
    }
    if (ext) {
        result = result.replace("{file.ext}", ext);
        const name = file.name.replace(`.${ext}`, "");
        result = result.replace("{file.name}", name)
    }

    if (!result)
        result = randomString() + "_" + file.name;

    return result;
}
