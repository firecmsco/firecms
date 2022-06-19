import React, { useCallback, useRef, useState } from "react";
import equal from "react-fast-compare";
import {
    Badge,
    Box,
    Button,
    darken,
    Divider,
    Grid,
    IconButton,
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
} from "../TableProps";
import { StringNumberFilterField } from "../filters/StringNumberFilterField";
import { BooleanFilterField } from "../filters/BooleanFilterField";
import { DateTimeFilterField } from "../filters/DateTimeFilterfield";
import { ErrorBoundary } from "../../ErrorBoundary";

type TableHeaderProps<M extends { [Key: string]: any }> = {
    column: TableColumn<M, any>;
    onColumnSort: (key: Extract<keyof M, string>) => void;
    filter?: [TableWhereFilterOp, any];
    sort: TableSort;
    onFilterUpdate: (column: TableColumn<any, any>, filterForProperty?: [TableWhereFilterOp, any]) => void;
    onColumnResize?: (column: TableColumn<M, any>, width: number) => void;
};

export const TableHeaderV2 = React.memo<TableHeaderProps<any>>(
    function TableHeaderInternal<M extends { [Key: string]: any }>({
                                                                       sort,
                                                                       onColumnSort,
                                                                       onFilterUpdate,
                                                                       filter,
                                                                       column,
                                                                       onColumnResize
                                                                   }: TableHeaderProps<M>) {

        const isResizing = useRef(false);

        // useEffect(() => {
        //     if (columnRef.current) {
        //         document.addEventListener("mousemove", handleOnMouseMove);
        //         document.addEventListener("mouseup", handleOnMouseUp);
        //     }
        //     return () => {
        //         if (columnRef.current) {
        //             document.removeEventListener("mousemove", handleOnMouseMove);
        //             document.removeEventListener("mouseup", handleOnMouseUp);
        //         }
        //     };
        // }, [columnRef])

        const adjustWidthColumn = (width: number) => {
            const minWidth = 100;
            const maxWidth = 800;
            const newWidth = width > maxWidth ? maxWidth : width < minWidth ? minWidth : width;
            if (onColumnResize)
                onColumnResize(column, newWidth);
            console.log("www", newWidth)
        };

        const handleOnMouseMove = (e: MouseEvent) => {
            e.stopPropagation();
            if (isResizing.current && ref?.current) {
                console.log("parent", ref.current.getBoundingClientRect().left)
                console.log("event", e.clientX)
                const newWidth =
                    e.clientX -
                    ref.current.getBoundingClientRect().left;
                adjustWidthColumn(newWidth);
            }
        };

        const setCursorDocument = (isResizing: boolean) => {
            document.body.style.cursor = isResizing ? "col-resize" : "auto";
        };

        const handleOnMouseUp = (e: MouseEvent) => {
            e.stopPropagation();
            console.log("end resize");
            isResizing.current = false;
            setCursorDocument(false);
            document.removeEventListener("dragover", preventDefault);
            document.removeEventListener("drop", preventDefault);
            document.removeEventListener("mousemove", handleOnMouseMove);
            document.removeEventListener("mouseup", handleOnMouseUp);
        };

        const preventDefault = (event: MouseEvent) => event.preventDefault();
        const onClickResizeColumn = () => {
            console.log("start resize");
            isResizing.current = true;
            setCursorDocument(true);
            document.addEventListener("dragover", preventDefault);
            document.addEventListener("drop", preventDefault);
            document.addEventListener("mousemove", handleOnMouseMove);
            document.addEventListener("mouseup", handleOnMouseUp);
        };

        const [onHover, setOnHover] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

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

        return (
            <ErrorBoundary>
                <Grid
                    sx={theme => ({
                        width: column.width,
                        position: "relative",
                        // width: "calc(100% + 24px)",
                        // margin: "0px -12px",
                        padding: "0px 12px",
                        color: onHover ? theme.palette.text.primary : theme.palette.text.secondary,
                        backgroundColor: onHover ? darken(theme.palette.background.default, 0.05) : theme.palette.background.default,
                        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                        height: "100%",
                        fontSize: "0.750rem",
                        textTransform: "uppercase",
                        fontWeight: 600
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

                    {column.sortable && (sort || onHover || openFilter) &&
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
                        sx={(theme) => ({
                            position: "absolute",
                            height: "100%",
                            width: "4px",
                            top: 0,
                            right: 0,
                            cursor: "col-resize",
                            backgroundColor: onHover ? theme.palette.primary.light : undefined
                        })}
                        onMouseDown={() => onClickResizeColumn()}
                    />
                </Grid>

                {column.sortable && <Popover
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
    }
    , equal) as React.FunctionComponent<TableHeaderProps<any>>;

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
