import React, { useRef, useState } from "react";
import "react-base-table/styles.css";

import { EntitySchema, Property, WhereFilterOp } from "../../models";
import ErrorBoundary from "../../core/internal/ErrorBoundary";
import { CMSColumn, Sort } from "../common";
import {
    Badge,
    Box,
    Button,
    createStyles,
    Divider,
    fade,
    Grid,
    IconButton,
    makeStyles,
    Popover,
    Theme
} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowDropDownCircleIcon from "@material-ui/icons/ArrowDropDownCircle";
import StringNumberFilterField from "./filters/StringNumberFilterField";
import BooleanFilterField from "./filters/BooleanFilterField";
import { getIconForProperty } from "../../util/property_icons";
import { useTableStyles } from "../components/styles";
import clsx from "clsx";
import DateTimeFilterField from "./filters/DateTimeFilterfield";

export const useStyles = makeStyles<Theme, { onHover: boolean, align: "right" | "left" | "center" }>
(theme => createStyles({
    header: ({ onHover }) => ({
        width: "calc(100% + 24px)",
        margin: "0px -12px",
        padding: "0px 12px",
        color: onHover ? "rgba(0, 0, 0, 0.87)" : "rgba(0,0,0,0.55)",
        backgroundColor: onHover ? fade(theme.palette.common.black, 0.03) : fade(theme.palette.common.black, 0.01),
        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        height: "100%"
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
        backgroundColor: "#f5f5f5"
    }
}));


export default function CollectionTableHeader<S extends EntitySchema<Key>,
    Key extends string,
    AdditionalKey extends string = string>({
                                               sort,
                                               onColumnSort,
                                               onFilterUpdate,
                                               filter,
                                               column
                                           }: {
    column: CMSColumn;
    onColumnSort: (key: Key) => void;
    onFilterUpdate: (filterForProperty?: [WhereFilterOp, any]) => void;
    filter?: [WhereFilterOp, any];
    sort: Sort;
}) {

    const [onHover, setOnHover] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const classes = useStyles({ onHover, align: column.align });
    const tableClasses = useTableStyles();

    const [open, setOpen] = React.useState(false);

    const handleSettingsClick = (event: any) => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const id = open ? `popover_${column.id}` : undefined;

    const update = (filterForProperty?: [WhereFilterOp, any]) => {
        onFilterUpdate(filterForProperty);
        setOpen(false);
    };

    return (

        <ErrorBoundary>
            <Grid
                className={clsx(classes.header, tableClasses.headerTypography)}
                ref={ref}
                wrap={"nowrap"}
                alignItems={"center"}
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
                container>


                <Grid item xs={true} className={classes.headerTitle}>
                    <Box
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                        justifyContent={column.align === "right" ? "flex-end" : (column.align === "center" ? "center" : "flex-start")}>
                        <Box className={classes.headerIcon}>
                            {column.property && getIconForProperty(column.property, onHover || open ? undefined : "disabled", "small")}
                        </Box>
                        <Box className={classes.headerTitleInternal}>
                            {column.label}
                        </Box>
                    </Box>
                </Grid>

                {column.sortable && (sort || onHover || open) &&
                <Grid item>
                    <Badge color="secondary"
                           variant="dot"
                           overlap="circle"
                           invisible={!sort}>
                        <IconButton
                            size={"small"}
                            className={classes.headerIconButton}
                            onClick={() => {
                                onColumnSort(column.id as Key);
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

                {column.filterable && <Grid item>
                    <Badge color="secondary"
                           variant="dot"
                           overlap="circle"
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

            {column.sortable && column.property && <Popover
                id={id}
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
                <FilterForm id={column.id as Key}
                            property={column.property}
                            filter={filter}
                            onFilterUpdate={update}/>
            </Popover>}

        </ErrorBoundary>
    );
}

interface FilterFormProps {
    id: string;
    property: Property;
    onFilterUpdate: (filter?: [WhereFilterOp, any]) => void;
    filter?: [WhereFilterOp, any];
}


function FilterForm({
                        id,
                        property,
                        onFilterUpdate,
                        filter
                    }: FilterFormProps) {


    const tableClasses = useTableStyles();

    const [filterInternal, setFilterInternal] = useState<[WhereFilterOp, any] | undefined>(filter);

    function createFilterField(property: Property): JSX.Element {

        if (property.dataType === "number" || property.dataType === "string") {
            return <StringNumberFilterField value={filterInternal}
                                            setValue={setFilterInternal}
                                            name={id}
                                            property={property}/>;
        } else if (property.dataType === "array" && property.of) {
            return createFilterField(property.of);
        } else if (property.dataType === "boolean") {
            return <BooleanFilterField value={filterInternal}
                                       setValue={setFilterInternal}
                                       name={id}
                                       property={property}/>;
        } else if (property.dataType === "timestamp") {
            return <DateTimeFilterField value={filterInternal}
                                        setValue={setFilterInternal}
                                        name={id}
                                        property={property}/>;
        }

        return (
            <div>{`Currently the field ${property.dataType} is not supported`}</div>
        );
    }


    const submit = (e: any) => {
        onFilterUpdate(filterInternal);
    };

    const reset = (e: any) => {
        onFilterUpdate(undefined);
    };

    const filterIsSet = !!filter;

    return (
        <>

            <Box p={2} className={tableClasses.headerTypography}>
                {property.title ?? id}
            </Box>
            <Divider/>

            <Box p={2}>
                {createFilterField(property)}
            </Box>

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

