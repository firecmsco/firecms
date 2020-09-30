import { Property } from "../../models";
import { FieldArray, getIn } from "formik";
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    Paper
} from "@material-ui/core";
import { Add, Remove } from "@material-ui/icons";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import React from "react";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

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
                        <LabelWithIcon scaledIcon={true} property={property}/>
                    </FormHelperText>

                    <Paper variant={"outlined"} className={classes.paper}>
                        {hasValue ? (
                            field.value.map((entryValue: any, index: number) => {
                                return (
                                    <Box key={`field_${index}`}
                                         mb={1}
                                         display="flex">
                                        <Box flexGrow={1}
                                             width={"100%"}
                                             key={`field_${field.name}_entryValue`}>
                                            {createFormField(`${field.name}[${index}]`, ofProperty, includeDescription)}
                                        </Box>
                                        <Box width={"50px"}
                                             display="flex"
                                             flexDirection="column"
                                             justifyContent="center"
                                             alignItems="center">
                                            <IconButton
                                                size="small"
                                                aria-label="insert"
                                                onClick={() => arrayHelpers.insert(index + 1, undefined)}>
                                                <Add/>
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                aria-label="remove"
                                                onClick={() => arrayHelpers.remove(index)}>
                                                <Remove/>
                                            </IconButton>
                                        </Box>
                                    </Box>
                                );
                            })
                        ) : (
                            <Box p={2}
                                 justifyContent="center"
                                 textAlign={"right"}>
                                <Button variant="outlined"
                                        color="primary"
                                        onClick={() => arrayHelpers.push(null)}>
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
