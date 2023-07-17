import React from "react";
import { FieldProps } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
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
                                 required={property.validation?.required}
                                 className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}
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
        return <div key={`custom_shaped_array_${index}`} className="pb-4">
            <PropertyFieldBinding {...fieldProps}/>
        </div>;
    });

    return (

        <>

            {!tableMode &&
                <ExpandablePanel initiallyExpanded={expanded}
                                 title={title}
                                 contentClassName={"p-2 md:p-4"}>
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
