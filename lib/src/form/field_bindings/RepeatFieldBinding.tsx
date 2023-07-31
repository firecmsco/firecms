import React, { useState } from "react";
import { CMSType, FieldProps, ResolvedProperty } from "../../types";
import { FieldHelperText, FormikArrayContainer, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { ExpandablePanel } from "../../components";

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
                                                             setFieldValue,
                                                             tableMode,
                                                             property,
                                                             includeDescription,
                                                             underlyingValueHasChanged,
                                                             context,
                                                             disabled
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

    const buildEntry = (index: number, internalId: number) => {
        const childProperty = property.resolvedProperties[index] ?? ofProperty;
        const fieldProps = {
            propertyKey: `${propertyKey}.${index}`,
            disabled,
            property: childProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            tableMode: false,
            partOfArray: true,
            autoFocus: internalId === lastAddedId
        };
        return <PropertyFieldBinding {...fieldProps}/>;
    };

    const arrayContainer = <FormikArrayContainer value={value}
                                                 addLabel={property.name ? "Add entry to " + property.name : "Add entry"}
                                                 name={propertyKey}
                                                 setFieldValue={setFieldValue}
                                                 buildEntry={buildEntry}
                                                 onInternalIdAdded={setLastAddedId}
                                                 disabled={isSubmitting || Boolean(property.disabled)}
                                                 includeAddButton={!property.disabled}
                                                 newDefaultEntry={property.of.defaultValue}/>;

    const title = (<LabelWithIcon icon={getIconForProperty(property)}
                                  required={property.validation?.required}
                                  title={property.name}
                                  className={"text-text-secondary dark:text-text-secondary-dark"}/>);

    return (

        <>

            {!tableMode && <ExpandablePanel initiallyExpanded={expanded}
                                            className={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}
                                            title={title}>
                {arrayContainer}
            </ExpandablePanel>}

            {tableMode && arrayContainer}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
