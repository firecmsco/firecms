import React from "react";
import { Button, Paper, Theme, useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";

import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    FilterCombination,
    FilterValues,
    SaveEntityProps,
    User,
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
import { Table } from "../../index";
import {
    buildColumnsFromSchema,
    checkInlineEditing,
    OnCellValueChange,
    UniqueFieldValidator
} from "./column_builder";

const DEFAULT_PAGE_SIZE = 50;

export const useStyles = makeStyles<Theme>(theme => createStyles({
    root: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
    }
}));


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
 * If you want to bind a EntityCollection to a table with the default
 * options you see in colelctions in the top level navigation, you can
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
export function CollectionTable<M extends { [Key: string]: any },
    AdditionalKey extends string = string,
    UserType = User>
({
     path,
     collection,
     inlineEditing,
     toolbarActionsBuilder,
     title,
     tableRowActionsBuilder,
     entitiesDisplayedFirst,
     onEntityClick,
     onColumnResize,
     onSizeChanged,
     hoverRow = true
 }: CollectionTableProps<M, AdditionalKey>) {

    const context = useFireCMSContext();
    const dataSource = useDataSource();
    const sideEntityController = useSideEntityController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [size, setSize] = React.useState<CollectionSize>(collection.defaultSize ?? "m");

    const schema = collection.schema;
    const initialFilter = collection.initialFilter;
    const initialSort = collection.initialSort;
    const filterCombinations = collection.filterCombinations;
    const textSearchEnabled = collection.textSearchEnabled;
    const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
    const pageSize = typeof collection.pagination === "number" ? collection.pagination : DEFAULT_PAGE_SIZE;

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? pageSize : undefined);

    const [filterValues, setFilterValues] = React.useState<FilterValues<M> | undefined>(initialFilter || {});
    const [sortBy, setSortBy] = React.useState<[Extract<keyof M, string>, "asc" | "desc"] | undefined>(initialSort);

    const filterIsSet = !!filterValues && Object.keys(filterValues).length > 0;

    const classes = useStyles();

    const subcollectionColumns: AdditionalColumnDelegate<M, any, any>[] = collection.subcollections?.map((subcollection) => {
        return {
            id: getSubcollectionColumnId(subcollection),
            title: subcollection.name,
            width: 200,
            builder: ({ entity }) => (
                <Button color={"primary"}
                        onClick={(event) => {
                            event.stopPropagation();
                            sideEntityController.open({
                                path,
                                entityId: entity.id,
                                selectedSubpath: subcollection.path,
                                permissions: collection.permissions,
                                schema: collection.schema,
                                subcollections: collection.subcollections,
                                callbacks: collection.callbacks,
                                overrideSchemaResolver: false
                            });
                        }}>
                    {subcollection.name}
                </Button>
            )
        };
    }) ?? [];

    const additionalColumns = [...(collection.additionalColumns ?? []), ...subcollectionColumns];

    const displayedProperties = useColumnIds(collection, true);

    const uniqueFieldValidator: UniqueFieldValidator = ({
                                                            name,
                                                            value,
                                                            property,
                                                            entityId
                                                        }) => dataSource.checkUniqueField(path, name, value, property, entityId);


    const onCellChanged: OnCellValueChange<any, M> = ({
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
            schema: collection.schema,
            status: "existing"
        };

        return saveEntityWithCallbacks({
            ...saveProps,
            callbacks: collection.callbacks,
            dataSource,
            context,
            onSaveSuccess: () => setSaved(true),
            onSaveFailure: ((e: Error) => {
                setError(e);
            })
        });

    };

    const { columns, popupFormField } = buildColumnsFromSchema({
        schema,
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
    } = useCollectionFetch({
        entitiesDisplayedFirst,
        path,
        schema,
        filterValues,
        sortBy,
        searchString,
        itemCount
    });

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

    const clearFilter = () => setFilterValues({});

    const buildIdColumn = ({ entry, size }: {
        entry: Entity<M>,
        size: CollectionSize,
    }) => {
        if (tableRowActionsBuilder)
            return tableRowActionsBuilder({ entity: entry, size });
        else
            return <CollectionRowActions entity={entry} size={size}/>;

    };

    const onRowClick = ({ rowData }: { rowData: Entity<M> }) => {
        if (checkInlineEditing(inlineEditing, rowData))
            return;
        return onEntityClick && onEntityClick(rowData);
    };

    function isFilterCombinationValid<M>(
        filterValues: FilterValues<M>,
        indexes?: FilterCombination<Extract<keyof M, string>>[],
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

    const updateSize = (size: CollectionSize) => {
        if (onSizeChanged)
            onSizeChanged(size);
        setSize(size);
    };

    return (

        <Paper className={classes.root}>

            <CollectionTableToolbar filterIsSet={filterIsSet}
                                    onTextSearch={textSearchEnabled ? setSearchString : undefined}
                                    clearFilter={clearFilter}
                                    actions={actions}
                                    size={size}
                                    onSizeChanged={updateSize}
                                    title={title}
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

}

