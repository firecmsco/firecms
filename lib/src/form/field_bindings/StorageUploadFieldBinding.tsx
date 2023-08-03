import React, { useCallback } from "react";

import {
    ArrayProperty,
    Entity,
    FieldProps,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig
} from "../../types";
import { useDropzone } from "react-dropzone";
import { PreviewSize } from "../../preview";
import { FieldHelperText, LabelWithIcon } from "../components";

import { getIconForProperty, isReadOnly } from "../../core";
import { useClearRestoreValue, useSnackbarController, useStorageSource } from "../../hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { StorageFieldItem, useStorageUploadController } from "../../core/util/useStorageUploadController";
import { StorageUploadProgress } from "../components/StorageUploadProgress";
import { StorageItemPreview } from "../components/StorageItemPreview";
import { Typography } from "../../components";
import {
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    focusedMixin
} from "../../styles";
import { cn } from "../../components/util/cn";

const dropZoneClasses = "box-border relative pt-[2px] items-center border border-transparent min-h-[254px] outline-none rounded-md duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-primary-solid";
const disabledClasses = "border-dotted-gray"
const nonActiveDropClasses = "hover:bg-field-hover dark:hover:bg-field-hover-dark"
const activeDropClasses = "pt-0 border-2 border-solid"
const acceptDropClasses = "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-2 border-solid border-green-500"
const rejectDropClasses = "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-2 border-solid border-red-500"

type StorageUploadFieldProps = FieldProps<string | string[]>;

/**
 * Field that allows to upload files to Google Cloud Storage.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function StorageUploadFieldBinding({
                                              propertyKey,
                                              value,
                                              setValue,
                                              error,
                                              showError,
                                              autoFocus,
                                              tableMode,
                                              property,
                                              includeDescription,
                                              context,
                                              isSubmitting
                                          }: StorageUploadFieldProps) {

    if (!context.entityId)
        throw new Error("StorageUploadFieldBinding: Entity id is null");

    const storageSource = useStorageSource();
    const disabled = isReadOnly(property) || !!property.disabled || isSubmitting;

    const {
        internalValue,
        setInternalValue,
        onFilesAdded,
        storage,
        onFileUploadComplete,
        storagePathBuilder,
        multipleFilesSupported
    } = useStorageUploadController({
        entityValues: context.values,
        entityId: context.entityId,
        path: context.path,
        property,
        propertyKey,
        value,
        storageSource,
        disabled,
        onChange: setValue
    });

    useClearRestoreValue<string | string[]>({
        property,
        value,
        setValue
    });

    const entity: Entity<any> = {
        id: context.entityId,
        values: context.values,
        path: context.path
    };

    return (

        <>

            {!tableMode &&
                <LabelWithIcon icon={getIconForProperty(property)}
                               required={property.validation?.required}
                               title={property.name}
                               className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>}

            <StorageUpload
                value={internalValue}
                name={propertyKey}
                disabled={disabled}
                autoFocus={autoFocus}
                property={property}
                onChange={setValue}
                setInternalValue={setInternalValue}
                onFilesAdded={onFilesAdded}
                entity={entity}
                onFileUploadComplete={onFileUploadComplete}
                storagePathBuilder={storagePathBuilder}
                storage={storage}
                multipleFilesSupported={multipleFilesSupported}/>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}

function FileDropComponent({
                               storage,
                               disabled,
                               isDraggingOver,
                               onFilesAdded,
                               multipleFilesSupported,
                               droppableProvided,
                               autoFocus,
                               internalValue,
                               property,
                               entity,
                               onClear,
                               metadata,
                               storagePathBuilder,
                               onFileUploadComplete,
                               size,
                               name,
                               helpText
                           }: {
    storage: StorageConfig,
    disabled: boolean,
    isDraggingOver: boolean,
    droppableProvided: any,
    onFilesAdded: (acceptedFiles: File[]) => void,
    multipleFilesSupported: boolean,
    autoFocus: boolean,
    internalValue: StorageFieldItem[],
    property: ResolvedStringProperty,
    onClear: (clearedStoragePathOrDownloadUrl: string) => void,
    metadata: any,
    entity: Entity<any>;
    storagePathBuilder: (file: File) => string,
    onFileUploadComplete: (uploadedPath: string, entry: StorageFieldItem, fileMetadata?: any) => Promise<void>,
    size: PreviewSize,
    name: string,
    helpText: string
}) {

    const snackbarContext = useSnackbarController();

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: storage.acceptedFiles ? storage.acceptedFiles.map(e => ({ [e]: [] })).reduce((a, b) => ({ ...a, ...b }), {}) : undefined,
            disabled: disabled || isDraggingOver,
            noDragEventsBubbling: true,
            maxSize: storage.maxSize,
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

    return (
        <div
            {...getRootProps()}
            className={cn(
                fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                dropZoneClasses,
                multipleFilesSupported && internalValue.length ? "" : "flex",
                focusedMixin,
                {
                    [nonActiveDropClasses]: !isDragActive,
                    [activeDropClasses]: isDragActive,
                    [rejectDropClasses]: isDragReject,
                    [acceptDropClasses]: isDragAccept,
                    [disabledClasses]: disabled
                })}
        >
            <div
                {...droppableProvided.droppableProps}
                ref={droppableProvided.innerRef}
                className={cn("flex items-center p-1",
                    multipleFilesSupported && internalValue.length ? "overflow-auto" : "",
                    multipleFilesSupported && internalValue.length ? "min-h-[180px]" : "min-h-[250px]"
                )}
                style={{
                    "&::-webkit-scrollbar": {
                        display: "none"
                    }
                }}
            >

                <input
                    autoFocus={autoFocus}
                    {...getInputProps()} />

                {internalValue.map((entry, index) => {
                    let child: any;
                    if (entry.storagePathOrDownloadUrl) {
                        child = (
                            <StorageItemPreview
                                name={`storage_preview_${entry.storagePathOrDownloadUrl}`}
                                property={property}
                                disabled={disabled}
                                entity={entity}
                                value={entry.storagePathOrDownloadUrl}
                                onRemove={onClear}
                                size={entry.size}/>
                        );
                    } else if (entry.file) {
                        child = (
                            <StorageUploadProgress
                                entry={entry}
                                metadata={metadata}
                                storagePath={storagePathBuilder(entry.file)}
                                onFileUploadComplete={onFileUploadComplete}
                                imageSize={size === "medium" ? 220 : 118}
                                simple={false}
                            />
                        );
                    }

                    return (
                        <Draggable
                            key={`array_field_${name}_${entry.id}`}
                            draggableId={`array_field_${name}_${entry.id}`}
                            index={index}>
                            {(provided, snapshot) => (
                                <div
                                    tabIndex={-1}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(focusedMixin, "rounded-md")}
                                    style={{
                                        ...provided.draggableProps.style
                                    }}
                                >
                                    {child}
                                </div>
                            )}
                        </Draggable>
                    );
                })
                }

                {droppableProvided.placeholder}

            </div>

            <div
                className="flex-grow min-h-[38px] box-border m-2 text-center">
                <Typography align={"center"}
                            variant={"label"}>
                    {helpText}
                </Typography>
            </div>

        </div>
    );
}

export interface StorageUploadProps {
    value: StorageFieldItem[];
    setInternalValue: (v: StorageFieldItem[]) => void;
    name: string;
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;
    onChange: (value: string | string[] | null) => void;
    multipleFilesSupported: boolean;
    autoFocus: boolean;
    disabled: boolean;
    entity: Entity<any>;
    storage: StorageConfig;
    onFilesAdded: (acceptedFiles: File[]) => void;
    storagePathBuilder: (file: File) => string;
    onFileUploadComplete: (uploadedPath: string, entry: StorageFieldItem, fileMetadata?: any) => Promise<void>;
}

export function StorageUpload({
                                  property,
                                  name,
                                  value,
                                  setInternalValue,
                                  onChange,
                                  multipleFilesSupported,
                                  onFileUploadComplete,
                                  disabled,
                                  onFilesAdded,
                                  autoFocus,
                                  storage,
                                  entity,
                                  storagePathBuilder
                              }: StorageUploadProps) {

    if (multipleFilesSupported) {
        const arrayProperty = property as ResolvedArrayProperty<string[]>;
        if (arrayProperty.of) {
            if (Array.isArray(arrayProperty.of)) {
                throw Error("Storage field using array must be of data type string");
            }
            if (arrayProperty.of.dataType !== "string") {
                throw Error("Storage field using array must be of data type string");
            }
        } else {
            throw Error("Storage field using array must be of data type string");
        }
    }

    const metadata: Record<string, unknown> | undefined = storage?.metadata;
    const size = multipleFilesSupported ? "small" : "medium";

    const moveItem = useCallback((fromIndex: number, toIndex: number) => {
        if (!multipleFilesSupported) return;
        const newValue = [...value];
        const item = newValue[fromIndex];
        newValue.splice(fromIndex, 1);
        newValue.splice(toIndex, 0, item);
        setInternalValue(newValue);
        const fieldValue = newValue
            .filter(e => !!e.storagePathOrDownloadUrl)
            .map(e => e.storagePathOrDownloadUrl as string);
        onChange(fieldValue);
    }, [multipleFilesSupported, onChange, setInternalValue, value]);

    const onDragEnd = useCallback((result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        moveItem(result.source.index, result.destination.index);

    }, [moveItem])

    const onClear = useCallback((clearedStoragePathOrDownloadUrl: string) => {
        if (multipleFilesSupported) {
            const newValue: StorageFieldItem[] = value.filter(v => v.storagePathOrDownloadUrl !== clearedStoragePathOrDownloadUrl);
            onChange(newValue.filter(v => !!v.storagePathOrDownloadUrl).map(v => v.storagePathOrDownloadUrl as string));
            setInternalValue(newValue);
        } else {
            onChange(null);
            setInternalValue([]);
        }
    }, [value, multipleFilesSupported, onChange]);

    const helpText = multipleFilesSupported
        ? "Drag 'n' drop some files here, or click to select files"
        : "Drag 'n' drop a file here, or click to select one";

    const renderProperty: ResolvedStringProperty = multipleFilesSupported
        ? (property as ArrayProperty<string[]>).of as ResolvedStringProperty
        : property as ResolvedStringProperty;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId={`droppable_${name}`}
                direction="horizontal"
                renderClone={(provided, snapshot, rubric) => {
                    const entry = value[rubric.source.index];
                    return (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={
                                provided.draggableProps.style
                            }
                            className="rounded"
                        >
                            <StorageItemPreview
                                name={`storage_preview_${entry.storagePathOrDownloadUrl}`}
                                property={renderProperty}
                                disabled={true}
                                entity={entity}
                                value={entry.storagePathOrDownloadUrl as string}
                                onRemove={onClear}
                                size={entry.size}/>
                        </div>
                    );
                }}
            >
                {(provided, snapshot) => {
                    return <FileDropComponent storage={storage}
                                              disabled={disabled}
                                              isDraggingOver={snapshot.isDraggingOver}
                                              droppableProvided={provided}
                                              onFilesAdded={onFilesAdded}
                                              multipleFilesSupported={multipleFilesSupported}
                                              autoFocus={autoFocus}
                                              internalValue={value}
                                              property={renderProperty}
                                              entity={entity}
                                              onClear={onClear}
                                              metadata={metadata}
                                              storagePathBuilder={storagePathBuilder}
                                              onFileUploadComplete={onFileUploadComplete}
                                              size={size}
                                              name={name}
                                              helpText={helpText}/>
                }}
            </Droppable>
        </DragDropContext>
    );

}
