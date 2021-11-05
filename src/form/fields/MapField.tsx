import React from "react";
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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

import { formStyles } from "../styles";
import { pick } from "../../core/util/objects";
import { LabelWithIcon } from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks";
import { buildPropertyField } from "../form_factory";
import { FieldDescription } from "../components";
import { isHidden } from "../../core/utils";

/**
 * Field that renders the children property fields
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function MapField<T extends object>({
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
        mapProperties = property.properties as Properties<any>;
    } else if (value) {
        mapProperties = pick(property.properties as Properties<any>,
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

        const handleAddProperty = (event: SelectChangeEvent) => {
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
                    variant={"standard"}
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
                <LabelWithIcon property={property}/>
            </FormHelperText>}

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                <Grid container spacing={2}>
                    {Object.entries(mapProperties)
                        .filter(([_, property]) => !isHidden(property))
                        .map(([entryKey, childProperty], index) => {
                                return (
                                    <Grid item
                                          sm={12}
                                          xs={12}
                                          key={`map-${name}-${index}`}>
                                        {
                                            buildPropertyField<any, T>({
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
