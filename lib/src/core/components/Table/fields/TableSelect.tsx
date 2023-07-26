import { EnumValueConfig } from "../../../../types";
import { ArrayEnumPreview, EnumValuesChip } from "../../../../preview";
import React, { useCallback, useEffect, useState } from "react";
import { Select, SelectItem } from "../../../../components";

export function TableSelect(props: {
    name: string;
    enumValues: EnumValueConfig[];
    error: Error | undefined;
    multiple: boolean;
    disabled: boolean;
    small: boolean;
    internalValue: string | number | string[] | number[] | undefined;
    valueType: "string" | "number";
    updateValue: (newValue: (string | number | string[] | number[] | null)) => void;
    focused: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const {
        name,
        enumValues,
        error,
        internalValue,
        disabled,
        small,
        focused,
        updateValue,
        multiple,
        valueType
    } = props;

    const [open, setOpen] = useState<boolean>(false);

    const validValue = (Array.isArray(internalValue) && multiple) ||
        (!Array.isArray(internalValue) && !multiple);

    const ref = React.useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (ref.current && focused) {
            ref.current?.focus({ preventScroll: true });
        }
    }, [focused, ref]);

    const onChange = useCallback((updatedValue: string | string[]) => {
        if (valueType === "number") {
            if (multiple) {
                const newValue = (updatedValue as string[]).map((v) => parseFloat(v));
                updateValue(newValue);
            } else {
                updateValue(parseFloat(updatedValue as string));
            }
        } else if (valueType === "string") {
            if (!updatedValue)
                updateValue(null)
            else
                updateValue(updatedValue);
        } else {
            throw Error("Missing mapping in TableSelect");
        }
    }, [multiple, updateValue, valueType]);
    const renderValue = (enumKey: string | number) => {
        if (multiple && Array.isArray(enumKey)) {
            return <ArrayEnumPreview value={enumKey}
                                     name={name}
                                     enumValues={enumValues}
                                     size={small ? "small" : "medium"}/>;
        } else {
            return <EnumValuesChip
                enumKey={enumKey}
                enumValues={enumValues}
                size={small ? "small" : "medium"}/>;
        }
    };
    return (
        <Select
            inputRef={ref}
            className="w-full h-full p-0 bg-transparent"
            position={"item-aligned"}
            disabled={disabled}
            multiple={multiple}
            padding={false}
            includeFocusOutline={false}
            value={validValue
                ? (multiple ? (internalValue as any[]).map(v => v.toString()) : internalValue?.toString())
                : (multiple ? [] : "")}
            onValueChange={onChange}
            renderValue={renderValue}>
            {enumValues?.map((enumConfig) => (
                <SelectItem
                    key={enumConfig.id}
                    value={String(enumConfig.id)}>
                    <EnumValuesChip
                        enumKey={enumConfig.id}
                        enumValues={enumValues}
                        size={small ? "small" : "medium"}/>
                </SelectItem>
            ))}
        </Select>
    );
}
