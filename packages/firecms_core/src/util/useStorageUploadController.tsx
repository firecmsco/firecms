import Resizer from "react-image-file-resizer";
import equal from "react-fast-compare";

import {
    ArrayProperty,
    EntityValues,
    ImageCompression,
    PreviewSize,
    Property,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    StorageSource,
    StringProperty
} from "@firecms/types";
import { useCallback, useEffect, useState } from "react";
import { randomString, resolveStorageFilenameString, resolveStoragePathString } from "@firecms/common";
import { resolveProperty } from "./resolutions";
import { useAuthController } from "../hooks";

/**
 * Internal representation of an item in the storage
 * It can have two states, having a storagePathOrDownloadUrl set,
 * which means the file has been uploaded, and it is rendered as a preview
 * Or have a pending file being uploaded.
 */
export interface StorageFieldItem {
    id: number; // generated on the fly for internal use only
    storagePathOrDownloadUrl?: string;
    file?: File;
    fileName?: string;
    metadata?: any,
    size: PreviewSize
}

export function useStorageUploadController<M extends object>({
                                                                 entityId,
                                                                 entityValues,
                                                                 path,
                                                                 value,
                                                                 property,
                                                                 propertyKey,
                                                                 storageSource,
                                                                 disabled,
                                                                 onChange
                                                             }:
                                                             {
                                                                 entityId?: string | number,
                                                                 entityValues: EntityValues<M>,
                                                                 value: string | string[] | null;
                                                                 path?: string,
                                                                 propertyKey: string,
                                                                 property: StringProperty | ArrayProperty | ResolvedStringProperty | ResolvedArrayProperty,
                                                                 storageSource: StorageSource,
                                                                 disabled: boolean,
                                                                 onChange: (value: string | string[] | null) => void
                                                             }) {

    const authController = useAuthController();
    const storage: StorageConfig | undefined = property.type === "string"
        ? property.storage
        : property.type === "array" &&
        (property.of as Property).type === "string"
            ? (property.of as StringProperty).storage
            : undefined;

    const multipleFilesSupported = property.type === "array";

    if (!storage)
        throw Error("Storage meta must be specified");

    const processFile = storage?.processFile;

    const metadata: Record<string, any> | undefined = storage?.metadata;
    const size = multipleFilesSupported ? "medium" : "large";

    const compression: ImageCompression | undefined = storage?.imageCompression;

    const internalInitialValue: StorageFieldItem[] =
        getInternalInitialValue(multipleFilesSupported, value, metadata, size);

    const [initialValue, setInitialValue] = useState<string | string[] | null>(value);
    const [internalValue, setInternalValue] = useState<StorageFieldItem[]>(internalInitialValue);

    useEffect(() => {
        if (!equal(initialValue, value)) {
            setInitialValue(value);
            setInternalValue(internalInitialValue);
        }
    }, [internalInitialValue, value, initialValue]);

    const resolvedProperty = resolveProperty({
        property: property,
        values: entityValues,
        authController
    }) as ResolvedStringProperty | ResolvedArrayProperty;

    const fileNameBuilder = useCallback(async (file: File) => {
        if (storage.fileName) {
            const fileName = await resolveStorageFilenameString({
                input: storage.fileName,
                storage,
                values: entityValues,
                entityId,
                path,
                property: resolvedProperty,
                file,
                propertyKey
            });
            if (!fileName || fileName.length === 0) {
                throw Error("You need to return a valid filename");
            }
            return fileName;
        }
        return randomString() + "_" + file.name;
    }, [entityId, entityValues, path, resolvedProperty, propertyKey, storage]);

    const storagePathBuilder = useCallback((file: File) => {
        return resolveStoragePathString({
            input: storage.storagePath,
            storage,
            values: entityValues,
            entityId,
            path,
            property: resolvedProperty,
            file,
            propertyKey
        }) ?? "/";
    }, [entityId, entityValues, path, resolvedProperty, propertyKey, storage]);

    const onFileUploadComplete = useCallback(async (uploadedPath: string,
                                                    entry: StorageFieldItem,
                                                    metadata?: any) => {

        console.debug("onFileUploadComplete", uploadedPath, entry);

        let uploadPathOrDownloadUrl: string | null = uploadedPath;
        if (storage.storeUrl) {
            uploadPathOrDownloadUrl = (await storageSource.getDownloadURL(uploadedPath)).url;
        }
        if (storage.postProcess && uploadPathOrDownloadUrl) {
            uploadPathOrDownloadUrl = await storage.postProcess(uploadPathOrDownloadUrl);
        }

        if (!uploadPathOrDownloadUrl) {
            console.warn("uploadPathOrDownloadUrl is null")
            return;
        }

        let newValue: StorageFieldItem[];

        entry.storagePathOrDownloadUrl = uploadPathOrDownloadUrl;
        entry.metadata = metadata;
        newValue = [...internalValue];

        newValue = removeDuplicates(newValue);
        setInternalValue(newValue);

        const fieldValue = newValue
            .filter(e => !!e.storagePathOrDownloadUrl)
            .map(e => e.storagePathOrDownloadUrl as string);

        if (multipleFilesSupported) {
            onChange(fieldValue);
        } else {
            onChange(fieldValue ? fieldValue[0] : null);
        }
    }, [internalValue, multipleFilesSupported, onChange, storage, storageSource]);

    const onFilesAdded = useCallback(async (acceptedFiles: File[]) => {

        if (!acceptedFiles.length || disabled)
            return;

        if (processFile) {
            try {
                acceptedFiles = await Promise.all(acceptedFiles.map(async file => {
                    const processedFile = await processFile(file);
                    if (!processedFile) {
                        return file;
                    }
                    return processedFile;
                }));
            } catch (e) {
                console.error("Error processing file with custom code. Attempting to continue uploading.", e);
            }
        }

        let newInternalValue: StorageFieldItem[];

        if (multipleFilesSupported) {
            newInternalValue = [...internalValue,
                ...(await Promise.all(acceptedFiles.map(async file => {
                    if (compression && compressionFormat(file)) {
                        file = await resizeAndCompressImage(file, compression)
                    }

                    return {
                        id: getRandomId(),
                        file,
                        fileName: await fileNameBuilder(file),
                        metadata,
                        size
                    } as StorageFieldItem;
                })))];
        } else {
            let file = acceptedFiles[0]
            if (compression && compressionFormat(file)) {
                file = await resizeAndCompressImage(file, compression)
            }

            newInternalValue = [{
                id: getRandomId(),
                file,
                fileName: await fileNameBuilder(file),
                metadata,
                size
            }];
        }

        // Remove either storage path or file duplicates
        newInternalValue = removeDuplicates(newInternalValue);
        setInternalValue(newInternalValue);
    }, [disabled, fileNameBuilder, internalValue, metadata, multipleFilesSupported, size]);

    return {
        internalValue,
        setInternalValue,
        storage,
        fileNameBuilder,
        storagePathBuilder,
        onFileUploadComplete,
        onFilesAdded,
        multipleFilesSupported
    }
}

function getInternalInitialValue(multipleFilesSupported: boolean,
                                 value: string | string[] | null,
                                 metadata: Record<string, any> | undefined,
                                 size: PreviewSize): StorageFieldItem[] {
    let strings: string[] = [];
    if (multipleFilesSupported) {
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
            strings = (value ?? []) as string[];
        }
    } else {
        if (typeof value === "string") {
            strings = value ? [value as string] : [];
        }
    }

    return strings
        .map(entry => (
            {
                id: getRandomId(),
                storagePathOrDownloadUrl: entry,
                metadata,
                size
            }
        ));
}

function removeDuplicates(items: StorageFieldItem[]) {
    return items.filter(
        (item, i) => {
            return ((items.map((v) => v.storagePathOrDownloadUrl).indexOf(item.storagePathOrDownloadUrl) === i) || !item.storagePathOrDownloadUrl) &&
                ((items.map((v) => v.file).indexOf(item.file) === i) || !item.file);
        }
    );
}

function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}

const supportedTypes: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP"
}
const compressionFormat = (file: File) => supportedTypes[file.type] ? supportedTypes[file.type] : null;

const defaultQuality = 100;
const resizeAndCompressImage = (file: File, compression: ImageCompression) => new Promise<File>((resolve) => {

    const inputQuality = compression.quality === undefined ? defaultQuality : compression.quality;
    const quality = inputQuality >= 0 ? inputQuality <= 100 ? inputQuality : 100 : 100;

    const format = compressionFormat(file);
    if (!format) {
        throw Error("resizeAndCompressImage: Unsupported image format");
    }
    Resizer.imageFileResizer(
        file,
        compression.maxWidth || Number.MAX_VALUE,
        compression.maxHeight || Number.MAX_VALUE,
        format,
        quality,
        0,
        (file: string | Blob | File | ProgressEvent<FileReader>) => resolve(file as File),
        "file"
    )
});
