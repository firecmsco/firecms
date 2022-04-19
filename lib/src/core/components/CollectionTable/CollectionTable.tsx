import React, { useCallback, useMemo } from "react";
import { Button, Paper, useMediaQuery, useTheme } from "@mui/material";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import equal from "react-fast-compare"

import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    FilterCombination,
    FilterValues,
    SaveEntityProps,
    WhereFilterOp
} from "../../../models";
import { getSubcollectionColumnId, useColumnIds } from "./internal/common";
import { CollectionTableToolbar } from "./internal/CollectionTableToolbar";
import { CollectionRowActions } from "./internal/CollectionRowActions";
import { CollectionTableProps } from "./CollectionTableProps";
import {
    saveEntityWithCallbacks,
    useCollectionFetch,
    useDataSource,
    useFireCMSContext,
    useSideEntityController
} from "../../../hooks";
import {  Table } from "../../index";
import {
    checkInlineEditing,
    OnCellValueChange,
    UniqueFieldValidator,
    useBuildColumnsFromCollection
} from "./column_builder";
import { getResolvedCollection } from "../../util/collections";

const DEFAULT_PAGE_SIZE = 50;

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
 * properties at all, you can check {@link Table}
 *
 * @see CollectionTableProps
 * @see EntityCollectionView
 * @see Table
 * @category Components
 */
export const CollectionTable = React.memo<CollectionTableProps<any>>(
    function CollectionTable<M extends { [Key: string]: any }>
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
     }: CollectionTableProps<M>) {


        const context = useFireCMSContext();
        const dataSource = useDataSource();
        const sideEntityController = useSideEntityController();

        const theme = useTheme();
        const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

        const resolvedCollection = getResolvedCollection<M>({
            collection,
            path
        });

        const [size, setSize] = React.useState<CollectionSize>(resolvedCollection.defaultSize ?? "m");

        const initialFilter = resolvedCollection.initialFilter;
        const initialSort = resolvedCollection.initialSort;
        const filterCombinations = resolvedCollection.filterCombinations;

        const textSearchEnabled = collection.textSearchEnabled;
        const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
        const pageSize = typeof collection.pagination === "number" ? collection.pagination : DEFAULT_PAGE_SIZE;

        const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? pageSize : undefined);

        const [filterValues, setFilterValues] = React.useState<FilterValues<Extract<keyof M, string>> | undefined>(initialFilter || undefined);
        const [sortBy, setSortBy] = React.useState<[Extract<keyof M, string>, "asc" | "desc"] | undefined>(initialSort);

        const filterIsSet = !!filterValues && Object.keys(filterValues).length > 0;

        const additionalColumns = useMemo(() => {
            const subcollectionColumns: AdditionalColumnDelegate<M, any, any>[] = collection.subcollections?.map((subcollection) => {
                return {
                    id: getSubcollectionColumnId(subcollection),
                    name: subcollection.name,
                    width: 200,
                    dependencies: [],
                    builder: ({ entity }) => (
                        <Button color={"primary"}
                                variant={"outlined"}
                                startIcon={<KeyboardTabIcon fontSize={"small"}/>}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    sideEntityController.open({
                                        path,
                                        entityId: entity.id,
                                        selectedSubPath: subcollection.path,
                                        collection: collection,
                                        updateUrl: true
                                    });
                                }}>
                            {subcollection.name}
                        </Button>
                    )
                };
            }) ?? [];
            return [...(resolvedCollection.additionalColumns ?? []), ...subcollectionColumns];
        }, [resolvedCollection, collection, path]);

        const displayedProperties = useColumnIds<M>(resolvedCollection, true);

        const uniqueFieldValidator: UniqueFieldValidator = useCallback(
            ({
                 name,
                 value,
                 property,
                 entityId
             }) => dataSource.checkUniqueField(path, name, value, property, entityId),
            [path, dataSource]);

        const onCellChanged: OnCellValueChange<any, M> = useCallback(({
                                                                          value,
                                                                          name,
                                                                          setSaved,
                                                                          setError,
                                                                          entity
                                                                      }) => {
            const saveProps: SaveEntityProps<M> = {
                path,
                entityId: entity.id,
                values: {
                    ...entity.values,
                    [name]: value
                },
                previousValues: entity.values,
                collection,
                status: "existing"
            };

            return saveEntityWithCallbacks({
                ...saveProps,
                callbacks: collection.callbacks,
                dataSource,
                context,
                onSaveSuccess: () => setSaved(true),
                onSaveFailure: (e: Error) => {
                    console.error(e);
                    setError(e);
                }
            });

        }, [path, collection, resolvedCollection]);

        const { columns, popupFormField } = useBuildColumnsFromCollection({
            collection,
            additionalColumns,
            displayedProperties,
            path,
            inlineEditing,
            size,
            onCellValueChange: onCellChanged,
            uniqueFieldValidator
        });

        const [searchString, setSearchString] = React.useState<string | undefined>();

        const {
            data,
            dataLoading,
            noMoreToLoad,
            dataLoadingError
        } = useCollectionFetch<M>({
            entitiesDisplayedFirst,
            path,
            collection,
            filterValues,
            sortBy,
            searchString,
            itemCount
        });

        const loadNextPage = useCallback(() => {
            if (!paginationEnabled || dataLoading || noMoreToLoad)
                return;
            if (itemCount !== undefined)
                setItemCount(itemCount + pageSize);
        }, [dataLoading, itemCount, noMoreToLoad, pageSize, paginationEnabled]);

        const resetPagination = useCallback(() => {
            setItemCount(pageSize);
        }, [pageSize]);

        const clearFilter = useCallback(() => setFilterValues(undefined), []);

        const buildIdColumn = useCallback(({ entry, size }: {
            entry: Entity<M>,
            size: CollectionSize,
        }) => {
            if (tableRowActionsBuilder)
                return tableRowActionsBuilder({ entity: entry, size });
            else
                return <CollectionRowActions entity={entry} size={size}/>;

        }, [tableRowActionsBuilder]);

        const onRowClick = useCallback(({ rowData }: { rowData: Entity<M> }) => {
            if (checkInlineEditing(inlineEditing, rowData))
                return;
            return onEntityClick && onEntityClick(rowData);
        }, [onEntityClick]);

        const updateSize = useCallback((size: CollectionSize) => {
            if (onSizeChanged)
                onSizeChanged(size);
            setSize(size);
        }, []);

        const onTextSearch = useCallback((newSearchString) => setSearchString(newSearchString), []);

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

                <Table
                    data={data}
                    columns={columns}
                    onRowClick={onRowClick}
                    onEndReached={loadNextPage}
                    onResetPagination={resetPagination}
                    idColumnBuilder={buildIdColumn}
                    error={dataLoadingError}
                    paginationEnabled={paginationEnabled}
                    onColumnResize={onColumnResize}
                    frozenIdColumn={largeLayout}
                    size={size}
                    loading={dataLoading}
                    filter={filterValues}
                    onFilterUpdate={setFilterValues}
                    sortBy={sortBy}
                    onSortByUpdate={setSortBy as any}
                    hoverRow={hoverRow}
                    checkFilterCombination={(filterValues, sortBy) => isFilterCombinationValid(filterValues, filterCombinations, sortBy)}
                />

                {popupFormField}

            </Paper>
        );

    },
    function areEqual(prevProps: CollectionTableProps<any>, nextProps: CollectionTableProps<any>) {
        return prevProps.path === nextProps.path &&
            equal(prevProps.collection, nextProps.collection) &&
            prevProps.Title === nextProps.Title &&
            prevProps.tableRowActionsBuilder === nextProps.tableRowActionsBuilder &&
            prevProps.inlineEditing === nextProps.inlineEditing;
    }
) as React.FunctionComponent<CollectionTableProps<any>>;

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
