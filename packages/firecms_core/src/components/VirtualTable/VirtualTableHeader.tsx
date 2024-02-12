import React, { RefObject, useCallback, useEffect, useState } from "react";
import equal from "react-fast-compare";

import { VirtualTableColumn, VirtualTableSort, VirtualTableWhereFilterOp } from "./VirtualTableProps";
import { ErrorBoundary } from "../ErrorBoundary";
import {
    ArrowUpwardIcon,
    Badge,
    Button,
    cn,
    defaultBorderMixin,
    FilterListIcon,
    IconButton,
    Popover
} from "@firecms/ui";

interface FilterFormProps<T> {
    column: VirtualTableColumn<T>;
    onFilterUpdate: (filter?: [VirtualTableWhereFilterOp, any], newOpenFilterState?: boolean) => void;
    filter?: [VirtualTableWhereFilterOp, any];
    onHover: boolean,
    createFilterField: (props: FilterFormFieldProps<T>) => React.ReactNode;
    hidden: boolean;
    setHidden: (hidden: boolean) => void;
}

export type FilterFormFieldProps<CustomProps> = {
    id: React.Key,
    filterValue: [VirtualTableWhereFilterOp, any] | undefined,
    setFilterValue: (filterValue?: [VirtualTableWhereFilterOp, any]) => void;
    column: VirtualTableColumn<CustomProps>;
    hidden: boolean;
    setHidden: (hidden: boolean) => void;
};

type VirtualTableHeaderProps<M extends Record<string, any>> = {
    resizeHandleRef: RefObject<HTMLDivElement>;
    columnIndex: number;
    isResizingIndex: number;
    column: VirtualTableColumn<any>;
    onColumnSort: (key: Extract<keyof M, string>) => void;
    filter?: [VirtualTableWhereFilterOp, any];
    sort: VirtualTableSort;
    onFilterUpdate: (column: VirtualTableColumn, filterForProperty?: [VirtualTableWhereFilterOp, any]) => void;
    onClickResizeColumn?: (columnIndex: number, column: VirtualTableColumn) => void;
    createFilterField?: (props: FilterFormFieldProps<any>) => React.ReactNode;
    AdditionalHeaderWidget?: (props: { onHover: boolean }) => React.ReactNode;
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
                                                                   createFilterField,
                                                                   AdditionalHeaderWidget
                                                               }: VirtualTableHeaderProps<M>) {

        const [onHover, setOnHover] = useState(false);

        const [openFilter, setOpenFilter] = React.useState(false);
        const [hidden, setHidden] = React.useState(false);

        const handleSettingsClick = useCallback((event: any) => {
            setOpenFilter(true);
        }, []);

        const update = useCallback((filterForProperty?: [VirtualTableWhereFilterOp, any], newOpenFilterState?: boolean) => {
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
                    className={cn("flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center bg-gray-50 dark:bg-gray-900",
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

                            {column.icon}

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
                    <>

                        {AdditionalHeaderWidget &&
                            <AdditionalHeaderWidget onHover={onHover || openFilter}/>}

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
                    </>

                    {column.filter && createFilterField && <div>
                        <Badge color="secondary"
                               invisible={!filter}>

                            <Popover
                                open={openFilter}
                                onOpenChange={setOpenFilter}
                                className={hidden ? "hidden" : undefined}
                                modal={true}
                                trigger={
                                    <IconButton
                                        className={onHover || openFilter ? "bg-white dark:bg-gray-950" : undefined}
                                        size={"small"}
                                        onClick={handleSettingsClick}>
                                        <FilterListIcon size={"small"}/>
                                    </IconButton>}
                            >
                                <FilterForm column={column}
                                            filter={filter}
                                            onHover={onHover}
                                            onFilterUpdate={update}
                                            createFilterField={createFilterField}
                                            hidden={hidden}
                                            setHidden={setHidden}/>

                            </Popover>

                        </Badge>

                    </div>}

                    {column.resizable && <div
                        ref={resizeHandleRef}
                        className={cn(
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
                           hidden,
                           setHidden
                       }: FilterFormProps<M>) {

    const id = column.key;

    const [filterInternal, setFilterInternal] = useState<[VirtualTableWhereFilterOp, any] | undefined>(filter);

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
        hidden,
        setHidden
    });

    if (!filterField) return null;
    return (
        <form noValidate={true}
              onSubmit={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  submit();
              }}
              className={"text-gray-900 dark:text-white"}>
            <div
                className={cn(defaultBorderMixin, "py-4 px-6 text-xs font-semibold uppercase border-b")}>
                {column.title ?? id}
            </div>
            {filterField && <div className="m-4">
                {filterField}
            </div>}
            <div className="flex justify-end m-4">
                <Button
                    className="mr-4"
                    disabled={!filterIsSet}
                    variant={"text"}
                    color="primary"
                    type="reset"
                    aria-label="filter clear"
                    onClick={reset}>Clear</Button>
                <Button
                    variant="outlined"
                    color="primary"
                    type="submit">Filter</Button>
            </div>
        </form>
    );

}
