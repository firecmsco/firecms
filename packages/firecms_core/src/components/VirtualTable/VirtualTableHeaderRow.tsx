import React, { createRef, RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

import {
    OnVirtualTableColumnResizeParams,
    VirtualTableColumn,
    VirtualTableFilterValues,
    VirtualTableWhereFilterOp
} from "./VirtualTableProps.js";
import { ErrorBoundary } from "../ErrorBoundary.js";
import { FilterFormFieldProps, VirtualTableHeader } from "./VirtualTableHeader.js";
import { cls, defaultBorderMixin } from "@firecms/ui";
import { useSortable } from "@dnd-kit/sortable";
import { columnClipVar, columnShiftVar, columnTransitionVar, columnWidth, columnWidthVar } from "./columnVars.js";

const MIN_COLUMN_WIDTH = 100;
const MAX_COLUMN_WIDTH = 800;

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
    isDraggable,
    headerIconSize,
    rootRef
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
    headerIconSize?: "small" | "smallest";
    rootRef: RefObject<HTMLDivElement | null>;
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

    // Don't transition the dragged item - only other items should animate
    const ownTransition = isDragging ? undefined : transition;
    const shiftX = transform?.x;

    // The body follows this header through the table's custom properties
    // rather than through a `useSortable` of its own in every cell. One per
    // cell on screen meant hundreds of drag registrations: each row scrolled
    // in or out added or removed a column's worth, and every one of those
    // re-rendered every header and every cell. dnd-kit also keeps one
    // droppable per id, so a cell replaced its header's and took it away when
    // it scrolled out.
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        const shiftVar = columnShiftVar(columnIndex);
        const transitionVar = columnTransitionVar(columnIndex);
        if (shiftX) root.style.setProperty(shiftVar, `${shiftX}px`);
        if (ownTransition) root.style.setProperty(transitionVar, ownTransition);
        return () => {
            root.style.removeProperty(shiftVar);
            root.style.removeProperty(transitionVar);
        };
    }, [rootRef, columnIndex, shiftX, ownTransition]);

    const width = columnWidth(columnIndex, column.width);
    const style = {
        // Only use translate, ignore any scale transforms
        transform: shiftX !== undefined ? `translateX(${shiftX}px)` : undefined,
        transition: ownTransition,
        minWidth: width,
        maxWidth: width,
        width,
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
                isDraggable={isDraggable}
                headerIconSize={headerIconSize} />
        </div>
    );
};

export type VirtualTableHeaderRowProps = {
    columns: VirtualTableColumn[];
    currentSort: "asc" | "desc" | undefined;
    sortByProperty?: string;
    onColumnSort: (key: string) => any;
    onFilterUpdate: (column: VirtualTableColumn, filterForProperty?: [VirtualTableWhereFilterOp, any]) => void;
    filter?: VirtualTableFilterValues<any>;
    /** Called once, when a column's edge is let go. */
    onColumnResizeEnd: (params: OnVirtualTableColumnResizeParams) => void;
    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;
    AddColumnComponent?: React.ComponentType;
    columnsReorderable: boolean;
    draggingColumnId?: string | null;
    headerIconSize?: "small" | "smallest";
    /** The element the column custom properties are written on; the body reads them. */
    rootRef: RefObject<HTMLDivElement | null>;
};

/**
 * The header, drawn again only when one of its own props changes.
 *
 * It sits inside react-window's inner element, which the list redraws on
 * every scroll frame; unmemoised, the header and each column's drag hook,
 * error boundary and title ran again on every one of them. It is handed only
 * what it draws from — not the rows, not the cell renderer — so new data
 * leaves it alone too.
 */
export const VirtualTableHeaderRow = React.memo(function VirtualTableHeaderRow({
    columns,
    currentSort,
    sortByProperty,
    onColumnSort,
    onFilterUpdate,
    filter,
    onColumnResizeEnd,
    createFilterField,
    AddColumnComponent,
    columnsReorderable,
    draggingColumnId,
    headerIconSize,
    rootRef
}: VirtualTableHeaderRowProps) {

    const columnRefs = useMemo(() => columns.map(() => createRef<HTMLDivElement>()), [columns.length]);
    const [isResizing, setIsResizing] = useState(-1);

    // A live resize writes the column's width as a custom property, which
    // every cell of the column reads; nothing is drawn until the edge is let
    // go. Each move used to replace `columns` and redraw the table. The
    // property is cleared in the commit that draws the new width, so the
    // column never shows its old one in between.
    const clearLiveWidth = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        columns.forEach((_, index) => {
            root.style.removeProperty(columnWidthVar(index));
            root.style.removeProperty(columnClipVar(index));
        });
    }, [columns, rootRef]);

    useLayoutEffect(() => clearLiveWidth, [clearLiveWidth]);

    const clampWidth = (width: number) => Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, width));

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
        const root = rootRef.current;
        if (newWidth && root) {
            root.style.setProperty(columnWidthVar(isResizing), `${clampWidth(newWidth)}px`);
            root.style.setProperty(columnClipVar(isResizing), "hidden");
        }
    }, [getEventNewWidth, isResizing, rootRef]);

    const handleOnMouseUp = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newWidth = getEventNewWidth(e);
        const column = columns[isResizing];
        if (newWidth && column) {
            const width = clampWidth(newWidth);
            onColumnResizeEnd({
                width,
                key: column.key as string,
                column: {
                    ...column,
                    width
                } as VirtualTableColumn
            });
        } else {
            clearLiveWidth();
        }
        setIsResizing(-1);
        setCursorDocument(false);
    }, [clearLiveWidth, columns, getEventNewWidth, isResizing, onColumnResizeEnd, setCursorDocument]);

    useEffect(() => {
        if (isResizing < 0) return undefined;
        document.addEventListener("mousemove", handleOnMouseMove);
        document.addEventListener("mouseup", handleOnMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleOnMouseMove);
            document.removeEventListener("mouseup", handleOnMouseUp);
        };
    }, [handleOnMouseMove, handleOnMouseUp, isResizing]);

    const onClickResizeColumn = useCallback((index: number) => {
        setIsResizing(index);
        setCursorDocument(true);
    }, [setCursorDocument]);

    return (
        <div
            className={cls(defaultBorderMixin, "z-20 sticky min-w-full flex w-fit flex-row top-0 left-0 h-12 border-b bg-surface-50 dark:bg-surface-900")}>
            {columns.map((column, columnIndex) => {
                const filterForThisProperty: [VirtualTableWhereFilterOp, any] | undefined =
                    column && filter && filter[column.key]
                        ? filter[column.key]
                        : undefined;

                const isDraggable = !column.frozen && columnsReorderable;
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
                            headerIconSize={headerIconSize}
                            rootRef={rootRef}
                        />
                    </ErrorBoundary>
                );
            })}

            {AddColumnComponent && <AddColumnComponent />}

        </div>
    );
});
