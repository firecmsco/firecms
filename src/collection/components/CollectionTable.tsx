import React, { useRef } from "react";
import BaseTable, { Column, ColumnShape } from "react-base-table";
import Measure, { ContentRect } from "react-measure";
import "./table_styles.css";
import { Box, Paper, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

import {
    CollectionSize,
    Entity,
    FilterCombination,
    FilterValues,
    WhereFilterOp
} from "../../models";
import { getRowHeight, Sort } from "../internal/common";
import CollectionTableToolbar from "../internal/CollectionTableToolbar";
import ErrorBoundary from "../../core/internal/ErrorBoundary";
import OutsideAlerter from "../../core/internal/OutsideAlerter";
import CollectionRowActions from "../internal/CollectionRowActions";
import { CollectionTableProps } from "./CollectionTableProps";
import CircularProgressCenter
    from "../../core/components/CircularProgressCenter";
import { useTableStyles } from "./styles";
import { useCollectionFetch } from "../../hooks";
import CollectionTableHeader from "../internal/CollectionTableHeader";

const DEFAULT_PAGE_SIZE = 50;

const PIXEL_NEXT_PAGE_OFFSET = 1200;

/**
 * This component is in charge of rendering a collection table with a high
 * degree of customization.
 *
 * Please note that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you just want to bind a EntityCollection to a collection table you can
 * check {@link EntityCollectionTable}
 *
 * @see CollectionTableProps
 * @see EntityCollectionTable
 * @category Core components
 */
export default function CollectionTable<M extends { [Key: string]: any },
    AdditionalKey extends string = string>({
                                               initialFilter,
                                               initialSort,
                                               path,
                                               schema,
                                               columns,
                                               textSearchEnabled,
                                               filterCombinations,
                                               inlineEditing,
                                               toolbarActionsBuilder,
                                               title,
                                               tableRowActionsBuilder,
                                               defaultSize = "m",
                                               frozenIdColumn,
                                               entitiesDisplayedFirst,
                                               paginationEnabled,
                                               onEntityClick,
                                               onColumnResize,
                                               pageSize = DEFAULT_PAGE_SIZE
                                           }: CollectionTableProps<M, AdditionalKey>) {

    const [size, setSize] = React.useState<CollectionSize>(defaultSize);

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? pageSize : undefined);

    const [filterValues, setFilterValues] = React.useState<FilterValues<M>>(initialFilter || {});
    const [sortByProperty, setSortProperty] = React.useState<Extract<keyof M, string> | undefined>(initialSort ? initialSort[0] : undefined);
    const [currentSort, setCurrentSort] = React.useState<Sort>(initialSort ? initialSort[1] : undefined);

    const [tableSize, setTableSize] = React.useState<ContentRect | undefined>();

    const tableRef = useRef<BaseTable>(null);

    const classes = useTableStyles();

    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const [searchString, setSearchString] = React.useState<string | undefined>();

    const filterIsSet = filterValues && Object.keys(filterValues).length > 0;

    const {
        data,
        dataLoading,
        noMoreToLoad,
        dataLoadingError
    } = useCollectionFetch({
        entitiesDisplayedFirst,
        path,
        schema,
        filterValues,
        sortByProperty,
        searchString,
        currentSort,
        itemCount
    });

    const textSearchInProgress = Boolean(searchString);

    const actions = toolbarActionsBuilder && toolbarActionsBuilder({
        size,
        data
    });

    const loadNextPage = () => {
        if (!paginationEnabled || dataLoading || noMoreToLoad)
            return;
        if (itemCount !== undefined)
            setItemCount(itemCount + pageSize);
    };

    const resetPagination = () => {
        setItemCount(pageSize);
    };

    const scrollToTop = () => {
        if (tableRef.current) {
            tableRef.current.scrollToTop(0);
        }
    };

    const handleClickOutside = () => {
        // unselect();
    };


    const onColumnSort = (key: Extract<keyof M, string>) => {

        const isDesc = sortByProperty === key && currentSort === "desc";
        const isAsc = sortByProperty === key && currentSort === "asc";
        const newSort = isDesc ? "asc" : (isAsc ? undefined : "desc");
        const newSortProperty: Extract<keyof M, string> | undefined = isAsc ? undefined : key;

        if (filterValues) {
            if (!isFilterCombinationValid(filterValues, filterCombinations, newSortProperty, newSort)) {
                // reset filters
                setFilterValues({});
            }
        }
        resetPagination();

        setCurrentSort(newSort);
        setSortProperty(newSortProperty);

        scrollToTop();
    };

    const resetSort = () => {
        setCurrentSort(undefined);
        setSortProperty(undefined);
    };

    const clearFilter = () => setFilterValues({});

    const buildIdColumn = (props: {
        entity: Entity<M>,
        size: CollectionSize,
    }) => {
        if (tableRowActionsBuilder)
            return tableRowActionsBuilder(props);
        else
            return <CollectionRowActions {...props}/>;

    };

    function checkInlineEditing<M>(entity: Entity<M>) {
        if (typeof inlineEditing === "boolean") {
            return inlineEditing;
        } else if (typeof inlineEditing === "function") {
            return inlineEditing(entity);
        } else {
            return true;
        }
    }

    const onRowClick = ({ rowData }: any) => {
        const entity = rowData as Entity<M>;
        if (checkInlineEditing(entity))
            return;
        return onEntityClick && onEntityClick(entity);
    };

    const headerRenderer = ({ columnIndex }: any) => {

        const column = columns[columnIndex - 1];

        const filterForThisProperty: [WhereFilterOp, any] | undefined =
            column && column.type === "property" && filterValues && filterValues[column.id] ?
                filterValues[column.id]
                : undefined;

        const onPropertyFilterUpdate = (filterForProperty?: [WhereFilterOp, any]) => {

            let newFilterValue = filterValues ? { ...filterValues } : {};

            if (!filterForProperty) {
                delete newFilterValue[column.id];
            } else {
                newFilterValue[column.id] = filterForProperty;
            }

            const isNewFilterCombinationValid = isFilterCombinationValid(newFilterValue, filterCombinations, sortByProperty, currentSort);
            if (!isNewFilterCombinationValid) {
                newFilterValue = filterForProperty ? { [column.id]: filterForProperty } as FilterValues<M> : {};
            }

            setFilterValues(newFilterValue);
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
                    <CollectionTableHeader
                        onFilterUpdate={onPropertyFilterUpdate}
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

                    {dataLoadingError?.name && <Typography>
                        {dataLoadingError?.name}
                    </Typography>}

                    {dataLoadingError?.message && <Typography>
                        {dataLoadingError?.message}
                    </Typography>}

                </Box>

            </Paper>
        );
    }

    function buildEmptyView<M extends { [Key: string]: any }>() {
        if (dataLoading)
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
                    {textSearchInProgress ? "No results" : (filterIsSet ? "No data with the selected filters" : "This collection is empty")}
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

    const body =
        (
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
                            emptyRenderer={dataLoadingError ? buildErrorView() : buildEmptyView()}
                            fixed
                            ignoreFunctionInColumnCompare={false}
                            rowHeight={getRowHeight(size)}
                            ref={tableRef}
                            overscanRowCount={2}
                            onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
                            onEndReached={loadNextPage}
                            rowEventHandlers={
                                { onClick: onRowClick }
                            }
                        >

                            <Column
                                headerRenderer={headerRenderer}
                                cellRenderer={({
                                                   rowData
                                               }: any) =>
                                    buildIdColumn({
                                        size,
                                        entity: rowData
                                    })
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
                                    type={column.type}
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

        );


    return (
        <>

            <Paper className={classes.root}>

                <CollectionTableToolbar filterIsSet={filterIsSet}
                                        onTextSearch={textSearchEnabled ? setSearchString : undefined}
                                        clearFilter={clearFilter}
                                        actions={actions}
                                        size={size}
                                        onSizeChanged={setSize}
                                        title={title}
                                        loading={dataLoading}/>

                <OutsideAlerter enabled={!preventOutsideClick}
                                onOutsideClick={handleClickOutside}>
                    {body}
                </OutsideAlerter>

            </Paper>
        </>
    );

}

function isFilterCombinationValid<M extends { [Key: string]: any }>(filterValues: FilterValues<M>, indexes?: FilterCombination<Extract<keyof M, string>>[], sortKey?: keyof M, sortDirection?: "asc" | "desc"): boolean {

    // Order by clause cannot contain a field with an equality filter available
    const values: [WhereFilterOp, any][] = Object.values(filterValues) as [WhereFilterOp, any][];
    if (sortKey && values.map((v) => v[0]).includes("==")) {
        return false;
    }

    const filterKeys = Object.keys(filterValues);
    const filtersCount = filterKeys.length;
    if (!indexes && filtersCount > 1)
        return false;

    // only one filter set, different to the sort key
    if (sortKey && filtersCount === 1 && filterKeys[0] !== sortKey)
        return false;

    return !!indexes && indexes
        .filter((compositeIndex) => !sortKey || sortKey in compositeIndex)
        .find((compositeIndex) =>
            Object.entries(filterValues).every(([key, value]) => compositeIndex[key] !== undefined && (!sortDirection || compositeIndex[key] === sortDirection))
        ) !== undefined;
}
