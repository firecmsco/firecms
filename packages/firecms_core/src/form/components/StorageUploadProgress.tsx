import React, { useCallback } from "react";

import { useSnackbarController, useStorageSource } from "../../hooks";
import { StorageFieldItem } from "../../util/useStorageUploadController";
import { ErrorView } from "../../components";
import { cls, paperMixin, Skeleton } from "@firecms/ui";

export interface StorageUploadItemProps {
    storagePath: string;
    metadata?: any,
    entry: StorageFieldItem,
    onFileUploadComplete: (value: string,
                           entry: StorageFieldItem,
                           metadata?: any) => Promise<void>;
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

    const snackbarController = useSnackbarController();

    const [error, setError] = React.useState<Error | undefined>();
    const [loading, setLoading] = React.useState<boolean>(false);
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
            metadata
        })
            .then(async ({ path }) => {
                console.debug("Upload successful", path);
                await onFileUploadComplete(path, entry, metadata);
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

    if (simple) {
        return <div className={`w-${imageSize} h-${imageSize}`}>

            {loading && <Skeleton className={`w-${imageSize} h-${imageSize}`}/>}

        </div>
    }
    return (

        <div className={cls(paperMixin,
            "p-4 relative border-box flex items-center justify-center",
            `min-w-[${imageSize}px] min-h-[${imageSize}px]`)}>

            {loading &&
                <Skeleton className="w-full h-full"/>}

            {error && <ErrorView title={"Error uploading file"}
                                 error={error}/>}

        </div>

    );

}
