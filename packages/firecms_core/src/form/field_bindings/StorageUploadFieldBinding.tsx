import React, { useCallback, useState } from "react";

import { ArrayProperty, FieldProps, PreviewSize, StorageConfig, StringProperty } from "@firecms/types";
import { useDropzone } from "react-dropzone";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";

import { isReadOnly } from "@firecms/common";
import { getIconForProperty } from "../../util";
import { useAuthController, useSnackbarController, useStorageSource } from "../../hooks";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StorageFieldItem, useStorageUploadController } from "../../util/useStorageUploadController";
import { StorageUploadProgress } from "../components/StorageUploadProgress";
import { StorageItemPreview } from "../components/StorageItemPreview";
import {
    cls,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    Typography
} from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";

const dropZoneClasses = "box-border relative pt-[2px] items-center border border-transparent min-h-[254px] outline-none rounded-md duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-primary-solid";
const disabledClasses = fieldBackgroundDisabledMixin;
const nonActiveDropClasses = fieldBackgroundHoverMixin
const activeDropClasses = "pt-0 border-2 border-solid"
const acceptDropClasses = "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-2 border-solid border-green-500"
const rejectDropClasses = "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-2 border-solid border-red-500"


export function StorageUploadFieldBinding({
                                              propertyKey,
                                              value,
                                              setValue,
                                              error,
                                              showError,
                                              autoFocus,
                                              minimalistView,
                                              property,
                                              includeDescription,
                                              context,
                                              isSubmitting,
                                          }: FieldProps<StringProperty | ArrayProperty>) {

    const authController = useAuthController();

    const storageSource = useStorageSource(context.collection);
    const disabled = isReadOnly(property) || !!property.disabled || isSubmitting || context.disabled;

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
        disabled: disabled ?? false,
        onChange: setValue
    });

    useClearRestoreValue<string | string[]>({
        property,
        value,
        setValue
    });

    return (

        <>

            {!minimalistView &&
                <LabelWithIconAndTooltip
                    propertyKey={propertyKey}
                    icon={getIconForProperty(property, "small")}
                    required={property.validation?.required}
                    title={property.name ?? propertyKey}
                    className={"h-8text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>}

            <StorageUpload
                value={internalValue}
                name={propertyKey}
                disabled={disabled ?? false}
                autoFocus={autoFocus ?? false}
                property={property}
                onChange={setValue}
                setInternalValue={setInternalValue}
                onFilesAdded={onFilesAdded}
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

interface SortableStorageItemProps {
    id: number;
    entry: StorageFieldItem;
    property: StringProperty;
    name: string;
    metadata?: Record<string, unknown>;
    storagePathBuilder: (file: File) => string;
    onFileUploadComplete: (uploadedPath: string, entry: StorageFieldItem, fileMetadata?: any) => Promise<void>;
    onClear: (clearedStoragePathOrDownloadUrl: string) => void;
    disabled: boolean;
    isSortable: boolean; // Kept for consistency, though dnd-kit handles sortability via context
}

function SortableStorageItem({
                                 id,
                                 entry,
                                 property,
                                 metadata,
                                 storagePathBuilder,
                                 onFileUploadComplete,
                                 onClear,
                                 disabled,
                             }: SortableStorageItemProps) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : undefined
    };

    const getImageSizeNumber = (previewSize: PreviewSize): number => {
        switch (previewSize) {
            case "small":
                return 40;
            case "medium":
                return 118;
            case "large":
                return 220;
            default:
                return 118;
        }
    };

    let child: React.ReactNode;
    if (entry.storagePathOrDownloadUrl) {
        child = (
            <StorageItemPreview
                name={`storage_preview_${entry.storagePathOrDownloadUrl}`}
                property={property}
                disabled={disabled}
                value={entry.storagePathOrDownloadUrl}
                onRemove={() => onClear(entry.storagePathOrDownloadUrl!)}
                size={entry.size}/>
        );
    } else if (entry.file) {
        child = (
            <StorageUploadProgress
                entry={entry}
                metadata={metadata}
                storagePath={storagePathBuilder(entry.file)}
                onFileUploadComplete={onFileUploadComplete}
                imageSize={getImageSizeNumber(entry.size)}
                simple={false}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cls("rounded-md m-1")}
            tabIndex={-1}
        >
            {child}
        </div>
    );
}

function FileDropComponent({
                               storage,
                               disabled,
                               onFilesAdded,
                               multipleFilesSupported,
                               autoFocus,
                               internalValue,
                               property,
                               onClear,
                               metadata,
                               storagePathBuilder,
                               onFileUploadComplete,
                               name,
                               helpText,
                               isDndItemDragging
                           }: {
    storage: StorageConfig,
    disabled: boolean,
    onFilesAdded: (acceptedFiles: File[]) => Promise<void>,
    multipleFilesSupported: boolean,
    autoFocus: boolean,
    internalValue: StorageFieldItem[],
    property: StringProperty,
    onClear: (clearedStoragePathOrDownloadUrl: string) => void,
    metadata?: any,
    storagePathBuilder: (file: File) => string,
    onFileUploadComplete: (uploadedPath: string, entry: StorageFieldItem, fileMetadata?: any) => Promise<void>,
    name: string,
    helpText: string,
    isDndItemDragging?: boolean
}) {

    const snackbarContext = useSnackbarController();

    const {
        getRootProps,
        getInputProps,
        isDragActive, // This is for files dragged from OS
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: storage.acceptedFiles ? storage.acceptedFiles.reduce((acc, ext) => ({
                ...acc,
                [ext]: []
            }), {}) : undefined,
            disabled: disabled || isDndItemDragging,
            noDragEventsBubbling: true,
            maxSize: storage.maxSize,
            onDrop: onFilesAdded,
            onDropRejected: (fileRejections) => {
                for (const fileRejection of fileRejections) {
                    for (const error of fileRejection.errors) {
                        console.error("Error uploading file: ", error);
                        if (error.code === "file-too-large") {
                            snackbarContext.open({
                                type: "error",
                                message: `Error uploading file: File is larger than ${storage.maxSize} bytes`
                            });
                        } else if (error.code === "file-invalid-type") {
                            snackbarContext.open({
                                type: "error",
                                message: "Error uploading file: File type is not supported"
                            });
                        }
                    }
                }
            }
        }
    );

    return (
        <div
            {...getRootProps()}
            className={cls(
                fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                disabled ? "text-surface-accent-600 dark:text-surface-accent-500" : "",
                dropZoneClasses,
                multipleFilesSupported && internalValue.length ? "" : "flex",
                {
                    [nonActiveDropClasses]: !isDragActive,
                    [activeDropClasses]: isDragActive, // OS file drag active
                    [rejectDropClasses]: isDragReject, // OS file drag reject
                    [acceptDropClasses]: isDragAccept, // OS file drag accept
                    [disabledClasses]: disabled || isDndItemDragging // Visually disable if internal drag
                })}
        >
            <div
                className={cls("flex items-center p-1 px-4 no-scrollbar",
                    multipleFilesSupported && internalValue.length ? "overflow-auto" : "",
                    multipleFilesSupported && internalValue.length ? "min-h-[180px]" : "min-h-[250px]"
                )}
            >
                <input
                    autoFocus={autoFocus}
                    {...getInputProps()} />

                {internalValue.map((entry) => (
                    <SortableStorageItem
                        key={entry.id}
                        id={entry.id}
                        entry={entry}
                        property={property}
                        name={name}
                        metadata={metadata}
                        storagePathBuilder={storagePathBuilder}
                        onFileUploadComplete={onFileUploadComplete}
                        onClear={onClear}
                        disabled={disabled}
                        isSortable={multipleFilesSupported}
                    />
                ))}

                {/* Placeholder for empty dropzone text is handled by the outer Typography */}
            </div>

            <div
                className="flex-grow min-h-[38px] box-border m-2 text-center">
                <Typography align={"center"}
                            variant={"label"}
                            className={disabled ? "text-surface-accent-600 dark:text-surface-accent-500" : ""}>
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
    property: StringProperty | ArrayProperty;
    onChange: (value: string | string[] | null) => void;
    multipleFilesSupported: boolean;
    autoFocus: boolean;
    disabled: boolean;
    storage: StorageConfig;
    onFilesAdded: (acceptedFiles: File[]) => Promise<void>; // Updated from useStorageUploadController
    storagePathBuilder: (file: File) => string;
    onFileUploadComplete: (uploadedPath: string, entry: StorageFieldItem, fileMetadata?: any) => Promise<void>;
}

export function StorageUpload({
                                  property,
                                  name,
                                  value, // This is internalValue from useStorageUploadController
                                  setInternalValue,
                                  onChange,
                                  multipleFilesSupported,
                                  onFileUploadComplete,
                                  disabled,
                                  onFilesAdded,
                                  autoFocus,
                                  storage,
                                  storagePathBuilder,
                              }: StorageUploadProps) {

    if (multipleFilesSupported) {
        const arrayProperty = property as ArrayProperty;
        if (arrayProperty.of) {
            if (Array.isArray(arrayProperty.of)) {
                throw Error("Storage field using array must be of data type string");
            }
            if (arrayProperty.of.type !== "string") {
                throw Error("Storage field using array must be of data type string");
            }
        } else {
            throw Error("Storage field using array must be of data type string");
        }
    }

    const metadata: Record<string, unknown> | undefined = storage?.metadata;
    const [isDndItemDragging, setIsDndItemDragging] = useState(false);

    const moveItem = useCallback((fromIndex: number, toIndex: number) => {
        if (!multipleFilesSupported || fromIndex === toIndex) return;
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Start dragging after 5px movement
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setIsDndItemDragging(true);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setIsDndItemDragging(false);
        const {
            active,
            over
        } = event;
        if (over && active.id !== over.id) {
            const oldIndex = value.findIndex(item => item.id === active.id);
            const newIndex = value.findIndex(item => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                moveItem(oldIndex, newIndex);
            }
        }
    }, [value, moveItem]);

    const onClear = useCallback((clearedStoragePathOrDownloadUrl: string) => {
        let newValue: StorageFieldItem[];
        if (multipleFilesSupported) {
            newValue = value.filter(v => v.storagePathOrDownloadUrl !== clearedStoragePathOrDownloadUrl);
            onChange(newValue.filter(v => !!v.storagePathOrDownloadUrl).map(v => v.storagePathOrDownloadUrl as string));
        } else {
            newValue = [];
            onChange(null);
        }
        setInternalValue(newValue);
    }, [value, multipleFilesSupported, onChange, setInternalValue]);

    const helpText = multipleFilesSupported
        ? "Drag 'n' drop some files here, or click to select files. Drag to reorder."
        : "Drag 'n' drop a file here, or click to select one";

    const renderProperty: StringProperty = multipleFilesSupported
        ? (property as ArrayProperty).of as StringProperty
        : property as StringProperty;

    const fileDropProps = {
        storage,
        disabled,
        onFilesAdded,
        multipleFilesSupported,
        autoFocus,
        internalValue: value, // Pass current internalValue
        property: renderProperty,
        onClear,
        metadata,
        storagePathBuilder,
        onFileUploadComplete,
        name,
        helpText,
        isDndItemDragging // Pass this down
    };

    if (multipleFilesSupported) {
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={value.map(v => v.id)} strategy={horizontalListSortingStrategy}>
                    <FileDropComponent {...fileDropProps} />
                </SortableContext>
            </DndContext>
        );
    } else {
        // For single file, no D&D context is needed
        return <FileDropComponent {...fileDropProps} isDndItemDragging={false}/>;
    }
}
