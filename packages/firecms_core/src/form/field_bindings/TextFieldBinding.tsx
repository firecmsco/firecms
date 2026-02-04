import React, { useCallback } from "react";

import { CloseIcon, Collapse, IconButton, TextField, TextareaAutosize, fieldBackgroundHoverMixin, fieldBackgroundMixin, cls } from "@firecms/ui";
import { FieldProps, NumberProperty, PreviewType, StringProperty } from "@firecms/types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { PropertyPreview } from "../../preview";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { PropertyIdCopyTooltip } from "../../components/PropertyIdCopyTooltip";
import { getIconForProperty } from "../../util";

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
}: FieldProps<StringProperty | NumberProperty>) {

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

    const label = (
        <LabelWithIcon
            icon={getIconForProperty(property, "small")}
            required={property.validation?.required}
            title={property.name ?? propertyKey} />
    );
    return (<>
        <PropertyIdCopyTooltip propertyKey={propertyKey}>
            {isMultiline ? (
                <div className={cls(
                    "rounded-md relative max-w-full min-h-[64px]",
                    fieldBackgroundMixin,
                    fieldBackgroundHoverMixin,
                    showError && error ? "border border-red-500 dark:border-red-600" : "",
                    property.widthPercentage !== undefined ? "mt-8" : undefined
                )}>
                    <div className="pointer-events-none absolute top-1 text-xs font-medium px-3 text-text-secondary dark:text-text-secondary-dark">
                        {label}
                    </div>
                    <TextareaAutosize
                        value={value ?? ""}
                        onChange={onChange}
                        autoFocus={autoFocus}
                        disabled={disabled}
                        className={cls(
                            "rounded-md resize-none w-full outline-none p-[32px] text-base bg-transparent min-h-[64px] px-3 pt-8",
                            disabled && "outline-none opacity-50 text-surface-accent-600 dark:text-surface-accent-500",
                            showError && error ? "text-red-500 dark:text-red-600" : ""
                        )}
                    />
                    {property.clearable && (
                        <div className="flex flex-row justify-center items-center absolute h-full right-0 top-0 mr-4">
                            <IconButton onClick={handleClearClick}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                    )}
                </div>
            ) : (
                <TextField
                    size={size}
                    value={value ?? ""}
                    onChange={onChange}
                    autoFocus={autoFocus}
                    className={property.widthPercentage !== undefined ? "mt-8" : undefined}
                    label={<LabelWithIcon
                        icon={getIconForProperty(property, "small")}
                        required={property.validation?.required}
                        title={property.name ?? propertyKey} />}
                    type={inputType}
                    disabled={disabled}
                    endAdornment={
                        property.clearable && <IconButton
                            onClick={handleClearClick}>
                            <CloseIcon />
                        </IconButton>
                    }
                    error={showError ? error : undefined}
                    inputClassName={error ? "text-red-500 dark:text-red-600" : ""} />
            )}
        </PropertyIdCopyTooltip>
        <FieldHelperText includeDescription={includeDescription}
            showError={showError}
            error={error}
            disabled={disabled}
            property={property} />

        {url && <Collapse
            className="mt-1 ml-1"
            in={Boolean(value)}>
            <PropertyPreview
                value={value}
                property={property}
                size={size} />
        </Collapse>}

    </>
    );

}
