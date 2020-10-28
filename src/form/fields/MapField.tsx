import { EntitySchema, Property } from "../../models";
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select
} from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";

import { CMSFieldProps } from "../form_props";
import { FieldDescription } from "../../components";
import { pick } from "../../util/objects";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { getIn } from "formik";

type MapFieldProps<S extends EntitySchema> = CMSFieldProps<object>;

export default function MapField<S extends EntitySchema>({
                                                             field,
                                                             form: { isSubmitting, errors, touched, setFieldValue },
                                                             property,
                                                             includeDescription,
                                                             createFormField,
                                                             underlyingValueHasChanged,
                                                             entitySchema
                                                         }: MapFieldProps<S>) {

    const classes = formStyles();

    const pickOnlySomeKeys = property.config?.pickOnlySomeKeys || false;

    let mapProperties: Record<string, Property>;
    if (!pickOnlySomeKeys) {
        mapProperties = property.properties;
    } else if (field.value) {
        mapProperties = pick(property.properties,
            ...Object.keys(field.value)
                .filter(key => key in property.properties)
        );
    } else {
        mapProperties = {};
    }

    const hasError = getIn(touched, field.name) && property.validation?.required && !field.value;

    function buildPickKeysSelect() {

        const keys = Object.keys(property.properties)
            .filter((key) => !field.value || !(key in field.value));

        const handleAddProperty = (event: React.ChangeEvent<{ value: unknown }>) => {
            setFieldValue(field.name, {
                ...field.value,
                [event.target.value as string]: null
            });
        };

        if (!keys.length) return <React.Fragment></React.Fragment>;

        return <Box m={1}>
            <FormControl fullWidth>
                <InputLabel>Add property</InputLabel>
                <Select
                    value={""}
                    onChange={handleAddProperty}>
                    {keys.map((key) => (
                        <MenuItem key={key} value={key}>
                            {property.properties[key].title || key}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>;
    }

    return (
        <FormControl fullWidth error={hasError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                <LabelWithIcon scaledIcon={true} property={property}/>
            </FormHelperText>

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                    <Grid container spacing={2}>
                        {Object.entries(mapProperties)
                            .map(([entryKey, childProperty], index) => {
                                    return <Grid item sm={12} xs={12}
                                                 key={`map-${field.name}-${index}`}>
                                        {createFormField(`${field.name}[${entryKey}]`,
                                            childProperty,
                                            includeDescription,
                                            underlyingValueHasChanged,
                                            entitySchema)}
                                    </Grid>;
                                }
                            )}
                    </Grid>

                {pickOnlySomeKeys && buildPickKeysSelect()}

            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

        </FormControl>
    );
}
