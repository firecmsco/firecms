import React, { createRef, useCallback, useEffect, useState } from "react";

import { TableColumn, TableWhereFilterOp } from "./VirtualTableProps";
import { ErrorBoundary } from "../ErrorBoundary";
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
                                          onColumnResize,
                                          onColumnResizeEnd,
                                          createFilterField
                                      }: VirtualTableContextProps<any>) => {

    const columnRefs = columns.map(() => createRef<HTMLDivElement>());
    const [isResizing, setIsResizing] = useState(-1);

    const adjustWidthColumn = useCallback((index: number, width: number, end: boolean) => {
        const column = columns[index];
        const minWidth = 100;
        const maxWidth = 800;
        const newWidth = width > maxWidth ? maxWidth : (width < minWidth ? minWidth : width);
        const params = {
            width: newWidth,
            key: column.key as string,
            column: {
                ...column,
                width: newWidth
            } as TableColumn
        };
        if (!end)
            onColumnResize(params);
        else
            onColumnResizeEnd(params);
    }, [columns, onColumnResize, onColumnResizeEnd]);

    const getEventNewWidth = useCallback((e: MouseEvent) => {
        if (isResizing >= 0) {
            const left = columnRefs[isResizing].current?.parentElement?.getBoundingClientRect().left;
            if (!left) return;
            return e.clientX - left;
        }
        return undefined;
    }, [columnRefs, isResizing]);

    const setCursorDocument = useCallback((isResizing: boolean) => {
        document.body.style.cursor = isResizing ? "col-resize" : "auto";
    }, []);

    const handleOnMouseMove = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newWidth = getEventNewWidth(e);
        if (newWidth)
            adjustWidthColumn(isResizing, newWidth, false);
    }, [adjustWidthColumn, getEventNewWidth, isResizing]);

    const handleOnMouseUp = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newWidth = getEventNewWidth(e);
        if (newWidth)
            adjustWidthColumn(isResizing, newWidth, true);
        setIsResizing(-1);
        setCursorDocument(false);
    }, [adjustWidthColumn, getEventNewWidth, isResizing, setCursorDocument]);

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
            minWidth: "100%",
            backgroundColor: theme.palette.background.default,
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
                        column={column}
                        createFilterField={createFilterField}/>
                </ErrorBoundary>;
            })}
        </Box>
    );
};
