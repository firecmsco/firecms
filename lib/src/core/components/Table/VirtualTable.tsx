import React, { useCallback, useEffect, useRef } from "react";
import equal from "react-fast-compare"

import { alpha, Box, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { styled } from "@mui/material/styles";

// @ts-ignore
import { FixedSizeList as List } from "react-window";
// @ts-ignore
import AutoSizer from "react-virtualized-auto-sizer";

import { ErrorBoundary } from "../ErrorBoundary";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { TableHeader } from "./TableHeader";
import {
    CellRendererParams,
    TableColumn,
    TableFilterValues,
    TableProps,
    TableSize,
    TableWhereFilterOp
} from "./TableProps";

import { getRowHeight } from "./common";

const PREFIX = "Table";

const classes = {
    tableContainer: `${PREFIX}-tableContainer`,
    header: `${PREFIX}-header`,
    tableRow: `${PREFIX}-tableRow`,
    tableRowClickable: `${PREFIX}-tableRowClickable`,
    column: `${PREFIX}-column`
};

const Root = styled("div")((
    {
        theme
    }
) => ({

    [`& .${classes.tableRow}`]: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        fontSize: "0.875rem"
    },

    [`& .${classes.tableRowClickable}`]: {
        "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.background.default, 0.5)
        }
    },

    [`& .${classes.column}`]: {
        padding: "0px !important"
    }
}));

const PIXEL_NEXT_PAGE_OFFSET = 1200;

// @types/react/index.d.ts
declare module "react" {
    interface Attributes {
        css?: any;
    }
}

type VirtualTableRowProps = { style: any, size: TableSize, children: JSX.Element[] };

// eslint-disable-next-line react/display-name
export const VirtualTableRow = React.memo<VirtualTableRowProps>(
    ({
         children,
         size,
         style
     }: VirtualTableRowProps) => (
        <Box
            component={"div"}
            style={{ ...(style), width: "fit-content" }}
            sx={{
                display: "flex",
                height: getRowHeight(size),
                flexDirection: "row",
                fontSize: "0.875rem"
            }}>

            {children}

        </Box>),
    equal
);

type VirtualTableCellProps<T, E> = {
    dataKey: string;
    column: TableColumn<T, E>;
    rowData: any;
    cellData: any;
    rowIndex: any;
    columnIndex: number;
    cellRenderer: (params: CellRendererParams<T, E>) => React.ReactNode;
};

// eslint-disable-next-line react/display-name
export const VirtualTableCell = React.memo<VirtualTableCellProps<any, any>>(
    <T, E>(props: VirtualTableCellProps<T, E>) => {
        return <Box
            component={"div"}
            sx={{
                width: props.column.width,
                height: "100%",
                p: 0
            }}
        >
            {props.rowData && props.cellRenderer(
                {
                    dataKey: props.column.dataKey,
                    cellData: props.cellData,
                    rowData: props.rowData as any,
                    rowIndex: props.rowIndex,
                    isScrolling: false,
                    column: props.column,
                    columnIndex: props.columnIndex,
                }
            )}
        </Box>;
    },
    (a, b) => {
        return true;
        // return equal(
        //     a.column.renderKey({
        //         dataKey: a.column.dataKey,
        //         cellData: a.cellData,
        //         column: a.column,
        //         columnIndex: a.columnIndex,
        //         rowData: a.rowData,
        //         rowIndex: a.rowIndex
        //     }),
        //     b.column.renderKey({
        //         dataKey: b.column.dataKey,
        //         cellData: b.cellData,
        //         column: b.column,
        //         columnIndex: b.columnIndex,
        //         rowData: b.rowData,
        //         rowIndex: b.rowIndex
        //     }));
    }
);

/**
 * This is a Table component that allows displaying arbitrary data, not
 * necessarily related to entities or properties. It is the component
 * that powers the entity collections but has a generic API, so it
 * can be reused.
 *
 * If you have an entity collection defined, you probably want to use
 * {@link EntityCollectionTable} or {@link EntityCollectionView}
 *
 * @see CollectionTable
 * @see EntityCollectionView
 * @category Components
 */
export function VirtualTable<T extends object, E extends any>({
                                                                  data,
                                                                  onResetPagination,
                                                                  onEndReached,
                                                                  size = "m",
                                                                  columns,
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
                                                                  hoverRow = true
                                                              }: TableProps<T, E>) {

    const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
    const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

    const tableRef = useRef<any>(null);

    // saving the current filter as a ref as a workaround for header closure
    const filterRef = useRef<TableFilterValues<any> | undefined>();

    // these refs are a workaround to prevent the scroll jump caused by Firestore
    // firing listeners with incomplete data
    const scrollRef = useRef<number>(0);
    const endReachedTimestampRef = useRef<number>(0);

    useEffect(() => {
        if (tableRef.current && data?.length) {
            tableRef.current.scrollToTop(scrollRef.current);
        }
    }, [data?.length]);

    useEffect(() => {
        filterRef.current = filterInput;
    }, [filterInput]);

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
    }, [checkFilterCombination, currentSort, onFilterUpdate, onResetPagination, onSortByUpdate, sortByProperty]);

    const resetSort = useCallback(() => {
        if (onSortByUpdate)
            onSortByUpdate(undefined);
    }, [onSortByUpdate]);

    const scrollToTop = useCallback(() => {
        if (tableRef.current) {
            scrollRef.current = 0;
            tableRef.current.scrollToTop(0);
        }
    }, []);

    const onScroll = useCallback(({ scrollTop, scrollUpdateWasRequested }: {
        scrollLeft: number;
        scrollTop: number;
        horizontalScrollDirection: "forward" | "backward";
        verticalScrollDirection: "forward" | "backward";
        scrollUpdateWasRequested: boolean;
    }) => {
        const prudentTime = Date.now() - endReachedTimestampRef.current > 3000;
        if (!scrollUpdateWasRequested && prudentTime) {
            scrollRef.current = scrollTop;
        }
    }, []);

    const onEndReachedInternal = useCallback(() => {
        endReachedTimestampRef.current = Date.now();
        if (onEndReached)
            onEndReached();
    }, [onEndReached]);

    const clickRow = useCallback((props: { rowData: T; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => {
        if (!onRowClick)
            return;
        onRowClick(props);
    }, [onRowClick]);

    const onInternalFilterUpdate = useCallback((column: TableColumn<T, E>, filterForProperty?: [TableWhereFilterOp, any]) => {

        const filter = filterRef.current;
        let newFilterValue: TableFilterValues<any> = filter ? { ...filter } : {};

        if (!filterForProperty) {
            delete newFilterValue[column.dataKey];
        } else {
            newFilterValue[column.dataKey] = filterForProperty;
        }
        const newSortBy: [string, "asc" | "desc"] | undefined = sortByProperty && currentSort ? [sortByProperty, currentSort] : undefined;
        const isNewFilterCombinationValid = !checkFilterCombination || checkFilterCombination(newFilterValue, newSortBy);
        if (!isNewFilterCombinationValid) {
            newFilterValue = filterForProperty ? { [column.dataKey]: filterForProperty } as TableFilterValues<Extract<keyof T, string>> : {};
        }

        if (onFilterUpdate) onFilterUpdate(newFilterValue);

        if (column.dataKey !== sortByProperty) {
            resetSort();
        }
    }, [checkFilterCombination, currentSort, onFilterUpdate, resetSort, sortByProperty]);

    const headerRenderer = useCallback(({ columnIndex }: any) => {
        const filter = filterRef.current;

        const column = columns[columnIndex];

        const filterForThisProperty: [TableWhereFilterOp, any] | undefined =
            column && filter && filter[column.dataKey]
                ? filter[column.dataKey]
                : undefined;

        return (
            <ErrorBoundary>
                <TableHeader
                    onFilterUpdate={(value) => onInternalFilterUpdate(column, value)}
                    filter={filterForThisProperty}
                    sort={sortByProperty === column.dataKey ? currentSort : undefined}
                    onColumnSort={onColumnSort}
                    column={column}/>
            </ErrorBoundary>
        );
    }, [columns, currentSort, onColumnSort, onInternalFilterUpdate, sortByProperty]);

    function buildErrorView() {
        return (
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}>

                <Typography variant={"h6"}>
                    {"Error fetching data from the data source"}
                </Typography>

                {error?.message && <Typography>
                        {error?.message}
                    </Typography>}

                </Box>

        );
    }

    function buildEmptyView() {
        if (loading)
            return <CircularProgressCenter/>;
        return (
            <Box display="flex"
                 flexDirection={"column"}
                 alignItems="center"
                 justifyContent="center"
                 width={"100%"}
                 height={"100%"}
                 padding={2}>
                <Box padding={1}>
                    <AssignmentIcon/>
                </Box>
                <Typography>
                    {emptyMessage}
                </Typography>
            </Box>
        );
    }

    const Row = useCallback(({ index, style }: any) => {
        const rowData = data && data[index];

        return (
            <VirtualTableRow style={style}
                             size={size}>
                {columns.map((column, columnIndex) => {
                    const cellData = rowData && rowData[column.dataKey];
                    return <VirtualTableCell
                        key={`cell_${column.dataKey}`}
                        dataKey={column.dataKey}
                        cellRenderer={cellRenderer}
                        column={column}
                        rowData={rowData}
                        cellData={cellData}
                        rowIndex={index}
                        columnIndex={columnIndex}/>;
                })}
            </VirtualTableRow>
        );
    }, [columns, data, size]);

    // const onBaseTableColumnResize = useCallback(({
    //                                                  column,
    //                                                  width
    //                                              }: { column: ColumnShape; width: number }) => {
    //     if (onColumnResize) {
    //         onColumnResize({
    //             width,
    //             key: column.key as string,
    //             column: column as TableColumn<any>
    //         });
    //     }
    // }, [onColumnResize]);

    // <BaseTable
    //     rowClassName={clsx(classes.tableRow, { [classes.tableRowClickable]: hoverRow })}
    //     data={data}
    //     onColumnResizeEnd={onBaseTableColumnResize}
    //     width={bounds.width}
    //     height={bounds.height}
    //     emptyRenderer={error ? buildErrorView() : buildEmptyView()}
    //     fixed
    //     ignoreFunctionInColumnCompare={false}
    //     rowHeight={getRowHeight(size)}
    //     ref={tableRef}
    //     onScroll={onScroll}
    //     overscanRowCount={2}
    //     onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
    //     onEndReached={onEndReachedInternal}
    //     rowEventHandlers={{ onClick: clickRow as any }}
    // >
    //     {columns.map((column) =>
    //         <Column
    //             key={column.key}
    //             title={column.title}
    //             className={classes.column}
    //             headerRenderer={headerRenderer}
    //             cellRenderer={column.cellRenderer as any}
    //             height={getRowHeight(size)}
    //             align={column.align}
    //             flexGrow={1}
    //             flexShrink={0}
    //             resizable={true}
    //             size={size}
    //             frozen={column.frozen}
    //             dataKey={column.key}
    //             width={column.width}/>)
    //     }
    // </BaseTable>

    return (
        <AutoSizer>
            {({ height, width }: any) => (
                <List
                    key={size}
                    width={width}
                    height={height}
                    overscanCount={3}
                    itemCount={data?.length}
                    itemSize={getRowHeight(size)}>
                    {Row}
                </List>

            )}
        </AutoSizer>
    );

}
