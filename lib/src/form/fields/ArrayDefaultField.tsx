import React from "react";
import { CMSType, FieldProps, Property } from "../../models";
import { FormControl, FormHelperText, Paper } from "@mui/material";
import { FieldDescription } from "../index";
import { ArrayContainer, LabelWithIcon } from "../components";
import { formStyles } from "../styles";
import { buildPropertyField } from "../form_factory";
import { useClearRestoreValue } from "../../hooks";

/**
 * Generic array field that allows reordering and renders the child property
 * as nodes.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayDefaultField<T extends Array<any>>({
                                                            name,
                                                            value,
                                                            error,
                                                            showError,
                                                            isSubmitting,
                                                            setValue,
                                                            tableMode,
                                                            property,
                                                            includeDescription,
                                                            underlyingValueHasChanged,
                                                            context,
                                                            disabled,
                                                            shouldAlwaysRerender
                                                        }: FieldProps<T>) {

    if (!property.of)
        throw Error("ArrayDefaultField misconfiguration. Property `of` not set");

    const ofProperty: Property<CMSType[]> = property.of as Property<CMSType[]>;
    const classes = formStyles();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = (index: number) => {
        return buildPropertyField({
            name: `${name}[${index}]`,
            disabled,
            property: ofProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            tableMode: false,
            partOfArray: true,
            autoFocus: true,
            shouldAlwaysRerender: false
        });

    };

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <FormHelperText filled
                                           required={property.validation?.required}>
                <LabelWithIcon property={property}/>
            </FormHelperText>}

            <Paper variant={"outlined"}
                   className={classes.paper}>
                <ArrayContainer value={value}
                                name={name}
                                buildEntry={buildEntry}
                                disabled={isSubmitting || Boolean(property.disabled)}
                                includeAddButton={!property.disabled}/>

            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && typeof error === "string" &&
            <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}


