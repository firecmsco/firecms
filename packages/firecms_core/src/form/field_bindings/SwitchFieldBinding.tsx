import React from "react";

import { FieldProps } from "../../types";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../util";
import { FieldHelperText } from "../components/FieldHelperText";
import { BooleanSwitchWithLabel } from "@firecms/ui";

type SwitchFieldProps = FieldProps<boolean>;

/**
 * Simple boolean switch biding to a boolean property.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export const SwitchFieldBinding = React.forwardRef(function SwitchFieldBinding({
                                                                                   propertyKey,
                                                                                   value,
                                                                                   setValue,
                                                                                   error,
                                                                                   showError,
                                                                                   autoFocus,
                                                                                   disabled,
                                                                                   touched,
                                                                                   property,
                                                                                   includeDescription
                                                                               }: SwitchFieldProps, ref) {

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <>

            <BooleanSwitchWithLabel
                value={value}
                onValueChange={(v) => setValue(v)}
                error={showError}
                label={<LabelWithIcon icon={getIconForProperty(property, "small")}
                                      required={property.validation?.required}
                                      title={property.name}/>}
                disabled={disabled}
                autoFocus={autoFocus}
                size={"medium"}
            />

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>
        </>

    );
});
