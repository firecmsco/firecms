import React from "react";

import { deepEqual as equal } from "fast-equals"

import { CellRendererParams, VirtualTableColumn } from "./VirtualTableProps";

type VirtualTableCellProps<T extends any> = {
    dataKey: string;
    column: VirtualTableColumn;
    columns: VirtualTableColumn[];
    rowData: any;
    cellData: any;
    rowIndex: any;
    columnIndex: number;
    cellRenderer: React.ComponentType<CellRendererParams<T>>;
    // Sortable props
    sortableNodeRef?: (node: HTMLElement | null) => void;
    sortableStyle?: React.CSSProperties;
    sortableAttributes?: Record<string, any>;
    isDragging?: boolean;
    isDraggable?: boolean;
    frozen?: boolean;
};

export const VirtualTableCell = React.memo<VirtualTableCellProps<any>>(
    function VirtualTableCell<T>(props: VirtualTableCellProps<T>) {
        // @ts-ignore
        return props.rowData && props.cellRenderer(
            {
                cellData: props.cellData,
                rowData: props.rowData,
                rowIndex: props.rowIndex,
                isScrolling: false,
                column: props.column,
                columns: props.columns,
                columnIndex: props.columnIndex,
                width: props.column.width,
                sortableNodeRef: props.sortableNodeRef,
                sortableStyle: props.sortableStyle,
                sortableAttributes: props.sortableAttributes,
                isDragging: props.isDragging,
                isDraggable: props.isDraggable,
                frozen: props.frozen
            } as CellRendererParams<T>
        );
    },
    (a, b) => {
        return equal(a.rowData, b.rowData) &&
            equal(a.column, b.column) &&
            equal(a.cellData, b.cellData) &&
            equal(a.rowIndex, b.rowIndex) &&
            equal(a.cellRenderer, b.cellRenderer) &&
            equal(a.columnIndex, b.columnIndex) &&
            a.isDragging === b.isDragging &&
            a.isDraggable === b.isDraggable &&
            a.frozen === b.frozen
    }
);
