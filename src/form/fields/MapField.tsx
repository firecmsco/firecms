import { EntitySchema, MapProperty, Property } from "../../models";
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    Paper
} from "@material-ui/core";
import React, { ReactNode } from "react";
import { formStyles } from "../../styles";

interface MapFieldProps<S extends EntitySchema> {
    name: string,
    property: MapProperty<S>,
    includeDescription: boolean,
    value: object,
    errors: object,
    touched: object,
    createFormField: (key: string, property: Property, value: any, includeDescription: boolean, error: any, touched: any) => ReactNode
}

export default function MapField<S extends EntitySchema>({ name, property, includeDescription, value, createFormField, errors, touched }: MapFieldProps<S>) {

    const classes = formStyles();

    const mapProperties = property.properties;
    const error = touched && property.validation?.required && !value;

    return (
        <FormControl fullWidth error={error}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || name}
            </FormHelperText>

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                <Box m={1}>
                    <Grid container>
                        {Object.entries(mapProperties).map(([entryKey, childProperty], index) => {
                                const fieldValue = value ? value[entryKey] : null;
                                const fieldError = errors ? errors[entryKey] : null;
                                const fieldTouched = touched ? touched[entryKey] : null;
                                return <Grid xs={12} key={`map-${name}-${index}`}>
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
