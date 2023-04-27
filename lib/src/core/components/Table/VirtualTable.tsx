import React, {
    createContext,
    forwardRef,
    RefObject,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import equal from "react-fast-compare"

import { Box, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

// @ts-ignore
import { FixedSizeList as List } from "react-window";
import useMeasure from "react-use-measure";

import { CircularProgressCenter } from "../CircularProgressCenter";
import {
    OnTableColumnResizeParams,
    TableColumn,
    TableFilterValues,
    TableWhereFilterOp,
    VirtualTableProps
} from "./VirtualTableProps";

import { getRowHeight } from "./common";
import { VirtualTableContextProps } from "./types";
import { VirtualTableHeaderRow } from "./VirtualTableHeaderRow";
import { VirtualTableRow } from "./VirtualTableRow";
import { VirtualTableCell } from "./VirtualTableCell";

const VirtualListContext = createContext<VirtualTableContextProps<any>>({} as any);
VirtualListContext.displayName = "VirtualListContext";

type InnerElementProps = { children: React.ReactNode, style: any };

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
                            <div style={{
                                position: "relative",
                                height: "100%"
                            }}>
                                <div ref={ref}
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
                                top: "56px",
                                flexGrow: 1,
                                height: "calc(100% - 56px)",
                                marginTop: "calc(56px - 100vh)",
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
 * @category Components
 */
export const VirtualTable = React.memo<VirtualTableProps<any>>(
    function VirtualTable<T extends Record<string, any>>({
                                                             data,
                                                             onResetPagination,
                                                             onEndReached,
                                                             size = "m",
                                                             columns: columnsProp,
                                                             onRowClick,
                                                             onColumnResize,
                                                             filter: filterInput,
                                                             checkFilterCombination,
                                                             onFilterUpdate,
                                                             sortBy,
                                                             error,
                                                             emptyMessage,
                                                             onSortByUpdate,
                                                             loading,
                                                             cellRenderer,
                                                             hoverRow,
                                                             createFilterField
                                                         }: VirtualTableProps<T>) {

        const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
        const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

        const [columns, setColumns] = useState(columnsProp);

        const tableRef = useRef<HTMLDivElement>(null);
        const endReachCallbackThreshold = useRef<number>(0);

        useEffect(() => {
            setColumns(columnsProp);
        }, [columnsProp]);

        const [measureRef, bounds] = useMeasure();

        const onColumnResizeInternal = useCallback((params: OnTableColumnResizeParams) => {
            setColumns(columns.map((column) => column.key === params.column.key ? params.column : column));
        }, [columns]);

        const onColumnResizeEndInternal = useCallback((params: OnTableColumnResizeParams) => {
            setColumns(columns.map((column) => column.key === params.column.key ? params.column : column));
            if (onColumnResize) {
                onColumnResize(params);
            }
        }, [columns, onColumnResize]);

        // saving the current filter as a ref as a workaround for header closure
        const filterRef = useRef<TableFilterValues<any> | undefined>();

        useEffect(() => {
            filterRef.current = filterInput;
        }, [filterInput]);

        const scrollToTop = useCallback(() => {
            endReachCallbackThreshold.current = 0;
            if (tableRef.current) {
                // scrollRef.current = [scrollRef.current[0], 0];
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

        const resetSort = useCallback(() => {
            endReachCallbackThreshold.current = 0;
            if (onSortByUpdate)
                onSortByUpdate(undefined);
        }, [onSortByUpdate]);

        const maxScroll = Math.max((data?.length ?? 0) * getRowHeight(size) - bounds.height, 0);
        const onEndReachedInternal = useCallback((scrollOffset: number) => {
            if (onEndReached && (data?.length ?? 0) > 0 && scrollOffset > endReachCallbackThreshold.current + 500) {
                endReachCallbackThreshold.current = scrollOffset;
                onEndReached();
            }
        }, [data, onEndReached]);

        const onScroll = useCallback(({
                                          scrollOffset,
                                          scrollUpdateWasRequested
                                      }: {
            scrollDirection: "forward" | "backward",
            scrollOffset: number,
            scrollUpdateWasRequested: boolean;
        }) => {
            if (!scrollUpdateWasRequested && (scrollOffset >= maxScroll - 500))
                onEndReachedInternal(scrollOffset);
        }, [maxScroll, onEndReachedInternal]);

        const onFilterUpdateInternal = useCallback((column: TableColumn, filterForProperty?: [TableWhereFilterOp, any]) => {

            endReachCallbackThreshold.current = 0;
            const filter = filterRef.current;
            let newFilterValue: TableFilterValues<any> = filter ? { ...filter } : {};

            if (!filterForProperty) {
                delete newFilterValue[column.key];
            } else {
                newFilterValue[column.key] = filterForProperty;
            }
            const newSortBy: [string, "asc" | "desc"] | undefined = sortByProperty && currentSort ? [sortByProperty, currentSort] : undefined;
            const isNewFilterCombinationValid = !checkFilterCombination || checkFilterCombination(newFilterValue, newSortBy);
            if (!isNewFilterCombinationValid) {
                newFilterValue = filterForProperty ? { [column.key]: filterForProperty } as TableFilterValues<Extract<keyof T, string>> : {};
            }

            if (onFilterUpdate) onFilterUpdate(newFilterValue);

            if (column.key !== sortByProperty) {
                resetSort();
            }
        }, [checkFilterCombination, currentSort, onFilterUpdate, resetSort, sortByProperty]);

        const buildErrorView = useCallback(() => (
            <Box
                sx={{
                    height: "calc(100% - 64px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "sticky",
                    left: 0
                }}>

                <Typography variant={"h6"}>
                    {"Error fetching data from the data source"}
                </Typography>

                {error?.message && <Typography>
                    {error?.message}
                </Typography>}

            </Box>
        ), [error?.message]);

        const buildEmptyView = useCallback(() => {
            if (loading)
                return <CircularProgressCenter/>;
            return <Box sx={{
                display: "flex",
                overflow: "auto",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                gap: 2,
                height: "100%"
            }}>
                <AssignmentIcon/>
                <Typography>
                    {emptyMessage}
                </Typography>
            </Box>;
        }, [emptyMessage, loading]);

        const empty = !loading && (data?.length ?? 0) === 0;
        const customView = error ? buildErrorView() : (empty ? buildEmptyView() : undefined);

        return (
            <Box
                ref={measureRef}
                sx={{
                    height: "100%",
                    width: "100%"
                }}>
                <VirtualListContext.Provider
                    value={{
                        data,
                        size,
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
                        createFilterField
                    }}>

                    <MemoizedList
                        outerRef={tableRef}
                        key={size}
                        width={bounds.width}
                        height={bounds.height}
                        itemCount={data?.length ?? 0}
                        onScroll={onScroll}
                        itemSize={getRowHeight(size)}/>

                </VirtualListContext.Provider>
            </Box>
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
                          itemSize
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
                  size = "m",
                  cellRenderer,
                  hoverRow
              }) => {
                const rowData = data && data[index];
                return (
                    <VirtualTableRow
                        key={`row_${index}`}
                        rowData={rowData}
                        rowIndex={index}
                        onRowClick={onRowClick}
                        columns={columns}
                        hoverRow={hoverRow}
                        style={{
                            ...style,
                            top: `calc(${style.top}px + 50px)`
                        }}
                        size={size}>
                        {columns.map((column: TableColumn, columnIndex: number) => {
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
