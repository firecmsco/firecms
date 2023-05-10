import React from "react";

import { FormControl, FormHelperText } from "@mui/material";

import { EntityReference, FieldProps } from "../../types";
import { FieldDescription, ReadOnlyFieldBinding } from "../index";
import { useClearRestoreValue } from "../../hooks";
import { ReferenceWidget } from "../components/ReferenceWidget";

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
        <FormControl error={showError} fullWidth>

            <ReferenceWidget
                name={property.name}
                path={path}
                forceFilter={property.forceFilter}
                previewProperties={property.previewProperties}
                value={value}
                disabled={Boolean(property.disabled)}
                setValue={setValue}
            />

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && <FormHelperText error={true}>{error}</FormHelperText>}

        </FormControl>
    );
}
