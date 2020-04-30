import { EntitySchema, MapProperty, Property } from "../../models";
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    Paper
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "./CMSFieldProps";

interface MapFieldProps<S extends EntitySchema> extends CMSFieldProps<object, MapProperty<S>>{
}

export default function MapField<S extends EntitySchema>({ name, property, includeDescription, value, createFormField, errors, touched }: MapFieldProps<S>) {

    const classes = formStyles();

    const mapProperties = property.properties;
    const hasError = touched && property.validation?.required && !value;

    return (
        <FormControl fullWidth error={hasError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || name}
            </FormHelperText>

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                <Box m={1}>
                    <Grid container spacing={1}>
                        {Object.entries(mapProperties).map(([entryKey, childProperty], index) => {
                                const fieldValue = value ? value[entryKey] : null;
                                const fieldError = hasError ? hasError[entryKey] : null;
                                const fieldTouched = touched ? touched[entryKey] : null;
                                return <Grid item xs={12}
                                             key={`map-${name}-${index}`}>
                                    {createFormField(`${name}[${entryKey}]`,
                                        childProperty,
                                        fieldValue,
                                        includeDescription,
                                        fieldError,
                                        fieldTouched)}
                                </Grid>;
                            }
                        )}
                    </Grid>
                </Box>
            </Paper>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>
            }

        </FormControl>
    );
}
