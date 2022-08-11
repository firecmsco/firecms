import React, { RefObject, useCallback, useRef, useState } from "react";
import equal from "react-fast-compare";
import {
    Badge,
    Box,
    Button,
    darken,
    Divider,
    Grid,
    IconButton,
    lighten,
    Popover
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";

import {
    TableColumn,
    TableColumnFilter,
    TableSort,
    TableWhereFilterOp
} from "./VirtualTableProps";
import { StringNumberFilterField } from "./filters/StringNumberFilterField";
import { BooleanFilterField } from "./filters/BooleanFilterField";
import { DateTimeFilterField } from "./filters/DateTimeFilterfield";
import { ErrorBoundary } from "../ErrorBoundary";

type VirtualTableHeaderProps<M extends { [Key: string]: any }> = {
    resizeHandleRef: RefObject<HTMLDivElement>;
    columnIndex: number;
    isResizingIndex: number;
    column: TableColumn<M, any>;
    onColumnSort: (key: Extract<keyof M, string>) => void;
    filter?: [TableWhereFilterOp, any];
    sort: TableSort;
    onFilterUpdate: (column: TableColumn<any, any>, filterForProperty?: [TableWhereFilterOp, any]) => void;
    onClickResizeColumn?: (columnIndex: number, column: TableColumn<M, any>) => void;
};

export const VirtualTableHeader = React.memo<VirtualTableHeaderProps<any>>(
    function VirtualTableHeader<M extends { [Key: string]: any }>({
                                                                      resizeHandleRef,
                                                                      columnIndex,
                                                                      isResizingIndex,
                                                                      sort,
                                                                      onColumnSort,
                                                                      onFilterUpdate,
                                                                      filter,
                                                                      column,
                                                                      onClickResizeColumn
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

        const update = useCallback((filterForProperty?: [TableWhereFilterOp, any]) => {
            onFilterUpdate(column, filterForProperty);
            setOpenFilter(false);
        }, [column, onFilterUpdate]);

        const thisColumnIsResizing = isResizingIndex === columnIndex;
        const anotherColumnIsResizing = isResizingIndex !== columnIndex && isResizingIndex > 0;

        const hovered = !anotherColumnIsResizing && (onHover || thisColumnIsResizing);

        return (
            <ErrorBoundary>
                <Grid
                    sx={theme => ({
                        width: column.width,
                        // position: "relative",
                        padding: "0px 12px",
                        color: hovered ? theme.palette.text.primary : theme.palette.text.secondary,
                        backgroundColor: hovered ? darken(theme.palette.background.default, 0.05) : theme.palette.background.default,
                        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                        height: "100%",
                        fontSize: "0.750rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        position: column.frozen ? "sticky" : "relative",
                        left: column.frozen ? 0 : undefined,
                        zIndex: column.frozen ? 1 : 0
                    })}
                    ref={ref}
                    wrap={"nowrap"}
                    alignItems={"center"}
                    onMouseEnter={() => setOnHover(true)}
                    onMouseMove={() => setOnHover(true)}
                    onMouseLeave={() => setOnHover(false)}
                    container>

                    <Grid item xs={true} sx={{
                        overflow: "hidden",
                        flexShrink: 1
                    }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: column.headerAlign,
                            alignItems: "center",
                            flexDirection: "row"
                        }}>
                            <Box sx={{
                                paddingTop: "4px"
                            }}>
                                {column.icon && column.icon(onHover || openFilter)}
                            </Box>
                            <Box sx={{
                                margin: "0px 4px",
                                overflow: "hidden",
                                justifyContent: column.align,
                                flexShrink: 1
                            }}>
                                {column.title}
                            </Box>

                        </Box>
                    </Grid>

                    {column.sortable && (sort || hovered || openFilter) &&
                        <Grid item>
                            <Badge color="secondary"
                                   variant="dot"
                                   overlap="circular"
                                   invisible={!sort}>
                                <IconButton
                                    size={"small"}
                                    sx={(theme) => ({
                                        backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : theme.palette.background.default
                                    })}
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
                                sx={(theme) => ({
                                    backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : theme.palette.background.default
                                })}
                                size={"small"}
                                onClick={handleSettingsClick}>
                                <ArrowDropDownCircleIcon fontSize={"small"}
                                                         color={onHover || openFilter ? undefined : "disabled"}/>
                            </IconButton>

                        </Badge>
                    </Grid>}

                    <Box
                        ref={resizeHandleRef}
                        sx={(theme) => ({
                            position: "absolute",
                            height: "100%",
                            width: "4px",
                            top: 0,
                            right: 0,
                            cursor: "col-resize",
                            backgroundColor: hovered ? (theme.palette.mode === "dark" ? lighten(theme.palette.background.default, 0.1) : darken(theme.palette.background.default, 0.15)) : undefined
                        })}
                        onMouseDown={onClickResizeColumn ? () => onClickResizeColumn(columnIndex, column) : undefined}
                    />
                </Grid>

                {column.sortable && ref?.current && <Popover
                    id={openFilter ? `popover_${column.key}` : undefined}
                    open={openFilter}
                    elevation={1}
                    anchorEl={ref.current}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                >
                    <FilterForm column={column}
                                filter={filter}
                                onHover={onHover}
                                onFilterUpdate={update}/>
                </Popover>}

            </ErrorBoundary>
        );
    }, equal) as React.FunctionComponent<VirtualTableHeaderProps<any>>;

interface FilterFormProps<M> {
    column: TableColumn<M, any>;
    onFilterUpdate: (filter?: [TableWhereFilterOp, any]) => void;
    filter?: [TableWhereFilterOp, any];
    onHover: boolean
}

function FilterForm<M>({
                           column,
                           onFilterUpdate,
                           filter,
                           onHover
                       }: FilterFormProps<M>) {

    const id = column.key;

    const [filterInternal, setFilterInternal] = useState<[TableWhereFilterOp, any] | undefined>(filter);

    const submit = (e: any) => {
        onFilterUpdate(filterInternal);
    };

    const reset = (e: any) => {
        onFilterUpdate(undefined);
    };

    const filterIsSet = !!filter;

    return (
        <>
            <Box p={2} sx={{
                fontSize: "0.750rem",
                fontWeight: 600,
                textTransform: "uppercase"
            }}>
                {column.title ?? id}
            </Box>
            <Divider/>
            {column.filter && <Box p={2}>
                {createFilterField(id, column.filter, filterInternal, setFilterInternal)}
            </Box>}
            <Box display="flex"
                 justifyContent="flex-end"
                 m={2}>
                <Box mr={1}>
                    <Button
                        disabled={!filterIsSet}
                        color="primary"
                        type="reset"
                        aria-label="filter clear"
                        onClick={reset}>Clear</Button>
                </Box>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={submit}>Filter</Button>
            </Box>
        </>
    );

}

function createFilterField(id: React.Key,
                           filterConfig: TableColumnFilter,
                           filterValue: [TableWhereFilterOp, any] | undefined,
                           setFilterValue: (filterValue?: [TableWhereFilterOp, any]) => void
): JSX.Element {

    if (filterConfig.dataType === "number" || filterConfig.dataType === "string") {
        const dataType = filterConfig.dataType;
        const title = filterConfig.title;
        const enumValues = filterConfig.enumValues;
        return <StringNumberFilterField value={filterValue}
                                        setValue={setFilterValue}
                                        name={id as string}
                                        dataType={dataType}
                                        isArray={filterConfig.isArray}
                                        enumValues={enumValues}
                                        title={title}/>;
    } else if (filterConfig.dataType === "boolean") {
        const title = filterConfig.title;
        return <BooleanFilterField value={filterValue}
                                   setValue={setFilterValue}
                                   name={id as string}
                                   title={title}/>;
    } else if (filterConfig.dataType === "date") {
        const title = filterConfig.title;
        return <DateTimeFilterField value={filterValue}
                                    setValue={setFilterValue}
                                    name={id as string}
                                    mode={filterConfig.dateMode}
                                    isArray={filterConfig.isArray}
                                    title={title}/>;
    }

    return (
        <div>{`Currently the field ${filterConfig.dataType} is not supported`}</div>
    );
}
