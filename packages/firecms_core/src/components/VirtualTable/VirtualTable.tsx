import React, { createContext, forwardRef, RefObject, useCallback, useEffect, useRef, useState } from "react";

import equal from "react-fast-compare"

// @ts-ignore
import { FixedSizeList as List } from "react-window";
import useMeasure from "react-use-measure";

import { CircularProgressCenter } from "../CircularProgressCenter";
import {
    OnVirtualTableColumnResizeParams,
    VirtualTableColumn,
    VirtualTableFilterValues,
    VirtualTableProps,
    VirtualTableWhereFilterOp
} from "./VirtualTableProps";

import { VirtualTableContextProps } from "./types";
import { VirtualTableHeaderRow } from "./VirtualTableHeaderRow";
import { VirtualTableRow } from "./VirtualTableRow";
import { VirtualTableCell } from "./VirtualTableCell";
import { AssignmentIcon, CenteredView, cls, Typography } from "@firecms/ui";
import { useDebounceCallback } from "../common/useDebouncedCallback";

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
                                    <VirtualTableHeaderRow {...virtualTableProps}/>
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
                                                             debug
                                                         }: VirtualTableProps<T>) {

        const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
        const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

        const [columns, setColumns] = useState(columnsProp);

        const tableRef = useRef<HTMLDivElement>(null);
        const endReachCallbackThreshold = useRef<number>(0);

        const debouncedScroll = useDebounceCallback(onScrollProp, 200);

        // Set initial scroll position
        useEffect(() => {
            if (tableRef.current && initialScroll) {
                tableRef.current.scrollTo(0, initialScroll);
            }
        }, [tableRef, initialScroll]);

        useEffect(() => {
            setColumns(columnsProp);
        }, [columnsProp]);

        const [measureRef, bounds] = useMeasure();

        const onColumnResizeInternal = useCallback((params: OnVirtualTableColumnResizeParams) => {
            if (debug)
                console.log("onColumnResizeInternal", params);
            setColumns(columns.map((column) => column.key === params.column.key ? params.column : column));
        }, [columns]);

        const onColumnResizeEndInternal = useCallback((params: OnVirtualTableColumnResizeParams) => {
            if (debug)
                console.log("onColumnResizeEndInternal", params);
            setColumns(columns.map((column) => column.key === params.column.key ? params.column : column));
            if (onColumnResize) {
                onColumnResize(params);
            }
        }, [columns, onColumnResize]);

        // saving the current filter as a ref as a workaround for header closure
        const filterRef = useRef<VirtualTableFilterValues<any> | undefined>();

        useEffect(() => {
            if (debug)
                console.log("Filter updated", filterInput);
            filterRef.current = filterInput;
        }, [filterInput]);

        const scrollToTop = useCallback(() => {
            if (debug)
                console.log("scrollToTop");
            endReachCallbackThreshold.current = 0;
            if (tableRef.current) {
                tableRef.current.scrollTo(tableRef.current?.scrollLeft, 0);
            }
        }, []);

        const onColumnSort = useCallback((key: string) => {

            if (debug)
                console.log("onColumnSort", key);

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
        if (debug)
            console.log("maxScroll", maxScroll);

        const onEndReachedInternal = useCallback((scrollOffset: number) => {
            if (debug)
                console.log("onEndReachedInternal", scrollOffset, endReachCallbackThreshold.current + endOffset);
            if (onEndReached && (data?.length ?? 0) > 0 && scrollOffset > endReachCallbackThreshold.current + endOffset) {
                endReachCallbackThreshold.current = scrollOffset;
                onEndReached();
            }
        }, [data?.length, onEndReached]);

        const onScroll = useCallback(({
                                          scrollDirection,
                                          scrollOffset,
                                          scrollUpdateWasRequested
                                      }: {
            scrollDirection: "forward" | "backward",
            scrollOffset: number,
            scrollUpdateWasRequested: boolean;
        }) => {
            if (debug)
                console.log("onScroll", {
                    scrollDirection,
                    scrollOffset,
                    scrollUpdateWasRequested
                });
            if (onScrollProp) {
                debouncedScroll({
                    scrollDirection,
                    scrollOffset,
                    scrollUpdateWasRequested
                })
            }
            if (!scrollUpdateWasRequested && (scrollOffset >= maxScroll - endOffset))
                onEndReachedInternal(scrollOffset);
        }, [maxScroll, onEndReachedInternal]);

        const onFilterUpdateInternal = useCallback((column: VirtualTableColumn, filterForProperty?: [VirtualTableWhereFilterOp, any]) => {
            if (debug)
                console.log("onFilterUpdateInternal", column, filterForProperty);

            endReachCallbackThreshold.current = 0;
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

                {error?.message && <SafeLinkRenderer text={error.message}/>}

            </CenteredView>
            : (empty
                ? (loading
                    ? <CircularProgressCenter/>
                    : <div
                        className="flex flex-col overflow-auto items-center justify-center p-2 gap-2 h-full">
                        <AssignmentIcon/>
                        {emptyComponent}
                    </div>)
                : undefined);

        const virtualListController = {
            data,
            rowHeight: rowHeight,
            cellRenderer,
            columns,
            currentSort,
            onRowClick,
            customView,
            onColumnResize: onColumnResizeInternal,
            onColumnResizeEnd: onColumnResizeEndInternal,
            filter: filterRef.current,
            onColumnSort,
            onFilterUpdate: onFilterUpdateInternal,
            sortByProperty,
            hoverRow: hoverRow ?? false,
            createFilterField,
            rowClassName,
            endAdornment,
            AddColumnComponent
        };

        if (debug)
            console.log("VirtualTable render", virtualListController);

        return (
            <div
                ref={measureRef}
                style={style}
                className={cls("h-full w-full", className)}>
                <VirtualListContext.Provider
                    value={virtualListController}>

                    <MemoizedList
                        outerRef={tableRef}
                        key={rowHeight}
                        width={bounds.width}
                        height={bounds.height}
                        itemCount={(data?.length ?? 0) + (endAdornment ? 1 : 0)}
                        onScroll={onScroll}
                        includeAddColumn={Boolean(AddColumnComponent)}
                        itemSize={rowHeight}/>

                </VirtualListContext.Provider>
            </div>
        );
    },
    equal
);

function MemoizedList({
                          outerRef,
                          width,
                          height,
                          itemCount,
                          onScroll,
                          itemSize,
                          includeAddColumn
                      }: {
    outerRef: RefObject<HTMLDivElement>;
    width: number;
    height: number;
    itemCount: number;
    onScroll: (params: {
        scrollDirection: "forward" | "backward",
        scrollOffset: number,
        scrollUpdateWasRequested: boolean;
    }) => void;
    itemSize: number;
    includeAddColumn?: boolean;
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
                  endAdornment
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

                const rowData = data && data[index];
                return (
                    <VirtualTableRow
                        key={`row_${index}`}
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
                            return <VirtualTableCell
                                key={`cell_${column.key}`}
                                dataKey={column.key}
                                cellRenderer={cellRenderer}
                                column={column}
                                columns={columns}
                                rowData={rowData}
                                cellData={cellData}
                                rowIndex={index}
                                columnIndex={columnIndex}/>;
                        })}

                        {includeAddColumn && <div className={"w-20"}/>}

                    </VirtualTableRow>
                );
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
        <div className={"break-all"} dangerouslySetInnerHTML={{ __html: htmlContent }}/>
    );
};
