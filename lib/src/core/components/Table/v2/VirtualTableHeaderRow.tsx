import React, { createRef, useCallback, useEffect, useState } from "react";

import { TableColumn, TableWhereFilterOp } from "../TableProps";
import { ErrorBoundary } from "../../ErrorBoundary";
import { VirtualTableHeader } from "./VirtualTableHeader";
import { VirtualTableContextProps } from "./types";
import { Box } from "@mui/material";

export const VirtualTableHeaderRow = ({
                       columns,
                       currentSort,
                       onColumnSort,
                       onFilterUpdate,
                       sortByProperty,
                       filter,
                       onColumnResize
                   }: VirtualTableContextProps<any>) => {

    const columnRefs = columns.map(() => createRef<HTMLDivElement>());
    const [isResizing, setIsResizing] = useState(-1);

    const adjustWidthColumn = useCallback((index: number, width: number) => {
        const column = columns[index];
        const minWidth = 100;
        const maxWidth = 800;
        const newWidth = width > maxWidth ? maxWidth : (width < minWidth ? minWidth : width);
        onColumnResize({
            width: newWidth,
            key: column.key as string,
            column: { ...column, width: newWidth } as TableColumn<any, any>
        });
    }, [columns, onColumnResize]);

    const handleOnMouseMove = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isResizing >= 0) {
            const left = columnRefs[isResizing].current?.parentElement?.getBoundingClientRect().left;
            if (!left) return;
            const newWidth = e.clientX - left;
            adjustWidthColumn(isResizing, newWidth);
        }
    }, [adjustWidthColumn, columnRefs, isResizing]);

    const setCursorDocument = useCallback((isResizing: boolean) => {
        document.body.style.cursor = isResizing ? "col-resize" : "auto";
    }, []);

    const handleOnMouseUp = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(-1);
        setCursorDocument(false);
    }, [setCursorDocument]);

    const removeResizingListeners = useCallback(() => {
        document.removeEventListener("mousemove", handleOnMouseMove);
        document.removeEventListener("mouseup", handleOnMouseUp);
    }, [handleOnMouseMove, handleOnMouseUp]);

    const attachResizeListeners = useCallback(() => {
        document.addEventListener("mousemove", handleOnMouseMove);
        document.addEventListener("mouseup", handleOnMouseUp);
    }, [handleOnMouseMove, handleOnMouseUp]);

    useEffect(() => {
        if (isResizing >= 0) {
            attachResizeListeners();
        } else {
            removeResizingListeners();
        }
        return () => {
            removeResizingListeners();
        };
    }, [attachResizeListeners, isResizing, removeResizingListeners]);

    const onClickResizeColumn = useCallback((index: number) => {
        setIsResizing(index);
        setCursorDocument(true);
    }, [setCursorDocument]);

    return (
        <Box sx={theme => ({
            position: "sticky",
            display: "flex",
            width: "fit-content",
            flexDirection: "row",
            top: 0,
            left: 0,
            zIndex: 2,
            height: 50,
            borderBottom: `1px solid ${theme.palette.divider}`
        })}>
            {columns.map((c, columnIndex) => {
                const column = columns[columnIndex];

                const filterForThisProperty: [TableWhereFilterOp, any] | undefined =
                    column && filter && filter[column.key]
                        ? filter[column.key]
                        : undefined;
                return <ErrorBoundary key={"header_" + column.key}>
                    <VirtualTableHeader
                        resizeHandleRef={columnRefs[columnIndex]}
                        columnIndex={columnIndex}
                        isResizingIndex={isResizing}
                        onFilterUpdate={onFilterUpdate}
                        filter={filterForThisProperty}
                        sort={sortByProperty === column.key ? currentSort : undefined}
                        onColumnSort={onColumnSort}
                        onClickResizeColumn={onClickResizeColumn}
                        column={column}/>
                </ErrorBoundary>;
            })}
        </Box>
    );
};
