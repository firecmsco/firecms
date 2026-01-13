import React from "react";
import { WhereFilterOp } from "../../types";
import { FilterFormFieldProps } from "./VirtualTableHeader";

export type OnRowClickParams<T extends Record<string, any>> = {
    rowData: T;
    rowIndex: number;
    event: React.SyntheticEvent
};

/**
 * @see Table
 * @group Components
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
    columns: VirtualTableColumn[];

    /**
     * Custom cell renderer
     * The renderer receives props `{ cellData, columns, column, columnIndex, rowData, rowIndex, container, isScrolling }`
     */
    cellRenderer: React.ComponentType<CellRendererParams<T>>;

    /**
     * Set this callback if you want to support some combinations
     * of filter combinations only.
     * @param filterValues
     * @param sortBy
     */
    checkFilterCombination?: (filterValues: VirtualTableFilterValues<Extract<keyof T, string>>,
                              sortBy?: [string, "asc" | "desc"]) => boolean;

    /**
     * A callback function when scrolling the table to near the end
     */
    onEndReached?: () => void;

    /**
     * Offset in pixels where the onEndReached callback is triggered
     */
    endOffset?: number;

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
    onColumnResize?: (params: OnVirtualTableColumnResizeParams) => void;

    /**
     * Size of the table
     */
    rowHeight?: number,

    /**
     * In case this table should have some filters set by default
     */
    filter?: VirtualTableFilterValues<any>;

    /**
     * Callback used when filters are updated
     * @param filter
     */
    onFilterUpdate?: (filter?: VirtualTableFilterValues<any> | undefined) => void;

    /**
     * Callback when the table is scrolled
     * @param props
     */
    onScroll?: (props: {
        scrollDirection: "forward" | "backward",
        scrollOffset: number,
        scrollUpdateWasRequested: boolean
    }) => void;

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
    emptyComponent?: React.ReactNode;

    /**
     * Is the table in a loading state
     */
    loading?: boolean;

    /**
     * Should apply a different style when hovering
     */
    hoverRow?: boolean;

    /**
     * Apply a custom class name to the row
     * @param rowData
     */
    rowClassName?: (rowData: T) => string | undefined;

    /**
     * Callback to create a filter field, displayed in the header as a dropdown
     * @param props
     */
    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;

    /**
     * Class name applied to the table
     */
    className?: string;

    /**
     * Style applied to the table
     */
    style?: React.CSSProperties;

    /**
     * Component rendered at the end of the table, after scroll
     */
    endAdornment?: React.ReactNode;

    /**
     * If adding this callback, a button to add a new column is displayed.
     * @param column
     */
    AddColumnComponent?: React.ComponentType;

    /**
     * Initial scroll position
     */
    initialScroll?: number;

    /**
     * Callback when columns are reordered via drag-and-drop.
     * @param columns The new column order
     */
    onColumnsOrderChange?: (columns: VirtualTableColumn[]) => void;

}

export type CellRendererParams<T = any> = {
    column: VirtualTableColumn;
    columns: VirtualTableColumn[];
    columnIndex: number;
    rowData?: T;
    rowIndex: number;
    width: number;
    isScrolling?: boolean;
};

/**
 * @see Table
 * @group Components
 */
export interface VirtualTableColumn<CustomProps = any> {

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
    icon?: React.ReactNode;

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

    /**
     * Custom props passed to the cell renderer
     */
    custom?: CustomProps;

    /**
     * Additional children to be rendered in the header when hovering
     */
    AdditionalHeaderWidget?: (props: { onHover: boolean }) => React.ReactNode;
}

/**
 * @see Table
 * @group Collection components
 */
export type OnVirtualTableColumnResizeParams = {
    width: number,
    key: string,
    column: VirtualTableColumn
};

/**
 * @see Table
 * @group Components
 */
export type VirtualTableSort = "asc" | "desc" | undefined;

/**
 * @see Table
 * @group Components
 */
export type VirtualTableFilterValues<Key extends string> = Partial<Record<Key, [WhereFilterOp, any]>>;

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings `<`, `<=`, `==`, `>=`, `>`, `array-contains`, `in`, and `array-contains-any`.
 * @see Table
 * @group Models
 */
export type VirtualTableWhereFilterOp =
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
