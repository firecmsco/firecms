import React, {
    RefObject,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
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
    TableSort,
    TableWhereFilterOp
} from "./VirtualTableProps";
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
                        zIndex: column.frozen ? 1 : 0,
                        userSelect: "none"
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
                                display: "-webkit-box",
                                margin: "0px 4px",
                                overflow: "hidden",
                                justifyContent: column.align,
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis"
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

                    {column.resizable && <Box
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
            <Box sx={theme => ({
                // backgroundColor: theme.palette.background.default
            })}>
                <Box sx={theme => ({
                    p: 2,
                    fontSize: "0.750rem",
                    fontWeight: 600,
                    textTransform: "uppercase"
                })}>
                    {column.title ?? id}
                </Box>
                <Divider/>
                {filterField && <Box p={2}>
                    {filterField}
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
            </Box>
        </Popover>
    );

}
