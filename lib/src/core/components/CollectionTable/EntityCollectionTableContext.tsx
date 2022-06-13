import React, { useCallback, useContext, useEffect, useMemo } from "react";
import {
    getCellAlignment,
    getPropertyColumnWidth,
    getSubcollectionColumnId
} from "./internal/common";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    FilterValues,
    FireCMSContext,
    Property,
    ResolvedEntityCollection,
    ResolvedProperty,
    SaveEntityProps,
    User
} from "../../../models";
import { TableCell } from "../Table/TableCell";
import { PropertyPreview, renderSkeletonText } from "../../../preview";
import { getPreviewSizeFrom } from "../../../preview/util";
import { CustomFieldValidator } from "../../../form/validation";
import { PropertyTableCell } from "./internal/PropertyTableCell";
import { ErrorBoundary } from "../ErrorBoundary";
import {
    saveEntityWithCallbacks,
    useCollectionFetch,
    useDataSource,
    useFireCMSContext,
    useSideEntityController
} from "../../../hooks";
import { PopupFormField } from "./internal/popup_field/PopupFormField";
import { CellRendererParams, TableColumn, TableColumnFilter } from "../Table";
import {
    getIconForProperty,
    getPropertyInPath,
    getResolvedPropertyInPath,
    getValueInPath,
    resolveCollection,
    resolveEnumValues,
    resolveProperty
} from "../../util";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { getRowHeight } from "../Table/common";
import { CollectionRowActions } from "./internal/CollectionRowActions";
import {
    EntityCollectionTableController,
    EntityCollectionTableProviderProps,
    OnCellValueChange,
    SelectedCellProps,
    UniqueFieldValidator
} from "./types";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { setIn } from "formik";

const DEFAULT_PAGE_SIZE = 50;

const DEFAULT_STATE = {} as any;

export const EntityCollectionTableContext = React.createContext<EntityCollectionTableController<any, any>>(DEFAULT_STATE);

export const useEntityCollectionTableController = () => useContext<EntityCollectionTableController<any, any>>(EntityCollectionTableContext);

export function EntityCollectionTableProvider<M, AdditionalKey extends string, UserType extends User>(
    {

        children,
        collection,
        path,
        entitiesDisplayedFirst,
        onEntityClick,
        onSizeChanged,
        inlineEditing,
        tableRowActionsBuilder
    }: EntityCollectionTableProviderProps<M, AdditionalKey, UserType> & {
        children: React.ReactNode
    }) {
    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const dataSource = useDataSource();
    const sideEntityController = useSideEntityController();

    const resolvedCollection = useMemo(() => resolveCollection<M>({
        collection,
        path
    }), [collection, path]);

    const [size, setSize] = React.useState<CollectionSize>(resolvedCollection.defaultSize ?? "m");

    const initialFilter = resolvedCollection.initialFilter;
    const initialSort = resolvedCollection.initialSort;
    const filterCombinations = resolvedCollection.filterCombinations;

    const textSearchEnabled = collection.textSearchEnabled ?? false;
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
        return [...(resolvedCollection.additionalColumns ?? []), ...subcollectionColumns];
    }, [resolvedCollection, collection, path]);

    const uniqueFieldValidator: UniqueFieldValidator = useCallback(
        ({
             name,
             value,
             property,
             entityId
         }) => dataSource.checkUniqueField(path, name, value, property, entityId),
        [path, dataSource]);

    const onValueChange: OnCellValueChange<any, M> = useCallback(({
                                                                          value,
                                                                          propertyKey,
                                                                          setSaved,
                                                                          setError,
                                                                          entity
                                                                      }) => {

        const updatedValues = setIn({ ...entity.values }, propertyKey, value);

        const saveProps: SaveEntityProps<M> = {
            path,
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
            onSaveSuccess: () => setSaved(true),
            onSaveFailure: (e: Error) => {
                console.error("Save failure");
                console.error(e);
                setError(e);
            }
        });

    }, [path, collection, resolvedCollection]);

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

    const onTextSearch = useCallback((newSearchString?: string) => setSearchString(newSearchString), []);

    const [selectedCell, setSelectedCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
    const [popupCell, setPopupCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const tableKey = React.useRef<string>(Math.random().toString(36));

    const additionalColumnsMap: Record<string, AdditionalColumnDelegate<M, string, UserType>> = useMemo(() => {
        return additionalColumns
            ? additionalColumns
                .map((aC) => ({ [aC.id]: aC }))
                .reduce((a, b) => ({ ...a, ...b }), {})
            : {};
    }, [additionalColumns]);

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
        console.trace("select", cell);
        setSelectedCell(cell);
        setFocused(true);
    }, []);

    const unselect = useCallback(() => {
        setSelectedCell(undefined);
        setFocused(false);
        setPreventOutsideClick(false);
    }, []);

    const onPopupClose = useCallback(() => {
        setPopupCell(undefined);
        setFocused(true);
    }, []);

    const displayedProperties = useColumnIds<M>(resolvedCollection, true);

    const propertyCellRenderer = useCallback(({
                                                  column,
                                                  columnIndex,
                                                  rowData,
                                                  rowIndex,
                                              }: CellRendererParams<any, any>) => {

        const entity: Entity<M> = rowData;

        const propertyKey = column.dataKey;

        const propertyOrBuilder = getPropertyInPath(collection.properties, propertyKey);
        if (!propertyOrBuilder) {
            return null;
        }
        const property = resolveProperty({
            propertyOrBuilder,
            path,
            propertyValue: entity.values ? entity.values[propertyKey] : undefined,
            values: entity.values,
            entityId: entity.id
        });

        if (!property) {
            return null;
        }
        const inlineEditingEnabled = checkInlineEditing(inlineEditing, entity);

        if (!inlineEditingEnabled) {
            return (
                <TableCell
                    key={`preview_cell_${propertyKey}_${rowIndex}_${columnIndex}`}
                    value={entity.values[propertyKey]}
                    align={column.align ?? "left"}
                    disabled={true}>
                    <PropertyPreview
                        width={column.width}
                        height={getRowHeight(size)}
                        propertyKey={`preview_${propertyKey}_${rowIndex}_${columnIndex}`}
                        property={property as any}
                        entity={entity}
                        value={entity.values[propertyKey]}
                        size={getPreviewSizeFrom(size)}
                    />
                </TableCell>
            );
        } else {

            return (
                <ErrorBoundary>
                    {entity
                        ? <PropertyTableCell
                            key={`table_cell_${propertyKey}_${rowIndex}_${columnIndex}`}
                            align={column.align ?? "left"}
                            propertyKey={propertyKey as string}
                            property={property}
                            setPreventOutsideClick={setPreventOutsideClick}
                            setFocused={setFocused}
                            value={entity?.values ? getValueInPath(entity.values as any, propertyKey) : undefined}
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
        }

    }, []);

    const additionalCellRenderer = useCallback(({
                                                    column,
                                                    rowData,
                                                    extra
                                                }: any) => {

        const entity: Entity<M> = rowData;

        const additionalColumn = additionalColumnsMap[column.dataKey as AdditionalKey];
        const value = additionalColumn.dependencies
            ? Object.entries(entity.values)
                .filter(([key, value]) => additionalColumn.dependencies!.includes(key as any))
                .reduce((a, b) => ({ ...a, ...b }), {})
            : undefined;

        return (
            <TableCell
                value={value}
                selected={false}
                disabled={true}
                align={"left"}
                allowScroll={false}
                showExpandIcon={false}
                disabledTooltip={"This column can't be edited directly"}
            >
                <ErrorBoundary>
                    {additionalColumn.builder({
                        entity,
                        context
                    })}
                </ErrorBoundary>
            </TableCell>
        );

    }, []);

    const allColumns: TableColumn<Entity<M>, any>[] = useMemo(() => Object.entries<Property>(resolvedCollection.properties)
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

                return ({
                    // renderKey: ({ columnIndex, rowData, dataKey }) => {
                    //     const entityId = (rowData as Entity<any>).id;
                    //     const selected = selectedCell?.columnIndex === columnIndex &&
                    //         selectedCell?.entity.id === entityId;
                    //     console.log("s", selectedCell, entityId, dataKey)
                    //     return `${entityId}_${dataKey}_${selected}`;
                    //     // return randomString();
                    // },
                    dataKey: key as string,
                    property,
                    align: getCellAlignment(property),
                    icon: (hoverOrOpen) => getIconForProperty(property, hoverOrOpen ? undefined : "disabled", "small"),
                    title: property.name || key as string,
                    sortable: true,
                    filter: buildFilterableFromProperty(property),
                    width: getPropertyColumnWidth(property),
                });
            }),
        [resolvedCollection.properties]);

    if (additionalColumns) {
        const items: TableColumn<Entity<M>, any>[] = additionalColumns.map((additionalColumn) =>
            ({
                renderKey: () => additionalColumn.id,
                dataKey: additionalColumn.id,
                type: "additional",
                align: "left",
                sortable: false,
                title: additionalColumn.name,
                width: additionalColumn.width ?? 200,
            }));
        allColumns.push(...items);
    }

    const idColumn: TableColumn<any, any> = useMemo(() => ({
        renderKey: () => "id",
        dataKey: "id",
        width: 160,
        title: "ID",
        frozen: largeLayout,
        headerAlign: "center",
    }), [largeLayout, size])

    const columns: TableColumn<any, any>[] = useMemo(() => [
        idColumn,
        ...displayedProperties
            .map((p) => {
                return allColumns.find(c => c.dataKey === p);
            }).filter(c => !!c) as TableColumn<Entity<M>, any>[]
    ], []);

    const customFieldValidator: CustomFieldValidator | undefined = uniqueFieldValidator;

    const popupFormField = (
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
            path={path}
            onCellValueChange={onValueChange}
            setPreventOutsideClick={setPreventOutsideClick}
        />
    );

    const cellRenderer = useCallback((props: CellRendererParams<any, any>) => {
        if (props.columnIndex === 0) {
            if (tableRowActionsBuilder)
                return tableRowActionsBuilder({ entity: props.rowData, size });
            else
                return <CollectionRowActions entity={props.rowData}
                                             size={size}/>;
        } else if (props.columnIndex < displayedProperties.length + 1) {
            return propertyCellRenderer(props);
        } else if (props.columnIndex < displayedProperties.length + (additionalColumns?.length ?? 0) + 1) {
            return additionalCellRenderer(props);
        } else {
            throw Error("Internal: columns not mapped properly");
        }
    }, [additionalCellRenderer, propertyCellRenderer])

    return (
        <EntityCollectionTableContext.Provider
            value={{
                collection,
                path,
                setPopupCell,
                select,
                onValueChange,
                inlineEditing,
                size,
                selectedCell,
                focused,
                additionalColumnsMap,
                columns,
                popupFormField,
                cellRenderer,
                filterIsSet,
                textSearchEnabled,
                filterCombinations,
                onTextSearch,
                clearFilter,
                updateSize,
                data,
                dataLoading,
                onRowClick,
                noMoreToLoad,
                onSizeChanged,
                loadNextPage,
                resetPagination,
                dataLoadingError,
                paginationEnabled,
                filterValues,
                setFilterValues,
                sortBy,
                setSortBy: setSortBy as any // todo
            }}
        >
            {children}
        </EntityCollectionTableContext.Provider>
    );

}

export function useColumnIds<M>(collection: ResolvedEntityCollection<M>, includeSubcollections: boolean): string[] {

    return useMemo(() => {
        const displayedProperties = getCollectionColumnIds(collection);

        const additionalColumns = collection.additionalColumns ?? [];
        const subCollections: EntityCollection[] = collection.subcollections ?? [];

        const columnIds: string[] = [
            ...displayedProperties,
            ...additionalColumns.map((column) => column.id)
        ];

        // let result: string[];
        // if (displayedProperties) {
        //     result = displayedProperties
        //         .map((p) => {
        //             return columnIds.find(id => id === p);
        //         }).filter(c => !!c) as string[];
        // } else {
        //     result = columnIds.filter((columnId) => !hiddenColumnIds.includes(columnId));
        // }

        if (includeSubcollections) {
            const subCollectionIds = subCollections
                .map((collection) => getSubcollectionColumnId(collection));
            columnIds.push(...subCollectionIds.filter((subColId) => !columnIds.includes(subColId)));
        }
        return columnIds;

    }, [collection, includeSubcollections]);
}

function getCollectionColumnIds(collection: ResolvedEntityCollection) {
    return Object.entries<Property>(collection.properties)
        .filter(([_, property]) => !property.hideFromCollection)
        .filter(([_, property]) => !(property.disabled && typeof property.disabled === "object" && property.disabled.hidden))
        .flatMap(([key, property]) => {
            if (property.dataType === "map" && property.spreadChildren && property.properties) {
                return Object.keys(property.properties).map(childKey => `${key}.${childKey}`);
            }
            return [key];
        })
}

export function checkInlineEditing<M>(inlineEditing: ((entity: Entity<any>) => boolean) | boolean, entity: Entity<M>) {
    if (typeof inlineEditing === "boolean") {
        return inlineEditing;
    } else if (typeof inlineEditing === "function") {
        return inlineEditing(entity);
    } else {
        return true;
    }
}

const buildFilterableFromProperty = (property: ResolvedProperty,
                                     isArray = false): TableColumnFilter | undefined => {

    if (property.dataType === "number" || property.dataType === "string") {
        const name = property.name;
        const enumValues = property.enumValues ? resolveEnumValues(property.enumValues) : undefined;
        return {
            dataType: property.dataType,
            isArray,
            title: name,
            enumValues
        };
    } else if (property.dataType === "array" && property.of) {
        if (Array.isArray(property.of)) {
            return undefined;
        }
        return buildFilterableFromProperty(property.of, true);
    } else if (property.dataType === "boolean") {
        const name = property.name;
        return {
            dataType: property.dataType,
            isArray,
            title: name
        };
    } else if (property.dataType === "date") {
        const title = property.name;
        return {
            dataType: property.dataType,
            isArray,
            title,
            dateMode: property.mode
        };
    }

    return undefined;

};
