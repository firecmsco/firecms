import { Property } from "../../models";
import { getIn, insert } from "formik";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    IconButton,
    Paper
} from "@material-ui/core";
import { Add, Remove } from "@material-ui/icons";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import React from "react";
import { FieldDescription } from "../../util";

type ArrayDefaultFieldProps<T> = CMSFieldProps<T[]>;

export default function ArrayDefaultField<T>({
                                                 field,
                                                 form: { errors, touched, setFieldValue, setFieldTouched },
                                                 property,
                                                 createFormField,
                                                 includeDescription
                                             }: ArrayDefaultFieldProps<T>) {

    const classes = formStyles();

    const ofProperty: Property = property.of;

    const hasValue = field.value && field.value.length > 0;

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (
        <FormControl fullWidth error={showError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title}
            </FormHelperText>

            <Paper variant={"outlined"}
                   className={classes.paper}>
                {hasValue ? (
                    <Container maxWidth={"md"}>
                        {field.value.map((_: any, index: number) => {
                            return (
                                <Box key={`field_${index}`}
                                     mb={1}
                                     alignItems="flex-start"
                                     display={"flex"}>
                                    <Box flexGrow={1}
                                         key={`field_${field.name}_entryValue`}>
                                        {createFormField(`${field.name}[${index}]`, ofProperty, includeDescription)}
                                    </Box>
                                    <Box>
                                        <IconButton
                                            aria-label="remove"
                                            onClick={() => {
                                                const newValue = field.value.slice(0, index).concat(field.value.slice(index + 1, field.value.length));
                                                setFieldTouched(field.name);
                                                setFieldValue(field.name, newValue);
                                            }}>
                                            <Remove/>
                                        </IconButton>
                                    </Box>
                                    <Box>
                                        <IconButton
                                            aria-label="insert"
                                            onClick={() => {
                                                setFieldTouched(field.name);
                                                setFieldValue(field.name, insert(field.value, index + 1, null));
                                            }}>
                                            <Add/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Container>
                ) : (
                    <Box margin={2}>
                        <Button
                            onClick={() => {
                                setFieldTouched(field.name);
                                setFieldValue(field.name, insert(field.value, 0, undefined));
                            }}>
                            Add
                        </Button>
                    </Box>
                )}
            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>
    );

}
