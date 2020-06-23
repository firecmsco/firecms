import { EntitySchema } from "../../models";
import { Box, FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import PreviewComponent from "../../preview/PreviewComponent";

type DisabledFieldProps = CMSFieldProps<any> ;

export default function DisabledField<S extends EntitySchema>({ field, property, includeDescription }: DisabledFieldProps) {

    const classes = formStyles();
    const value = field.value;
    const hasValue = value instanceof Array ? value.length > 0 : !!value;

    return (

        <FormControl fullWidth disabled={true}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || field.name}
            </FormHelperText>

            <Paper elevation={0} className={classes.paper} variant={"outlined"}>

                {hasValue &&
                <PreviewComponent value={value}
                                  property={property}
                                  small={false}/>}

                {!hasValue && <Box>No value set</Box>}

            </Paper>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>
            }

        </FormControl>
    );
}
