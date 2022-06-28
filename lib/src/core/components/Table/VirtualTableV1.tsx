import React, { useCallback, useEffect, useRef } from "react";
import useMeasure from "react-use-measure";

import { alpha, Box, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { styled } from "@mui/material/styles";
import BaseTable, { Column, ColumnShape } from "react-base-table";
import clsx from "clsx";

import { ErrorBoundary } from "../ErrorBoundary";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { baseTableCss } from "./styles";
import {
    OnRowClickParams,
    TableColumn,
    TableFilterValues,
    TableProps,
    TableWhereFilterOp
} from "./TableProps";

import { getRowHeight } from "./common";
import { TableHeader } from "./TableHeader";

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

    const [ref, bounds] = useMeasure();

    const tableRef = useRef<BaseTable>(null);

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

    const clickRow = useCallback((props: OnRowClickParams<any>) => {
        if (!onRowClick)
            return;
        onRowClick(props);
    }, [onRowClick]);

    const onInternalFilterUpdate = useCallback((column: TableColumn<T, E>, filterForProperty?: [TableWhereFilterOp, any]) => {

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

    const headerRenderer = useCallback(({ columnIndex }: any) => {
        const filter = filterRef.current;

        const column = columns[columnIndex];

        const filterForThisProperty: [TableWhereFilterOp, any] | undefined =
            column && filter && filter[column.key]
                ? filter[column.key]
                : undefined;

        return (
            <ErrorBoundary>
                <TableHeader
                    onFilterUpdate={(value) => onInternalFilterUpdate(column, value)}
                    filter={filterForThisProperty}
                    sort={sortByProperty === column.key ? currentSort : undefined}
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

    const onBaseTableColumnResize = useCallback(({
                                                     column,
                                                     width
                                                 }: { column: ColumnShape<any>; width: number }) => {
        if (onColumnResize) {
            onColumnResize({
                width,
                key: column.key as string,
                column: column as TableColumn<any, any>
            });
        }
    }, [onColumnResize]);

    const baseTableCellRenderer = useCallback(({
                                                   // key,
                                                   cellData,
                                                   column,
                                                   columnIndex,
                                                   rowData,
                                                   rowIndex,
                                                   isScrolling
                                               }: {
        cellData: any;
        columns: ColumnShape<T>[];
        column: ColumnShape<T>;
        columnIndex: number;
        rowData: T;
        rowIndex: number;
        container: BaseTable<T>;
        isScrolling?: boolean;
    }) => {
        return cellRenderer({
            // key,
            cellData,
            column: column as TableColumn<any, any>,
            columnIndex,
            rowData,
            rowIndex,
            isScrolling,
            width: column.width
        });
    }, [cellRenderer]);

    return <Root
        sx={{
            width: "100%",
            height: "100%",
            overflow: "hidden"
        }}
        ref={ref}
        css={baseTableCss}>

        {bounds && <BaseTable
            rowClassName={clsx(classes.tableRow, { [classes.tableRowClickable]: hoverRow })}
            data={data}
            onColumnResizeEnd={onBaseTableColumnResize}
            width={bounds.width}
            height={bounds.height}
            emptyRenderer={error ? buildErrorView() : buildEmptyView()}
            fixed
            ignoreFunctionInColumnCompare={false}
            rowHeight={getRowHeight(size)}
            ref={tableRef}
            onScroll={onScroll}
            overscanRowCount={2}
            onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
            onEndReached={onEndReachedInternal}
            rowEventHandlers={{ onClick: clickRow as any }}
        >

            {columns.map((column) =>
                <Column
                    key={column.key}
                    title={column.title}
                    className={classes.column}
                    headerRenderer={headerRenderer}
                    cellRenderer={baseTableCellRenderer}
                    height={getRowHeight(size)}
                    align={column.align}
                    flexGrow={1}
                    flexShrink={0}
                    resizable={true}
                    size={size}
                    frozen={column.frozen}
                    dataKey={column.key}
                    width={column.width}/>)
            }
        </BaseTable>}
    </Root>;

}
