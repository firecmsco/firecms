import React from "react";
import { FieldProps } from "../../types";
import { Box, FormControl, FormHelperText } from "@mui/material";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { useClearRestoreValue } from "../../hooks";
import { ExpandablePanel, getIconForProperty } from "../../core";

/**
 * Array field used for custom
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayCustomShapedFieldBinding<T extends Array<any>>({
                                                                        propertyKey,
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
                                                                        disabled
                                                                    }: FieldProps<T, any, any>) {

    if (!Array.isArray(property.resolvedProperties))
        throw Error("ArrayCustomShapedFieldBinding misconfiguration. Property `of` not set");

    const expanded = property.expanded === undefined ? true : property.expanded;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const title = <LabelWithIcon icon={getIconForProperty(property)}
                                 title={property.name}/>;

    const body = property.resolvedProperties.map((childProperty, index) => {
        const fieldProps = {
            propertyKey: `${propertyKey}[${index}]`,
            disabled,
            property: childProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            tableMode: false,
            partOfArray: true,
            autoFocus: false
        };
        return <Box key={`custom_shaped_array_${index}`} pb={1}>
            <PropertyFieldBinding {...fieldProps}/>
        </Box>;
    });

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <ExpandablePanel initiallyExpanded={expanded} title={title}>
                {body}
            </ExpandablePanel>}

            {tableMode && body}

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && typeof error === "string" &&
                <FormHelperText error={true}>{error}</FormHelperText>}

        </FormControl>
    );
}
