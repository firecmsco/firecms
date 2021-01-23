import { Property } from "../../models";
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    Paper
} from "@material-ui/core";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../../models/form_props";
import React from "react";
import { FieldDescription } from "../../components";

type ArrayDefaultFieldProps = CMSFieldProps<any[]>;

export default function ArrayShapedField<T>({
                                                name,
                                                value,
                                                error,
                                                showError,
                                                isSubmitting,
                                                touched,
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
                                             key={`array-shape-${name}-${index}`}>
                                    {createFormField(
                                        {
                                            name:`${name}[${index}]`,
                                            property:childProperty,
                                            includeDescription,
                                            underlyingValueHasChanged,
                                            entitySchema,
                                            tableMode: false,
                                            partOfArray: false,
                                            autoFocus: false
                                        })}
                                </Grid>;
                            }
                        )}
                    </Grid>
                </Box>
            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError
            && typeof error === "string"
            && <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}
