import React, { useCallback } from "react";

import { useSnackbarController, useStorageSource } from "../../hooks/index.js";
import { StorageFieldItem } from "../../util/useStorageUploadController.js";
import { ErrorView } from "../../components/index.js";
import { cls, paperMixin, Skeleton } from "@firecms/ui";
import { useMediaPicker } from "../../contexts/MediaPickerContext.js";

export interface StorageUploadItemProps {
    storagePath: string;
    metadata?: any,
    entry: StorageFieldItem,
    onFileUploadComplete: (value: string,
                           entry: StorageFieldItem,
                           metadata?: any,
                           uploadedUrl?: string) => Promise<void>;
    imageSize: number;
    simple: boolean;
}

export function StorageUploadProgress({
                                          storagePath,
                                          entry,
                                          metadata,
                                          onFileUploadComplete,
                                          imageSize,
                                          simple,
                                      }: StorageUploadItemProps) {

    const storageSource = useStorageSource();
    const mediaPicker = useMediaPicker();
    const mediaPickerRef = React.useRef(mediaPicker);
    mediaPickerRef.current = mediaPicker;

    const snackbarController = useSnackbarController();

    const [error, setError] = React.useState<Error | undefined>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [progress, setProgress] = React.useState<number>(0);
    const mounted = React.useRef(false);
    const uploading = React.useRef(false);

    const upload = useCallback((file: File, fileName?: string) => {

        if (uploading.current) return;
        uploading.current = true;
        setError(undefined);
        setLoading(true);

        storageSource.uploadFile({
            file,
            fileName,
            path: storagePath,
            metadata,
            onProgress: (p) => {
                if (mounted.current) setProgress(p);
            }
        })
            .then(async ({ path, storageUrl, bucket }) => {
                console.debug("Upload successful", path);
                await onFileUploadComplete(path, entry, metadata, storageUrl);
                if (mediaPickerRef.current) {
                    try {
                        await mediaPickerRef.current.registerUpload(file, path, bucket);
                    } catch (error) {
                        console.error("Media library registration failed", error);
                        snackbarController.open({ type: "error", message: "File uploaded, but could not be added to the media library." });
                    }
                }
                if (mounted.current)
                    setLoading(false);
            })
            .catch((e) => {
                console.warn("Upload error", e);
                if (mounted.current) {
                    setError(e);
                    setLoading(false);
                    snackbarController.open({
                        type: "error",
                        message: "Error uploading file: " + e.message
                    });
                }
            })
            .finally(() => {
                uploading.current = false;
            });
    }, [entry, metadata, onFileUploadComplete, storageSource, storagePath]);

    React.useEffect(() => {
        mounted.current = true;
        if (entry.file)
            upload(entry.file, entry.fileName);
        return () => {
            mounted.current = false;
        };
    }, [entry.file, entry.fileName, upload]);

    const isLargeFile = entry.file && entry.file.size > 500 * 1024;
    const renderProgressBar = loading && isLargeFile && progress > 0;
    const progressBar = renderProgressBar && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary w-full origin-left transition-transform duration-200"
             style={{ transform: `scaleX(${progress / 100})` }} />
    );

    if (simple) {
        return <div className={`relative overflow-hidden w-${imageSize} h-${imageSize}`}>

            {loading && <Skeleton className={`w-${imageSize} h-${imageSize}`}/>}

            {progressBar}

        </div>
    }
    return (

        <div className={cls(paperMixin,
            "p-4 relative overflow-hidden border-box flex items-center justify-center",
            `min-w-[${imageSize}px] min-h-[${imageSize}px]`)}>

            {loading &&
                <Skeleton className="w-full h-full"/>}

            {progressBar}

            {error && <ErrorView title={"Error uploading file"}
                                 error={error}/>}

        </div>

    );

}
