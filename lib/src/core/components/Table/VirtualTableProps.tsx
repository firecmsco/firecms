import React from "react";
import { EnumValueConfig, WhereFilterOp } from "../../../types";
import { FilterFormFieldProps } from "./VirtualTableHeader";

export type OnRowClickParams<T extends Record<string, any>> = { rowData: T; rowIndex: number; event: React.SyntheticEvent };

/**
 * @see Table
 * @category Components
 */
export interface VirtualTableProps<T extends Record<string, any>> {

    /**
     * Array of arbitrary data
     */
    data?: T[];

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed, you can filter
     */
    columns: TableColumn[];

    /**
     * Custom cell renderer
     * The renderer receives props `{ cellData, columns, column, columnIndex, rowData, rowIndex, container, isScrolling }`
     */
    cellRenderer: (params: CellRendererParams<T>) => React.ReactNode;

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
    onRowClick?: (props: OnRowClickParams<T>) => void;

    /**
     * Callback when a column is resized
     */
    onColumnResize?: (params: OnTableColumnResizeParams) => void;

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

    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;

}

/**
 * @see Table
 * @category Components
 */
export type TableColumnFilter<T> = {
    dataType: "number" | "string" | "boolean" | "date"
    isArray?: boolean;
    title?: string;
    dateMode?: "date" | "date_time";
    enumValues?: TableEnumValues;
};

export type CellRendererParams<T extends any> = {
    cellData?: any;
    column: TableColumn;
    columns: TableColumn[];
    columnIndex: number;
    rowData?: T;
    rowIndex: number;
    width: number;
    isScrolling?: boolean;
};

/**
 * @see Table
 * @category Components
 */
export interface TableColumn<CustomProps extends any = any> {

    /**
     * Data key for the cell value, could be "a.b.c"
     */
    key: string;

    /**
     * The width of the column, gutter width is not included
     */
    width: number;

    /**
     * Label displayed in the header
     */
    title?: string;

    /**
     * This column is frozen to the left
     */
    frozen?: boolean;

    /**
     * How is the
     */
    headerAlign?: "left" | "center" | "right";

    /**
     * Icon displayed in the header
     */
    icon?: (hoverOrOpen: boolean) => React.ReactNode;

    /**
     *
     */
    filter?: boolean;

    /**
     * Alignment of the column cell
     */

    align?: "left" | "right" | "center";

    /**
     * Whether the column is sortable, defaults to false
     */
    sortable?: boolean;

    /**
     * Can it be resized
     */
    resizable?: boolean;

    custom?: CustomProps;
}

/**
 * @see Table
 * @category Collection components
 */
export type OnTableColumnResizeParams = { width: number, key: string, column: TableColumn };

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
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', 'not-in', and 'array-contains-any'.
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
    | "not-in"
    | "array-contains-any";
