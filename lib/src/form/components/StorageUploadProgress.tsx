import React, { useCallback } from "react";
import { useSnackbarController, useStorageSource } from "../../hooks";
import { StorageFieldItem } from "../../core/util/useStorageUploadController";
import { Box, Paper, Skeleton } from "@mui/material";
import { ErrorView } from "../../core";

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
        return <Box m={1} sx={{
            width: imageSize,
            height: imageSize
        }}>

            {loading && <Skeleton variant="rectangular" sx={{
                width: imageSize,
                height: imageSize
            }}/>}

        </Box>
    }
    return (

        <Box m={1}>
            <Paper elevation={0}
                   sx={{
                       padding: 1,
                       boxSizing: "border-box",
                       minWidth: imageSize,
                       minHeight: imageSize
                   }}
                   variant={"outlined"}>

                {loading && <Skeleton variant="rectangular" sx={{
                    width: "100%",
                    height: "100%"
                }}/>}

                {error && <ErrorView title={"Error uploading file"}
                                     error={error}/>}

            </Paper>
        </Box>

    );

}
