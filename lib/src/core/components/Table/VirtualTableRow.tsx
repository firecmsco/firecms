import React, { useCallback, useState } from "react";

import equal from "react-fast-compare"

import { Box, darken, lighten } from "@mui/material";

import { getRowHeight } from "./common";
import { VirtualTableRowProps } from "./types";

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

        const [onHover, setOnHover] = useState(false);

        const onClick = useCallback((event: React.SyntheticEvent) => onRowClick
            ? onRowClick({
                rowData,
                rowIndex,
                event
            })
            : undefined, [onRowClick, rowData, rowIndex]);

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        return (
            <Box
                component={"div"}
                onClick={onClick}
                style={{ ...(style), width: "fit-content" }}
                onMouseEnter={setOnHoverTrue}
                onMouseMove={setOnHoverTrue}
                onMouseLeave={setOnHoverFalse}
                sx={theme => ({
                    display: "flex",
                    minWidth: "100%",
                    height: getRowHeight(size),
                    cursor: onRowClick ? "pointer" : undefined,
                    flexDirection: "row",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid rgba(128, 128, 128, 0.1)",
                    backgroundColor: hoverRow && onHover
                        ? (theme.palette.mode === "dark"
                            ? lighten(theme.palette.background.paper, 0.01)
                            : "rgb(252, 252, 253)") //darken(theme.palette.background.default, 0.005))
                        : undefined
                })}>

                {children}

            </Box>
        );
    },
    equal
);
