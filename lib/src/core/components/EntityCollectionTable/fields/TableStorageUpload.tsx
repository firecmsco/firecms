import * as React from "react";
import { useMemo, useState } from "react";
import clsx from "clsx";


import { Entity, ResolvedArrayProperty, ResolvedStringProperty, StorageConfig } from "../../../../types";
import { useDropzone } from "react-dropzone";
import { PreviewSize, PropertyPreview } from "../../../../preview";
import { ErrorBoundary } from "../../ErrorBoundary";
import { useSnackbarController, useStorageSource } from "../../../../hooks";
import { getThumbnailMeasure } from "../../../../preview/util";
import { StorageFieldItem, useStorageUploadController } from "../../../util/useStorageUploadController";
import { StorageUploadProgress } from "../../../../form/components/StorageUploadProgress";
import { IconButton, Typography } from "../../../../components";
import { EditIcon } from "../../../../icons/EditIcon";

const dropZoneClasses = "max-w-full box-border relative pt-[2px] items-center border border-transparent outline-none rounded-md duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-primary-solid";
const activeDropClasses = "pt-0 border-2 border-solid"
const acceptDropClasses = "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-2 border-solid border-green-500 bg-green-50 dark:bg-green-900"
const rejectDropClasses = "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-2 border-solid border-red-500 bg-red-50 dark:bg-red-900"

/**
 * Field that allows to upload files to Google Cloud Storage.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function TableStorageUpload(props: {
    propertyKey: string;
    error: Error | undefined;
    disabled: boolean;
    value: string | string[] | null;
    updateValue: (newValue: (string | string[] | null)) => void;
    focused: boolean;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;
    entity: Entity<any>;
    path: string;
    previewSize: PreviewSize;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const {
        propertyKey,
        error,
        value,
        disabled,
        property,
        entity,
        path,
        previewSize,
        updateValue
    } = props;

    const storageSource = useStorageSource();

    const {
        internalValue,
        setInternalValue,
        onFilesAdded,
        storage,
        onFileUploadComplete,
        storagePathBuilder,
        multipleFilesSupported
    } = useStorageUploadController({
        entityValues: entity.values,
        entityId: entity.id,
        path,
        property,
        propertyKey,
        storageSource,
        onChange: updateValue,
        value,
        disabled
    });

    return (

        <StorageUpload
            internalValue={internalValue}
            setInternalValue={setInternalValue}
            name={propertyKey}
            disabled={disabled}
            autoFocus={false}
            property={property}
            onChange={updateValue}
            entity={entity}
            storagePathBuilder={storagePathBuilder}
            storage={storage}
            multipleFilesSupported={multipleFilesSupported}
            onFilesAdded={onFilesAdded}
            onFileUploadComplete={onFileUploadComplete}
            previewSize={previewSize}/>

    );
}

interface StorageUploadProps {
    internalValue: StorageFieldItem[];
    setInternalValue: (v: StorageFieldItem[]) => void;
    name: string;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;
    onChange: (value: string | string[] | null) => void;
    multipleFilesSupported: boolean;
    autoFocus: boolean;
    disabled: boolean;
    entity: Entity<any>;
    previewSize: PreviewSize;
    storage: StorageConfig;
    onFilesAdded: (acceptedFiles: File[]) => void;
    storagePathBuilder: (file: File) => string;
    onFileUploadComplete: (uploadedPath: string, entry: StorageFieldItem, fileMetadata?: any) => Promise<void>;
}

function StorageUpload({
                           property,
                           name,
                           internalValue,
                           setInternalValue,
                           entity,
                           onChange,
                           multipleFilesSupported,
                           previewSize: previewSizeInput,
                           disabled,
                           autoFocus,
                           storage,
                           onFilesAdded,
                           onFileUploadComplete,
                           storagePathBuilder
                       }: StorageUploadProps) {

    const [onHover, setOnHover] = useState(false);

    const previewSize = multipleFilesSupported && previewSizeInput === "medium" ? "small" : previewSizeInput;
    if (multipleFilesSupported) {
        const arrayProperty = property as ResolvedArrayProperty<string[]>;
        if (Array.isArray(arrayProperty.of)) {
            throw Error("Using array properties instead of single one in `of` in ArrayProperty");
        }
        if (arrayProperty.of) {
            if (arrayProperty.of.dataType !== "string") {
                throw Error("Storage field using array must be of data type string");
            }
        } else {
            throw Error("Storage field using array must be of data type string");
        }
    }

    const metadata: any | undefined = storage?.metadata;
    const hasValue = Boolean(internalValue);

    const snackbarContext = useSnackbarController();

    const {
        open,
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: storage.acceptedFiles ? storage.acceptedFiles.map(e => ({ [e]: [] })).reduce((a, b) => ({ ...a, ...b }), {}) : undefined,
            disabled,
            maxSize: storage.maxSize,
            noClick: true,
            noKeyboard: true,
            onDrop: onFilesAdded,
            onDropRejected: (fileRejections, event) => {
                for (const fileRejection of fileRejections) {
                    for (const error of fileRejection.errors) {
                        snackbarContext.open({
                            type: "error",
                            message: `Error uploading file: File is larger than ${storage.maxSize} bytes`
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

    const imageSize = useMemo(() => getThumbnailMeasure(previewSize), [previewSize]);

    return (
        <div {...rootProps}
             onMouseEnter={() => setOnHover(true)}
             onMouseMove={() => setOnHover(true)}
             onMouseLeave={() => setOnHover(false)}
             className={clsx(dropZoneClasses,
                 `justify-${hasValue ? "start" : "center"}`,
                 isDragActive ? activeDropClasses : "",
                 isDragAccept ? acceptDropClasses : "",
                 isDragReject ? rejectDropClasses : ""
             )}
        >

            <input autoFocus={autoFocus} {...getInputProps()} />

            {internalValue.map((entry, index) => {
                let child;
                if (entry.storagePathOrDownloadUrl) {
                    child = (
                        <TableStorageItemPreview
                            key={`storage_preview_${index}`}
                            property={renderProperty}
                            value={entry.storagePathOrDownloadUrl}
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
                            imageSize={imageSize}
                            simple={true}
                        />
                    );
                }

                return child;
            })
            }

            {!internalValue && <div
                className="flex-grow m-2 max-w-[200px]"
                onClick={open}>
                <Typography
                    className="text-[#999] dark:text-[#444]"
                    variant={"body2"}
                    align={"center"}>
                    {helpText}
                </Typography>
            </div>}

            {onHover &&
                <IconButton
                    color={"inherit"}
                    size={"small"}
                    onClick={open}
                    className="absolute bottom-2 right-2">
                    <EditIcon className="w-4 h-4" style={{ fill: "#888" }}/>
                </IconButton>
            }

        </div>
    );

}

interface TableStorageItemPreviewProps {
    property: ResolvedStringProperty;
    value: string,
    size: PreviewSize;
    entity: Entity<any>;
}

export function TableStorageItemPreview({
                                            property,
                                            value,
                                            size,
                                            entity
                                        }: TableStorageItemPreviewProps) {

    return (
        <div
            className={"relative m-2"}
        >

            {value &&
                <ErrorBoundary>
                    <PropertyPreview
                        propertyKey={"ignore"} // TODO: Fix this
                        value={value}
                        property={property}
                        entity={entity}
                        size={size}/>
                </ErrorBoundary>
            }

        </div>
    );

}
