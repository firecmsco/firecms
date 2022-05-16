import React from "react";
import { ColumnShape } from "react-base-table";
import { EnumValueConfig, WhereFilterOp } from "../../../models";

/**
 * @see Table
 * @category Components
 */
export interface TableProps<T extends object> {

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
    paginationEnabled?: boolean;

    /**
     * Set this callback if you want to support some combinations
     * of filter combinations only.
     * @param filterValues
     * @param sortBy
     */
    checkFilterCombination?: (filterValues: TableFilterValues<Extract<keyof T, string>>,
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
    size?: TableSize,

    /**
     * In case this table should have some filters set by default
     */
    filter?: TableFilterValues<any>;

    /**
     * Callback used when filters are updated
     * @param filter
     */
    onFilterUpdate?: (filter?: TableFilterValues<any> | undefined) => void;

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
     * If there is an error loading data you can pass it here, so it gets
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
    dataType: "number" | "string" | "boolean" | "date"
    isArray?: boolean;
    title?: string;
    dateMode?: "date" | "date_time";
    enumValues?: TableEnumValues;
};

/**
 * @see Table
 * @category Components
 */
export interface TableColumn<T extends any> {

    label?: string;

    icon?: (hoverOrOpen: boolean) => React.ReactNode;

    /**
     *
     */
    filter?: TableColumnFilter;

    /**
     * Data key for the cell value, could be "a.b.c"
     */
    key: string;

    /**
     * Alignment of the column cell
     */
    align?: "left" | "right" | "center";
    /**
     * The width of the column, gutter width is not included
     */
    width: number;
    /**
     * Whether the column is sortable, defaults to false
     */
    sortable?: boolean;
    /**
     * Custom column cell renderer
     * The renderer receives props `{ cellData, columns, column, columnIndex, rowData, rowIndex, container, isScrolling }`
     */
    cellRenderer: (params: {
        cellData: any;
        columns: ColumnShape<T>[];
        column: ColumnShape<T>;
        columnIndex: number;
        rowData: T;
        rowIndex: number;
        container: any;
        isScrolling?: boolean;
    }) => React.ReactNode;

    // [key: string]: any;
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
export type TableEnumValues = EnumValueConfig[];

/**
 * @see Table
 * @category Components
 */
export type TableSort = "asc" | "desc" | undefined;

/**
 * @see Table
 * @category Components
 */
export type TableFilterValues<Key extends string> = Partial<Record<Key, [WhereFilterOp, any]>>;

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
