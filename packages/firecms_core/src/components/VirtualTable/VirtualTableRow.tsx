import React, { useCallback } from "react";

import { VirtualTableRowProps } from "./types.js";
import { cls } from "@firecms/ui";

/**
 * Not memoised itself: `VirtualTableRowRenderer` (in `VirtualTable`) decides
 * when a row is drawn again, from the inputs its cells are built from. A memo
 * here could only compare the `children` it is handed, and those are new
 * elements every time the list draws the row: it deep-compared every cell
 * element and the full `columns` array each one carries, on every scroll
 * frame, for every row on screen.
 */
export function VirtualTableRow<T>({
    rowData,
    rowIndex,
    children,
    onRowClick,
    rowHeight,
    style,
    hoverRow,
    rowClassName
}: VirtualTableRowProps<T>) {

    const onClick = useCallback((event: React.SyntheticEvent) => {
        if (onRowClick)
            onRowClick({
                rowData,
                rowIndex,
                event
            })
    }, [onRowClick, rowData, rowIndex]);

    return (
        <div
            className={cls(
                "flex min-w-full text-sm border-b border-surface-200 dark:border-surface-800 border-opacity-40 border-surface-200/40 dark:border-opacity-40 dark:border-surface-800/40",
                rowClassName ? rowClassName(rowData) : "",
                {
                    "hover:bg-opacity-95": hoverRow,
                    "cursor-pointer": onRowClick
                }
            )}
            onClick={onClick}
            style={{
                ...(style),
                height: rowHeight,
                width: "fit-content"
            }}
        >
            {children}
        </div>
    );
}
