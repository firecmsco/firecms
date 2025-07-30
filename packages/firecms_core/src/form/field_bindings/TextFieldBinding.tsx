import React, { useCallback } from "react";

import { CloseIcon, Collapse, IconButton, TextField } from "@firecms/ui";
import { FieldProps, PreviewType } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { getIconForProperty } from "../../util";
import { PropertyPreview } from "../../preview";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { PropertyIdCopyTooltip } from "../../components/PropertyIdCopyTooltip";

interface TextFieldBindingProps<T extends string | number> extends FieldProps<T> {
    allowInfinity?: boolean
}

/**
 * Generic text field.
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function TextFieldBinding<T extends string | number>({
                                                                propertyKey,
                                                                value,
                                                                setValue,
                                                                error,
                                                                showError,
                                                                disabled,
                                                                autoFocus,
                                                                property,
                                                                includeDescription,
                                                                size = "large"
                                                            }: TextFieldBindingProps<T>) {

    let multiline: boolean | undefined;
    let url: boolean | PreviewType | undefined;
    if (property.type === "string") {
        multiline = property.multiline;
        url = property.url;
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setValue(null);
    }, [setValue]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (inputType === "number") {
            const numberValue = event.target.value ? parseFloat(event.target.value) : undefined;
            if (numberValue && isNaN(numberValue)) {
                setValue(null);
            } else if (numberValue !== undefined && numberValue !== null) {
                setValue(numberValue as T);
            } else {
                setValue(null);
            }
        } else {
            setValue(event.target.value as T);
        }
    };

    const isMultiline = Boolean(multiline);

    const inputType = property.type === "number" ? "number" : undefined;
    return (<>
            <PropertyIdCopyTooltip propertyKey={propertyKey}>
                <TextField
                    size={size}
                    value={value}
                    onChange={onChange}
                    autoFocus={autoFocus}
                    className={property.widthPercentage !== undefined ? "mt-8" : undefined}
                    label={<LabelWithIcon
                        icon={getIconForProperty(property, "small")}
                        required={property.validation?.required}
                        title={property.name ?? propertyKey}/>}
                    type={inputType}
                    multiline={isMultiline}
                    disabled={disabled}
                    endAdornment={
                        property.clearable && <IconButton
                            onClick={handleClearClick}>
                            <CloseIcon/>
                        </IconButton>
                    }
                    error={showError ? error : undefined}
                    inputClassName={error ? "text-red-500 dark:text-red-600" : ""}/>
            </PropertyIdCopyTooltip>
            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

            {url && <Collapse
                className="mt-1 ml-1"
                in={Boolean(value)}>
                <PropertyPreview
                    value={value}
                    property={property}
                    size={size}/>
            </Collapse>}

        </>
    );

}
