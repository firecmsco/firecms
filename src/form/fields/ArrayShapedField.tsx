import { Property } from "../../models";
import { getIn } from "formik";
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    Paper
} from "@material-ui/core";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import React from "react";
import { FieldDescription } from "../../components";

type ArrayDefaultFieldProps = CMSFieldProps<any[]>;

export default function ArrayShapedField<T>({
                                                field,
                                                form: { errors, touched },
                                                property,
                                                createFormField,
                                                includeDescription,
                                                underlyingValueHasChanged,
                                                entitySchema
                                            }: ArrayDefaultFieldProps) {

    const classes = formStyles();

    if (!Array.isArray(property.of)) {
        throw Error("Misconfiguration in array shaped field");
    }

    const ofProperties: Property[] = property.of;

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (
        <FormControl fullWidth error={showError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title}
            </FormHelperText>

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                <Box m={1}>
                    <Grid container spacing={2}>
                        {ofProperties.map((childProperty, index) => {
                                return <Grid item
                                             xs={12}
                                             key={`array-shape-${field.name}-${index}`}>
                                    {createFormField(
                                        {
                                            name:`${field.name}[${index}]`,
                                            property:childProperty,
                                            includeDescription,
                                            underlyingValueHasChanged,
                                            entitySchema,
                                            partOfArray: false
                                        })}
                                </Grid>;
                            }
                        )}
                    </Grid>
                </Box>
            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>
    );
}
