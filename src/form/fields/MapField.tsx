import { FieldProps, Properties, Property } from "../../models";
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
import { formStyles } from "../styles";

import { FieldDescription } from "../../form/components";
import { pick } from "../../util/objects";
import LabelWithIcon from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks";
import { buildPropertyField } from "../form_factory";

/**
 * @category Form fields
 */
export default function MapField<T extends object>({
                                                       name,
                                                       value,
                                                       showError,
                                                       disabled,
                                                       property,
                                                       setValue,
                                                       tableMode,
                                                       includeDescription,
                                                       underlyingValueHasChanged,
                                                       context
                                                   }: FieldProps<T>) {

    const classes = formStyles();

    const pickOnlySomeKeys = property.config?.pickOnlySomeKeys || false;

    if (!property.properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${name}`);
    }

    let mapProperties: Record<string, Property>;
    if (!pickOnlySomeKeys) {
        mapProperties = property.properties;
    } else if (value) {
        mapProperties = pick(property.properties,
            ...Object.keys(value)
                .filter(key => key in property.properties!)
        );
    } else {
        mapProperties = {};
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    function buildPickKeysSelect() {

        const keys = Object.keys(property.properties!)
            .filter((key) => !value || !(key in value));

        const handleAddProperty = (event: React.ChangeEvent<{ value: unknown }>) => {
            setValue({
                ...value,
                [event.target.value as string]: null
            });
        };

        if (!keys.length) return <></>;

        return <Box m={1}>
            <FormControl fullWidth>
                <InputLabel>Add property</InputLabel>
                <Select
                    value={""}
                    disabled={disabled}
                    onChange={handleAddProperty}>
                    {keys.map((key) => (
                        <MenuItem key={key} value={key}>
                            {(property.properties as Properties<any>)[key].title || key}
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
                                return (
                                    <Grid item
                                          sm={12}
                                          xs={12}
                                          key={`map-${name}-${index}`}>
                                        {
                                            buildPropertyField({
                                                name: `${name}[${entryKey}]`,
                                                disabled,
                                                property: childProperty,
                                                includeDescription,
                                                underlyingValueHasChanged,
                                                context,
                                                tableMode,
                                                partOfArray: false,
                                                autoFocus: false,
                                                dependsOnOtherProperties: false
                                            })
                                        }
                                    </Grid>
                                );
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
