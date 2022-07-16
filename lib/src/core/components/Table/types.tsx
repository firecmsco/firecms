import {
    CellRendererParams,
    OnRowClickParams,
    OnTableColumnResizeParams,
    TableColumn,
    TableFilterValues,
    TableSize,
    TableWhereFilterOp
} from "./TableProps";

export type VirtualTableRowProps<T> = {
    style: any,
    size: TableSize,
    rowData: T;
    rowIndex: number;
    onRowClick?: (props: OnRowClickParams<any>) => void;
    children: JSX.Element[];
    columns: TableColumn<T, any>[];
    hoverRow?: boolean;
};

export type VirtualTableContextProps<T> = {
    data?: T[];
    size?: TableSize,
    columns: TableColumn<any, any>[];
    cellRenderer: (params: CellRendererParams<T, any>) => React.ReactNode;
    currentSort: "asc" | "desc" | undefined;
    filter?: TableFilterValues<any>;
    onRowClick?: (props: OnRowClickParams<any>) => void;
    onColumnSort: (key: string) => any;
    onColumnResize: (params: OnTableColumnResizeParams<any, any>) => void;
    onFilterUpdate: (column: TableColumn<any, any>, filterForProperty?: [TableWhereFilterOp, any]) => void;
    sortByProperty?: string;
    customView?: React.ReactNode,
    hoverRow: boolean;
};
