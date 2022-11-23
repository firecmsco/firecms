import React from "react";

import equal from "react-fast-compare"

import { CellRendererParams, TableColumn } from "./VirtualTableProps";

type VirtualTableCellProps<T extends any> = {
    dataKey: string;
    column: TableColumn;
    columns: TableColumn[];
    rowData: any;
    cellData: any;
    rowIndex: any;
    columnIndex: number;
    cellRenderer: (params: CellRendererParams<T>) => React.ReactNode;
};

export const VirtualTableCell = React.memo<VirtualTableCellProps<any>>(
    function VirtualTableCell<T extends any>(props: VirtualTableCellProps<T>) {
        return props.rowData && props.cellRenderer(
            {
                cellData: props.cellData,
                rowData: props.rowData,
                rowIndex: props.rowIndex,
                isScrolling: false,
                column: props.column,
                columns: props.columns,
                columnIndex: props.columnIndex,
                width: props.column.width
            } as CellRendererParams<T>
        );
    },
    (a, b) => {
        return equal(a, b);
    }
);
