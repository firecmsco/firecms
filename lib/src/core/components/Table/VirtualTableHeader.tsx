import React, { RefObject, useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare";
import { Badge, Button, darken, Divider, Grid, IconButton, lighten, Popover, useTheme } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";

import { TableColumn, TableSort, TableWhereFilterOp } from "./VirtualTableProps";
import { ErrorBoundary } from "../ErrorBoundary";

interface FilterFormProps<T> {
    column: TableColumn<T>;
    onFilterUpdate: (filter?: [TableWhereFilterOp, any], newOpenFilterState?: boolean) => void;
    filter?: [TableWhereFilterOp, any];
    onHover: boolean,
    createFilterField: (props: FilterFormFieldProps<T>) => React.ReactNode;
    popupOpen: boolean;
    setPopupOpen: (open: boolean) => void;
    anchorEl: RefObject<HTMLDivElement>;
}

export type FilterFormFieldProps<CustomProps> = {
    id: React.Key,
    filterValue: [TableWhereFilterOp, any] | undefined,
    setFilterValue: (filterValue?: [TableWhereFilterOp, any]) => void;
    column: TableColumn<CustomProps>;
    popupOpen: boolean;
    setPopupOpen: (open: boolean) => void;
};

type VirtualTableHeaderProps<M extends Record<string, any>> = {
    resizeHandleRef: RefObject<HTMLDivElement>;
    columnIndex: number;
    isResizingIndex: number;
    column: TableColumn<any>;
    onColumnSort: (key: Extract<keyof M, string>) => void;
    filter?: [TableWhereFilterOp, any];
    sort: TableSort;
    onFilterUpdate: (column: TableColumn, filterForProperty?: [TableWhereFilterOp, any]) => void;
    onClickResizeColumn?: (columnIndex: number, column: TableColumn) => void;
    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;
};

export const VirtualTableHeader = React.memo<VirtualTableHeaderProps<any>>(
    function VirtualTableHeader<M extends Record<string, any>>({
                                                                   resizeHandleRef,
                                                                   columnIndex,
                                                                   isResizingIndex,
                                                                   sort,
                                                                   onColumnSort,
                                                                   onFilterUpdate,
                                                                   filter,
                                                                   column,
                                                                   onClickResizeColumn,
                                                                   createFilterField
                                                               }: VirtualTableHeaderProps<M>) {

        const ref = useRef<HTMLDivElement>(null);

        const [onHover, setOnHover] = useState(false);

        const [openFilter, setOpenFilter] = React.useState(false);

        const handleSettingsClick = useCallback((event: any) => {
            setOpenFilter(true);
        }, []);

        const handleClose = useCallback(() => {
            setOpenFilter(false);
        }, []);

        const update = useCallback((filterForProperty?: [TableWhereFilterOp, any], newOpenFilterState?: boolean) => {
            onFilterUpdate(column, filterForProperty);
            if (newOpenFilterState !== undefined)
                setOpenFilter(newOpenFilterState);
        }, [column, onFilterUpdate]);

        const thisColumnIsResizing = isResizingIndex === columnIndex;
        const anotherColumnIsResizing = isResizingIndex !== columnIndex && isResizingIndex > 0;

        const hovered = !anotherColumnIsResizing && (onHover || thisColumnIsResizing);

        const theme = useTheme();

        return (
            <ErrorBoundary>
                <Grid
                    className={`py-0 px-3 h-full text-xs uppercase font-semibold relative select-none ${
                        column.frozen ? "sticky left-0 z-10" : "relative z-0"
                    }`}
                    style={{
                        color: hovered ? theme.palette.text.primary : theme.palette.text.secondary,
                        backgroundColor: hovered
                            ? darken(theme.palette.background.default, 0.05)
                            : theme.palette.background.default,
                        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                        fontSize: "0.750rem",
                        left: column.frozen ? 0 : undefined,
                        minWidth: column.width,
                        maxWidth: column.width,
                    }}
                    ref={ref}
                    wrap={"nowrap"}
                    alignItems={"center"}
                    onMouseEnter={() => setOnHover(true)}
                    onMouseMove={() => setOnHover(true)}
                    onMouseLeave={() => setOnHover(false)}
                    container>

                    <Grid item xs={true}
                          className="overflow-hidden flex-shrink">
                        <div
                            className={`flex items-center justify-${column.headerAlign} flex-row`}>
                            <div className="pt-1">
                                {column.icon && column.icon(onHover || openFilter)}
                            </div>
                            <div
                                className="truncate -webkit-box w-full mx-1 overflow-hidden"
                                style={{
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 2,
                                    justifyContent: column.align,
                                }}>
                                {column.title}
                            </div>

                        </div>
                    </Grid>

                    {column.sortable && (sort || hovered || openFilter) &&
                        <Grid item>
                            <Badge color="secondary"
                                   variant="dot"
                                   overlap="circular"
                                   invisible={!sort}>
                                <IconButton
                                    size={"small"}
                                    className={`${theme.palette.mode === 'light' ? 'bg-f5f5f5' : 'bg-[defaultBackgroundColor]'}`}
                                    onClick={() => {
                                        onColumnSort(column.key as Extract<keyof M, string>);
                                    }}
                                >
                                    {!sort &&
                                        <ArrowUpwardIcon fontSize={"small"}/>}
                                    {sort === "asc" &&
                                        <ArrowUpwardIcon fontSize={"small"}/>}
                                    {sort === "desc" &&
                                        <ArrowDownwardIcon fontSize={"small"}/>}
                                </IconButton>
                            </Badge>
                        </Grid>
                    }

                    {column.filter && <Grid item>
                        <Badge color="secondary"
                               variant="dot"
                               overlap="circular"
                               invisible={!filter}>
                            <IconButton
                                className={`bg-[${theme.palette.mode === "light" ? "#f5f5f5" : theme.palette.background.default}]`}
                                size={"small"}
                                onClick={handleSettingsClick}>
                                <ArrowDropDownCircleIcon fontSize={"small"}
                                                         color={onHover || openFilter ? undefined : "disabled"}/>
                            </IconButton>

                        </Badge>
                    </Grid>}

                    {column.resizable && <div
                        ref={resizeHandleRef}
                        className={`absolute h-full w-[4px] top-0 right-0 cursor-col-resize`}
                        onMouseDown={onClickResizeColumn ? () => onClickResizeColumn(columnIndex, column) : undefined}
                    />}
                </Grid>

                {column.filter && createFilterField &&
                    <FilterForm column={column}
                                filter={filter}
                                onHover={onHover}
                                onFilterUpdate={update}
                                createFilterField={createFilterField}
                                popupOpen={openFilter}
                                setPopupOpen={setOpenFilter}
                                anchorEl={ref}/>}

            </ErrorBoundary>
        );
    }, equal) as React.FunctionComponent<VirtualTableHeaderProps<any>>;

function FilterForm<M>({
                           column,
                           onFilterUpdate,
                           filter,
                           onHover,
                           createFilterField,
                           popupOpen,
                           setPopupOpen,
                           anchorEl
                       }: FilterFormProps<M>) {

    const id = column.key;

    const [filterInternal, setFilterInternal] = useState<[TableWhereFilterOp, any] | undefined>(filter);

    useEffect(() => {
        setFilterInternal(filter);
    }, [filter]);

    if (!column.filter) return null;

    const submit = () => {
        onFilterUpdate(filterInternal, false);
    };

    const reset = (e: any) => {
        onFilterUpdate(undefined, false);
    };

    const filterIsSet = !!filter;

    const filterField = createFilterField({
        id,
        filterValue: filterInternal,
        setFilterValue: setFilterInternal,
        column,
        popupOpen,
        setPopupOpen
    });

    if (!filterField) return null;
    return (
        <Popover
            id={`popover_${column.key}`}
            open={popupOpen}
            elevation={3}
            anchorEl={anchorEl.current}
            onClose={() => setPopupOpen(false)}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right"
            }}
        >
            <div className="bg-background-default">
                <div className="p-2 text-xs font-semibold uppercase">
                    {column.title ?? id}
                </div>
                <Divider/>
                {filterField && <div className="p-8">
                    {filterField}
                </div>}
                <div className="flex justify-end m-8">
                    <div className="mr-4">
                        <Button
                            disabled={!filterIsSet}
                            color="primary"
                            type="reset"
                            aria-label="filter clear"
                            onClick={reset}>Clear</Button>
                    </div>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={submit}>Filter</Button>
                </div>
            </div>
        </Popover>
    );

}
