import React, {
    createContext,
    forwardRef,
    useCallback,
    useEffect,
    useRef
} from "react";

import equal from "react-fast-compare"

import { Box, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

// @ts-ignore
import { FixedSizeList as List } from "react-window";
// @ts-ignore
import AutoSizer from "react-virtualized-auto-sizer";

import { ErrorBoundary } from "../ErrorBoundary";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { TableHeader } from "./TableHeader";
import {
    CellRendererParams,
    OnTableColumnResizeParams,
    TableColumn,
    TableFilterValues,
    TableProps,
    TableSize,
    TableWhereFilterOp
} from "./TableProps";

import { getRowHeight } from "./common";

const VirtualListContext = createContext<VirtualTableContextProps>({} as any);
VirtualListContext.displayName = "VirtualListContext";

type VirtualTableRowProps = { style: any, size: TableSize, children: JSX.Element[] };

export const VirtualTableRow = React.memo<VirtualTableRowProps>(
    function VirtualTableRow({
                                 children,
                                 size,
                                 style
                             }: VirtualTableRowProps) {
        return <Box
            component={"div"}
            style={{ ...(style), width: "fit-content" }}
            sx={theme => ({
                display: "flex",
                height: getRowHeight(size),
                flexDirection: "row",
                fontSize: "0.875rem",
                backgroundColor: theme.palette.background.paper,
                borderBottom: "1px solid rgba(128, 128, 128, 0.1)"
            })}>

            {children}

        </Box>;
    },
    (a, b) => a.size === b.size
);

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

const HeaderRow = ({
                       columns,
                       currentSort,
                       onColumnSort,
                       onInternalFilterUpdate,
                       sortByProperty,
                       filter,
                       onColumnResize
                   }: VirtualTableContextProps) => {

    const headerRenderer = useCallback(({ columnIndex }: { columnIndex: number }) => {
        const column = columns[columnIndex];

        const filterForThisProperty: [TableWhereFilterOp, any] | undefined =
            column && filter && filter[column.key]
                ? filter[column.key]
                : undefined;

        return (
            <ErrorBoundary key={"header_" + column.key}>
                <TableHeader
                    onFilterUpdate={(value) => onInternalFilterUpdate(column, value)}
                    onColumnResize={(width) => {
                        if (onColumnResize) {
                            onColumnResize({
                                width,
                                key: column.key as string,
                                column: column as TableColumn<any, any>
                            });
                        }
                    }}
                    filter={filterForThisProperty}
                    sort={sortByProperty === column.key ? currentSort : undefined}
                    onColumnSort={onColumnSort}
                    column={column}/>
            </ErrorBoundary>
        );
    }, [columns, currentSort, onColumnSort, onInternalFilterUpdate, sortByProperty, filter]);

    return (
        <div style={{
            position: "sticky",
            display: "flex",
            width: "fit-content",
            flexDirection: "row",
            top: 0,
            left: 0,
            // width: "100%",
            zIndex: 2,
            height: 50,
            borderBottom: "1px solid rgba(128, 128, 128, 0.1)"
        }}>
            {columns.map((c, columnIndex) => headerRenderer({ columnIndex }))}
        </div>
    );
};

type VirtualTableContextProps = {
    columns: TableColumn<any, any>[];
    currentSort: "asc" | "desc" | undefined;
    filter?: TableFilterValues<any>;
    onColumnSort: (key: string) => any;
    onColumnResize?: (params: OnTableColumnResizeParams<any, any>) => void;
    onInternalFilterUpdate: (column: TableColumn<any, any>, filterForProperty?: [TableWhereFilterOp, any]) => void;
    sortByProperty?: string;
};

// eslint-disable-next-line react/display-name
const innerElementType = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({
                                                                                        children,
                                                                                        ...rest
                                                                                    }: { children: React.ReactNode }, ref) => {

    return (
        <VirtualListContext.Consumer>
            {(virtualTableProps) => (
                <div ref={ref} {...rest}>
                    <HeaderRow {...virtualTableProps}/>
                    {children}
                </div>
            )}
        </VirtualListContext.Consumer>
    );
});

/**
 * This is a Table component that allows displaying arbitrary data, not
 * necessarily related to entities or properties. It is the component
 * that powers the entity collections but has a generic API, so it
 * can be reused.
 *
 * If you have an entity collection defined, you probably want to use
 * {@link EntityCollectionTable} or {@link EntityCollectionView}
 *
 * @see CollectionTable
 * @see EntityCollectionView
 * @category Components
 */

export const VirtualTable = React.memo<TableProps<any, any>>(
    function VirtualTable<T extends object, E extends any>({
                                                               data,
                                                               onResetPagination,
                                                               onEndReached,
                                                               size = "m",
                                                               columns,
                                                               onRowClick,
                                                               onColumnResize,
                                                               filter: filterInput,
                                                               checkFilterCombination,
                                                               onFilterUpdate,
                                                                  sortBy,
                                                                  error,
                                                                  emptyMessage,
                                                                  onSortByUpdate,
                                                                  loading,
                                                                  cellRenderer,
                                                                  hoverRow = true
                                                              }: TableProps<T, E>) {

    const sortByProperty: string | undefined = sortBy ? sortBy[0] : undefined;
    const currentSort: "asc" | "desc" | undefined = sortBy ? sortBy[1] : undefined;

        // const [ref, bounds] = useMeasure();

        const tableRef = useRef<any>(null);

    // saving the current filter as a ref as a workaround for header closure
    const filterRef = useRef<TableFilterValues<any> | undefined>();

    // these refs are a workaround to prevent the scroll jump caused by Firestore
    // firing listeners with incomplete data
    const scrollRef = useRef<number>(0);
    const endReachedTimestampRef = useRef<number>(0);

    useEffect(() => {
        if (tableRef.current && data?.length) {
            tableRef.current.scrollToTop(scrollRef.current);
        }
    }, [data?.length]);

    useEffect(() => {
        filterRef.current = filterInput;
    }, [filterInput]);

    const onColumnSort = useCallback((key: string) => {

        const isDesc = sortByProperty === key && currentSort === "desc";
        const isAsc = sortByProperty === key && currentSort === "asc";
        const newSort = isAsc ? "desc" : (isDesc ? undefined : "asc");
        const newSortProperty: string | undefined = isDesc ? undefined : key;

        const filter = filterRef.current;

        const newSortBy: [string, "asc" | "desc"] | undefined = newSort && newSortProperty ? [newSortProperty, newSort] : undefined;
        if (filter) {
            if (checkFilterCombination && !checkFilterCombination(filter, newSortBy)) {
                if (onFilterUpdate)
                    onFilterUpdate(undefined);
            }
        }

        if (onResetPagination) {
            onResetPagination();
        }

        if (onSortByUpdate) {
            onSortByUpdate(newSortBy);
        }

        scrollToTop();
    }, [checkFilterCombination, currentSort, onFilterUpdate, onResetPagination, onSortByUpdate, sortByProperty]);

    const resetSort = useCallback(() => {
        if (onSortByUpdate)
            onSortByUpdate(undefined);
    }, [onSortByUpdate]);

        const scrollToTop = useCallback(() => {
            if (tableRef.current) {
                scrollRef.current = 0;
                tableRef.current.scrollTo(0);
            }
        }, []);

        const onScroll = useCallback(({
                                          scrollOffset,
                                          scrollUpdateWasRequested
                                      }: {
            scrollDirection: "forward" | "backward",
            scrollOffset: number,
            scrollUpdateWasRequested: boolean;
        }) => {
            const prudentTime = Date.now() - endReachedTimestampRef.current > 3000;
            if (!scrollUpdateWasRequested && prudentTime) {
                scrollRef.current = scrollOffset;
            }
        }, []);

        const onEndReachedInternal = useCallback(() => {
            endReachedTimestampRef.current = Date.now();
        if (onEndReached)
            onEndReached();
    }, [onEndReached]);

    const clickRow = useCallback((props: { rowData: T; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => {
        if (!onRowClick)
            return;
        onRowClick(props);
    }, [onRowClick]);

    const onInternalFilterUpdate = useCallback((column: TableColumn<T, E>, filterForProperty?: [TableWhereFilterOp, any]) => {

        const filter = filterRef.current;
        let newFilterValue: TableFilterValues<any> = filter ? { ...filter } : {};

        if (!filterForProperty) {
            delete newFilterValue[column.key];
        } else {
            newFilterValue[column.key] = filterForProperty;
        }
        const newSortBy: [string, "asc" | "desc"] | undefined = sortByProperty && currentSort ? [sortByProperty, currentSort] : undefined;
        const isNewFilterCombinationValid = !checkFilterCombination || checkFilterCombination(newFilterValue, newSortBy);
        if (!isNewFilterCombinationValid) {
            newFilterValue = filterForProperty ? { [column.key]: filterForProperty } as TableFilterValues<Extract<keyof T, string>> : {};
        }

        if (onFilterUpdate) onFilterUpdate(newFilterValue);

        if (column.key !== sortByProperty) {
            resetSort();
        }
    }, [checkFilterCombination, currentSort, onFilterUpdate, resetSort, sortByProperty]);

        const buildErrorView = useCallback(() => (
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}>

                <Typography variant={"h6"}>
                    {"Error fetching data from the data source"}
                </Typography>

                {error?.message && <Typography>
                    {error?.message}
                </Typography>}

            </Box>
        ), [error?.message]);

        const buildEmptyView = useCallback(() => {
            if (loading)
                return <CircularProgressCenter/>;
            return (
                <Box display="flex"
                     flexDirection={"column"}
                     alignItems="center"
                     justifyContent="center"
                     width={"100%"}
                     height={"100%"}
                     padding={2}>
                    <Box padding={1}>
                        <AssignmentIcon/>
                    </Box>
                    <Typography>
                        {emptyMessage}
                    </Typography>
                </Box>
            );
        }, [emptyMessage, loading]);

    const Row = useCallback(({ index, style }: any) => {
        const rowData = data && data[index];
        return (
            <VirtualTableRow style={{
                ...style,
                // top: "50px"
                top: `calc(${style.top}px + 50px)`
            }}
                             size={size}>
                {columns.map((column, columnIndex) => {
                    const cellData = rowData && rowData[column.key];
                    return <VirtualTableCell
                        key={`cell_${column.key}`}
                        dataKey={column.key}
                        cellRenderer={cellRenderer}
                        column={column}
                        rowData={rowData}
                        cellData={cellData}
                        rowIndex={index}
                        columnIndex={columnIndex}/>;
                })}
            </VirtualTableRow>
        );
    }, [columns, data, size]);

    return (
        <AutoSizer>
            {({ height, width }: any) => (
                <VirtualListContext.Provider
                    value={{
                        columns,
                        currentSort,
                        onColumnResize,
                        filter: filterRef.current,
                        onColumnSort,
                        onInternalFilterUpdate,
                        sortByProperty
                    }}>

                    <List
                        key={size}
                        innerElementType={innerElementType}
                        width={width}
                        height={height}
                        overscanCount={5}
                        itemCount={data?.length}
                        onScroll={onScroll}
                        itemSize={getRowHeight(size)}>
                        {Row}
                    </List>
                </VirtualListContext.Provider>

            )}
        </AutoSizer>
    );

    // return <Root sx={{
    //     width: "100%",
    //     height: "100%",
    //     overflow: "hidden"
    // }}
    //              ref={ref}
    //              css={baseTableCss}>
    //
    //     {bounds && <BaseTable
    //         rowClassName={clsx(classes.tableRow, { [classes.tableRowClickable]: hoverRow })}
    //         data={data}
    //         onColumnResizeEnd={onBaseTableColumnResize}
    //         width={bounds.width}
    //         height={bounds.height}
    //         emptyRenderer={error ? buildErrorView() : buildEmptyView()}
    //         fixed
    //         ignoreFunctionInColumnCompare={false}
    //         rowHeight={getRowHeight(size)}
    //         ref={tableRef}
    //         onScroll={onScroll}
    //         overscanRowCount={2}
    //         onEndReachedThreshold={PIXEL_NEXT_PAGE_OFFSET}
    //         onEndReached={onEndReachedInternal}
    //         rowEventHandlers={{ onClick: clickRow as any }}
    //     >
    //
    //         {columns.map((column) =>
    //             <Column
    //                 key={column.key}
    //                 title={column.title}
    //                 className={classes.column}
    //                 headerRenderer={headerRenderer}
    //                 cellRenderer={baseTableCellRenderer}
    //                 height={getRowHeight(size)}
    //                 align={column.align}
    //                 flexGrow={1}
        //                 flexShrink={0}
        //                 resizable={true}
        //                 size={size}
        //                 frozen={column.frozen}
        //                 dataKey={column.key}
        //                 width={column.width}/>)
        //         }
        //     </BaseTable>}
        // </Root>;

    },
    (a, b) => {
        return equal(a, b);
    }
);
