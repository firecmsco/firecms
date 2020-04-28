import {
    EntitySchema,
    EntityValues,
    FilterValues,
    Properties,
    Property
} from "../models";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import React, { ReactElement } from "react";
import { Form, Formik } from "formik";
import { initFilterValues } from "../firebase/firestore";
import { useStyles } from "../styles";
import ClearIcon from "@material-ui/icons/Clear";
import DateTimeField from "../form/fields/DateTimeField";
import SwitchField from "../form/fields/SwitchField";
import Select from "../form/fields/Select";
import TextField from "../form/fields/TextField";
import { getFilterableProperties } from "../util/properties";

interface FilterPopupProps<S extends EntitySchema> {
    schema: S;

    filterValues?: FilterValues<S>;

    onFilterUpdate(filterValues?: FilterValues<S>): void;
}

export default function FilterPopup<S extends EntitySchema>({ schema, filterValues, onFilterUpdate }: FilterPopupProps<S>) {

    const filterableProperties = getFilterableProperties(schema.properties);
    const classes = useStyles();

    function createFilterFields(values: any) {
        return (
            <Grid className={classes.filter}>
                {filterableProperties.map(
                    ([key, property]) => {
                        const value = values ? values[key] : undefined;
                        const formField = createFieldFormField(key, property, value, false);
                        return (
                            <Box width={200}
                                 key={`filter_field_${key}`}>
                                {formField}
                                {/*<IconButton aria-label="delete">*/}
                                {/*    <DeleteIcon/>*/}
                                {/*</IconButton>*/}
                            </Box>
                        );
                    })}
            </Grid>
        );
    }

    const cleanedInitialValues = filterValues || initFilterValues(schema);

    // TODO: change filters to use FilterValues instead of entityvalues
    const entityValues = Object.entries(cleanedInitialValues)
        .filter(([_, entry]) => !!entry)
        .map(([key, [_, value]]) => ({ [key]: value }))
        .reduce((a: any, b: any) => ({ ...a, ...b }), {});

    return (
        <PopupState variant="popover" popupId="collection-filter">
            {(popupState) => {

                function setFilters(values: EntityValues<S>) {
                    const filterValues = Object.entries(values)
                        .map(([key, value]) => ({ [key]: ["==", value] }))
                        .reduce((a: any, b: any) => ({ ...a, ...b }), {});
                    console.log("Updating filters", filterValues);
                    onFilterUpdate(filterValues);
                    // popupState.close();
                }

                return (
                    <React.Fragment>
                        {filterValues && <Tooltip title="Clear filter">
                            <IconButton
                                aria-label="filter clear"
                                onClick={() => onFilterUpdate(undefined)}>
                                <ClearIcon/>
                            </IconButton>
                        </Tooltip>}
                        <Tooltip title="Filter list">
                            <IconButton
                                aria-label="filter list"  {...bindTrigger(popupState)} >
                                <FilterListIcon/>
                            </IconButton>
                        </Tooltip>
                        <Popover
                            {...bindPopover(popupState)}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "center"
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "center"
                            }}
                        >
                            <Box p={2}>
                                <Formik
                                    initialValues={entityValues}
                                    onSubmit={setFilters}
                                    validate={setFilters}
                                    validateOnChange={true}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
                                        return (
                                            <Form
                                                onSubmit={handleSubmit}
                                                noValidate>
                                                <Grid container spacing={3}>
                                                    {createFilterFields(values)}
                                                </Grid>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </Box>
                        </Popover>
                    </React.Fragment>
                );
            }}
        </PopupState>
    );
}

function createFieldFormField(key: string, property: Property, value: any, includeDescription = true): ReactElement {

    if (property.dataType === "timestamp") {
        return <DateTimeField name={key}
                              property={property}
                              includeDescription={includeDescription}/>;
    } else if (property.dataType === "boolean") {
        return <SwitchField name={key}
                            property={property}
                            includeDescription={includeDescription}/>;
    } else if (property.dataType === "number") {
        if (property.enumValues) {
            return <Select name={key}
                           property={property}
                           includeDescription={includeDescription}/>;
        } else {
            return <TextField name={key}
                              property={property}
                              includeDescription={includeDescription}/>;
        }
    } else if (property.dataType === "string") {
        if (property.enumValues) {
            return <Select name={key}
                           property={property}
                           includeDescription={includeDescription}/>;
        } else {
            return <TextField name={key}
                              property={property}
                              includeDescription={includeDescription}/>;
        }
    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}

