import { EntitySchema, Property } from "../../models";
import { Box, FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import renderPreviewComponent from "../../preview";

interface DisabledFieldProps<S extends EntitySchema> {
    name: string,
    property: Property,
    includeDescription: boolean,
    value: object,
}

export default function DisabledField<S extends EntitySchema>({ name, property, includeDescription, value }: DisabledFieldProps<S>) {

    const classes = formStyles();

    return (

        <FormControl fullWidth disabled={true}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || name}
            </FormHelperText>

            <Paper elevation={0} className={classes.paper} variant={"outlined"}>
                {value && renderPreviewComponent(value, property)}
                {!value && <Box m={1}>No value set</Box>}
            </Paper>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>
            }

        </FormControl>
    );
}
