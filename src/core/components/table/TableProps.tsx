import React from "react";

/**
 * @see Table
 * @category Components
 */
export interface TableProps<T> {

    /**
     * Array of arbitrary data
     */
    data?: T[];

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed, you can filter
     */
    columns: TableColumn<T>[];

    /**
     * Builder function for the column id
     * @param props
     */
    idColumnBuilder: (props: {
        entry: T,
        size: TableSize,
    }) => React.ReactNode;

    /**
     * If enabled, content is loaded in batch
     */
    paginationEnabled: boolean;

    /**
     * Set this callback if you want to support some combinations
     * of
     * @param filterValues
     * @param sortBy
     */
    checkFilterCombination?: (filterValues: TableFilterValues<T>,
                              sortBy?: [string, "asc" | "desc"]) => boolean;

    /**
     * Is the id column frozen to the left.
     */
    frozenIdColumn?: boolean;

    /**
     * A callback function when scrolling the table to near the end
     */
    onEndReached?: () => void;

    /**
     * When the pagination should be reset. E.g. the filters or sorting
     * has been reset.
     */
    onResetPagination?: () => void;

    /**
     * Callback when a row is clicked
     */
    onRowClick?: (props: { rowData: T; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => void;

    /**
     * Callback when a column is resized
     */
    onColumnResize?: (params: OnTableColumnResizeParams<T>) => void;

    /**
     * Size of the table
     */
    size: TableSize,

    /**
     * In case this table should have some filters set by default
     */
    filter?: TableFilterValues<any>;

    /**
     * Callback used when filters are updated
     * @param filter
     */
    onFilterUpdate?: (filter?: TableFilterValues<any>) => void;

    /**
     * Default sort applied to this collection
     */
    sortBy?: [string, "asc" | "desc"];

    /**
     * Callback used when sorting is updated
     * @param sortBy
     */
    onSortByUpdate?: (sortBy?: [string, "asc" | "desc"]) => void;

    /**
     * If there is an error loading data you can pass it here so it gets
     * displayed instead of the content
     */
    error?: Error;

    /**
     * Message displayed when there is no data
     */
    emptyMessage?: string;

    /**
     * Is the table in a loading state
     */
    loading?: boolean;

    /**
     * Should apply a different style when hovering
     */
    hoverRow?: boolean;
}

/**
 * @see Table
 * @category Components
 */
export type TableColumnFilter = {
    dataType: "number" | "string" | "boolean" | "timestamp"
    isArray?: boolean;
    title?: string;
    enumValues?: TableEnumValues;
};


/**
 * @see Table
 * @category Components
 */
export interface TableColumn<T> {
    key: string;
    label: string;
    icon?: (hoverOrOpen: boolean) => React.ReactNode;
    align: "right" | "left" | "center";
    sortable: boolean;
    width: number;
    filter?: TableColumnFilter;
    cellRenderer: (props: {
        columns: TableColumn<T>[];
        column: TableColumn<T>;
        columnIndex: number;
        rowData: any;
        rowIndex: number;
        isScrolling?: boolean;
    }) => React.ReactNode;
}

/**
 * @see Table
 * @category Collection components
 */
export type OnTableColumnResizeParams<T> = { width: number, key: string, column: TableColumn<T> };


/**
 * @see Table
 * @category Components
 */
export type TableSize = "xs" | "s" | "m" | "l" | "xl";

/**
 * @see Table
 * @category Components
 */
export type TableEnumValues =
    Record<string | number, string>
    | Map<string | number, string>;

/**
 * @see Table
 * @category Components
 */
export type TableSort = "asc" | "desc" | undefined;

/**
 * @see Table
 * @category Components
 */
export type TableFilterValues<M> = { [K in keyof M]?: [TableWhereFilterOp, any] };

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', and 'array-contains-any'.
 * @see Table
 * @category Models
 */
export type TableWhereFilterOp =
    | "<"
    | "<="
    | "=="
    | "!="
    | ">="
    | ">"
    | "array-contains"
    | "in"
    | "array-contains-any";
