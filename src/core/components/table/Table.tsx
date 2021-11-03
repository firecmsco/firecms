import React, { useRef } from "react";
import BaseTable, { Column, ColumnShape } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import { Box, Paper, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { FilterValues, WhereFilterOp } from "../../../models";
import ErrorBoundary from "../../internal/ErrorBoundary";
import CircularProgressCenter from "../CircularProgressCenter";
import { useTableStyles } from "./styles";
import TableHeader from "./TableHeader";
import { TableProps } from "./TableProps";

import "./table_styles.css";
import { getRowHeight } from "./common";

const PIXEL_NEXT_PAGE_OFFSET = 1200;

/**
 *
 * @see CollectionTableProps
 * @see EntityCollectionTable
 * @category Core components
 */
export default function Table<T>({
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
                                     loading
                                 }: TableProps<T>) {

    const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
    const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const tableRef = useRef<BaseTable>(null);

    const classes = useTableStyles();

    const onColumnSort = (key: Extract<keyof T, string>) => {

        const isDesc = sortByProperty === key && currentSort === "desc";
        const isAsc = sortByProperty === key && currentSort === "asc";
        const newSort = isDesc ? "asc" : (isAsc ? undefined : "desc");
        const newSortProperty: Extract<keyof T, string> | undefined = isAsc ? undefined : key;

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
            tableRef.current.scrollToTop(0);
        }
    };

    const clickRow = ({ rowData }: any) => {
        if (!onRowClick)
            return;
        const entry = rowData as T;
        return onRowClick && onRowClick(entry);
    };

    const headerRenderer = ({ columnIndex }: any) => {

        const column = columns[columnIndex - 1];

        const filterForThisProperty: [WhereFilterOp, any] | undefined =
            column && filter && filter[column.id] ?
                filter[column.id]
                : undefined;

        const onInternalFilterUpdate = (filterForProperty?: [WhereFilterOp, any]) => {

            let newFilterValue = filter ? { ...filter } : {};

            if (!filterForProperty) {
                delete newFilterValue[column.id];
            } else {
                newFilterValue[column.id] = filterForProperty;
            }

            const newSortBy: [string, "asc" | "desc"] | undefined = sortByProperty && currentSort ? [sortByProperty, currentSort] : undefined;
            const isNewFilterCombinationValid = !checkFilterCombination || checkFilterCombination(newFilterValue, newSortBy);
            if (!isNewFilterCombinationValid) {
                newFilterValue = filterForProperty ? { [column.id]: filterForProperty } as FilterValues<T> : {};
            }

            if (onFilterUpdate) onFilterUpdate(newFilterValue);

            if (column.id !== sortByProperty) {
                resetSort();
            }
        };

        return (

            <ErrorBoundary>
                {columnIndex === 0 ?
                    <div className={classes.header}
                         style={{
                             display: "flex",
                             justifyContent: "center",
                             alignItems: "center"
                         }}>
                        Id
                    </div>
                    :
                    <TableHeader
                        onFilterUpdate={onInternalFilterUpdate}
                        filter={filterForThisProperty}
                        sort={sortByProperty === column.id ? currentSort : undefined}
                        onColumnSort={onColumnSort}
                        column={column}/>

                }
            </ErrorBoundary>
        );
    };

    function buildErrorView<M extends { [Key: string]: any }>() {
        return (

            <Paper className={classes.root}>
                <Box display="flex"
                     flexDirection={"column"}
                     justifyContent="center"
                     margin={6}>

                    <Typography variant={"h6"}>
                        {"Error fetching data from the data source"}
                    </Typography>

                    {error?.name && <Typography>
                        {error?.name}
                    </Typography>}

                    {error?.message && <Typography>
                        {error?.message}
                    </Typography>}

                </Box>

            </Paper>
        );
    }

    function buildEmptyView<M extends { [Key: string]: any }>() {
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

    const onBaseTableColumnResize = ({
                                         column,
                                         width
                                     }: { column: ColumnShape; width: number }) => {
        if (onColumnResize) {
            onColumnResize({
                width,
                type: column.type,
                key: column.key as string
            });
        }
    };

    return (

        <>

            <Measure
                bounds
                onResize={setTableSize}>
                {({ measureRef }) => (
                    <div ref={measureRef}
                         className={classes.tableContainer}>

                        {tableSize?.bounds &&
                        <BaseTable
                            rowClassName={`${classes.tableRow} ${classes.tableRowClickable}`}
                            data={data}
                            onColumnResizeEnd={onBaseTableColumnResize}
                            width={tableSize.bounds.width}
                            height={tableSize.bounds.height}
                            emptyRenderer={error ? buildErrorView() : buildEmptyView()}
                            fixed
                            ignoreFunctionInColumnCompare={false}
                            rowHeight={getRowHeight(size)}
                            ref={tableRef}
                            overscanRowCount={2}
                            onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                            onEndReached={onEndReached}
                            rowEventHandlers={
                                { onClick: clickRow }
                            }
                        >

                            <Column
                                headerRenderer={headerRenderer}
                                cellRenderer={({
                                                   rowData
                                               }: any) =>
                                    idColumnBuilder ? idColumnBuilder({
                                        size,
                                        entry: rowData
                                    }) : null
                                }
                                align={"center"}
                                key={"header-id"}
                                dataKey={"id"}
                                flexShrink={0}
                                frozen={frozenIdColumn ? "left" : undefined}
                                width={160}/>

                            {columns.map((column) =>
                                <Column
                                    key={column.id}
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
                                    dataKey={column.id}
                                    width={column.width}/>)
                            }
                        </BaseTable>}
                    </div>
                )}
            </Measure>

        </>
    );

}
