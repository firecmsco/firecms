import React, { useState } from "react";
import { CMSType, FieldProps, ResolvedProperty } from "../../types";
import { FieldHelperText, FormikArrayContainer, LabelWithIconAndTooltip } from "../components";
import { ErrorBoundary } from "../../components";
import { getArrayResolvedProperties, getDefaultValueFor, getIconForProperty } from "../../util";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { ExpandablePanel, Typography } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";

/**
 * Generic array field that allows reordering and renders the child property
 * as nodes.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function RepeatFieldBinding<T extends Array<any>>({
                                                             propertyKey,
                                                             value,
                                                             error,
                                                             showError,
                                                             isSubmitting,
                                                             setValue,
                                                             setFieldValue,
                                                             minimalistView,
                                                             property,
                                                             includeDescription,
                                                             underlyingValueHasChanged,
                                                             context,
                                                             disabled
                                                         }: FieldProps<T>) {

    if (!property.of)
        throw Error("RepeatFieldBinding misconfiguration. Property `of` not set");

    let resolvedProperties = "resolvedProperties" in property ? property.resolvedProperties : undefined;
    if (!resolvedProperties) {
        resolvedProperties = getArrayResolvedProperties({
            propertyValue: value,
            propertyKey,
            property,
            ignoreMissingFields: false
        })
    }
    // if (!resolvedProperties || !Array.isArray(resolvedProperties))
    //     throw Error("RepeatFieldBinding - Internal error: Expected array in 'property.resolvedProperties'");

    const expanded = property.expanded === undefined ? true : property.expanded;
    const ofProperty: ResolvedProperty<CMSType[]> = property.of as ResolvedProperty<CMSType[]>;

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = (index: number, internalId: number) => {
        const childProperty = resolvedProperties[index] ?? ofProperty;
        const fieldProps = {
            propertyKey: `${propertyKey}.${index}`,
            disabled,
            property: childProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            partOfArray: true,
            minimalistView: false,
            autoFocus: internalId === lastAddedId
        };
        return <ErrorBoundary>
            <PropertyFieldBinding {...fieldProps} index={index}/>
        </ErrorBoundary>;
    };

    const arrayContainer = <FormikArrayContainer value={value}
                                                 addLabel={property.name ? "Add entry to " + property.name : "Add entry"}
                                                 name={propertyKey}
                                                 setFieldValue={setFieldValue}
                                                 buildEntry={buildEntry}
                                                 onInternalIdAdded={setLastAddedId}
                                                 disabled={isSubmitting || Boolean(property.disabled)}
                                                 includeAddButton={!property.disabled}
                                                 newDefaultEntry={getDefaultValueFor(property.of)}/>;

    const title = (<>
        <LabelWithIconAndTooltip
            propertyKey={propertyKey}
            icon={getIconForProperty(property, "small")}
            required={property.validation?.required}
            title={property.name}
            className={"flex flex-grow text-text-secondary dark:text-text-secondary-dark"}/>
        {Array.isArray(value) && <Typography variant={"caption"} className={"px-4"}>({value.length})</Typography>}
    </>);

    return (

        <>

            {!minimalistView && <ExpandablePanel initiallyExpanded={expanded}
                                                 innerClassName={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}
                                                 title={title}>
                {arrayContainer}
            </ExpandablePanel>}

            {minimalistView && arrayContainer}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
