import React, { useCallback } from "react";

import { styled, Theme } from "@mui/material/styles";

import { Box, FormControl, FormHelperText, Typography } from "@mui/material";
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
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";

import { getIconForProperty, isReadOnly } from "../../core";
import clsx from "clsx";
import {
    useClearRestoreValue,
    useSnackbarController,
    useStorageSource
} from "../../hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
    StorageFieldItem,
    useStorageUploadController
} from "../../core/util/useStorageUploadController";
import { StorageUploadProgress } from "../components/StorageUploadProgress";
import { StorageItemPreview } from "../components/StorageItemPreview";
import { fieldBackground, fieldBackgroundHover } from "./utils";

const PREFIX = "StorageUploadField";

const classes = {
    dropZone: `${PREFIX}-dropZone`,
    disabled: `${PREFIX}-disabled`,
    nonActiveDrop: `${PREFIX}-nonActiveDrop`,
    activeDrop: `${PREFIX}-activeDrop`,
    acceptDrop: `${PREFIX}-acceptDrop`,
    rejectDrop: `${PREFIX}-rejectDrop`
};

const StyledBox = styled(Box)(({ theme }:
                                   {
                                       theme: Theme
                                   }
) => ({
    [`&.${classes.dropZone}`]: {
        position: "relative",
        paddingTop: "2px",
        border: "2px solid transparent",
        minHeight: "254px",
        outline: 0,
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: fieldBackground(theme),
        boxSizing: "border-box",
        transition: "border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        "&:focus": {
            border: `2px solid ${theme.palette.primary.main}`
        }
    },

    [`&.${classes.disabled}`]: {
        backgroundColor: "rgba(0, 0, 0, 0.12)",
        color: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.38)",
        border: `1px dotted ${theme.palette.grey[400]}`
    },

    [`&.${classes.nonActiveDrop}`]: {
        "&:hover": {
            backgroundColor: fieldBackgroundHover(theme)
        }
    },

    [`&.${classes.activeDrop}`]: {
        paddingTop: "0px",
        boxSizing: "border-box",
        border: "2px solid"
    },

    [`&.${classes.acceptDrop}`]: {
        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        background: "repeating-linear-gradient( 45deg, rgba(0, 0, 0, 0.09), rgba(0, 0, 0, 0.09) 10px, rgba(0, 0, 0, 0.12) 10px, rgba(0, 0, 0, 0.12) 20px) !important",
        border: "2px solid",
        borderColor: theme.palette.success.light
    },

    [`&.${classes.rejectDrop}`]: {
        border: "2px solid",
        borderColor: theme.palette.error.light
    }

}));

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

        <FormControl fullWidth
                     required={property.validation?.required}
                     error={showError}>

            {!tableMode &&
                <FormHelperText filled>
                    <LabelWithIcon icon={getIconForProperty(property)}
                                   title={property.name}/>
                </FormHelperText>}

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

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && <FormHelperText error={true}>{error}</FormHelperText>}

        </FormControl>
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
        <StyledBox
            {...getRootProps()}
            className={clsx(classes.dropZone, {
                [classes.nonActiveDrop]: !isDragActive,
                [classes.activeDrop]: isDragActive,
                [classes.rejectDrop]: isDragReject,
                [classes.acceptDrop]: isDragAccept,
                [classes.disabled]: disabled
            })}
            sx={{
                display: multipleFilesSupported && internalValue.length ? undefined : "flex",
                alignItems: "center"
            }}
        >
            <Box
                {...droppableProvided.droppableProps}
                ref={droppableProvided.innerRef}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    overflow: multipleFilesSupported && internalValue.length ? "auto" : undefined,
                    minHeight: multipleFilesSupported && internalValue.length ? 180 : 250,
                    p: 1,
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
                                imageSize={size === "regular" ? 220 : 118}
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
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={
                                        provided.draggableProps.style
                                    }
                                    sx={theme => ({
                                        borderRadius: `${theme.shape.borderRadius}px`
                                    })}
                                >
                                    {child}
                                </Box>
                            )}
                        </Draggable>
                    );
                })
                }

                {droppableProvided.placeholder}

            </Box>

            <Box
                sx={{
                    flexGrow: 1,
                    minHeight: 38,
                    boxSizing: "border-box",
                    m: 2
                }}>
                <Typography align={"center"}
                            variant={"label"}>
                    {helpText}
                </Typography>
            </Box>

        </StyledBox>
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
    const size = multipleFilesSupported ? "small" : "regular";

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
                        <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={
                                provided.draggableProps.style
                            }
                            sx={theme => ({
                                borderRadius: theme.shape.borderRadius
                            })}
                        >
                            <StorageItemPreview
                                name={`storage_preview_${entry.storagePathOrDownloadUrl}`}
                                property={renderProperty}
                                disabled={true}
                                entity={entity}
                                value={entry.storagePathOrDownloadUrl as string}
                                onRemove={onClear}
                                size={entry.size}/>
                        </Box>
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
