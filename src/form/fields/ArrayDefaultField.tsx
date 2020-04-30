import { ArrayProperty, Property } from "../../models";
import { FieldArray } from "formik";
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    Paper,
    Table,
    TableBody
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { Add, Remove } from "@material-ui/icons";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "./CMSFieldProps";


interface ArrayDefaultFieldProps extends CMSFieldProps<any[],ArrayProperty<any>>{
}

export default function ArrayDefaultField({ name, property, value, createFormField, includeDescription, errors, touched }: ArrayDefaultFieldProps) {

    const classes = formStyles();

    const ofProperty: Property = property.of;

    const hasValue = value && value.length > 0;
    const error = touched && property.validation?.required && !value;

    return <FieldArray
        name={name}
        render={arrayHelpers =>
            (

                <FormControl fullWidth error={error}>

                    <FormHelperText filled
                                    required={property.validation?.required}>
                        {property.title || name}
                    </FormHelperText>

                    <Paper variant={"outlined"} className={classes.paper}>
                        {hasValue ? (
                            <React.Fragment>
                                    {value.map((entryValue: any, index: number) => {
                                        const errorElement = errors && errors[index];
                                        const touchedElement = touched && touched[index];
                                        return (
                                            <Box key={`field_${index}`}
                                                 mb={1}
                                                 display={"flex"}>
                                                <Box flexGrow={1}
                                                     key={`field_${name}_entryValue`}>{createFormField(`${name}[${index}]`, ofProperty, entryValue, includeDescription, errorElement, touchedElement)}</Box>
                                                <Box>
                                                    <IconButton
                                                        aria-label="remove"
                                                        onClick={() => arrayHelpers.remove(index)}>
                                                        <Remove/>
                                                    </IconButton>
                                                </Box>
                                                <Box>
                                                    <IconButton
                                                        aria-label="insert"
                                                        onClick={() => arrayHelpers.insert(index + 1, undefined)}>
                                                        <Add/>
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                            </React.Fragment>
                        ) : (
                            <Box margin={2}>
                                <Button onClick={() => arrayHelpers.push(null)}>
                                    {/* show this when user has removed all entries from the list */}
                                    Add
                                </Button>
                            </Box>
                        )}
                    </Paper>

                    {includeDescription && property.description &&
                    <Box>
                        <FormHelperText>{property.description}</FormHelperText>
                    </Box>}

                </FormControl>
            )}
    />;
}
