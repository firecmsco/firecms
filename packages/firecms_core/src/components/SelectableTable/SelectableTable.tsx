import React, { useCallback, useEffect, useRef } from "react";
import equal from "react-fast-compare";
import {
    CollectionSize,
    Entity,
    EntityTableController,
    FilterValues,
    ResolvedProperty,
    SelectedCellProps
} from "../../types";
import { CellRendererParams, VirtualTable, VirtualTableColumn } from "../VirtualTable";
import { enumToObjectEntries } from "../../util";
import { OnCellValueChange, OnColumnResizeParams } from "../common";
import { FilterFormFieldProps } from "../VirtualTable/VirtualTableHeader";
import { ReferenceFilterField } from "./filters/ReferenceFilterField";
import { StringNumberFilterField } from "./filters/StringNumberFilterField";
import { BooleanFilterField } from "./filters/BooleanFilterField";
import { DateTimeFilterField } from "./filters/DateTimeFilterField";
import { useOutsideAlerter } from "@firecms/ui";
import { SelectableTableContext } from "./SelectableTableContext";
import { getRowHeight } from "../common/table_height";

export type SelectableTableProps<M extends Record<string, any>> = {

    /**
     * Callback when a cell value changes.
     */
    onValueChange?: OnCellValueChange<any, M>;

    columns: VirtualTableColumn[];

    cellRenderer: React.ComponentType<CellRendererParams<Entity<M>>>;

    /**
     * Builder for creating the buttons in each row
     * @param entity
     * @param size
     */
    tableRowActionsBuilder?: (params: {
        entity: Entity<M>,
        size: CollectionSize,
        width: number,
        frozen?: boolean
    }) => React.ReactNode;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(entity: Entity<M>): void;

    /**
     * Callback when a column is resized
     */
    onColumnResize?(params: OnColumnResizeParams): void;

    /**
     * Should apply a different style to a row when hovering
     */
    hoverRow?: boolean;

    /**
     * Controller holding the logic for the table
     * {@link useDataSourceEntityCollectionTableController}
     * {@link EntityTableController}
     */
    tableController: EntityTableController<M>;

    filterable?: boolean;

    sortable?: boolean;

    inlineEditing?: boolean;

    forceFilter?: FilterValues<keyof M extends string ? keyof M : never>;

    highlightedRow?: (data: Entity<M>) => boolean;

    size?: CollectionSize;

    emptyComponent?: React.ReactNode;

    endAdornment?: React.ReactNode;

    AddColumnComponent?: React.ComponentType;
}

/**
 * This component is in charge of rendering a collection table with a high
 * degree of customization.
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
 * check {@link EntityCollectionView}.
 *
 * The data displayed in the table is managed by a {@link EntityTableController}.
 * You can build the default, bound to a path in the datasource, by using the hook
 * {@link useDataSourceEntityCollectionTableController}
 *
 * @see EntityCollectionTableProps
 * @see EntityCollectionView
 * @see VirtualTable
 * @group Components
 */
export const SelectableTable = React.memo<SelectableTableProps<any>>(
    function SelectableTable<M extends Record<string, any>>
    ({
         onValueChange,
         cellRenderer,
         onEntityClick,
         onColumnResize,
         hoverRow = true,
         size = "m",
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
                 setSearchString,
                 clearFilter,
                 itemCount,
                 setItemCount,
                 pageSize = 50,
                 paginationEnabled,
                 checkFilterCombination,
                 setPopupCell
             },
         filterable = true,
         emptyComponent,
         columns,
         forceFilter,
         highlightedRow,
         endAdornment,
         AddColumnComponent
     }: SelectableTableProps<M>) {

        const ref = useRef<HTMLDivElement>(null);

        const [selectedCell, setSelectedCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);

        const loadNextPage = () => {
            if (!paginationEnabled || dataLoading || noMoreToLoad)
                return;
            if (itemCount !== undefined)
                setItemCount?.(itemCount + pageSize);
        };

        const resetPagination = useCallback(() => {
            setItemCount?.(pageSize);
        }, [pageSize]);

        const onRowClick = useCallback(({ rowData }: {
            rowData: Entity<M>
        }) => {
            if (inlineEditing)
                return;
            return onEntityClick && onEntityClick(rowData);
        }, [onEntityClick, inlineEditing]);

        useOutsideAlerter(ref,
            () => {
                if (selectedCell) {
                    unselect();
                }
            },
            Boolean(selectedCell));

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
        }, []);

        const unselect = useCallback(() => {
            setSelectedCell(undefined);
        }, []);

        const onFilterUpdate = useCallback((updatedFilterValues?: FilterValues<any>) => {
            setFilterValues?.({ ...updatedFilterValues, ...forceFilter } as FilterValues<any>);
        }, [forceFilter]);

        return (
            <SelectableTableContext.Provider
                value={{
                    setPopupCell: setPopupCell as ((cell?: SelectedCellProps<M>) => void),
                    select,
                    onValueChange,
                    size: size ?? "m",
                    selectedCell,
                }}
            >
                <div className="h-full w-full flex flex-col bg-white dark:bg-gray-950"
                     ref={ref}>

                    <VirtualTable
                        data={data}
                        columns={columns}
                        cellRenderer={cellRenderer}
                        onRowClick={inlineEditing ? undefined : (onEntityClick ? onRowClick : undefined)}
                        onEndReached={loadNextPage}
                        onResetPagination={resetPagination}
                        error={dataLoadingError}
                        paginationEnabled={paginationEnabled}
                        onColumnResize={onColumnResize}
                        rowHeight={getRowHeight(size)}
                        loading={dataLoading}
                        filter={filterValues}
                        onFilterUpdate={setFilterValues ? onFilterUpdate : undefined}
                        sortBy={sortBy}
                        onSortByUpdate={setSortBy as ((sortBy?: [string, "asc" | "desc"]) => void)}
                        hoverRow={hoverRow}
                        checkFilterCombination={checkFilterCombination}
                        createFilterField={filterable ? createFilterField : undefined}
                        rowClassName={useCallback((entity: Entity<M>) => {
                            return highlightedRow?.(entity) ? "bg-gray-100 bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75" : "";
                        }, [highlightedRow])}
                        className="flex-grow"
                        emptyComponent={emptyComponent}
                        endAdornment={endAdornment}
                        AddColumnComponent={AddColumnComponent}
                    />

                </div>
            </SelectableTableContext.Provider>
        );

    },
    equal
);

function createFilterField({
                               id,
                               filterValue,
                               setFilterValue,
                               column,
                               hidden,
                               setHidden
                           }: FilterFormFieldProps<{
    resolvedProperty: ResolvedProperty,
    disabled: boolean,
}>): React.ReactNode {

    if (!column.custom) {
        return null;
    }

    const { resolvedProperty } = column.custom;

    const isArray = resolvedProperty?.dataType === "array";
    const baseProperty: ResolvedProperty = isArray ? resolvedProperty.of : resolvedProperty;
    if (!baseProperty) {
        return null;
    }
    if (baseProperty.dataType === "reference") {
        return <ReferenceFilterField value={filterValue}
                                     setValue={setFilterValue}
                                     name={id as string}
                                     isArray={isArray}
                                     path={baseProperty.path}
                                     title={resolvedProperty?.name}
                                     previewProperties={baseProperty?.previewProperties}
                                     hidden={hidden}
                                     setHidden={setHidden}/>;
    } else if (baseProperty.dataType === "number" || baseProperty.dataType === "string") {
        const name = baseProperty.name;
        const enumValues = baseProperty.enumValues ? enumToObjectEntries(baseProperty.enumValues) : undefined;
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
        <div>{`Currently the filter field ${resolvedProperty.dataType} is not supported`}</div>
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
