import React, { useState } from "react";
import { CMSType, FieldProps, ResolvedProperty } from "../../models";
import { FormControl, FormHelperText } from "@mui/material";
import { FieldDescription } from "../index";
import { ArrayContainer, LabelWithIcon } from "../components";
import { buildPropertyField } from "../form_factory";
import { useClearRestoreValue } from "../../hooks";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";

/**
 * Generic array field that allows reordering and renders the child property
 * as nodes.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayDefaultFieldBinding<T extends Array<any>>({
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
                                                            disabled,
                                                            shouldAlwaysRerender
                                                        }: FieldProps<T>) {

    if (!property.of)
        throw Error("ArrayDefaultField misconfiguration. Property `of` not set");

    const expanded = property.expanded === undefined ? true : property.expanded;
    const ofProperty: ResolvedProperty<CMSType[]> = property.of as ResolvedProperty<CMSType[]>;

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = (index: number, internalId: number) => {
        return buildPropertyField({
            propertyKey: `${propertyKey}[${index}]`,
            disabled,
            property: ofProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            tableMode: false,
            partOfArray: true,
            autoFocus: internalId === lastAddedId,
            shouldAlwaysRerender: false
        });

    };

    return (

        <FormControl fullWidth error={showError}>

            <ExpandablePanel title={
                <FormHelperText filled
                                required={property.validation?.required}>
                    <LabelWithIcon property={property}/>
                </FormHelperText>}
                             expanded={expanded}>

                <ArrayContainer value={value}
                                name={propertyKey}
                                buildEntry={buildEntry}
                                onInternalIdAdded={setLastAddedId}
                                disabled={isSubmitting || Boolean(property.disabled)}
                                includeAddButton={!property.disabled}/>
            </ExpandablePanel>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && typeof error === "string" &&
            <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}
