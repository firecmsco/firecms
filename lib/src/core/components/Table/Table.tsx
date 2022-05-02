import React, { useCallback, useEffect, useRef } from "react";
import { styled } from '@mui/material/styles';
import BaseTable, { Column, ColumnShape } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import { alpha, Box, Typography, useTheme } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import clsx from "clsx";

import { ErrorBoundary } from "../ErrorBoundary";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { baseTableCss } from "./styles";
import { TableHeader } from "./TableHeader";
import {
    TableColumn,
    TableFilterValues,
    TableProps,
    TableWhereFilterOp
} from "./TableProps";

import { getRowHeight } from "./common";

const PREFIX = 'Table';

const classes = {
    tableContainer: `${PREFIX}-tableContainer`,
    header: `${PREFIX}-header`,
    tableRow: `${PREFIX}-tableRow`,
    tableRowClickable: `${PREFIX}-tableRowClickable`,
    column: `${PREFIX}-column`
};

const Root = styled('div')((
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
 * that powers the entity collections but has a generic API so it
 * can be reused.
 *
 * If you have an entity collection defined, you probably want to use
 * {@link CollectionTable} or {@link EntityCollectionView}
 *
 * @see CollectionTable
 * @see EntityCollectionView
 * @category Components
 */
export function Table<T>({
                             data,
                             idColumnBuilder,
                             onResetPagination,
                             onEndReached,
                             size,
                             columns,
                             frozenIdColumn,
                             onRowClick,
                             onColumnResize,
                             filter,
                             checkFilterCombination,
                             onFilterUpdate,
                             sortBy,
                             error,
                             emptyMessage,
                             onSortByUpdate,
                             loading,
                             hoverRow = true
                         }: TableProps<T>) {

    const theme = useTheme();

    const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
    const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const tableRef = useRef<BaseTable>(null);

    // these refs are a workaround to prevent the scroll jump caused by Firestore
    // firing listeners with incomplete data
    const scrollRef = useRef<number>(0);
    const endReachedTimestampRef = useRef<number>(0);

    useEffect(() => {
        if (tableRef.current && data?.length) {
            tableRef.current.scrollToTop(scrollRef.current);
        }
    }, [data?.length]);

    const onColumnSort = (key: string) => {

        const isDesc = sortByProperty === key && currentSort === "desc";
        const isAsc = sortByProperty === key && currentSort === "asc";
        const newSort = isAsc ? "desc" : (isDesc ? undefined : "asc");
        const newSortProperty: string | undefined = isDesc ? undefined : key;

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
    };

    const resetSort = () => {
        if (onSortByUpdate)
            onSortByUpdate(undefined);
    };

    const scrollToTop = () => {
        if (tableRef.current) {
            scrollRef.current = 0;
            tableRef.current.scrollToTop(0);
        }
    };

    const onScroll = ({ scrollTop, scrollUpdateWasRequested }: {
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
    };

    const onEndReachedInternal = () => {
        endReachedTimestampRef.current = Date.now();
        if (onEndReached)
            onEndReached();
    };

    const clickRow = (props: { rowData: T; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => {
        if (!onRowClick)
            return;
        onRowClick(props);
    };

    const headerRenderer = ({ columnIndex }: any) => {

        const column = columns[columnIndex - 1];

        const filterForThisProperty: [TableWhereFilterOp, any] | undefined =
            column && filter && filter[column.key]
                ? filter[column.key]
                : undefined;

        const onInternalFilterUpdate = (filterForProperty?: [TableWhereFilterOp, any]) => {

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
        };

        return (

            <ErrorBoundary>
                {columnIndex === 0
                    ? <Box
                        sx={{
                            width: "calc(100% + 24px)",
                            margin: "0px -12px",
                            padding: "0px 12px",
                            color: theme.palette.text.secondary,
                            backgroundColor: theme.palette.background.default,
                            transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            height: "100%",
                            fontSize: "0.750rem",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                        ID
                    </Box>
                    : <TableHeader
                        onFilterUpdate={onInternalFilterUpdate}
                        filter={filterForThisProperty}
                        sort={sortByProperty === column.key ? currentSort : undefined}
                        onColumnSort={onColumnSort}
                        column={column}/>

                }
            </ErrorBoundary>
        );
    };

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
                                                 }: { column: ColumnShape; width: number }) => {
        if (onColumnResize) {
            onColumnResize({
                width,
                key: column.key as string,
                column: column as TableColumn<any>
            });
        }
    }, [onColumnResize]);

    return (
        <Measure
            bounds
            onResize={setTableSize}>
            {({ measureRef }) => {

                return <Box ref={measureRef}
                            sx={{
                                width: "100%",
                                height: "100%",
                                flexGrow: 1
                            }}
                            css={baseTableCss}>

                    {tableSize?.bounds &&
                        <Root>
                            <BaseTable
                                rowClassName={clsx(classes.tableRow, { [classes.tableRowClickable]: hoverRow })}
                                data={data}
                                onColumnResizeEnd={onBaseTableColumnResize}
                                width={tableSize.bounds.width}
                                height={tableSize.bounds.height}
                                emptyRenderer={error ? buildErrorView() : buildEmptyView()}
                                fixed
                                ignoreFunctionInColumnCompare={false}
                                rowHeight={getRowHeight(size)}
                                ref={tableRef}
                                onScroll={onScroll}
                                overscanRowCount={2}
                                onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                                onEndReached={onEndReachedInternal}
                                rowEventHandlers={
                                    { onClick: clickRow as any }
                                }
                            >

                                <Column
                                    headerRenderer={headerRenderer}
                                    cellRenderer={({
                                                       rowData
                                                   }: any) =>
                                        idColumnBuilder
                                            ? idColumnBuilder({
                                                size,
                                                entry: rowData
                                            })
                                            : null
                                    }
                                    align={"center"}
                                    key={"header-id"}
                                    dataKey={"id"}
                                    flexShrink={0}
                                    frozen={frozenIdColumn ? "left" : undefined}
                                    width={160}/>

                                {columns.map((column) =>
                                    <Column
                                        key={column.key}
                                        title={column.label}
                                        className={classes.column}
                                        headerRenderer={headerRenderer}
                                        cellRenderer={column.cellRenderer}
                                        height={getRowHeight(size)}
                                        align={column.align}
                                        flexGrow={1}
                                        flexShrink={0}
                                        resizable={true}
                                        size={size}
                                        dataKey={column.key}
                                        width={column.width}/>)
                                }
                            </BaseTable>
                        </Root>}
                </Box>;
            }}
        </Measure>

    );

}
