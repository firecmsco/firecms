import React from "react";
import { FieldProps } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { PropertyFieldBinding } from "../PropertyFieldBinding";
import { useClearRestoreValue, useFireCMSContext } from "../../hooks";
import { getIconForProperty } from "../../core";
import { ExpandablePanel } from "../../components";

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

    const { fields } = useFireCMSContext();
    if (!Array.isArray(property.resolvedProperties))
        throw Error("ArrayCustomShapedFieldBinding misconfiguration. Property `of` not set");

    const expanded = property.expanded === undefined ? true : property.expanded;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const title = <LabelWithIcon icon={getIconForProperty(property, "small")}
                                 required={property.validation?.required}
                                 className={"text-text-secondary dark:text-text-secondary-dark"}
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
            partOfBlock: false,
            autoFocus: false
        };
        return <div key={`custom_shaped_array_${index}`} className="pb-4">
            <PropertyFieldBinding {...fieldProps}/>
        </div>;
    });

    return (

        <>

            {!tableMode &&
                <ExpandablePanel initiallyExpanded={expanded}
                                 title={title}
                                 className={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>
                    {body}
                </ExpandablePanel>}

            {tableMode && body}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
