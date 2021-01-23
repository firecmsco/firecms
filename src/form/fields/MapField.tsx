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

import { CMSFieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { pick } from "../../util/objects";
import { LabelWithIcon } from "../../components/LabelWithIcon";

type MapFieldProps<S extends EntitySchema> = CMSFieldProps<object>;

export default function MapField<S extends EntitySchema>({
                                                             name,
                                                             value,
                                                             error,
                                                             showError,
                                                             isSubmitting,
                                                             touched,
                                                             property,
                                                             setValue,
                                                             tableMode,
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
    } else if (value) {
        mapProperties = pick(property.properties,
            ...Object.keys(value)
                .filter(key => key in property.properties)
        );
    } else {
        mapProperties = {};
    }

    function buildPickKeysSelect() {

        const keys = Object.keys(property.properties)
            .filter((key) => !value || !(key in value));

        const handleAddProperty = (event: React.ChangeEvent<{ value: unknown }>) => {
            setValue({
                ...value,
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
        <FormControl fullWidth error={showError}>

            {!tableMode && <FormHelperText filled
                             required={property.validation?.required}>
                <LabelWithIcon scaledIcon={true} property={property}/>
            </FormHelperText>}

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                <Grid container spacing={2}>
                    {Object.entries(mapProperties)
                        .map(([entryKey, childProperty], index) => {
                                return <Grid item sm={12} xs={12}
                                             key={`map-${name}-${index}`}>
                                    {createFormField(
                                        {
                                            name: `${name}[${entryKey}]`,
                                            property: childProperty,
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

                {pickOnlySomeKeys && buildPickKeysSelect()}

            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

        </FormControl>
    );
}
