import React from "react";
import { Box, Paper } from "@mui/material";
import equal from "react-fast-compare";

import {
    FilterCombination,
    FilterValues,
    WhereFilterOp
} from "../../../models";
import { CollectionTableToolbar } from "./internal/CollectionTableToolbar";
import { EntityCollectionTableProps } from "./EntityCollectionTableProps";
import { VirtualTable } from "../Table";
import {
    EntityCollectionTableContext,
    EntityCollectionTableProvider
} from "./EntityCollectionTableContext";

/**
 * This component is in charge of rendering a collection table with a high
 * degree of customization. It is in charge of fetching data from
 * the {@link DataSource} and holding the state of filtering and sorting.
 *
 * This component is used internally by {@link EntityCollectionView} and
 * {@link ReferenceDialog}
 *
 * Please note that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you want to bind a {@link EntityCollection} to a table with the default
 * options you see in collections in the top level navigation, you can
 * check {@link EntityCollectionView}
 *
 * If you need a table that is not bound to the datasource or entities and
 * properties at all, you can check {@link VirtualTable}
 *
 * @see EntityCollectionTableProps
 * @see EntityCollectionView
 * @see VirtualTable
 * @category Components
 */
export const EntityCollectionTable = React.memo<EntityCollectionTableProps<any>>(
    function EntityCollectionTable<M extends { [Key: string]: any }>
    ({
         path,
         collection,
         inlineEditing,
         ActionsStart,
         Actions,
         Title,
         tableRowActionsBuilder,
         entitiesDisplayedFirst,
         onEntityClick,
         onColumnResize,
         onSizeChanged,
         hoverRow = true
     }: EntityCollectionTableProps<M>) {

        return <EntityCollectionTableProvider path={path}
                                              collection={collection as any}
                                              inlineEditing={inlineEditing}
                                              entitiesDisplayedFirst={entitiesDisplayedFirst}
                                              onEntityClick={onEntityClick}
                                              onSizeChanged={onSizeChanged}
                                              tableRowActionsBuilder={tableRowActionsBuilder as any}
        >

            <EntityCollectionTableContext.Consumer>{
                ({
                     columns,
                     cellRenderer,
                     popupFormField,
                     filterIsSet,
                     textSearchEnabled,
                     size,
                     onTextSearch,
                     clearFilter,
                     updateSize,
                     data,
                     dataLoading,
                     onRowClick,
                     loadNextPage,
                     resetPagination,
                     dataLoadingError,
                     paginationEnabled,
                     filterValues,
                     setFilterValues,
                     sortBy,
                     setSortBy,
                     filterCombinations
                 }) => {
                    return (

                        <Paper sx={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column"
                        }}>

                            <CollectionTableToolbar filterIsSet={filterIsSet}
                                                    onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                                                    clearFilter={clearFilter}
                                                    size={size}
                                                    onSizeChanged={updateSize}
                                                    Title={Title}
                                                    ActionsStart={ActionsStart}
                                                    Actions={Actions}
                                                    loading={dataLoading}/>

                            <Box sx={{ flexGrow: 1 }}>
                                <VirtualTable
                                    data={data}
                                    columns={columns}
                                    cellRenderer={cellRenderer}
                                    onRowClick={onRowClick}
                                    onEndReached={loadNextPage}
                                    onResetPagination={resetPagination}
                                    error={dataLoadingError}
                                    paginationEnabled={paginationEnabled}
                                    onColumnResize={onColumnResize}
                                    size={size}
                                    loading={dataLoading}
                                    filter={filterValues}
                                    onFilterUpdate={setFilterValues}
                                    sortBy={sortBy}
                                    onSortByUpdate={setSortBy as any}
                                    hoverRow={hoverRow}
                                    checkFilterCombination={(filterValues, sortBy) => isFilterCombinationValid(filterValues, filterCombinations, sortBy)}
                                />
                            </Box>

                            {popupFormField}

                        </Paper>
                    );

                }
            }
            </EntityCollectionTableContext.Consumer>
        </EntityCollectionTableProvider>;

    },
    function areEqual(prevProps: EntityCollectionTableProps<any>, nextProps: EntityCollectionTableProps<any>) {
        return prevProps.path === nextProps.path &&
            equal(prevProps.collection, nextProps.collection) &&
            prevProps.Title === nextProps.Title &&
            prevProps.inlineEditing === nextProps.inlineEditing;
    }
) as React.FunctionComponent<EntityCollectionTableProps<any>>;

function isFilterCombinationValid<M>(
    filterValues: FilterValues<Extract<keyof M, string>>,
    indexes?: FilterCombination<string>[],
    sortBy?: [string, "asc" | "desc"]
): boolean {

    const sortKey = sortBy ? sortBy[0] : undefined;
    const sortDirection = sortBy ? sortBy[1] : undefined;

    // Order by clause cannot contain a field with an equality filter available
    const values: [WhereFilterOp, any][] = Object.values(filterValues) as [WhereFilterOp, any][];
    if (sortKey && values.map((v) => v[0]).includes("==")) {
        return false;
    }

    const filterKeys = Object.keys(filterValues);
    const filtersCount = filterKeys.length;

    if (filtersCount === 1 && (!sortKey || sortKey === filterKeys[0])) {
        return true;
    }

    if (!indexes && filtersCount > 1) {
        return false;
    }

    // only one filter set, different to the sort key
    if (sortKey && filtersCount === 1 && filterKeys[0] !== sortKey) {
        return false;
    }

    return !!indexes && indexes
        .filter((compositeIndex) => !sortKey || sortKey in compositeIndex)
        .find((compositeIndex) =>
            Object.entries(filterValues).every(([key, value]) => compositeIndex[key] !== undefined && (!sortDirection || compositeIndex[key] === sortDirection))
        ) !== undefined;
}
