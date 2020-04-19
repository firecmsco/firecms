import {
    ArrayProperty,
    EnumType,
    MapProperty,
    Properties,
    Property
} from "../../models";
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


interface ArrayMapFieldProps<T extends EnumType> {
    name: string,
    arrayProperty: ArrayProperty<T>,
    values: any[],
    errors: any[],
    touched: any[],
    includeDescription: boolean,
    createFormField: (key: string, property: Property, value: any, includeDescription: boolean, error: any, touched: any) => ReactElement
}

export default function ArrayMapField<T extends EnumType>({ name, arrayProperty, values, createFormField, includeDescription, errors, touched }: ArrayMapFieldProps<T>) {

    if (arrayProperty.of.dataType !== "map") {
        console.error(arrayProperty);
        throw Error("Field misconfiguration: this array field should have type map");
    }

    const classes = formStyles();
    const mapProperty: MapProperty<any> = arrayProperty.of;
    const properties: Properties = mapProperty.properties;

    return <FieldArray
        name={name}
        render={arrayHelpers => {

            const hasValue = values && values.length > 0;
            const error = touched && arrayProperty.validation?.required && !values;

            return (

                <FormControl fullWidth error={error}>

                    <FormHelperText filled
                                    required={arrayProperty.validation?.required}>
                        {arrayProperty.title || name}
                    </FormHelperText>

                    <Paper elevation={0} className={classes.paper}>

                        {hasValue ? (
                            <Table>
                                <TableBody>
                                    {values.map((entryValue: any, index: number) => (
                                        <TableRow key={`field_${index}`}>
                                            {Object.entries(properties).map(([arrayKey, childProperty]) => {

                                                const errorElement = errors && errors[index];
                                                const touchedElement = touched && touched[index];

                                                return (
                                                    <TableCell
                                                        key={`field_${arrayKey}`}>
                                                        {createFormField(`${name}[${index}].${arrayKey}`,
                                                            childProperty,
                                                            entryValue ? entryValue[arrayKey] : null,
                                                            includeDescription,
                                                            errorElement,
                                                            touchedElement)}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell size={"small"}
                                                       padding={"none"}>
                                                <IconButton aria-label="remove"
                                                            onClick={() => arrayHelpers.remove(index)}>
                                                    <Remove/>
                                                </IconButton>
                                            </TableCell>
                                            <TableCell size={"small"}
                                                       padding={"none"}>
                                                <IconButton aria-label="insert"
                                                            onClick={() => arrayHelpers.insert(index + 1, {})}>
                                                    <Add/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
            );
        }}
    />;

}
