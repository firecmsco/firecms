import React from "react";
import {
    CellRendererParams,
    OnRowClickParams,
    OnVirtualTableColumnResizeParams,
    VirtualTableColumn,
    VirtualTableFilterValues,
    VirtualTableWhereFilterOp
} from "./VirtualTableProps.js";
import { FilterFormFieldProps } from "./VirtualTableHeader.js";

export type VirtualTableRowProps<T> = {
    style: any,
    rowHeight: number,
    rowData: T;
    rowIndex: number;
    onRowClick?: (props: OnRowClickParams<any>) => void;
    children: React.ReactNode[];
    columns: VirtualTableColumn[];
    hoverRow?: boolean;
    rowClassName?: (rowData: T) => string | undefined;
};

export type VirtualTableContextProps<T extends any> = {
    data?: T[];
    rowHeight?: number,
    columns: VirtualTableColumn[];
    cellRenderer: React.ComponentType<CellRendererParams<T>>;
    currentSort: "asc" | "desc" | undefined;
    filter?: VirtualTableFilterValues<any>;
    onRowClick?: (props: OnRowClickParams<any>) => void;
    onColumnSort: (key: string) => any;
    /** Called once a column's edge is let go; while it moves, only a custom property changes. */
    onColumnResizeEnd: (params: OnVirtualTableColumnResizeParams) => void;
    /** The table's root element, where the header writes the column custom properties. */
    rootRef: React.RefObject<HTMLDivElement | null>;
    onFilterUpdate: (column: VirtualTableColumn, filterForProperty?: [VirtualTableWhereFilterOp, any]) => void;
    sortByProperty?: string;
    customView?: React.ReactNode,
    hoverRow: boolean;
    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;
    rowClassName?: (rowData: T) => string | undefined;
    endAdornment?: React.ReactNode;
    AddColumnComponent?: React.ComponentType;
    onColumnsOrderChange?: (columns: VirtualTableColumn[]) => void;
    draggingColumnId?: string | null;
    headerIconSize?: "small" | "smallest";
};
