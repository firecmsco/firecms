import React, { RefObject, useCallback, useEffect, useState } from "react";
import equal from "react-fast-compare";
import clsx from "clsx";

import { TableColumn, TableSort, TableWhereFilterOp } from "./VirtualTableProps";
import { ErrorBoundary } from "../ErrorBoundary";
import { Button, IconButton } from "../../../components";
import { defaultBorderMixin } from "../../../styles";
import { ArrowUpwardIcon, ChevronDownIcon } from "../../../icons";
import { Popover } from "../../../components/Popover";
import { Badge } from "../../../components/Badge";

interface FilterFormProps<T> {
    column: TableColumn<T>;
    onFilterUpdate: (filter?: [TableWhereFilterOp, any], newOpenFilterState?: boolean) => void;
    filter?: [TableWhereFilterOp, any];
    onHover: boolean,
    createFilterField: (props: FilterFormFieldProps<T>) => React.ReactNode;
    popupOpen: boolean;
    setPopupOpen: (open: boolean) => void;
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

        return (
            <ErrorBoundary>
                <div
                    className={clsx("flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center bg-gray-50 dark:bg-gray-900",
                        "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 ",
                        "hover:bg-gray-100 dark:hover:bg-gray-800 hover:bg-opacity-50 dark:hover:bg-opacity-50",
                        column.frozen ? "sticky left-0 z-10" : "relative z-0"
                    )}
                    style={{
                        // transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                        // fontSize: "0.750rem",
                        left: column.frozen ? 0 : undefined,
                        minWidth: column.width,
                        maxWidth: column.width
                    }}
                    onMouseEnter={() => setOnHover(true)}
                    onMouseMove={() => setOnHover(true)}
                    onMouseLeave={() => setOnHover(false)}
                >

                    <div className="overflow-hidden flex-grow">
                        <div
                            className={`flex items-center justify-${column.headerAlign} flex-row`}>

                            {column.icon && column.icon(onHover || openFilter)}

                            <div
                                className="truncate -webkit-box w-full mx-1 overflow-hidden"
                                style={{
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 2,
                                    justifyContent: column.align
                                }}>
                                {column.title}
                            </div>

                        </div>
                    </div>

                    {column.sortable && (sort || hovered || openFilter) &&
                        <Badge color="secondary"
                               invisible={!sort}>
                            <IconButton
                                size={"small"}
                                className={onHover || openFilter ? "bg-white dark:bg-gray-950" : undefined}
                                onClick={() => {
                                    onColumnSort(column.key as Extract<keyof M, string>);
                                }}
                            >
                                {!sort &&
                                    <ArrowUpwardIcon/>}
                                {sort === "asc" &&
                                    <ArrowUpwardIcon/>}
                                {sort === "desc" &&
                                    <ArrowUpwardIcon className={"rotate-180"}/>}
                            </IconButton>
                        </Badge>
                    }

                    {column.filter && <div>
                        <Badge color="secondary"
                               invisible={!filter}>

                            <Popover
                                open={openFilter}
                                onOpenChange={setOpenFilter}
                                trigger={
                                    <IconButton
                                        className={onHover || openFilter ? "bg-white dark:bg-gray-950" : undefined}
                                        size={"small"}
                                        onClick={handleSettingsClick}>
                                        <ChevronDownIcon/>
                                    </IconButton>}
                                // anchorOrigin={{
                                //     vertical: "bottom",
                                //     horizontal: "right"
                                // }}
                                // transformOrigin={{
                                //     vertical: "top",
                                //     horizontal: "right"
                                // }}
                            >
                                {column.filter && createFilterField &&
                                    <FilterForm column={column}
                                                filter={filter}
                                                onHover={onHover}
                                                onFilterUpdate={update}
                                                createFilterField={createFilterField}
                                                popupOpen={openFilter}
                                                setPopupOpen={setOpenFilter}/>}
                            </Popover>

                        </Badge>
                    </div>}

                    {column.resizable && <div
                        ref={resizeHandleRef}
                        className={clsx(
                            "absolute h-full w-[6px] top-0 right-0 cursor-col-resize",
                            hovered && "bg-gray-300 dark:bg-gray-700"
                        )}
                        onMouseDown={onClickResizeColumn ? () => onClickResizeColumn(columnIndex, column) : undefined}
                    />}
                </div>


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
        <div className={
            clsx(
                "text-gray-900 dark:text-white",
            )
        }>
            <div
                className={clsx(defaultBorderMixin, "py-4 px-6 text-xs font-semibold uppercase border-b")}>
                {column.title ?? id}
            </div>
            {filterField && <div className="m-6">
                {filterField}
            </div>}
            <div className="flex justify-end m-6">
                <Button
                    className="mr-4"
                    disabled={!filterIsSet}
                    color="primary"
                    type="reset"
                    aria-label="filter clear"
                    onClick={reset}>Clear</Button>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={submit}>Filter</Button>
            </div>
        </div>
    );

}
