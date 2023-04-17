import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import equal from "react-fast-compare";
import {
    getCellAlignment,
    getPropertyColumnWidth,
    getSubcollectionColumnId
} from "./internal/common";
import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    FilterValues,
    FireCMSContext,
    PropertyOrBuilder,
    ResolvedEntityCollection,
    ResolvedProperty,
    SaveEntityProps,
    User
} from "../../../types";
import { renderSkeletonText } from "../../../preview";
import { CustomFieldValidator } from "../../../form/validation";
import { PropertyTableCell } from "./internal/PropertyTableCell";
import { ErrorBoundary } from "../ErrorBoundary";
import {
    saveEntityWithCallbacks,
    useDataSource,
    useFireCMSContext,
    useSideEntityController
} from "../../../hooks";
import { PopupFormField } from "./internal/popup_field/PopupFormField";
import { CellRendererParams, TableColumn, VirtualTable } from "../Table";
import {
    getIconForProperty,
    getPropertyInPath,
    getResolvedPropertyInPath,
    getValueInPath,
    resolveCollection,
    resolveEnumValues,
    resolveProperty
} from "../../util";
import { getRowHeight } from "../Table/common";
import {
    EntityCollectionRowActions
} from "./internal/EntityCollectionRowActions";
import {
    EntityCollectionTableController,
    OnCellValueChange,
    SelectedCellProps,
    UniqueFieldValidator
} from "./types";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { setIn } from "formik";
import { CollectionTableToolbar } from "./internal/CollectionTableToolbar";
import { EntityCollectionTableProps } from "./EntityCollectionTableProps";
import { TableCell } from "./internal/TableCell";
import { FilterFormFieldProps } from "../Table/VirtualTableHeader";
import { ReferenceFilterField } from "./filters/ReferenceFilterField";
import { StringNumberFilterField } from "./filters/StringNumberFilterField";
import { BooleanFilterField } from "./filters/BooleanFilterField";
import { DateTimeFilterField } from "./filters/DateTimeFilterfield";

const DEFAULT_STATE = {} as any;

export const EntityCollectionTableContext = React.createContext<EntityCollectionTableController<any>>(DEFAULT_STATE);

export const useEntityCollectionTableController = () => useContext<EntityCollectionTableController<any>>(EntityCollectionTableContext);

/**
 * This component is in charge of rendering a collection table with a high
 * degree of customization. It is in charge of fetching data from
 * the {@link DataSource} and holding the state of filtering and sorting.
 *
 * This component is used internally by {@link EntityCollectionView} and
 * {@link useReferenceDialog}
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
    function EntityCollectionTable<M extends Record<string, any>, AdditionalKey extends string, UserType extends User>
    ({
         fullPath,
         initialFilter,
         initialSort,
         filterCombinations,
         forceFilter,
         actionsStart,
         actions,
         title,
         tableRowActionsBuilder,
         selectionController,
         highlightedEntities,
         onEntityClick,
         onColumnResize,
         onSizeChanged,
         textSearchEnabled = false,
         hoverRow = true,
         inlineEditing = false,
         tableController:
             {
                 data,
                 dataLoading,
                 noMoreToLoad,
                 dataLoadingError,
                 filterValues,
                 setFilterValues,
                 sortBy,
                 setSortBy,
                 searchString,
                 setSearchString,
                 clearFilter,
                 itemCount,
                 setItemCount,
                 pageSize,
                 paginationEnabled,
                 checkFilterCombination
             },
         ...collection
     }: EntityCollectionTableProps<M>) {

        const theme = useTheme();
        const largeLayout = useMediaQuery(theme.breakpoints.up("md"));
        const disabledFilterChange = Boolean(forceFilter);
        const selectedEntities = selectionController?.selectedEntities?.length > 0 ? selectionController?.selectedEntities : highlightedEntities;

        const tableKey = React.useRef<string>(Math.random().toString(36));

        const context: FireCMSContext<UserType> = useFireCMSContext();

        const dataSource = useDataSource();
        const sideEntityController = useSideEntityController();

        const resolvedCollection = useMemo(() => resolveCollection<M>({
            collection,
            path: fullPath,
            fields: context.fields
        }), [collection, fullPath]);

        const [size, setSize] = React.useState<CollectionSize>(resolvedCollection.defaultSize ?? "m");

        const [selectedCell, setSelectedCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
        const [popupCell, setPopupCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
        const [focused, setFocused] = React.useState<boolean>(false);

        const selectedEntityIds = selectedEntities?.map(e => e.id);

        const filterIsSet = !!filterValues && Object.keys(filterValues).length > 0;

        const additionalFields = useMemo(() => {
            const subcollectionColumns: AdditionalFieldDelegate<M, any, any>[] = collection.subcollections?.map((subcollection) => {
                return {
                    id: getSubcollectionColumnId(subcollection),
                    name: subcollection.name,
                    width: 200,
                    dependencies: [],
                    Builder: ({ entity }) => (
                        <Button color={"primary"}
                                variant={"outlined"}
                                startIcon={<KeyboardTabIcon
                                    fontSize={"small"}/>}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    sideEntityController.open({
                                        path: fullPath,
                                        entityId: entity.id,
                                        selectedSubPath: subcollection.alias ?? subcollection.path,
                                        collection,
                                        updateUrl: true
                                    });
                                }}>
                            {subcollection.name}
                        </Button>
                    )
                };
            }) ?? [];
            return [...(collection.additionalFields ?? collection.additionalColumns ?? []), ...subcollectionColumns];
        }, [collection, fullPath]);

        const uniqueFieldValidator: UniqueFieldValidator = useCallback(
            ({
                 name,
                 value,
                 property,
                 entityId
             }) => dataSource.checkUniqueField(fullPath, name, value, property, entityId),
            [fullPath]);

        const loadNextPage = () => {
            if (!paginationEnabled || dataLoading || noMoreToLoad)
                return;
            if (itemCount !== undefined)
                setItemCount(itemCount + pageSize);
        };

        const resetPagination = useCallback(() => {
            setItemCount(pageSize);
        }, [pageSize]);

        const onRowClick = useCallback(({ rowData }: { rowData: Entity<M> }) => {
            if (inlineEditing)
                return;
            return onEntityClick && onEntityClick(rowData);
        }, [onEntityClick, inlineEditing]);

        const updateSize = useCallback((size: CollectionSize) => {
            if (onSizeChanged)
                onSizeChanged(size);
            setSize(size);
        }, []);

        const onTextSearch = useCallback((newSearchString?: string) => setSearchString(newSearchString), []);

        const additionalFieldsMap: Record<string, AdditionalFieldDelegate<M, string, UserType>> = useMemo(() => {
            return (additionalFields
                ? additionalFields
                    .map((aC) => ({ [aC.id]: aC }))
                    .reduce((a, b) => ({ ...a, ...b }), {})
                : {}) as Record<string, AdditionalFieldDelegate<M, string, UserType>>;
        }, [additionalFields]);

        // on ESC key press
        useEffect(() => {
            const escFunction = (event: any) => {
                if (event.keyCode === 27) {
                    unselect();
                }
            };
            document.addEventListener("keydown", escFunction, false);
            return () => {
                document.removeEventListener("keydown", escFunction, false);
            };
        });

        const select = useCallback((cell?: SelectedCellProps<M>) => {
            setSelectedCell(cell);
            setFocused(true);
        }, []);

        const unselect = useCallback(() => {
            setSelectedCell(undefined);
            setFocused(false);
        }, []);

        const onPopupClose = useCallback(() => {
            setPopupCell(undefined);
            setFocused(true);
        }, []);

        const displayedColumnIds = useColumnIds<M>(resolvedCollection, true);

        const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator;

        const propertyCellRenderer = useCallback(({
                                                      column,
                                                      columnIndex,
                                                      rowData,
                                                      rowIndex
                                                  }: CellRendererParams<any>) => {

            const entity: Entity<M> = rowData;

            const propertyKey = column.key;

            const propertyOrBuilder: PropertyOrBuilder<any, M> | undefined = getPropertyInPath<M>(collection.properties, propertyKey);
            if (!propertyOrBuilder) {
                return null;
            }
            const property = resolveProperty({
                propertyKey,
                propertyOrBuilder,
                path: fullPath,
                propertyValue: entity.values ? getValueInPath(entity.values, propertyKey) : undefined,
                values: entity.values,
                entityId: entity.id,
                fields: context.fields
            });

            if (!property) {
                return null;
            }

            return (
                <ErrorBoundary>
                    {entity
                        ? <PropertyTableCell
                            key={`property_table_cell_${entity.id}_${propertyKey}`}
                            readonly={!inlineEditing}
                            align={column.align ?? "left"}
                            propertyKey={propertyKey as string}
                            property={property}
                            setFocused={setFocused}
                            value={entity?.values ? getValueInPath(entity.values, propertyKey) : undefined}
                            collection={collection}
                            customFieldValidator={customFieldValidator}
                            columnIndex={columnIndex}
                            width={column.width}
                            height={getRowHeight(size)}
                            entity={entity}
                            path={entity.path}/>
                        : renderSkeletonText()
                    }
                </ErrorBoundary>);

        }, [collection, customFieldValidator, fullPath, inlineEditing, size, selectedEntityIds]);

        const additionalCellRenderer = useCallback(({
                                                        column,
                                                        rowData,
                                                        width
                                                    }: CellRendererParams<any>) => {

            const entity: Entity<M> = rowData;

            const additionalField = additionalFieldsMap[column.key as AdditionalKey];
            const value = additionalField.dependencies
                ? Object.entries(entity.values)
                    .filter(([key, value]) => additionalField.dependencies!.includes(key as Extract<keyof M, string>))
                    .reduce((a, b) => ({ ...a, ...b }), {})
                : entity;

            if (additionalField.builder) {
                console.warn("`additionalField.builder` is deprecated. Use `additionalField.Builder` instead.");
            }

            const Builder = additionalField.builder ?? additionalField.Builder;
            if (!Builder) {
                throw new Error("No builder provided for additional field");
            }

            return (
                <TableCell
                    key={`additional_table_cell_${entity.id}_${column.key}`}
                    width={width}
                    size={size}
                    focused={focused}
                    value={value}
                    selected={false}
                    selectedRow={selectedEntityIds?.includes(entity.id) ?? false}
                    disabled={true}
                    align={"left"}
                    allowScroll={false}
                    showExpandIcon={false}
                    disabledTooltip={"This column can't be edited directly"}
                >
                    <ErrorBoundary>
                        <Builder entity={entity}
                                 context={context}/>
                    </ErrorBoundary>
                </TableCell>
            );

        }, [additionalFieldsMap, size, selectedEntityIds]);

        const allColumns: TableColumn[] = useMemo(() => {
                const columnsResult: TableColumn[] = Object.entries<ResolvedProperty>(resolvedCollection.properties)
                    .flatMap(([key, property]) => {
                        if (property.dataType === "map" && property.spreadChildren && property.properties) {
                            return Object.keys(property.properties).map(childKey => `${key}.${childKey}`);
                        }
                        return [key];
                    })
                    .map((key) => {
                        const property = getResolvedPropertyInPath(resolvedCollection.properties, key);
                        if (!property)
                            throw Error("Internal error: no property found in path " + key);
                        const filterable = filterableProperty(property);
                        return ({
                            key: key as string,
                            align: getCellAlignment(property),
                            icon: (hoverOrOpen) => getIconForProperty(property, hoverOrOpen ? undefined : "disabled", "small"),
                            title: property.name ?? key as string,
                            sortable: forceFilter ? Object.keys(forceFilter).includes(key) : true,
                            filter: !disabledFilterChange && filterable,
                            width: getPropertyColumnWidth(property),
                            resizable: true,
                            custom: property
                        });
                    });

                const additionalTableColumns: TableColumn[] = additionalFields
                    ? additionalFields.map((additionalField) =>
                        ({
                            key: additionalField.id,
                            type: "additional",
                            align: "left",
                            sortable: false,
                            title: additionalField.name,
                            width: additionalField.width ?? 200
                        }))
                    : [];
                return [...columnsResult, ...additionalTableColumns];
            },
            [additionalFields, disabledFilterChange, forceFilter, resolvedCollection.properties]);

        const idColumn: TableColumn = useMemo(() => ({
            key: "id_ewcfedcswdf3",
            width: largeLayout ? 160 : 130,
            title: "ID",
            resizable: false,
            frozen: largeLayout,
            headerAlign: "center"
        }), [largeLayout])

        const columns: TableColumn[] = useMemo(() => [
            idColumn,
            ...displayedColumnIds
                .map((p) => {
                    return allColumns.find(c => c.key === p);
                }).filter(c => !!c) as TableColumn[]
        ], [allColumns, displayedColumnIds, idColumn]);

        const cellRenderer = useCallback((props: CellRendererParams<any>) => {
            const column = props.column;
            const columns = props.columns;
            const columnKey = column.key;
            if (props.columnIndex === 0) {
                if (tableRowActionsBuilder)
                    return tableRowActionsBuilder({
                        entity: props.rowData,
                        size,
                        width: column.width,
                        frozen: column.frozen
                    });
                else
                    return <EntityCollectionRowActions entity={props.rowData}
                                                       width={column.width}
                                                       frozen={column.frozen}
                                                       size={size}/>;
            } else if (additionalFieldsMap[columnKey]) {
                return additionalCellRenderer(props);
            } else if (props.columnIndex < columns.length + 1) {
                return propertyCellRenderer(props);
            } else {
                throw Error("Internal: columns not mapped properly");
            }
        }, [additionalFieldsMap, tableRowActionsBuilder, size, additionalCellRenderer, propertyCellRenderer])

        const onFilterUpdate = useCallback((updatedFilterValues?: FilterValues<any>) => {
            setFilterValues({ ...updatedFilterValues, ...forceFilter } as FilterValues<any>);
        }, [forceFilter]);

        return (

            <EntityCollectionTableContext.Provider
                value={{
                    setPopupCell,
                    select,
                    onValueChange,
                    size,
                    selectedCell,
                    selectedEntityIds,
                    focused
                }}
            >

                <Box sx={(theme) => ({
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: theme.palette.background.paper
                })}>

                    <CollectionTableToolbar
                        forceFilter={disabledFilterChange}
                        filterIsSet={filterIsSet}
                        onTextSearch={textSearchEnabled ? onTextSearch : undefined}
                        clearFilter={clearFilter}
                        size={size}
                        onSizeChanged={updateSize}
                        title={title}
                        actionsStart={actionsStart}
                        actions={actions}
                        loading={dataLoading}/>

                    <Box sx={{ flexGrow: 1 }}>
                        <VirtualTable
                            data={data}
                            columns={columns}
                            cellRenderer={cellRenderer}
                            onRowClick={inlineEditing ? undefined : onRowClick}
                            onEndReached={loadNextPage}
                            onResetPagination={resetPagination}
                            error={dataLoadingError}
                            paginationEnabled={paginationEnabled}
                            onColumnResize={onColumnResize}
                            size={size}
                            loading={dataLoading}
                            filter={filterValues}
                            onFilterUpdate={onFilterUpdate}
                            sortBy={sortBy}
                            onSortByUpdate={setSortBy as ((sortBy?: [string, "asc" | "desc"]) => void)}
                            hoverRow={hoverRow}
                            checkFilterCombination={checkFilterCombination}
                            createFilterField={createFilterField}
                        />
                    </Box>

                    <PopupFormField
                        key={`popup_form_${popupCell?.columnIndex}_${popupCell?.entity?.id}`}
                        open={Boolean(popupCell)}
                        onClose={onPopupClose}
                        cellRect={popupCell?.cellRect}
                        columnIndex={popupCell?.columnIndex}
                        propertyKey={popupCell?.propertyKey}
                        collection={popupCell?.collection}
                        entity={popupCell?.entity}
                        tableKey={tableKey.current}
                        customFieldValidator={customFieldValidator}
                        path={fullPath}
                        onCellValueChange={onValueChange}
                    />

                </Box>
            </EntityCollectionTableContext.Provider>
        );

    },
    equal
);

const onValueChange: OnCellValueChange<any, any> = ({
                                                        fullPath,
                                                        collection,
                                                        dataSource,
                                                        context,
                                                        value,
                                                        propertyKey,
                                                        onValueUpdated,
                                                        setError,
                                                        entity
                                                    }) => {

    const updatedValues = setIn({ ...entity.values }, propertyKey, value);

    const saveProps: SaveEntityProps = {
        path: fullPath,
        entityId: entity.id,
        values: updatedValues,
        previousValues: entity.values,
        collection,
        status: "existing"
    };

    return saveEntityWithCallbacks({
        ...saveProps,
        callbacks: collection.callbacks,
        dataSource,
        context,
        onSaveSuccess: () => onValueUpdated(),
        onSaveFailure: (e: Error) => {
            console.error("Save failure");
            console.error(e);
            setError(e);
        }
    });

};

function getDefaultColumnKeys<M extends Record<string, any> = any>(collection: ResolvedEntityCollection<M>, includeSubcollections: boolean) {
    const propertyKeys = Object.keys(collection.properties);

    if (collection.additionalColumns) {
        console.warn("`additionalColumns` is deprecated and will be removed in previous versions. Use `additionalFields` instead, with the same structure.");
    }

    const additionalFields = collection.additionalFields ?? collection.additionalColumns ?? [];
    const subCollections: EntityCollection[] = collection.subcollections ?? [];

    const columnIds: string[] = [
        ...propertyKeys,
        ...additionalFields.map((field) => field.id)
    ];

    if (includeSubcollections) {
        const subCollectionIds = subCollections
            .map((collection) => getSubcollectionColumnId(collection));
        columnIds.push(...subCollectionIds.filter((subColId) => !columnIds.includes(subColId)));
    }
    return hideAndExpandKeys(collection, columnIds);
}

function useColumnIds<M extends Record<string, any>>(collection: ResolvedEntityCollection<M>, includeSubcollections: boolean): string[] {
    return useMemo(() => {
        if (collection.propertiesOrder)
            return hideAndExpandKeys(collection, collection.propertiesOrder);
        return getDefaultColumnKeys(collection, includeSubcollections);

    }, [collection, includeSubcollections]);
}

function hideAndExpandKeys<M extends Record<string, any>>(collection: ResolvedEntityCollection<M>, keys: string[]): string[] {

    return keys.flatMap((key) => {
        const property = collection.properties[key];
        if (property) {
            if (property.hideFromCollection)
                return [null];
            if (property.disabled && typeof property.disabled === "object" && property.disabled.hidden)
                return [null];
            if (property.dataType === "map" && property.spreadChildren && property.properties) {
                return Object.keys(property.properties).map(childKey => `${key}.${childKey}`);
            }
            return [key];
        }

        const additionalField = collection.additionalFields?.find(field => field.id === key);
        if (additionalField) {
            return [key];
        }

        return [null];
    }).filter((key) => key !== null) as string[];
}

function createFilterField({
                               id,
                               filterValue,
                               setFilterValue,
                               column,
                               popupOpen,
                               setPopupOpen
                           }: FilterFormFieldProps<ResolvedProperty>): React.ReactNode {
    const property: ResolvedProperty | undefined = column.custom;
    if (!property) {
        return null;
    }
    const isArray = property?.dataType === "array";
    const baseProperty: ResolvedProperty = isArray ? property.of : property;
    if (!baseProperty) {
        return null;
    }
    if (baseProperty.dataType === "reference") {
        return <ReferenceFilterField value={filterValue}
                                     setValue={setFilterValue}
                                     name={id as string}
                                     isArray={isArray}
                                     path={baseProperty.path}
                                     title={property?.name}
                                     previewProperties={baseProperty?.previewProperties}
                                     popupOpen={popupOpen}
                                     setPopupOpen={setPopupOpen}/>;
    } else if (baseProperty.dataType === "number" || baseProperty.dataType === "string") {
        const name = baseProperty.name;
        const enumValues = baseProperty.enumValues ? resolveEnumValues(baseProperty.enumValues) : undefined;
        return <StringNumberFilterField value={filterValue}
                                        setValue={setFilterValue}
                                        name={id as string}
                                        dataType={baseProperty.dataType}
                                        isArray={isArray}
                                        enumValues={enumValues}
                                        title={name}/>;
    } else if (baseProperty.dataType === "boolean") {
        const name = baseProperty.name;
        return <BooleanFilterField value={filterValue}
                                   setValue={setFilterValue}
                                   name={id as string}
                                   title={name}/>;

    } else if (baseProperty.dataType === "date") {
        const title = baseProperty.name;
        return <DateTimeFilterField value={filterValue}
                                    setValue={setFilterValue}
                                    name={id as string}
                                    mode={baseProperty.mode}
                                    isArray={isArray}
                                    title={title}/>;
    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}

function filterableProperty(property: ResolvedProperty, partOfArray = false): boolean {
    if (partOfArray) {
        return ["string", "number", "date", "reference"].includes(property.dataType);
    }
    if (property.dataType === "array") {
        if (property.of)
            return filterableProperty(property.of, true);
        else
            return false;
    }
    return ["string", "number", "boolean", "date", "reference", "array"].includes(property.dataType);
}
