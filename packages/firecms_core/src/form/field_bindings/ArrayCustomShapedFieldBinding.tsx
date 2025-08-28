import React from "react";
import { FieldProps } from "@firecms/types";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { ExpandablePanel, Typography } from "@firecms/ui";
import { isReadOnly } from "@firecms/util";
import { getArrayResolvedProperties, getIconForProperty, } from "../../util";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { useAuthController } from "../../hooks";

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
                                                                        minimalistView: minimalistViewProp,
                                                                        property,
                                                                        includeDescription,
                                                                        context,
                                                                        disabled
                                                                    }: FieldProps<T, any, any>) {

    const authController = useAuthController();
    const minimalistView = minimalistViewProp || property.minimalistView;

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
            title={property.name ?? propertyKey}
            className={"h-8 grow text-text-secondary dark:text-text-secondary-dark"}/>
        {Array.isArray(value) && <Typography variant={"caption"} className={"px-4"}>({value.length})</Typography>}
    </>);

    const body = resolvedProperties.map((childProperty, index) => {
        const thisDisabled = isReadOnly(childProperty) || Boolean(childProperty.disabled);
        const fieldProps = {
            propertyKey: `${propertyKey}[${index}]`,
            disabled: disabled || thisDisabled,
            property: childProperty,
            includeDescription,
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
                                 innerClassName={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>
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
