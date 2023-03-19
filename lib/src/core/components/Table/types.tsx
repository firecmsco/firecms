import {
    CellRendererParams,
    OnRowClickParams,
    OnTableColumnResizeParams,
    TableColumn,
    TableFilterValues,
    TableSize,
    TableWhereFilterOp
} from "./VirtualTableProps";
import { FilterFormFieldProps } from "./VirtualTableHeader";

export type VirtualTableRowProps<T> = {
    style: any,
    size: TableSize,
    rowData: T;
    rowIndex: number;
    onRowClick?: (props: OnRowClickParams<any>) => void;
    children: React.ReactNode[];
    columns: TableColumn[];
    hoverRow?: boolean;
};

export type VirtualTableContextProps<T extends any> = {
    data?: T[];
    size?: TableSize,
    columns: TableColumn[];
    cellRenderer: (params: CellRendererParams<T>) => React.ReactNode;
    currentSort: "asc" | "desc" | undefined;
    filter?: TableFilterValues<any>;
    onRowClick?: (props: OnRowClickParams<any>) => void;
    onColumnSort: (key: string) => any;
    onColumnResize: (params: OnTableColumnResizeParams) => void;
    onColumnResizeEnd: (params: OnTableColumnResizeParams) => void;
    onFilterUpdate: (column: TableColumn, filterForProperty?: [TableWhereFilterOp, any]) => void;
    sortByProperty?: string;
    customView?: React.ReactNode,
    hoverRow: boolean;
    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;
};
