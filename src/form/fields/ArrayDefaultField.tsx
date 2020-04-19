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
    TableBody,
    TableCell,
    TableRow
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { Add, Remove } from "@material-ui/icons";
import { formStyles } from "../../styles";


interface ArrayDefaultFieldProps {
    name: string,
    arrayProperty: ArrayProperty<any>,
    values: any[],
    errors: any[],
    touched: any[],
    includeDescription: boolean,
    createFormField: (key: string, property: Property, value: any, includeDescription: boolean, error: any, touched: any) => ReactElement
}

export default function ArrayDefaultField({ name, arrayProperty, values, createFormField, includeDescription, errors, touched }: ArrayDefaultFieldProps) {

    const classes = formStyles();

    const property: Property = arrayProperty.of;

    const hasValue = values && values.length > 0;
    const error = touched && arrayProperty.validation?.required && !values;

    return <FieldArray
        name={name}
        render={arrayHelpers =>
            (

                <FormControl fullWidth error={error}>

                    <FormHelperText filled
                                    required={arrayProperty.validation?.required}>
                        {arrayProperty.title || name}
                    </FormHelperText>

                    <Paper variant={"outlined"} className={classes.paper}>
                        {hasValue ? (
                            <Table>
                                <TableBody>
                                    {values.map((entryValue: any, index: number) => {
                                        const errorElement = errors && errors[index];
                                        const touchedElement = touched && touched[index];
                                        return (
                                            <TableRow key={`field_${index}`}>
                                                <TableCell
                                                    key={`field_${name}_entryValue`}>
                                                    {createFormField(`${name}[${index}]`, property, entryValue, includeDescription, errorElement, touchedElement)}
                                                </TableCell>
                                                <TableCell size={"small"}
                                                           padding={"none"}>
                                                    <Box display={"inline"}>

                                                        <IconButton
                                                            aria-label="remove"
                                                            onClick={() => arrayHelpers.remove(index)}>
                                                            <Remove/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="insert"
                                                            onClick={() => arrayHelpers.insert(index + 1, undefined)}>
                                                            <Add/>
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <Box margin={2}>
                                <Button onClick={() => arrayHelpers.push(null)}>
                                    {/* show this when user has removed all entries from the list */}
                                    Add
                                </Button>
                            </Box>
                        )}
                    </Paper>

                    {includeDescription && arrayProperty.description &&
                    <Box>
                        <FormHelperText>{arrayProperty.description}</FormHelperText>
                    </Box>}

                </FormControl>
            )}
    />;
}
