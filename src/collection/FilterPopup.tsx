import { EntitySchema, FilterValues, Property } from "../models";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import {
    Button,
    createStyles,
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell as MuiTableCell,
    TableRow,
    Theme,
    Tooltip,
    withStyles
} from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import React from "react";
import { Form, Formik } from "formik";
import ClearIcon from "@material-ui/icons/Clear";
import StringNumberFilterField from "./filters/StringNumberFilterField";
import BooleanFilterField from "./filters/BooleanFilterField";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        filter: {
            flexGrow: 1,
            padding: theme.spacing(1)
        }
    })
);


const TableCell = withStyles({
    root: {
        borderBottom: "none"
    }
})(MuiTableCell);

interface FilterPopupProps<S extends EntitySchema> {
    schema: S;

    filterValues?: FilterValues<S>;

    /**
     * Properties that can be filtered
     */
    filterableProperties: (keyof S["properties"])[];

    onFilterUpdate(filterValues?: FilterValues<S>): void;
}

export default function FilterPopup<S extends EntitySchema>({ schema, filterValues, onFilterUpdate, filterableProperties }: FilterPopupProps<S>) {

    const classes = useStyles();

    function createFilterFields() {

        return (
            <Table size="small">
                <TableBody>
                    {
                        filterableProperties.map((key, index) => {
                            return (
                                <TableRow
                                    key={`filter_table_${key}_${index}`}>
                                    <TableCell
                                        key={`filter-cell-title-${key}`}
                                        component="th"
                                        align={"right"}
                                    >
                                        {schema.properties[key as string].title}
                                    </TableCell>
                                    <TableCell
                                        key={`filter-cell-field-${key}`}
                                        component="th"
                                    >
                                        {createFilterField(key as string, schema.properties[key as string])}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        );
        return (
            <Box className={classes.filter} width={300}>
                {filterableProperties.map(
                    (key) => {
                        const formField = createFilterField(key as string, schema.properties[key as string]);
                        return (
                            <Box key={`filter_${key}`} mb={1}>
                                {formField}
                            </Box>
                        );
                    })}
            </Box>
        );
    }

    const cleanedInitialValues: FilterValues<S> = filterValues || {};

    return (
        <PopupState variant="popover" popupId="collection-filter">
            {(popupState) => {

                function setFilters(filterValues?: FilterValues<S>) {
                    if (!filterValues) {
                        onFilterUpdate(undefined);
                    } else {
                        const filters = { ...filterValues };
                        Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
                        onFilterUpdate(filters);
                    }
                    popupState.close();
                }

                return (
                    <Box display={"flex"} ml={1}>

                        <Tooltip title="Filter list">
                            <IconButton
                                color={filterValues ? "primary" : undefined}
                                aria-label="filter list"  {...bindTrigger(popupState)} >
                                <FilterListIcon/>
                            </IconButton>
                        </Tooltip>

                        {filterValues ?
                            <Tooltip title="Clear filter">
                                <IconButton
                                    aria-label="filter clear"
                                    onClick={() => onFilterUpdate(undefined)}>
                                    <ClearIcon fontSize={"small"}/>
                                </IconButton>
                            </Tooltip>
                            :
                            <Box style={{ width: 26 }}/>}
                        <Popover
                            {...bindPopover(popupState)}
                            elevation={1}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left"
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left"
                            }}
                        >
                            <Box p={2}>
                                <Formik
                                    initialValues={cleanedInitialValues}
                                    onSubmit={setFilters}
                                >
                                    {({ values, resetForm, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
                                        const reset = (e: any) => {
                                            resetForm();
                                            setFilters(undefined);
                                        };
                                        return (
                                            <Form
                                                onSubmit={handleSubmit}
                                                onReset={() => onFilterUpdate(undefined)}
                                                noValidate>
                                                {createFilterFields()}
                                                <Box display="flex"
                                                     justifyContent="flex-end"
                                                     m={2}
                                                     mt={3}>
                                                    <Button
                                                        disabled={!filterValues && !Object.keys(values).length}
                                                        color="primary"
                                                        type="reset"
                                                        aria-label="filter clear"
                                                        onClick={reset}>Clear</Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        type="submit">Ok</Button>
                                                </Box>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </Box>
                        </Popover>
                    </Box>
                );
            }}
        </PopupState>
    );
}

function createFilterField(key: string, property: Property): JSX.Element {

    if (property.dataType === "number" || property.dataType === "string") {
        return <StringNumberFilterField name={key} property={property}/>;
    } else if (property.dataType === "boolean") {
        return <BooleanFilterField name={key} property={property}/>;
    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}

