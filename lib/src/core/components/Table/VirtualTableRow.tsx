import React, { useCallback } from "react";

import equal from "react-fast-compare"

import { getRowHeight } from "./common";
import { VirtualTableRowProps } from "./types";
import clsx from "clsx";

export const VirtualTableRow = React.memo<VirtualTableRowProps<any>>(
    function VirtualTableRow<T>({
                                    rowData,
                                    rowIndex,
                                    children,
                                    onRowClick,
                                    size,
                                    style,
                                    hoverRow
                                }: VirtualTableRowProps<T>) {

        const onClick = useCallback((event: React.SyntheticEvent) => onRowClick
            ? onRowClick({
                rowData,
                rowIndex,
                event
            })
            : undefined, [onRowClick, rowData, rowIndex]);


        return (
            <div
                className={clsx(
                    "flex min-w-full text-sm border-b border-gray-200 dark:border-gray-800 border-opacity-40 dark:border-opacity-40",
                    {
                        "hover:bg-opacity-95": hoverRow,
                        "cursor-pointer": onRowClick
                    }
                )}
                onClick={onClick}
                style={{
                    ...(style),
                    height: getRowHeight(size),
                    width: "fit-content"
                }}
                // onMouseEnter={setOnHoverTrue}
                // onMouseMove={setOnHoverTrue}
                // onMouseLeave={setOnHoverFalse}
            >
                {children}
            </div>
        );

    },
    equal
);
