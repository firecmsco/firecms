import { EntitySchema, FilterValues, Property } from "../models";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { Button, IconButton, Tooltip } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import React from "react";
import { Form, Formik } from "formik";
import { initFilterValues } from "../firebase/firestore";
import { useStyles } from "../styles";
import ClearIcon from "@material-ui/icons/Clear";
import { getFilterableProperties } from "../util/properties";
import StringNumberFilterField from "./filters/StringNumberFilterField";

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
            <Box className={classes.filter} width={220}>
                {filterableProperties.map(
                    ([key, property]) => {
                        const value = values ? values[key] : undefined;
                        const formField = createFilterField(key, property, value);
                        return (
                            <Box key={`filter_${key}`} mb={1}>
                                {formField}
                            </Box>
                        );
                    })}
            </Box>
        );
    }

    const cleanedInitialValues = filterValues || initFilterValues(schema);

    return (
        <PopupState variant="popover" popupId="collection-filter">
            {(popupState) => {

                function setFilters(filterValues: FilterValues<S>) {
                    const filters = { ...filterValues };
                    console.log("Updating filters", filters);
                    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
                    onFilterUpdate(filters);
                    popupState.close();
                }

                return (
                    <React.Fragment>
                        {filterValues ?
                            <Tooltip title="Clear filter">
                                <IconButton
                                    size={"small"}
                                    aria-label="filter clear"
                                    onClick={() => onFilterUpdate(undefined)}>
                                    <ClearIcon fontSize={"small"}/>
                                </IconButton>
                            </Tooltip>
                            :
                            <Box style={{ width: 26 }}/>}

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
                                    initialValues={cleanedInitialValues}
                                    onSubmit={setFilters}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
                                        return (
                                            <Form
                                                onSubmit={handleSubmit}
                                                noValidate>
                                                {createFilterFields(values)}
                                                <Box display="flex"
                                                     justifyContent="flex-end">
                                                    <Box p={1}
                                                         justifyContent="flex-end">
                                                        <Button
                                                            size={"small"}
                                                            variant="outlined"
                                                            color="primary"
                                                            type="submit">Ok</Button>
                                                    </Box>
                                                </Box>
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

function createFilterField(key: string, property: Property, value: any): JSX.Element {

    if (property.dataType === "number" || property.dataType === "string") {
        return <StringNumberFilterField name={key} property={property}/>;
    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}

