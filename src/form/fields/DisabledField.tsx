import { EntitySchema, Property } from "../../models";
import { Box, FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import renderPreviewComponent from "../../preview";
import { CMSFieldProps } from "./form_props";

type DisabledFieldProps = CMSFieldProps<any> ;

export default function DisabledField<S extends EntitySchema>({ field, property, includeDescription }: DisabledFieldProps) {

    const classes = formStyles();

    return (

        <FormControl fullWidth disabled={true}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || field.name}
            </FormHelperText>

            <Paper elevation={0} className={classes.paper} variant={"outlined"}>
                {field.value && renderPreviewComponent(field.value, property, false)}
                {!field.value && <Box m={1}>No value set</Box>}
            </Paper>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>
            }

        </FormControl>
    );
}
