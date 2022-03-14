import React from "react";
import {
    FieldProps,
    Properties,
    ResolvedProperties,
    ResolvedProperty
} from "../../models";
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

import { pick } from "../../core/util/objects";
import { FieldDescription, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { buildPropertyField } from "../form_factory";
import { isHidden } from "../../core/util/entities";

/**
 * Field that renders the children property fields
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function MapFieldBinding<T extends object>({
                                               propertyKey,
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


    const pickOnlySomeKeys = property.pickOnlySomeKeys || false;

    if (!property.properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${propertyKey}`);
    }

    let mapProperties: Record<string, ResolvedProperty>;
    if (!pickOnlySomeKeys) {
        mapProperties = property.properties as ResolvedProperties;
    } else if (value) {
        mapProperties = pick(property.properties as ResolvedProperties,
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
                            {(property.properties as Properties)[key].name || key}
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

            <Paper elevation={0} variant={"outlined"} sx={(theme) => ({
                elevation: 0,
                padding: theme.spacing(2),
                [theme.breakpoints.up("md")]: {
                    padding: theme.spacing(2)
                }
            })}>
                <Grid container spacing={2}>
                    {Object.entries(mapProperties)
                        .filter(([_, property]) => !isHidden(property))
                        .map(([entryKey, childProperty], index) => {
                            return (
                                <Grid item
                                      sm={12}
                                      xs={12}
                                      key={`map-${propertyKey}-${index}`}>
                                    {
                                        buildPropertyField<any, T>({
                                            propertyKey: `${propertyKey}[${entryKey}]`,
                                            disabled,
                                            property: childProperty,
                                            includeDescription,
                                            underlyingValueHasChanged,
                                            context,
                                            tableMode,
                                            partOfArray: false,
                                            autoFocus: false,
                                                shouldAlwaysRerender: false
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
