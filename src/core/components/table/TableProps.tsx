import React from "react";
import { CollectionSize, EnumValues, FilterValues } from "../../../models";

export type TableColumnFilter = {
    dataType: "number" | "string" | "boolean" | "timestamp"
    isArray?: boolean;
    title?: string;
    enumValues?: EnumValues;
};

export interface TableColumn {
    id: string;
    label: string;
    icon?: (hoverOrOpen: boolean) => React.ReactNode;
    align: "right" | "left" | "center";
    sortable: boolean;
    width: number;
    filter?:TableColumnFilter;
    cellRenderer: ({
                       column,
                       columnIndex,
                       rowData,
                       rowIndex
                   }: any) => React.ReactNode;
}

/**
 * @category Collection components
 */
export type OnTableColumnResizeParams = { width: number, key: string, type: "property" | "additional" };

/**
 * @category Collection components
 */
export interface TableProps<T> {

    data?: T[];

    onEndReached?: () => void;

    onResetPagination?: () => void;

    idColumnBuilder: (props: {
        entry: T,
        size: CollectionSize,
    }) => React.ReactNode;

    /**
     * If enabled, content is loaded in batch
     */
    paginationEnabled: boolean;

    checkFilterCombination?: (filterValues: FilterValues<any>,
                              sortBy?: [string, "asc" | "desc"]) => boolean;

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed, you can filter
     */
    columns: TableColumn[];

    /**
     * Is the id column frozen to the left.
     */
    frozenIdColumn?: boolean;

    /**
     * Callback when anywhere on the table is clicked
     */
    onRowClick?: (entry: T) => void;

    /**
     * Callback when a column is resized
     */
    onColumnResize?: (params: OnTableColumnResizeParams) => void;

    /**
     * Size of the table
     */
    size: CollectionSize,

    /**
     * In case this table should have some filters set by default
     */
    filter?: FilterValues<any>;

    /**
     * Callback used when filters are updated
     * @param filter
     */
    onFilterUpdate?: (filter?: FilterValues<any>) => void;

    /**
     * Default sort applied to this collection
     */
    sortBy?: [string, "asc" | "desc"];
    /**
     * Callback used when sorting is updated
     * @param sortBy
     */
    onSortByUpdate?: (sortBy?: [string, "asc" | "desc"]) => void;

    error?: Error;

    emptyMessage?: string;

    loading?: boolean;
}
