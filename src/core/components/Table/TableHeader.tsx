import React, { useCallback, useRef, useState } from "react";

import clsx from "clsx";
import {
    alpha,
    Badge,
    Box,
    Button,
    darken,
    Divider,
    Grid,
    IconButton,
    Popover,
    Theme
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";

import {
    TableColumn,
    TableColumnFilter,
    TableSort,
    TableWhereFilterOp
} from "./TableProps";
import { StringNumberFilterField } from "./filters/StringNumberFilterField";
import { BooleanFilterField } from "./filters/BooleanFilterField";
import { DateTimeFilterField } from "./filters/DateTimeFilterfield";
import { ErrorBoundary } from "../../internal/ErrorBoundary";

export const useStyles = makeStyles<Theme, { onHover?: boolean, align?: "right" | "left" | "center" }>(theme => createStyles({
    header: ({ onHover }) => ({
        width: "calc(100% + 24px)",
        margin: "0px -12px",
        padding: "0px 12px",
        color: onHover ? theme.palette.text.primary : theme.palette.text.secondary,
        backgroundColor: onHover ? darken(theme.palette.background.default, 0.05) : theme.palette.background.default,
        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        height: "100%",
        fontSize: "0.750rem",
        textTransform: "uppercase",
        fontWeight: 600
    }),
    headerInternal: ({ align }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: align === "right" ? "flex-end" : (align === "center" ? "center" : "flex-start")
    }),
    headerTitle: ({ align }) => ({
        overflow: "hidden",
        flexShrink: 1
    }),
    headerTitleInternal: ({ align }) => ({
        margin: "0px 4px",
        overflow: "hidden",
        justifyContent: align,
        flexShrink: 1
    }),
    headerIcon: {
        paddingTop: "4px"
    },
    headerIconButton: {
        backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : theme.palette.background.default
    },
    headerTypography: {
        fontSize: "0.750rem",
        fontWeight: 600,
        textTransform: "uppercase"
    }
}));


export const TableHeader = React.memo<TableHeaderProps<any>>(TableHeaderInternal) as React.FunctionComponent<TableHeaderProps<any>>;

type TableHeaderProps<M extends { [Key: string]: any }> = {
    column: TableColumn<M>;
    onColumnSort: (key: Extract<keyof M, string>) => void;
    onFilterUpdate: (filterForProperty?: [TableWhereFilterOp, any]) => void;
    filter?: [TableWhereFilterOp, any];
    sort: TableSort;
};

function TableHeaderInternal<M extends { [Key: string]: any }>({
                                                                   sort,
                                                                   onColumnSort,
                                                                   onFilterUpdate,
                                                                   filter,
                                                                   column
                                                               }: TableHeaderProps<M>) {

    const [onHover, setOnHover] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const classes = useStyles({ onHover, align: column.align });

    const [open, setOpen] = React.useState(false);

    const handleSettingsClick = useCallback((event: any) => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const update = useCallback((filterForProperty?: [TableWhereFilterOp, any]) => {
        onFilterUpdate(filterForProperty);
        setOpen(false);
    }, []);

    return (
        <ErrorBoundary>
            <Grid
                className={classes.header}
                ref={ref}
                wrap={"nowrap"}
                alignItems={"center"}
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
                container>

                <Grid item xs={true} className={classes.headerTitle}>
                    <div className={classes.headerInternal}>
                        <div className={classes.headerIcon}>
                            {column.icon && column.icon(onHover || open)}
                        </div>
                        <div className={classes.headerTitleInternal}>
                            {column.label}
                        </div>
                    </div>
                </Grid>

                {column.sortable && (sort || onHover || open) &&
                <Grid item>
                    <Badge color="secondary"
                           variant="dot"
                           overlap="circular"
                           invisible={!sort}>
                        <IconButton
                            size={"small"}
                            className={classes.headerIconButton}
                            onClick={() => {
                                onColumnSort(column.key as Extract<keyof M, string>);
                            }}
                        >
                            {!sort && <ArrowDownwardIcon fontSize={"small"}/>}
                            {sort === "desc" &&
                            <ArrowUpwardIcon fontSize={"small"}/>}
                            {sort === "asc" &&
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
                            className={classes.headerIconButton}
                            size={"small"}
                            onClick={handleSettingsClick}>
                            <ArrowDropDownCircleIcon fontSize={"small"}
                                                     color={onHover || open ? undefined : "disabled"}/>
                        </IconButton>

                    </Badge>
                </Grid>}
            </Grid>

            {column.sortable && <Popover
                id={open ? `popover_${column.key}` : undefined}
                open={open}
                elevation={2}
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
                            onFilterUpdate={update}/>
            </Popover>}

        </ErrorBoundary>
    );
}

interface FilterFormProps<M> {
    column: TableColumn<M>;
    onFilterUpdate: (filter?: [TableWhereFilterOp, any]) => void;
    filter?: [TableWhereFilterOp, any];
}


function FilterForm<M>({
                           column,
                           onFilterUpdate,
                           filter
                       }: FilterFormProps<M>) {


    const id = column.key;
    const classes = useStyles({});

    const [filterInternal, setFilterInternal] = useState<[TableWhereFilterOp, any] | undefined>(filter);

    const submit = (e: any) => {
        onFilterUpdate(filterInternal);
    };

    const reset = (e: any) => {
        onFilterUpdate(undefined);
    };

    const filterIsSet = !!filter;

    function createFilterField(id: string,
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
        } else if (filterConfig.dataType === "timestamp") {
            const title = filterConfig.title;
            return <DateTimeFilterField value={filterValue}
                                        setValue={setFilterValue}
                                        name={id as string}
                                        isArray={filterConfig.isArray}
                                        title={title}/>;
        }

        return (
            <div>{`Currently the field ${filterConfig.dataType} is not supported`}</div>
        );
    }


    return (
        <>

            <Box p={2} className={classes.headerTypography}>
                {column.label ?? id}
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

