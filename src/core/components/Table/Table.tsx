import React, { useRef } from "react";
import BaseTable, { Column, ColumnShape } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import { Box, Paper, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import clsx from "clsx";

import { ErrorBoundary } from "../../internal/ErrorBoundary";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { useTableStyles } from "./styles";
import { TableHeader } from "./TableHeader";
import {
    TableColumn,
    TableFilterValues,
    TableProps,
    TableWhereFilterOp
} from "./TableProps";

import "./table_styles.css";
import { getRowHeight } from "./common";

const PIXEL_NEXT_PAGE_OFFSET = 1200;

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

    const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
    const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const tableRef = useRef<BaseTable>(null);

    const classes = useTableStyles();

    const onColumnSort = (key: string) => {

        const isDesc = sortByProperty === key && currentSort === "desc";
        const isAsc = sortByProperty === key && currentSort === "asc";
        const newSort = isDesc ? "asc" : (isAsc ? undefined : "desc");
        const newSortProperty: string | undefined = isAsc ? undefined : key;

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

    const clickRow = (props: { rowData: T; rowIndex: number; rowKey: string ; event: React.SyntheticEvent }) => {
        if (!onRowClick)
            return;
        onRowClick(props);
    };

    const headerRenderer = ({ columnIndex }: any) => {

        const column = columns[columnIndex - 1];

        const filterForThisProperty: [TableWhereFilterOp, any] | undefined =
            column && filter && filter[column.key] ?
                filter[column.key]
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
                newFilterValue = filterForProperty ? { [column.key]: filterForProperty } as TableFilterValues<T> : {};
            }

            if (onFilterUpdate) onFilterUpdate(newFilterValue);

            if (column.key !== sortByProperty) {
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
                        sort={sortByProperty === column.key ? currentSort : undefined}
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
                key: column.key as string,
                column: column as TableColumn<any>
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
                            overscanRowCount={2}
                            onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                            onEndReached={onEndReached}
                            rowEventHandlers={
                                { onClick: clickRow as any }
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
                        </BaseTable>}
                    </div>
                )}
            </Measure>

        </>
    );

}
