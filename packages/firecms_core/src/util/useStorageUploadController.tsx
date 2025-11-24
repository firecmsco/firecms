import Compressor from "compressorjs";
import equal from "react-fast-compare";

import {
    ArrayProperty,
    EntityValues,
    ImageResize,
    Property,
    PropertyOrBuilder,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    StorageSource,
    StringProperty
} from "../types";
import { useCallback, useEffect, useState } from "react";
import { PreviewSize } from "../preview";
import { randomString } from "./strings";
import { resolveStorageFilenameString, resolveStoragePathString } from "./storage";
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
                                                                 entityId: string,
                                                                 entityValues: EntityValues<M>,
                                                                 value: string | string[] | null;
                                                                 path?: string,
                                                                 propertyKey: string,
                                                                 property: StringProperty | ArrayProperty<string[]> | ResolvedStringProperty | ResolvedArrayProperty<string[]>,
                                                                 storageSource: StorageSource,
                                                                 disabled: boolean,
                                                                 onChange: (value: string | string[] | null) => void
                                                             }) {

    const authController = useAuthController();
    const storage: StorageConfig | undefined = property.dataType === "string"
        ? property.storage
        : property.dataType === "array" &&
        (property.of as Property).dataType === "string"
            ? (property.of as StringProperty).storage
            : undefined;

    const multipleFilesSupported = property.dataType === "array";

    if (!storage)
        throw Error("Storage meta must be specified");

    const processFile = storage?.processFile;

    const metadata: Record<string, any> | undefined = storage?.metadata;
    const size = multipleFilesSupported ? "medium" : "large";

    // Support both new imageResize and deprecated imageCompression
    const imageResize = storage?.imageResize;
    const legacyCompression = storage?.imageCompression;

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
        propertyOrBuilder: property as PropertyOrBuilder,
        values: entityValues,
        authController
    }) as ResolvedStringProperty | ResolvedArrayProperty<string[]>;

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

    const onFileUploadError = useCallback((entry: StorageFieldItem) => {
        console.debug("onFileUploadError", entry);

        // Remove the failed entry from internalValue
        const newValue = internalValue.filter(item => item.id !== entry.id);
        setInternalValue(newValue);
    }, [internalValue]);

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
                    if ((imageResize || legacyCompression) && isImageFile(file)) {
                        file = await resizeImage(file, imageResize, legacyCompression);
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
            let file = acceptedFiles[0];
            if ((imageResize || legacyCompression) && isImageFile(file)) {
                file = await resizeImage(file, imageResize, legacyCompression);
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
    }, [disabled, fileNameBuilder, internalValue, metadata, multipleFilesSupported, size, imageResize, legacyCompression]);

    return {
        internalValue,
        setInternalValue,
        storage,
        fileNameBuilder,
        storagePathBuilder,
        onFileUploadComplete,
        onFileUploadError,
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

/**
 * Check if a file is an image type supported for resizing
 */
function isImageFile(file: File): boolean {
    return file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp";
}

/**
 * Resize and compress an image using compressorjs.
 * Supports both the new imageResize API and legacy imageCompression for backward compatibility.
 */
async function resizeImage(
    file: File,
    imageResize?: StorageConfig["imageResize"],
    legacyCompression?: ImageResize
): Promise<File> {
    // Determine configuration (new API takes precedence)
    const maxWidth = imageResize?.maxWidth ?? legacyCompression?.maxWidth;
    const maxHeight = imageResize?.maxHeight ?? legacyCompression?.maxHeight;
    const quality = (imageResize?.quality ?? legacyCompression?.quality ?? 80) / 100;
    const mode = imageResize?.mode ?? "contain";

    // Determine output format
    let mimeType = file.type;
    if (imageResize?.format && imageResize.format !== "original") {
        mimeType = `image/${imageResize.format}`;
    }

    return new Promise<File>((resolve, reject) => {
        new Compressor(file, {
            quality,
            maxWidth,
            maxHeight,
            mimeType,
            // Use cover mode if specified (crops to fit)
            // Otherwise use contain mode (scales to fit)
            ...(mode === "cover" || mode === undefined ? {
                width: maxWidth,
                height: maxHeight,
                resize: "cover" as const
            } : {}),
            success: (result) => {
                const compressedFile = new File([result], file.name, {
                    type: result.type,
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            },
            error: reject,
        });
    });
}
