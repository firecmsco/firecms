import { EntitySchema } from "../../models";
import { Box, FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import PreviewComponent from "../../preview/PreviewComponent";

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
                {field.value &&
                <PreviewComponent value={field.value}
                                  property={property}
                                  small={false}/>}
                {!field.value && <Box m={1}>No value set</Box>}
            </Paper>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>
            }

        </FormControl>
    );
}
