import React, { useCallback } from "react";
import clsx from "clsx";

import { useSnackbarController, useStorageSource } from "../../hooks";
import { StorageFieldItem } from "../../core/util/useStorageUploadController";
import { Skeleton } from "@mui/material";
import { ErrorView } from "../../core";
import { paperMixin } from "../../styles";

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
                                          simple
                                      }: StorageUploadItemProps) {

    const storage = useStorageSource();

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

        storage.uploadFile({
            file,
            fileName,
            path: storagePath,
            metadata
        })
            .then(async ({ path }) => {
                console.debug("Upload successful");
                await onFileUploadComplete(path, entry, metadata);
                if (mounted.current)
                    setLoading(false);
            })
            .catch((e) => {
                console.error("Upload error", e);
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
    }, [entry, metadata, onFileUploadComplete, storage, storagePath]);

    React.useEffect(() => {
        mounted.current = true;
        if (entry.file)
            upload(entry.file, entry.fileName);
        return () => {
            mounted.current = false;
        };
    }, [entry.file, entry.fileName, upload]);

    if (simple) {
        return <div className={`m-4 w-${imageSize} h-${imageSize}`}>

            {loading && <Skeleton variant="rectangular"
                                  className={`w-${imageSize} h-${imageSize}`}/>}

        </div>
    }
    return (

        <div className={clsx(paperMixin, "m-4 p-1 box-border min-w-[imageSize] min-h-[imageSize]")}>

            {loading &&
                <Skeleton variant="rectangular" className="w-full h-full"/>}

            {error && <ErrorView title={"Error uploading file"}
                                 error={error}/>}

        </div>

    );

}
