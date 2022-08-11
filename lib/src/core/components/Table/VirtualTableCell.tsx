import React from "react";

import equal from "react-fast-compare"

import { CellRendererParams, TableColumn } from "./VirtualTableProps";

type VirtualTableCellProps<T, E> = {
    dataKey: string;
    column: TableColumn<T, E>;
    rowData: any;
    cellData: any;
    rowIndex: any;
    columnIndex: number;
    cellRenderer: (params: CellRendererParams<T, E>) => React.ReactNode;
};

export const VirtualTableCell = React.memo<VirtualTableCellProps<any, any>>(
    function VirtualTableCell<T, E>(props: VirtualTableCellProps<T, E>) {
        return props.rowData && props.cellRenderer(
            {
                cellData: props.cellData,
                rowData: props.rowData as any,
                rowIndex: props.rowIndex,
                isScrolling: false,
                column: props.column,
                columnIndex: props.columnIndex,
                width: props.column.width
            }
        );
    },
    (a, b) => {
        return equal(a, b);
    }
);
