import React from "react";

import { EntityReference, FieldProps } from "../../types";
import { useClearRestoreValue } from "../../hooks";
import { ReferenceWidget } from "../components/ReferenceWidget";
import { ReadOnlyFieldBinding } from "./ReadOnlyFieldBinding";
import { FieldHelperText } from "../components/FieldHelperText";

/**
 * Field that opens a reference selection dialog.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ReferenceFieldBinding<M extends Record<string, any>>(props: FieldProps<EntityReference>) {

    if (typeof props.property.path !== "string") {
        return <ReadOnlyFieldBinding {...props}/>
    }

    return <ReferenceFieldBindingInternal {...props}/>;

}

function ReferenceFieldBindingInternal<M extends Record<string, any>>({
                                                                          propertyKey,
                                                                          value,
                                                                          setValue,
                                                                          error,
                                                                          showError,
                                                                          disabled,
                                                                          touched,
                                                                          autoFocus,
                                                                          property,
                                                                          includeDescription,
                                                                          context
                                                                      }: FieldProps<EntityReference>) {
    if (!property.path) {
        throw new Error("Property path is required for ReferenceFieldBinding");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const validValue = value && value instanceof EntityReference;
    const path = validValue ? value.path : property.path;

    return (
        <>

            <ReferenceWidget
                name={property.name}
                path={path}
                forceFilter={property.forceFilter}
                previewProperties={property.previewProperties}
                value={value}
                disabled={Boolean(property.disabled)}
                setValue={setValue}
            />

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>

        </>
    );
}
