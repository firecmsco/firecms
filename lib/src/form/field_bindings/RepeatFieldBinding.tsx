import React, { useCallback, useState } from "react";
import { CMSType, FieldProps, ResolvedProperty } from "../../types";
import { FormControl, FormHelperText } from "@mui/material";
import { FieldDescription } from "../index";
import { ArrayContainer, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";
import { PropertyFieldBinding } from "../PropertyFieldBinding";

/**
 * Generic array field that allows reordering and renders the child property
 * as nodes.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function RepeatFieldBinding<T extends Array<any>>({
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
        throw Error("RepeatFieldBinding misconfiguration. Property `of` not set");

    if (!property.resolvedProperties || !Array.isArray(property.resolvedProperties))
        throw Error("RepeatFieldBinding - Internal error: Expected array in 'property.resolvedProperties'");

    const expanded = property.expanded === undefined ? true : property.expanded;
    const ofProperty: ResolvedProperty<CMSType[]> = property.of as ResolvedProperty<CMSType[]>;

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = useCallback((index: number, internalId: number) => {
        const childProperty = property.resolvedProperties[index] ?? ofProperty;
        const fieldProps = {
            propertyKey: `${propertyKey}[${index}]`,
            disabled,
            property: childProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            tableMode: false,
            partOfArray: true,
            autoFocus: internalId === lastAddedId,
            shouldAlwaysRerender: childProperty.fromBuilder
        };
        return <PropertyFieldBinding {...fieldProps}/>;
    }, [context, disabled, includeDescription, lastAddedId, ofProperty, property.resolvedProperties, propertyKey, underlyingValueHasChanged]);

    const arrayContainer = <ArrayContainer value={value}
                                           addLabel={property.name ? "Add entry to " + property.name : "Add entry"}
                                           name={propertyKey}
                                           buildEntry={buildEntry}
                                           onInternalIdAdded={setLastAddedId}
                                           disabled={isSubmitting || Boolean(property.disabled)}
                                           includeAddButton={!property.disabled}
                                           newDefaultEntry={property.of.defaultValue}/>;

    const title = (<LabelWithIcon property={property}/>);

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <ExpandablePanel expanded={expanded}
                                            title={title}>
                {arrayContainer}
            </ExpandablePanel>}

            {tableMode && arrayContainer}

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && typeof error === "string" &&
                <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}
