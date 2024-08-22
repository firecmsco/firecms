import React from "react";
import { FieldProps } from "../../types";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { ExpandablePanel, Typography } from "@firecms/ui";
import { getIconForProperty } from "../../util";
import { useClearRestoreValue } from "../useClearRestoreValue";

/**
 * Array field used for custom
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function ArrayCustomShapedFieldBinding<T extends Array<any>>({
                                                                        propertyKey,
                                                                        value,
                                                                        error,
                                                                        showError,
                                                                        isSubmitting,
                                                                        setValue,
                                                                        minimalistView,
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

    const title = (<>
        <LabelWithIconAndTooltip
            propertyKey={propertyKey}
            icon={getIconForProperty(property, "small")}
            required={property.validation?.required}
            title={property.name}
            className={"flex-grow text-text-secondary dark:text-text-secondary-dark"}/>
        {Array.isArray(value) && <Typography variant={"caption"} className={"px-4"}>({value.length})</Typography>}
    </>);

    const body = property.resolvedProperties.map((childProperty, index) => {
        const fieldProps = {
            propertyKey: `${propertyKey}[${index}]`,
            disabled,
            property: childProperty,
            includeDescription,
            underlyingValueHasChanged,
            context,
            partOfArray: true,
            minimalistView: false,
            autoFocus: false
        };
        return <div key={`custom_shaped_array_${index}`} className="pb-4">
            <PropertyFieldBinding {...fieldProps}/>
        </div>;
    });

    return (

        <>

            {!minimalistView &&
                <ExpandablePanel initiallyExpanded={expanded}
                                 title={title}
                                 className={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>
                    {body}
                </ExpandablePanel>}

            {minimalistView && body}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
