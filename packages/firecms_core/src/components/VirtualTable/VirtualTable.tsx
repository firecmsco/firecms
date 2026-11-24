import React, { createContext, forwardRef, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import equal from "react-fast-compare"

// @ts-ignore
import { FixedSizeList as List } from "react-window";
import useMeasure from "react-use-measure";

import { CircularProgressCenter } from "../CircularProgressCenter.js";
import {
    OnVirtualTableColumnResizeParams,
    VirtualTableColumn,
    VirtualTableFilterValues,
    VirtualTableProps,
    VirtualTableWhereFilterOp
} from "./VirtualTableProps.js";

import { VirtualTableContextProps } from "./types.js";
import { VirtualTableHeaderRow } from "./VirtualTableHeaderRow.js";
import { VirtualTableRow } from "./VirtualTableRow.js";
import { VirtualTableCell } from "./VirtualTableCell.js";
import { AssignmentIcon, CenteredView, cls, Typography } from "@firecms/ui";
import { useDebounceCallback } from "../common/useDebouncedCallback.js";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { columnClipVar, columnShiftVar, columnTransitionVar, columnWidth } from "./columnVars.js";

const VirtualListContext = createContext<VirtualTableContextProps<any>>({} as any);
VirtualListContext.displayName = "VirtualListContext";

type InnerElementProps = {
    children: React.ReactNode,
    style: any
};

// eslint-disable-next-line react/display-name
const innerElementType = forwardRef<HTMLDivElement, InnerElementProps>(({
    children,
    ...rest
}: InnerElementProps, ref) => {

    return (
        <VirtualListContext.Consumer>
            {(virtualTableProps) => {
                const customView = virtualTableProps.customView;
                return (
                    <>
                        <div
                            id={"virtual-table"}
                            style={{
                                position: "relative",
                                height: "100%"
                            }}>
                            <div
                                ref={ref}
                                {...rest}
                                style={{
                                    ...rest?.style,
                                    minHeight: "100%",
                                    position: "relative"
                                }}>
                                <VirtualTableHeaderRow
                                    columns={virtualTableProps.columns}
                                    currentSort={virtualTableProps.currentSort}
                                    sortByProperty={virtualTableProps.sortByProperty}
                                    onColumnSort={virtualTableProps.onColumnSort}
                                    onFilterUpdate={virtualTableProps.onFilterUpdate}
                                    filter={virtualTableProps.filter}
                                    onColumnResizeEnd={virtualTableProps.onColumnResizeEnd}
                                    createFilterField={virtualTableProps.createFilterField}
                                    AddColumnComponent={virtualTableProps.AddColumnComponent}
                                    columnsReorderable={Boolean(virtualTableProps.onColumnsOrderChange)}
                                    draggingColumnId={virtualTableProps.draggingColumnId}
                                    headerIconSize={virtualTableProps.headerIconSize}
                                    rootRef={virtualTableProps.rootRef} />
                                {!customView && children}
                            </div>

                        </div>

                        {customView && <div style={{
                            position: "sticky",
                            top: "48px",
                            flexGrow: 1,
                            height: "calc(100% - 48px)",
                            marginTop: "calc(48px - 100vh)",
                            left: 0
                        }}>{customView}</div>}

                    </>
                );
            }}
        </VirtualListContext.Consumer>
    );
})
    ;

/**
 * This is a Table component that allows displaying arbitrary data, not
 * necessarily related to entities or properties. It is the component
 * that powers the entity collections but has a generic API, so it
 * can be reused.
 *
 * @group Components
 */
export const VirtualTable = React.memo<VirtualTableProps<any>>(
    function VirtualTable<T extends Record<string, any>>({
        data,
        onResetPagination,
        onEndReached,
        endOffset = 600,
        rowHeight = 54,
        columns: columnsProp,
        onRowClick,
        onColumnResize,
        filter: filterInput,
        checkFilterCombination,
        onFilterUpdate,
        sortBy,
        error,
        emptyComponent,
        onSortByUpdate,
        onScroll: onScrollProp,
        loading,
        cellRenderer,
        hoverRow,
        createFilterField,
        rowClassName,
        style,
        className,
        endAdornment,
        AddColumnComponent,
        initialScroll = 0,
        onColumnsOrderChange,
        headerIconSize,
    }: VirtualTableProps<T>) {

        const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
        const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

        // Held by value: a caller that rebuilds equal column objects on each
        // render must not hand every row a new `columns` array, which is one
        // of the things a row is drawn from (see `areRowRendererPropsEqual`).
        const columnsPropRef = useRef(columnsProp);
        if (columnsPropRef.current !== columnsProp && !equal(columnsPropRef.current, columnsProp)) {
            columnsPropRef.current = columnsProp;
        }
        const stableColumnsProp = columnsPropRef.current;

        const [columns, setColumns] = useState(stableColumnsProp);

        const tableRef = useRef<HTMLDivElement>(null);
        const lastEndReachedDataLength = useRef<number | undefined>(undefined);

        const debouncedScroll = useDebounceCallback(onScrollProp, 200);

        // Drag and drop state
        const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);

        const sensors = useSensors(
            useSensor(PointerSensor, {
                activationConstraint: {
                    distance: 5,
                },
            })
        );

        const handleDragStart = useCallback((event: DragStartEvent) => {
            setDraggingColumnId(event.active.id as string);
        }, []);

        const handleDragEnd = useCallback((event: DragEndEvent) => {
            const {
                active,
                over
            } = event;
            setDraggingColumnId(null);

            if (over && active.id !== over.id && onColumnsOrderChange) {
                const oldIndex = columns.findIndex((col) => col.key === active.id);
                const newIndex = columns.findIndex((col) => col.key === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newColumns = arrayMove(columns, oldIndex, newIndex);
                    setColumns(newColumns);
                    onColumnsOrderChange(newColumns);
                }
            }
        }, [columns, onColumnsOrderChange]);

        const handleDragCancel = useCallback(() => {
            setDraggingColumnId(null);
        }, []);

        // Set initial scroll position
        useEffect(() => {
            if (tableRef.current && initialScroll) {
                const { scrollLeft } = tableRef.current;
                tableRef.current.scrollTo(scrollLeft, initialScroll);
            }
        }, [tableRef, initialScroll]);

        useEffect(() => {
            setColumns(stableColumnsProp);
        }, [stableColumnsProp]);

        // No ResizeObserver of its own: `useMeasure` below already observes the
        // table and re-renders it when its size really changes. The one that
        // stood here flipped a state flag on every notification, so each one
        // re-rendered the whole table even when nothing had changed size.

        // Width and height only. `scroll: true` listened to every scroll on
        // the page to keep the box's position current, which the table never
        // reads: a page scrolling around a table re-rendered all of it on
        // every frame, and its own scroll read its box on every event.
        const [measureRef, bounds] = useMeasure({
            debounce: 0,
            polyfill: ResizeObserver,
            // This is important for handling zooming in react-flow
            offsetSize: true
        });

        // Where the header writes the column custom properties the body reads
        // during a resize or a column drag (see `columnVars`).
        const rootRef = useRef<HTMLDivElement | null>(null);
        const setRootRef = useCallback((element: HTMLDivElement | null) => {
            rootRef.current = element;
            measureRef(element);
        }, [measureRef]);

        const onColumnResizeEndInternal = useCallback((params: OnVirtualTableColumnResizeParams) => {
            setColumns(columns.map((column) => column.key === params.column.key ? params.column : column));
            if (onColumnResize) {
                onColumnResize(params);
            }
        }, [columns, onColumnResize]);

        // saving the current filter as a ref as a workaround for header closure
        const filterRef = useRef<VirtualTableFilterValues<any> | undefined>(undefined);

        useEffect(() => {
            filterRef.current = filterInput;
        }, [filterInput]);

        const scrollToTop = useCallback(() => {
            lastEndReachedDataLength.current = undefined;
            if (tableRef.current) {
                tableRef.current.scrollTo(tableRef.current?.scrollLeft, 0);
            }
        }, []);

        const onColumnSort = useCallback((key: string) => {

            const isDesc = sortByProperty === key && currentSort === "desc";
            const isAsc = sortByProperty === key && currentSort === "asc";
            const newSort = isAsc ? "desc" : (isDesc ? undefined : "asc");
            const newSortProperty: string | undefined = isDesc ? undefined : key;

            const filter = filterRef.current;

            const newSortBy: [string, "asc" | "desc"] | undefined = newSort && newSortProperty ? [newSortProperty, newSort] : undefined;
            if (filter) {
                if (checkFilterCombination && !checkFilterCombination(filter, newSortBy)) {
                    if (onFilterUpdate)
                        onFilterUpdate(undefined);
                }
            }

            if (onResetPagination) {
                onResetPagination();
            }

            if (onSortByUpdate) {
                onSortByUpdate(newSortBy);
            }

            scrollToTop();
        }, [checkFilterCombination, currentSort, onFilterUpdate, onResetPagination, onSortByUpdate, scrollToTop, sortByProperty]);

        const maxScroll = Math.max((data?.length ?? 0) * rowHeight - bounds.height, 0);

        const onEndReachedInternal = useCallback(() => {
            const dataLength = data?.length ?? 0;

            if (onEndReached && dataLength > 0 && lastEndReachedDataLength.current !== dataLength) {
                lastEndReachedDataLength.current = dataLength;
                onEndReached();
            }
        }, [data?.length, onEndReached]);

        useEffect(() => {
            if (!onEndReached || loading || !data?.length || !bounds.height || !tableRef.current) {
                return;
            }
            if (tableRef.current.scrollHeight <= tableRef.current.clientHeight) {
                onEndReachedInternal();
            }
        }, [bounds.height, data?.length, loading, onEndReached, onEndReachedInternal]);

        const onScroll = useCallback(({
            scrollDirection,
            scrollOffset,
            scrollUpdateWasRequested
        }: {
            scrollDirection: "forward" | "backward",
            scrollOffset: number,
            scrollUpdateWasRequested: boolean;
        }) => {
            if (onScrollProp) {
                debouncedScroll({
                    scrollDirection,
                    scrollOffset,
                    scrollUpdateWasRequested
                })
            }
            if (!scrollUpdateWasRequested && (scrollOffset >= maxScroll - endOffset))
                onEndReachedInternal();
        }, [endOffset, maxScroll, onEndReachedInternal]);

        const onFilterUpdateInternal = useCallback((column: VirtualTableColumn, filterForProperty?: [VirtualTableWhereFilterOp, any]) => {

            lastEndReachedDataLength.current = undefined;
            const filter = filterRef.current;
            let newFilterValue: VirtualTableFilterValues<any> = filter ? { ...filter } : {};

            if (!filterForProperty) {
                delete newFilterValue[column.key];
            } else {
                newFilterValue[column.key] = filterForProperty;
            }
            const newSortBy: [string, "asc" | "desc"] | undefined = sortByProperty && currentSort ? [sortByProperty, currentSort] : undefined;
            const isNewFilterCombinationValid = !checkFilterCombination || checkFilterCombination(newFilterValue, newSortBy);
            if (!isNewFilterCombinationValid) {
                newFilterValue = filterForProperty ? { [column.key]: filterForProperty } as VirtualTableFilterValues<Extract<keyof T, string>> : {};
            }

            if (onFilterUpdate) onFilterUpdate(newFilterValue);
        }, [checkFilterCombination, currentSort, onFilterUpdate, sortByProperty]);

        const empty = !loading && (data?.length ?? 0) === 0;
        const customView = error
            ? <CenteredView maxWidth={"2xl"}
                className="flex flex-col gap-2">

                <Typography variant={"h6"}>
                    {"Error"}
                </Typography>

                {error?.message && <SafeLinkRenderer text={error.message} />}

            </CenteredView>
            : (empty
                ? (loading
                    ? <CircularProgressCenter />
                    : <div
                        className="flex flex-col overflow-auto items-center justify-center p-2 gap-2 h-full">
                        <AssignmentIcon />
                        {emptyComponent}
                    </div>)
                : undefined);

        const virtualListController = useMemo(() => ({
            data,
            rowHeight: rowHeight,
            cellRenderer,
            columns,
            currentSort,
            onRowClick,
            customView,
            onColumnResizeEnd: onColumnResizeEndInternal,
            rootRef,
            filter: filterRef.current,
            onColumnSort,
            onFilterUpdate: onFilterUpdateInternal,
            sortByProperty,
            hoverRow: hoverRow ?? false,
            createFilterField,
            rowClassName,
            endAdornment,
            AddColumnComponent,
            onColumnsOrderChange: onColumnsOrderChange ? (newColumns: VirtualTableColumn[]) => {
                setColumns(newColumns);
                onColumnsOrderChange(newColumns);
            } : undefined,
            draggingColumnId,
            headerIconSize,
        }), [data, rowHeight, cellRenderer, columns, currentSort, onRowClick, customView, onColumnResizeEndInternal, filterInput, onColumnSort, onFilterUpdateInternal, sortByProperty, hoverRow, createFilterField, rowClassName, endAdornment, AddColumnComponent, onColumnsOrderChange, draggingColumnId, headerIconSize]);

        // Get sortable column keys (excluding frozen columns)
        const sortableColumnKeys = columns
            .filter(col => !col.frozen)
            .map(col => col.key);

        const tableContent = (
            <div
                ref={setRootRef}
                style={style}
                className={cls(
                    "h-full w-full",
                    className,
                    draggingColumnId && "overflow-hidden"
                )}>
                <VirtualListContext.Provider
                    value={virtualListController}>

                    <MemoizedList
                        outerRef={tableRef}
                        key={rowHeight}
                        width={bounds.width}
                        height={bounds.height}
                        itemCount={(data?.length ?? 0) + (endAdornment ? 1 : 0)}
                        onScroll={draggingColumnId ? undefined : onScroll}
                        itemSize={rowHeight} />

                </VirtualListContext.Provider>
            </div>
        );

        // Wrap with DndContext if column reorder is enabled
        if (onColumnsOrderChange) {
            return (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext
                        items={sortableColumnKeys}
                        strategy={horizontalListSortingStrategy}
                    >
                        {tableContent}
                    </SortableContext>
                </DndContext>
            );
        }

        return tableContent;
    },
    equal
);
type VirtualTableRowRendererProps = {
    rowData: any;
    index: number;
    style: React.CSSProperties;
    onRowClick?: VirtualTableContextProps<any>["onRowClick"];
    columns: VirtualTableColumn[];
    hoverRow: boolean;
    rowClassName?: (rowData: any) => string | undefined;
    rowHeight: number;
    cellRenderer: VirtualTableContextProps<any>["cellRenderer"];
    dragActive: boolean;
    includeAddColumn: boolean;
};

/**
 * One row and its cells, drawn again only when something it is drawn from
 * changed.
 *
 * Every input is a prop and every prop is compared, so nothing a row shows can
 * go stale behind its memo. The comparisons are by reference except for the
 * row's data, compared by value: new data often arrives as new, equal objects.
 *
 * This replaced a deep compare of the row's `children` — every cell element,
 * each carrying the full `columns` array — which ran for every row on screen
 * on every scroll frame.
 */
const VirtualTableRowRenderer = React.memo(function VirtualTableRowRenderer({
    rowData,
    index,
    style,
    onRowClick,
    columns,
    hoverRow,
    rowClassName,
    rowHeight,
    cellRenderer,
    dragActive,
    includeAddColumn
}: VirtualTableRowRendererProps) {
    return (
        <VirtualTableRow
            rowData={rowData}
            rowIndex={index}
            onRowClick={onRowClick}
            columns={columns}
            hoverRow={hoverRow}
            rowClassName={rowClassName}
            style={{
                ...style,
                top: `calc(${style.top}px + 48px)`
            }}
            rowHeight={rowHeight}>

            {columns.map((column: VirtualTableColumn, columnIndex: number) => {
                const cellData = rowData && rowData[column.key];
                const width = columnWidth(columnIndex, column.width);
                // While a column is dragged, each cell moves with its header,
                // through the offset the header writes on the table root.
                const followsDrag = dragActive && !column.frozen;

                return (
                    <div
                        key={`cell_wrapper_${column.key}`}
                        data-vt-col={column.key}
                        className={cls(
                            "flex-shrink-0",
                            column.frozen && "sticky left-0 z-10 bg-white dark:bg-surface-950"
                        )}
                        style={{
                            minWidth: width,
                            maxWidth: width,
                            width,
                            overflow: `var(${columnClipVar(columnIndex)}, visible)`,
                            transform: followsDrag ? `translateX(var(${columnShiftVar(columnIndex)}, 0px))` : undefined,
                            transition: followsDrag ? `var(${columnTransitionVar(columnIndex)}, none)` : undefined
                        }}
                    >
                        <VirtualTableCell
                            dataKey={column.key}
                            cellRenderer={cellRenderer}
                            column={column}
                            columns={columns}
                            rowData={rowData}
                            cellData={cellData}
                            rowIndex={index}
                            columnIndex={columnIndex} />
                    </div>
                );
            })}

            {includeAddColumn && <div className={"w-20"} />}

        </VirtualTableRow>
    );
}, areRowRendererPropsEqual);

function areRowRendererPropsEqual(a: VirtualTableRowRendererProps, b: VirtualTableRowRendererProps): boolean {
    return a.index === b.index &&
        a.columns === b.columns &&
        a.cellRenderer === b.cellRenderer &&
        a.onRowClick === b.onRowClick &&
        a.rowClassName === b.rowClassName &&
        a.hoverRow === b.hoverRow &&
        a.rowHeight === b.rowHeight &&
        a.dragActive === b.dragActive &&
        a.includeAddColumn === b.includeAddColumn &&
        shallowEqualStyle(a.style, b.style) &&
        equal(a.rowData, b.rowData);
}

/** react-window hands each index the same style object until the item size changes. */
function shallowEqualStyle(a: React.CSSProperties, b: React.CSSProperties): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof React.CSSProperties)[];
    if (aKeys.length !== Object.keys(b).length) return false;
    return aKeys.every((key) => a[key] === b[key]);
}

function MemoizedList({
    outerRef,
    width,
    height,
    itemCount,
    onScroll,
    itemSize
}: {
    outerRef: RefObject<HTMLDivElement | null>;
    width: number;
    height: number;
    itemCount: number;
    onScroll?: (params: {
        scrollDirection: "forward" | "backward",
        scrollOffset: number,
        scrollUpdateWasRequested: boolean;
    }) => void;
    itemSize: number;
}) {

    const Row = useCallback(({
        index,
        style
    }: any) => {
        return <VirtualListContext.Consumer>
            {({
                onRowClick,
                data,
                columns,
                rowHeight = 54,
                cellRenderer,
                hoverRow,
                rowClassName,
                endAdornment,
                draggingColumnId,
                AddColumnComponent
            }) => {

                if (endAdornment && index === (data ?? []).length) {
                    return <div style={{
                        ...style,
                        height: "auto",
                        position: "sticky",
                        bottom: 0,
                        zIndex: 1
                    }}>
                        {endAdornment}
                    </div>;
                }

                return <VirtualTableRowRenderer
                    rowData={data ? data[index] : undefined}
                    index={index}
                    style={style}
                    onRowClick={onRowClick}
                    columns={columns}
                    hoverRow={hoverRow}
                    rowClassName={rowClassName}
                    rowHeight={rowHeight}
                    cellRenderer={cellRenderer}
                    dragActive={Boolean(draggingColumnId)}
                    // Read here rather than from this function's closure: the
                    // component is created once, and a closure would keep the
                    // first value for the life of the list.
                    includeAddColumn={Boolean(AddColumnComponent)} />;
            }}
        </VirtualListContext.Consumer>;
    }, []);

    return <List
        outerRef={outerRef}
        innerElementType={innerElementType}
        width={width}
        height={height}
        overscanCount={4}
        itemCount={itemCount}
        onScroll={onScroll}
        itemSize={itemSize}>
        {Row}
    </List>;
}

const SafeLinkRenderer: React.FC<{
    text: string;
}> = ({ text }) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const htmlContent = text.replace(urlRegex, (url) => {
        // For each URL found, replace it with an HTML <a> tag
        return `<a href="${url}" class="underline" target="_blank">Link</a><br/>`;
    });

    return (
        <div className={"break-all"} dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
};
