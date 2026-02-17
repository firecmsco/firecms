import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";

import { VirtualTableColumn, VirtualTableWhereFilterOp } from "./VirtualTableProps";
import { ErrorBoundary } from "../ErrorBoundary";
import { VirtualTableHeader } from "./VirtualTableHeader";
import { VirtualTableContextProps } from "./types";
import { cls, defaultBorderMixin } from "@firecms/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable column header wrapper
const SortableColumnHeader = ({
    column,
    columnIndex,
    columnRefs,
    isResizing,
    onFilterUpdate,
    filter,
    sortByProperty,
    currentSort,
    onColumnSort,
    onClickResizeColumn,
    createFilterField,
    isDragging,
    isDraggable
}: {
    column: VirtualTableColumn;
    columnIndex: number;
    columnRefs: React.RefObject<HTMLDivElement | null>[];
    isResizing: number;
    onFilterUpdate: any;
    filter: [VirtualTableWhereFilterOp, any] | undefined;
    sortByProperty: string | undefined;
    currentSort: "asc" | "desc" | undefined;
    onColumnSort: any;
    onClickResizeColumn: (index: number) => void;
    createFilterField: any;
    isDragging: boolean;
    isDraggable: boolean;
}) => {
    const [isPressing, setIsPressing] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: column.key,
        disabled: !isDraggable || column.frozen
    });

    const style = {
        // Only use translate, ignore any scale transforms
        transform: transform ? `translateX(${transform.x}px)` : undefined,
        // Don't transition the dragged item - only other items should animate
        transition: isDragging ? undefined : transition,
        minWidth: column.width,
        maxWidth: column.width,
        width: column.width,
    };

    // Combine our press handlers with dnd-kit listeners
    const combinedListeners = isDraggable ? {
        ...listeners,
        onPointerDown: (e: React.PointerEvent) => {
            setIsPressing(true);
            listeners?.onPointerDown?.(e);
        },
        onPointerUp: () => setIsPressing(false),
        onPointerCancel: () => setIsPressing(false),
    } : {};

    // Reset pressing state when drag ends
    React.useEffect(() => {
        if (!isDragging) {
            setIsPressing(false);
        }
    }, [isDragging]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cls(
                "flex-shrink-0 h-full",
                column.frozen && "sticky left-0 z-10"
            )}
            {...attributes}
            {...combinedListeners}
        >
            <VirtualTableHeader
                resizeHandleRef={columnRefs[columnIndex]}
                columnIndex={columnIndex}
                isResizingIndex={isResizing}
                onFilterUpdate={onFilterUpdate}
                filter={filter}
                sort={sortByProperty === column.key ? currentSort : undefined}
                onColumnSort={onColumnSort}
                onClickResizeColumn={onClickResizeColumn}
                column={column}
                createFilterField={createFilterField}
                AdditionalHeaderWidget={column.AdditionalHeaderWidget}
                isDragging={isDragging || isPressing}
                isDraggable={isDraggable} />
        </div>
    );
};

export const VirtualTableHeaderRow = ({
    columns,
    currentSort,
    onColumnSort,
    onFilterUpdate,
    sortByProperty,
    filter,
    onColumnResize,
    onColumnResizeEnd,
    createFilterField,
    AddColumnComponent,
    onColumnsOrderChange,
    data,
    cellRenderer: CellRenderer,
    rowHeight = 54,
    draggingColumnId
}: VirtualTableContextProps<any>) => {

    const columnRefs = useMemo(() => columns.map(() => createRef<HTMLDivElement>()), [columns.length]);
    const [isResizing, setIsResizing] = useState(-1);

    const adjustWidthColumn = useCallback((index: number, width: number, end: boolean) => {
        const column = columns[index];
        const minWidth = 100;
        const maxWidth = 800;
        const newWidth = width > maxWidth ? maxWidth : (width < minWidth ? minWidth : width);
        const params = {
            width: newWidth,
            key: column.key as string,
            column: {
                ...column,
                width: newWidth
            } as VirtualTableColumn
        };
        if (!end)
            onColumnResize(params);
        else
            onColumnResizeEnd(params);
    }, [columns, onColumnResize, onColumnResizeEnd]);

    const getEventNewWidth = useCallback((e: MouseEvent) => {
        if (isResizing >= 0) {
            const left = columnRefs[isResizing].current?.parentElement?.getBoundingClientRect().left;
            if (!left) return;
            return e.clientX - left;
        }
        return undefined;
    }, [columnRefs, isResizing]);

    const setCursorDocument = useCallback((isResizing: boolean) => {
        document.body.style.cursor = isResizing ? "col-resize" : "auto";
    }, []);

    const handleOnMouseMove = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newWidth = getEventNewWidth(e);
        if (newWidth)
            adjustWidthColumn(isResizing, newWidth, false);
    }, [adjustWidthColumn, getEventNewWidth, isResizing]);

    const handleOnMouseUp = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newWidth = getEventNewWidth(e);
        if (newWidth)
            adjustWidthColumn(isResizing, newWidth, true);
        setIsResizing(-1);
        setCursorDocument(false);
    }, [adjustWidthColumn, getEventNewWidth, isResizing, setCursorDocument]);

    const removeResizingListeners = useCallback(() => {
        document.removeEventListener("mousemove", handleOnMouseMove);
        document.removeEventListener("mouseup", handleOnMouseUp);
    }, [handleOnMouseMove, handleOnMouseUp]);

    const attachResizeListeners = useCallback(() => {
        document.addEventListener("mousemove", handleOnMouseMove);
        document.addEventListener("mouseup", handleOnMouseUp);
    }, [handleOnMouseMove, handleOnMouseUp]);

    useEffect(() => {
        if (isResizing >= 0) {
            attachResizeListeners();
        } else {
            removeResizingListeners();
        }
        return () => {
            removeResizingListeners();
        };
    }, [attachResizeListeners, isResizing, removeResizingListeners]);

    const onClickResizeColumn = useCallback((index: number) => {
        setIsResizing(index);
        setCursorDocument(true);
    }, [setCursorDocument]);

    return (
        <>
            <div
                className={cls(defaultBorderMixin, "z-20 sticky min-w-full flex w-fit flex-row top-0 left-0 h-12 border-b bg-surface-50 dark:bg-surface-900")}>
                {columns.map((column, columnIndex) => {
                    const filterForThisProperty: [VirtualTableWhereFilterOp, any] | undefined =
                        column && filter && filter[column.key]
                            ? filter[column.key]
                            : undefined;

                    const isDraggable = !column.frozen && !!onColumnsOrderChange;
                    const isDragging = draggingColumnId === column.key;

                    return (
                        <ErrorBoundary key={"header_" + column.key}>
                            <SortableColumnHeader
                                column={column}
                                columnIndex={columnIndex}
                                columnRefs={columnRefs}
                                isResizing={isResizing}
                                onFilterUpdate={onFilterUpdate}
                                filter={filterForThisProperty}
                                sortByProperty={sortByProperty}
                                currentSort={currentSort}
                                onColumnSort={onColumnSort}
                                onClickResizeColumn={onClickResizeColumn}
                                createFilterField={createFilterField}
                                isDragging={isDragging}
                                isDraggable={isDraggable}
                            />
                        </ErrorBoundary>
                    );
                })}

                {AddColumnComponent && <AddColumnComponent />}

            </div>
        </>
    );
};
