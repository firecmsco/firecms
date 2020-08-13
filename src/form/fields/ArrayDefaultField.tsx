import { Property } from "../../models";
import { FieldArray, getIn } from "formik";
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
                                                 form: { errors, touched },
                                                 property,
                                                 createFormField,
                                                 includeDescription
                                             }: ArrayDefaultFieldProps<T>) {

    const classes = formStyles();

    const ofProperty: Property = property.of;

    const hasValue = field.value && field.value.length > 0;

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return <FieldArray
        name={field.name}
        render={arrayHelpers =>
            (

                <FormControl fullWidth error={showError}>

                    <FormHelperText filled
                                    required={property.validation?.required}>
                        {property.title}
                    </FormHelperText>

                    <Paper variant={"outlined"}
                           className={classes.paper}>
                        {hasValue ? (
                            <Container maxWidth={"md"}>
                                {field.value.map((entryValue: any, index: number) => {
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
                            </Container>
                        ) : (
                            <Box margin={2}>
                                <Button
                                    onClick={() => arrayHelpers.push(null)}>
                                    {/* show this when user has removed all entries from the list */}
                                    Add
                                </Button>
                            </Box>
                        )}
                    </Paper>

                    {includeDescription &&
                    <FieldDescription property={property}/>}

                </FormControl>
            )}
    />;
}
