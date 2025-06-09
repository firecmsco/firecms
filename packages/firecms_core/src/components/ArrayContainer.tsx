import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getHashValue } from "../util";
import {
    AddIcon,
    Button,
    cls,
    ContentCopyIcon,
    HandleIcon,
    IconButton,
    KeyboardArrowDownIcon,
    KeyboardArrowUpIcon,
    Menu,
    MenuItem,
    RemoveIcon,
    Tooltip,
    useOutsideAlerter
} from "@firecms/ui";

export type ArrayEntryParams = {
    index: number;
    internalId: number;
    isDragging: boolean;
    storedProps?: object;
    storeProps: (props: object) => void;
};

export type ArrayEntryBuilder = (params: ArrayEntryParams) => React.ReactNode;

export interface ArrayContainerProps<T> {
    droppableId: string;
    value: T[];
    addLabel: string;
    buildEntry: ArrayEntryBuilder;
    disabled?: boolean;
    size?: "small" | "medium";
    onInternalIdAdded?: (id: number) => void;
    includeAddButton?: boolean;
    canAddElements?: boolean;
    sortable?: boolean;
    newDefaultEntry: T;
    onValueChange: (value: T[]) => void;
    className?: string;
    min?: number;
    max?: number;
}

const buildIdsMap = (value: any[]) =>
    value && Array.isArray(value) && value.length > 0
        ? value
            .map((v, index) => {
                if (!v) return {};
                return {
                    [getHashValue(v) + index]: getRandomId()
                };
            })
            .reduce((a, b) => ({ ...a, ...b }), {})
        : {};

type SortableItemProps = {
    id: number;
    index: number;
    size?: "small" | "medium";
    disabled: boolean;
    buildEntry: ArrayEntryBuilder;
    remove: (index: number) => void;
    copy: (index: number) => void;
    addInIndex?: (index: number) => void;
    canAddElements?: boolean;
    sortable: boolean;
    storedProps?: object;
    updateItemCustomProps: (internalId: number, props: object) => void;
};

function SortableItem({
                          id,
                          index,
                          size,
                          disabled,
                          buildEntry,
                          remove,
                          copy,
                          addInIndex,
                          canAddElements,
                          sortable,
                          storedProps,
                          updateItemCustomProps
                      }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = sortable
        ? useSortable({ id })
        : {
            attributes: {},
            listeners: {},
            setNodeRef: (node: HTMLElement | null) => {
            },
            transform: null,
            transition: undefined,
            isDragging: false
        };

    const style = transform ? {
        transform: CSS.Transform.toString(transform),
        transition
    } : {};
    const dragHandleProps = sortable ? { ...listeners, ...attributes } : {};

    return (
        <ArrayContainerItem
            nodeRef={setNodeRef}
            style={style}
            dragHandleProps={dragHandleProps}
            internalId={id}
            index={index}
            size={size}
            disabled={disabled}
            buildEntry={buildEntry}
            remove={remove}
            copy={copy}
            addInIndex={addInIndex}
            canAddElements={canAddElements}
            sortable={sortable}
            isDragging={isDragging}
            storedProps={storedProps}
            updateItemCustomProps={updateItemCustomProps}
        />
    );
}

type ArrayContainerItemProps = {
    nodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    dragHandleProps: any;
    index: number;
    internalId: number;
    size?: "small" | "medium";
    disabled: boolean;
    buildEntry: ArrayEntryBuilder;
    remove: (index: number) => void;
    copy: (index: number) => void;
    addInIndex?: (index: number) => void;
    canAddElements?: boolean;
    sortable: boolean;
    isDragging: boolean;
    storedProps?: object;
    updateItemCustomProps: (internalId: number, props: object) => void;
};

export function ArrayContainerItem({
                                       nodeRef,
                                       style,
                                       dragHandleProps,
                                       index,
                                       internalId,
                                       size,
                                       disabled,
                                       buildEntry,
                                       remove,
                                       copy,
                                       addInIndex,
                                       canAddElements,
                                       sortable,
                                       isDragging,
                                       storedProps,
                                       updateItemCustomProps
                                   }: ArrayContainerItemProps) {
    return (
        <div
            ref={nodeRef}
            style={style}
            className={`relative ${!isDragging ? "hover\\:bg-surface-accent-50 dark\\:hover\\:bg-surface-800 dark\\:hover\\:bg-opacity-20" : ""} rounded-md opacity-100`}
        >
            <div className="flex items-start">
                <div className="flex-grow w-[calc(100%-48px)] text-text-primary dark:text-text-primary-dark">
                    {buildEntry({
                        index,
                        internalId,
                        isDragging,
                        storedProps,
                        storeProps: (props: object) => updateItemCustomProps(internalId, props)
                    })}
                </div>
                <ArrayItemOptions
                    dragHandleProps={dragHandleProps}
                    direction={size === "small" ? "row" : "column"}
                    disabled={disabled}
                    remove={remove}
                    index={index}
                    copy={copy}
                    canAddElements={canAddElements}
                    sortable={sortable}
                    addInIndex={addInIndex}
                />
            </div>
        </div>
    );
}

export function ArrayItemOptions({
                                     dragHandleProps,
                                     direction,
                                     disabled,
                                     remove,
                                     index,
                                     copy,
                                     canAddElements,
                                     sortable,
                                     addInIndex,
                                 }: {
    dragHandleProps: any;
    direction?: "row" | "column";
    disabled: boolean;
    remove: (index: number) => void;
    index: number;
    copy: (index: number) => void;
    sortable: boolean;
    canAddElements?: boolean;
    addInIndex?: (index: number) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const iconRef = useRef<HTMLDivElement>(null);
    useOutsideAlerter(iconRef, () => {
        if (menuOpen) setMenuOpen(false);
    });

    const showMenu = canAddElements ?? false;

    const handleIconButtonClick = (e: React.MouseEvent) => {
        if (showMenu) {
            e.stopPropagation();
            e.preventDefault();
            setMenuOpen(o => !o);
        } else if (sortable) {
            // Allow drag to propagate if menu is not shown
        } else {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    const title = !disabled && sortable && showMenu ? "Drag to move. Click for options" :
        !disabled && showMenu ? "Click for options" :
            !disabled && sortable ? "Drag to move" : undefined;

    return (
        <div ref={iconRef}
             className={`pl-2 pt-1 pb-1 flex ${direction === "row" ? "flex-row-reverse" : "flex-col"} items-center`}>
            <Tooltip
                delayDuration={400}
                open={menuOpen ? false : undefined}
                side={direction === "column" ? "left" : undefined}
                title={title}
            >
                <IconButton
                    size="small"
                    disabled={disabled || (!showMenu && !sortable)}
                    {...(sortable ? dragHandleProps : {})}
                    onClick={handleIconButtonClick}
                    onFocus={() => {
                        if (sortable && menuOpen) setMenuOpen(false);
                    }}
                    className={cls(
                        (disabled || (!sortable && !showMenu)) ? "cursor-inherit" : "",
                        sortable && !disabled ? "cursor-grab" : "",
                        !sortable && showMenu && !disabled ? "cursor-pointer" : ""
                    )}
                >
                    <HandleIcon/>
                </IconButton>
            </Tooltip>
            {showMenu && (
                <Menu portalContainer={iconRef.current} open={menuOpen} trigger={<div tabIndex={-1}/>}>
                    <MenuItem
                        dense
                        onClick={(e: React.MouseEvent) => {
                            setMenuOpen(false);
                            remove(index);
                        }}
                    >
                        <RemoveIcon size={"small"}/>
                        Remove
                    </MenuItem>
                    <MenuItem
                        dense
                        onClick={() => {
                            setMenuOpen(false);
                            copy(index);
                        }}
                    >
                        <ContentCopyIcon size={"small"}/>
                        Copy
                    </MenuItem>
                    {addInIndex && (
                        <MenuItem
                            dense
                            onClick={() => {
                                setMenuOpen(false);
                                addInIndex(index);
                            }}
                        >
                            <KeyboardArrowUpIcon size={"small"}/>
                            Add on top
                        </MenuItem>
                    )}
                    {addInIndex && (
                        <MenuItem
                            dense
                            onClick={() => {
                                setMenuOpen(false);
                                addInIndex(index + 1);
                            }}
                        >
                            <KeyboardArrowDownIcon size={"small"}/>
                            Add below
                        </MenuItem>
                    )}
                </Menu>
            )}
        </div>
    );
}

export function ArrayContainer<T>({
                                      droppableId,
                                      addLabel,
                                      value,
                                      disabled = false,
                                      buildEntry,
                                      size = "medium",
                                      onInternalIdAdded,
                                      includeAddButton: deprecatedIncludeAddButton,
                                      canAddElements: canAddElementsProp = true,
                                      sortable = true,
                                      newDefaultEntry,
                                      onValueChange,
                                      className,
                                      min = 0,
                                      max = Infinity
                                  }: ArrayContainerProps<T>) {
    const canAddElements =
        (canAddElementsProp === undefined ? true : canAddElementsProp) && // Default canAddElementsProp to true if undefined
        (deprecatedIncludeAddButton === undefined || deprecatedIncludeAddButton);

    const hasValue = value && Array.isArray(value) && value.length > 0;
    const internalIdsRef = useRef<Record<string, number>>(buildIdsMap(value));
    const [internalIds, setInternalIds] = useState<number[]>(
        hasValue ? Object.values(internalIdsRef.current) : []
    );
    const itemCustomPropsRef = useRef<Record<number, object>>({});

    const updateItemCustomProps = useCallback((internalId: number, customProps: object) => {
        itemCustomPropsRef.current[internalId] = customProps;
    }, []);

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        },
    });
    const keyboardSensor = useSensor(KeyboardSensor, {});
    const sensors = useSensors(pointerSensor, keyboardSensor);

    useEffect(() => {
        if (hasValue && value && value.length !== internalIds.length) {
            const newInternalIds = value.map((v, index) => {
                const hashValue = getHashValue(v) + index;
                if (hashValue in internalIdsRef.current) {
                    return internalIdsRef.current[hashValue];
                } else {
                    const newInternalId = getRandomId();
                    internalIdsRef.current[hashValue] = newInternalId;
                    return newInternalId;
                }
            });
            setInternalIds(newInternalIds);
        }
    }, [hasValue, internalIds.length, value]);

    const insertInEnd = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (disabled || (value ?? []).length >= max) return;
        const id = getRandomId();
        const newIds: number[] = [...internalIds, id];
        if (onInternalIdAdded) onInternalIdAdded(id);
        setInternalIds(newIds);
        onValueChange([...(value ?? []), newDefaultEntry]);
    };

    const remove = (index: number) => {
        if ((value ?? []).length <= min) return;
        const newIds = [...internalIds];
        newIds.splice(index, 1);
        setInternalIds(newIds);
        onValueChange(value.filter((_, i) => i !== index));
    };

    const copy = (index: number) => {
        if ((value ?? []).length >= max) return;
        const id = getRandomId();
        const copyingItem = value[index];
        const newIds: number[] = [
            ...internalIds.slice(0, index + 1),
            id,
            ...internalIds.slice(index + 1)
        ];
        if (onInternalIdAdded) onInternalIdAdded(id);
        setInternalIds(newIds);
        onValueChange([...value.slice(0, index + 1), copyingItem, ...value.slice(index + 1)]);
    };

    const addInIndex = (index: number) => {
        if ((value ?? []).length >= max) return;
        const id = getRandomId();
        const newIds: number[] = [
            ...internalIds.slice(0, index),
            id,
            ...internalIds.slice(index)
        ];
        if (onInternalIdAdded) onInternalIdAdded(id);
        setInternalIds(newIds);
        onValueChange([...value.slice(0, index), newDefaultEntry, ...value.slice(index)]);
    };

    const onDragEnd = (event: DragEndEvent) => {
        const {
            active,
            over
        } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = internalIds.indexOf(active.id as number);
        const newIndex = internalIds.indexOf(over.id as number);
        if (oldIndex === -1 || newIndex === -1) return;
        const newIds = arrayMove(internalIds, oldIndex, newIndex);
        setInternalIds(newIds);
        onValueChange(arrayMove(value, oldIndex, newIndex));
    };

    return sortable ? (
        <DndContext sensors={sensors}
                    modifiers={[restrictToVerticalAxis]}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}>
            <SortableContext items={internalIds} strategy={verticalListSortingStrategy}>
                <div className={cls("space-y-1", className)} id={droppableId}>
                    {hasValue &&
                        internalIds.map((internalId: number, index: number) => (
                            <SortableItem
                                key={`array_field_${internalId}`}
                                id={internalId}
                                index={index}
                                size={size}
                                disabled={disabled}
                                buildEntry={buildEntry}
                                remove={remove}
                                copy={copy}
                                addInIndex={addInIndex}
                                canAddElements={canAddElements}
                                sortable={sortable}
                                storedProps={itemCustomPropsRef.current[internalId]}
                                updateItemCustomProps={updateItemCustomProps}
                            />
                        ))}
                    {canAddElements && (
                        <div className="my-4 justify-center text-left">
                            <Button
                                variant={"text"}
                                size={size === "small" ? "small" : "medium"}
                                color="primary"
                                disabled={disabled || (value?.length ?? 0) >= max}
                                startIcon={<AddIcon/>}
                                onClick={insertInEnd}
                                className={"ml-3.5"}
                            >
                                {addLabel ?? "Add"}
                            </Button>
                        </div>
                    )}
                </div>
            </SortableContext>
        </DndContext>
    ) : (
        <div className={cls("space-y-1", className)} id={droppableId}>
            {hasValue &&
                internalIds.map((internalId: number, index: number) => (
                    <ArrayContainerItem
                        key={`array_field_${internalId}`}
                        nodeRef={(node: HTMLElement | null) => {
                        }}
                        style={{}}
                        dragHandleProps={{}}
                        internalId={internalId}
                        index={index}
                        size={size}
                        disabled={disabled}
                        buildEntry={buildEntry}
                        remove={remove}
                        copy={copy}
                        addInIndex={addInIndex}
                        canAddElements={canAddElements}
                        sortable={false}
                        isDragging={false}
                        storedProps={itemCustomPropsRef.current[internalId]}
                        updateItemCustomProps={updateItemCustomProps}
                    />
                ))}
            {canAddElements && (
                <div className="my-4 justify-center text-left">
                    <Button
                        variant={"text"}
                        size={size === "small" ? "small" : "medium"}
                        color="primary"
                        disabled={disabled || (value?.length ?? 0) >= max}
                        startIcon={<AddIcon/>}
                        onClick={insertInEnd}
                    >
                        {addLabel ?? "Add"}
                    </Button>
                </div>
            )}
        </div>
    );
}

function arrayMove<T>(value: T[], sourceIndex: number, destinationIndex: number): T[] {
    const result = Array.from(value);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    return result;
}

export function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}
