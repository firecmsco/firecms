import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material/styles";

import { Box, IconButton, Skeleton, Theme, Typography } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

import {
    ArrayProperty,
    Entity,
    EntityValues,
    Property,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    StringProperty
} from "../../../../../models";
import { useDropzone } from "react-dropzone";
import { PreviewSize, PropertyPreview } from "../../../../../preview";
import equal from "react-fast-compare"
import { ErrorBoundary } from "../../../../internal/ErrorBoundary";

import clsx from "clsx";
import { useSnackbarController, useStorageSource } from "../../../../../hooks";
import { getThumbnailMeasure } from "../../../../../preview/util";
import { resolveStorageString } from "../../../../util/storage";

const PREFIX = "TableStorageUpload";

const classes = {
    dropZone: `${PREFIX}-dropZone`,
    activeDrop: `${PREFIX}-activeDrop`,
    acceptDrop: `${PREFIX}-acceptDrop`,
    rejectDrop: `${PREFIX}-rejectDrop`,
    arrayEntry: `${PREFIX}-arrayEntry`,
    arrayEntryHovered: `${PREFIX}-arrayEntryHovered`,
    thumbnailCloseIcon: `${PREFIX}-thumbnailCloseIcon`
};

const StyledBox = styled(Box)((
    { theme, hasValue }: {
        hasValue: boolean,
        theme: Theme
    }
) => ({
    [`&.${classes.dropZone}`]: {
        position: "relative",
        height: "100%",
        outline: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: hasValue ? "start" : "center",
        alignItems: "center"
    },

    [`&.${classes.activeDrop}`]: {
        borderRadius: "2px",
        border: "2px solid",
        borderColor: "transparent"
    },

    [`&.${classes.acceptDrop}`]: {
        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        background: "repeating-linear-gradient( 45deg, rgba(128, 128, 128, 0.2), rgba(128, 128, 128, 0.2) 10px, rgba(128, 128, 128, 0.25) 10px, rgba(128, 128, 128, 0.25) 20px) !important",
        // background: "repeating-linear-gradient( 45deg, rgba(0, 0, 0, 0.09), rgba(0, 0, 0, 0.09) 10px, rgba(0, 0, 0, 0.12) 10px, rgba(0, 0, 0, 0.12) 20px) !important",
        borderColor: theme.palette.success.light
    },

    [`&.${classes.rejectDrop}`]: {
        borderColor: theme.palette.error.light
    },

    [`& .${classes.arrayEntry}`]: {
        border: "1px dashed transparent",
        borderRadius: "4px"
    },

    [`& .${classes.arrayEntryHovered}`]: {
        opacity: 0.5,
        border: "1px dashed gray",
        boxSizing: "border-box"
    },

    [`& .${classes.thumbnailCloseIcon}`]: {
        position: "absolute",
        borderRadius: "9999px",
        top: -8,
        right: -8,
        zIndex: 100,
        backgroundColor: theme.palette.background.paper
    }
}));

/**
 * Field that allows to upload files to Google Cloud Storage.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function TableStorageUpload(props: {
    propertyId: string;
    error: Error | undefined;
    disabled: boolean;
    internalValue: string | string[] | null;
    updateValue: (newValue: (string | string[] | null)) => void;
    focused: boolean;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;
    entity: Entity<any>;
    path: string;
    previewSize: PreviewSize;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        propertyId,
        error,
        internalValue,
        disabled,
        property,
        entity,
        path,
        previewSize,
        updateValue,
        setPreventOutsideClick
    } = props;

    const multipleFilesSupported = property.dataType === "array";

    const storage: StorageConfig | undefined = property.dataType === "string"
        ? property.storage
        : property.dataType === "array" &&
        (property.of as Property).dataType === "string"
            ? (property.of as StringProperty).storage
            : undefined;

    if (!storage)
        throw Error("Storage meta must be specified");

    const fileNameBuilder = (file: File) => {
        if (storage.fileName) {

            const fileName = resolveStorageString(storage.fileName, storage, entity.values, entity.id,  path, property, file, propertyId);
            if (!fileName || fileName.length === 0) {
                throw Error("You need to return a valid filename");
            }
            return fileName;
        }
        return file.name;
    };

    const storagePathBuilder = (file: File) => {
        return resolveStorageString(storage.storagePath, storage, entity.values, entity.id, path, property, file, propertyId) ?? "/";
    };

    return (

        <StorageUpload
            value={internalValue}
            name={propertyId}
            disabled={disabled}
            autoFocus={false}
            property={property}
            onChange={(newValue) => {
                updateValue(
                    newValue
                );
            }}
            entity={entity}
            fileNameBuilder={fileNameBuilder}
            storagePathBuilder={storagePathBuilder}
            storage={storage}
            multipleFilesSupported={multipleFilesSupported}
            previewSize={previewSize}/>

    );
}

/**
 * Internal representation of an item in the storage
 * It can have two states, having a storagePathOrDownloadUrl set,
 * which means the file has
 * been uploaded and it is rendered as a preview
 * Or have a pending file being uploaded.
 */
interface StorageFieldItem {
    id: number; // generated on the fly for internal use only
    storagePathOrDownloadUrl?: string;
    file?: File;
    fileName?: string;
    metadata?: any
}

interface StorageUploadProps {
    value: string | string[] | null;
    name: string;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;
    onChange: (value: string | string[] | null) => void;
    multipleFilesSupported: boolean;
    autoFocus: boolean;
    disabled: boolean;
    entity: Entity<any>;
    previewSize: PreviewSize;
    storage: StorageConfig;
    fileNameBuilder: (file: File) => string;
    storagePathBuilder: (file: File) => string;
}

function StorageUpload({
                           property,
                           name,
                           value,
                           entity,
                           onChange,
                           multipleFilesSupported,
                           previewSize: previewSizeInput,
                           disabled,
                           autoFocus,
                           storage,
                           fileNameBuilder,
                           storagePathBuilder
                       }: StorageUploadProps) {

    const storageSource = useStorageSource();
    const [onHover, setOnHover] = useState(false);

    const previewSize = multipleFilesSupported && previewSizeInput === "regular" ? "small" : previewSizeInput;
    if (multipleFilesSupported) {
        const arrayProperty = property as ResolvedArrayProperty<string[]>;
        if (arrayProperty.of) {
            if (arrayProperty.of.dataType !== "string") {
                throw Error("Storage field using array must be of data type string");
            }
        } else {
            throw Error("Storage field using array must be of data type string");
        }
    }

    const metadata: any | undefined = storage?.metadata;
    const hasValue = Boolean(value);

    const snackbarContext = useSnackbarController();

    const internalInitialValue: StorageFieldItem[] =
        value == null
            ? []
            : (multipleFilesSupported
                ? value as string[]
                : [value as string]).map(entry => (
                {
                    id: getRandomId(),
                    storagePathOrDownloadUrl: entry,
                    metadata: metadata,
                    size: previewSize
                }
            ));

    const initialValue = React.useRef<string | string[] | null>(value);
    const [internalValue, setInternalValue] = React.useState<StorageFieldItem[]>(internalInitialValue);

    if (!equal(initialValue.current, value)) {
        initialValue.current = value;
        setInternalValue(internalInitialValue ?? []);
    }

    function getRandomId() {
        return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
    }

    function removeDuplicates(items: StorageFieldItem[]) {
        return items.filter(
            (v, i) => {
                return ((items.map((v) => v.storagePathOrDownloadUrl).indexOf(v.storagePathOrDownloadUrl) === i) || !v.storagePathOrDownloadUrl) &&
                    ((items.map((v) => v.file).indexOf(v.file) === i) || !v.file);
            }
        );
    }

    const onExternalDrop = (acceptedFiles: File[]) => {

        if (!acceptedFiles.length || disabled)
            return;

        let newInternalValue: StorageFieldItem[];
        if (multipleFilesSupported) {
            newInternalValue = [...internalValue,
                ...(acceptedFiles.map(file => ({
                    id: getRandomId(),
                    file,
                    fileName: fileNameBuilder(file),
                    metadata
                } as StorageFieldItem)))];
        } else {
            newInternalValue = [{
                id: getRandomId(),
                file: acceptedFiles[0],
                fileName: fileNameBuilder(acceptedFiles[0]),
                metadata
            }];
        }

        // Remove either storage path or file duplicates
        newInternalValue = removeDuplicates(newInternalValue);
        setInternalValue(newInternalValue);
    };

    const onFileUploadComplete = async (uploadedPath: string,
                                        entry: StorageFieldItem,
                                        metadata?: any) => {

        let uploadPathOrDownloadUrl = uploadedPath;
        if (storage.storeUrl) {
            uploadPathOrDownloadUrl = (await storageSource.getDownloadURL(uploadedPath)).url;
        }
        if (storage.postProcess) {
            uploadPathOrDownloadUrl = await storage.postProcess(uploadPathOrDownloadUrl);
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
    };

    const onClear = (clearedStoragePathOrDownloadUrl: string) => {
        if (multipleFilesSupported) {
            const newValue: StorageFieldItem[] = internalValue.filter(v => v.storagePathOrDownloadUrl !== clearedStoragePathOrDownloadUrl);
            onChange(newValue.filter(v => !!v.storagePathOrDownloadUrl).map(v => v.storagePathOrDownloadUrl as string));
            setInternalValue(newValue);
        } else {
            onChange(null);
            setInternalValue([]);
        }
    };

    const {
        open,
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: storage.acceptedFiles,
            disabled: disabled,
            maxSize: storage.maxSize,
            noClick: true,
            noKeyboard: true,
            onDrop: onExternalDrop,
            onDropRejected: (fileRejections, event) => {
                for (const fileRejection of fileRejections) {
                    for (const error of fileRejection.errors) {
                        snackbarContext.open({
                            type: "error",
                            title: "Error uploading file",
                            message: `File is larger than ${storage.maxSize} bytes`
                        });
                    }
                }
            }
        }
    );

    const { ...rootProps } = getRootProps();

    const helpText = multipleFilesSupported
        ? "Drag 'n' drop some files here, or click here to edit"
        : "Drag 'n' drop a file here, or click here edit";

    const renderProperty = multipleFilesSupported
        ? (property as ResolvedArrayProperty<string[]>).of as ResolvedStringProperty
        : property as ResolvedStringProperty;

    return (
        // @ts-ignore
        <StyledBox {...rootProps}
                   hasValue={hasValue}
                   onMouseEnter={() => setOnHover(true)}
                   onMouseMove={() => setOnHover(true)}
                   onMouseLeave={() => setOnHover(false)}
                   className={clsx(classes.dropZone, {
                       [classes.activeDrop]: isDragActive,
                       [classes.rejectDrop]: isDragReject,
                       [classes.acceptDrop]: isDragAccept
                   })}
        >

            <input autoFocus={autoFocus} {...getInputProps()} />

            {internalValue.map((entry, index) => {
                let child;
                if (entry.storagePathOrDownloadUrl) {
                    child = (
                        <StorageItemPreview
                            key={`storage_preview_${index}`}
                            property={renderProperty}
                            disabled={disabled}
                            value={entry.storagePathOrDownloadUrl}
                            onClear={onClear}
                            entity={entity}
                            size={previewSize}/>
                    );
                } else if (entry.file) {
                    child = (
                        <StorageUploadProgress
                            key={`storage_progress_${index}`}
                            entry={entry}
                            metadata={metadata}
                            storagePath={storagePathBuilder(entry.file)}
                            onFileUploadComplete={onFileUploadComplete}
                            size={previewSize}
                        />
                    );
                }

                return child;
            })
            }

            {!value && <Box
                sx={{
                    flexGrow: 1,
                    m: 2,
                    maxWidth: 200
                }}
                onClick={open}>
                <Typography
                    sx={{
                        color: (theme) => (theme.palette.mode === "light" ? "#999" : "#444")
                    }}
                    variant={"body2"}
                    align={"center"}>
                    {helpText}
                </Typography>
            </Box>}

            {onHover &&
            <IconButton
                color={"inherit"}
                size={"small"}
                onClick={open}
                sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2
                }}>
                <EditIcon sx={{
                    width: 16,
                    height: 16,
                    fill: "#888"
                }
                }/>
            </IconButton>
            }

        </StyledBox>
    );

}

interface StorageUploadItemProps {
    storagePath: string;
    metadata?: any,
    entry: StorageFieldItem,
    onFileUploadComplete: (value: string,
                           entry: StorageFieldItem,
                           metadata?: any) => Promise<void>;
    size: PreviewSize;
}

export function StorageUploadProgress({
                                          storagePath,
                                          entry,
                                          metadata,
                                          onFileUploadComplete,
                                          size
                                      }: StorageUploadItemProps) {

    const storage = useStorageSource();

    const snackbarController = useSnackbarController();

    const [error, setError] = React.useState<string>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const mounted = React.useRef(false);

    const upload = useCallback((file: File, fileName?: string) => {

        setError(undefined);
        setLoading(true);

        storage.uploadFile({ file, fileName, path: storagePath, metadata })
            .then(async ({ path }) => {
                console.debug("Upload successful");
                await onFileUploadComplete(path, entry, metadata);
                if (mounted.current)
                    setLoading(false);
            })
            .catch((e) => {
                console.error("Upload error", e);
                if (mounted.current) {
                    setError(e.message);
                    setLoading(false);
                }
                snackbarController.open({
                    type: "error",
                    title: "Error uploading file",
                    message: e.message
                });
            });
    }, [entry, metadata, onFileUploadComplete, snackbarController, storage, storagePath]);

    useEffect(() => {
        mounted.current = true;
        if (entry.file)
            upload(entry.file, entry.fileName);
        return () => {
            mounted.current = false;
        };
    }, [entry.file, entry.fileName, upload]);

    const imageSize = useMemo(() => getThumbnailMeasure(size), [size]);

    return (

        <Box m={1} sx={{
            width: imageSize,
            height: imageSize
        }}>

            {loading && <Skeleton variant="rectangular" sx={{
                width: imageSize,
                height: imageSize
            }}/>}

            {error && <p>Error uploading file: {error}</p>}

        </Box>

    );

}

interface StorageItemPreviewProps {
    property: ResolvedStringProperty;
    value: string,
    onClear: (value: string) => void;
    size: PreviewSize;
    disabled: boolean;
    entity: Entity<any>;
}

export function StorageItemPreview({
                                       property,
                                       value,
                                       size,
                                       entity
                                   }: StorageItemPreviewProps) {

    return (
        <Box
            m={1}
            position={"relative"}
        >

            {value &&
            <ErrorBoundary>
                <PropertyPreview value={value}
                                 property={property}
                                 entity={entity}
                                 size={size}/>
            </ErrorBoundary>
            }

        </Box>
    );

}
