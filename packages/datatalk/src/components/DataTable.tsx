import React, { useMemo } from "react";
import { CellRendererParams, VirtualTable, VirtualTableColumn } from "@firecms/core";
import { getIn } from "@firecms/formex";
import { DataTableCell } from "./DataTableCell";
import { FileDownloadIcon, IconButton, Paper, Typography } from "@firecms/ui";
import { downloadDataAsCsv } from "@firecms/data_export";

export type type = "string" | "number" | "date" | "object" | "array";

export type TableColumn = {
    key: string,
    name: string,
    width?: number,
    type?: type
};

export type DataTableProps = {
    data?: object[];
    maxWidth?: number;
    onEndReached?: () => void;
    onColumnResize?: (params: { key: string, width: number }) => void;
    loading?: boolean;
}

export function DataTable({
                              data,
                              onColumnResize,
                              maxWidth,
                              onEndReached,
                              loading
                          }: DataTableProps) {

    const columns = useMemo(() => extractColumns(data ?? []), [data]);

    function cellRenderer({
                              columns,
                              column,
                              columnIndex,
                              rowData,
                              rowIndex,
                              isScrolling
                          }: CellRendererParams) {

        const entry = getIn(rowData, column.key);
        const string = entry ? entry.toString() : "";
        return <DataTableCell
            align={column.align}
            width={column.width}>
            {string}
        </DataTableCell>;
    }

    const tableColumns: VirtualTableColumn[] = columns.map(col => {
        return {
            key: col.key,
            title: col.name,
            width: col.width ?? getColumnWidth(col.type),
            resizable: true,
        };
    });

    return (
        <Paper>
            <div
                className="rounded-xs bg-surface-50 dark:bg-surface-900 flex flex-row justify-between items-center px-4 py-2 h-14">
                <Typography variant="label" className="flex-1">Data</Typography>
                <IconButton
                    disabled={!data}
                    onClick={() => data && downloadDataAsCsv(data, "export")}>
                    <FileDownloadIcon/>
                </IconButton>
            </div>
            <div className="flex h-[360px] w-full flex-col bg-white dark:bg-surface-950"
                 style={{
                     maxWidth
                 }}>

                <VirtualTable
                    loading={loading}
                    data={data}
                    rowHeight={48}
                    columns={tableColumns}
                    cellRenderer={cellRenderer}
                    onColumnResize={onColumnResize}
                    onEndReached={onEndReached}
                    endOffset={1600}
                />

            </div>

        </Paper>
    );

};

function getColumnWidth(type?: type) {
    switch (type) {
        case "object":
            return 300;
        case "string":
            return 300;
        case "number":
            return 180;
        case "date":
            return 240;
        case "array":
            return 240;
        default:
            return 200;
    }
}

function extractColumns(newData: object[]): TableColumn[] {
    if (!newData || newData.length === 0) {
        return [];
    }

    const sampleSize = Math.min(newData.length, 10);
    const sampleData = newData.slice(0, sampleSize);

    const columns = Object.keys(sampleData[0]).map((key) => {
        const sampleValues = sampleData.map((row) => (row as any)[key]);
        const type = determinetype(sampleValues);

        return {
            key,
            name: key,
            type
        };
    });

    return columns;
}

function determinetype(values: any[]): type {
    const typeCounts: { [key in type]?: number } = {};

    values.forEach((value) => {
        let type: type;

        if (typeof value === "string") {
            // Check if the string is a date
            if (!isNaN(Date.parse(value))) {
                type = "date";
            } else {
                type = "string";
            }
        } else if (typeof value === "number") {
            type = "number";
        } else if (Array.isArray(value)) {
            type = "array";
        } else if (typeof value === "object" && value !== null) {
            type = "object";
        } else {
            type = "string";
        }

        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Find the most frequent type
    const mostFrequentType = Object.keys(typeCounts).reduce((a, b) =>
        typeCounts[a as type]! > typeCounts[b as type]! ? a : b
    );

    return mostFrequentType as type;
}
