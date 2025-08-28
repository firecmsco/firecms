import React, { useState } from "react";
import { CMSType, FieldProps, PropertyFieldBindingProps, ResolvedProperty } from "@firecms/types";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { ArrayContainer, ArrayEntryParams, ErrorBoundary } from "../../components";
import { getDefaultValueFor, mergeDeep } from "@firecms/util";
import { getArrayResolvedProperties, getIconForProperty } from "../../util";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { ExpandablePanel, Typography } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { useAuthController } from "../../hooks";

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
                                                             minimalistView: minimalistViewProp,
                                                             property,
                                                             includeDescription,
                                                             underlyingValueHasChanged,
                                                             context,
                                                             disabled
                                                         }: FieldProps<T>) {

    const authController = useAuthController();
    const minimalistView = minimalistViewProp || property.minimalistView;

    if (!property.of)
        throw Error("RepeatFieldBinding misconfiguration. Property `of` not set");

    let resolvedProperties = "resolvedProperties" in property ? property.resolvedProperties : undefined;
    if (!resolvedProperties) {
        resolvedProperties = getArrayResolvedProperties({
            propertyValue: value,
            propertyKey,
            property,
            ignoreMissingFields: false,
            authController
        })
    }

    const expanded = property.expanded === undefined ? true : property.expanded;
    const ofProperty: ResolvedProperty<CMSType[]> = property.of as ResolvedProperty<CMSType[]>;

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = ({
                            index,
                            internalId,
                            storedProps,
                            storeProps
                        }: ArrayEntryParams) => {
        const childProperty = resolvedProperties[index] ?? ofProperty;
        const fieldProps: PropertyFieldBindingProps<any, any> = {
            propertyKey: `${propertyKey}.${index}`,
            disabled,
            property: storedProps ? mergeDeep(childProperty, storedProps) : childProperty,
            onPropertyChange: storeProps,
            includeDescription,
            underlyingValueHasChanged,
            context,
            partOfArray: true,
            minimalistView: false,
            autoFocus: internalId === lastAddedId,
        };
        return <ErrorBoundary>
            <PropertyFieldBinding {...fieldProps} index={index}/>
        </ErrorBoundary>;
    };

    const canAddElements = !property.disabled && !isSubmitting && !disabled && (property.canAddElements || property.canAddElements === undefined);
    const sortable = property.sortable === undefined ? true : property.sortable;
    const arrayContainer = <ArrayContainer droppableId={propertyKey}
                                           addLabel={property.name ? "Add entry to " + property.name : "Add entry"}
                                           value={value}
                                           buildEntry={buildEntry}
                                           onInternalIdAdded={setLastAddedId}
                                           disabled={isSubmitting || Boolean(property.disabled)}
                                           canAddElements={canAddElements}
                                           sortable={sortable}
                                           newDefaultEntry={getDefaultValueFor(property.of)}
                                           onValueChange={(value) => setFieldValue(propertyKey, value)}
                                           className={property.widthPercentage !== undefined ? "mt-8" : undefined}
    />;

    const title = (<>
        <LabelWithIconAndTooltip
            propertyKey={propertyKey}
            icon={getIconForProperty(property, "small")}
            required={property.validation?.required}
            title={property.name ?? propertyKey}
            className={"h-8 flex grow text-text-secondary dark:text-text-secondary-dark"}/>
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
                             error={error ? (typeof error === "string" ? error : "A property of this array/repeat has an error") : undefined}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
