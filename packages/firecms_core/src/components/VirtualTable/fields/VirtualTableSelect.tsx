import { EnumValueConfig } from "../../../types";
import { EnumValuesChip } from "../../../preview";
import React, { useCallback, useEffect } from "react";
import { MultiSelect, MultiSelectItem, Select, SelectItem } from "@firecms/ui";

export function VirtualTableSelect(props: {
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
        enumValues,
        internalValue,
        disabled,
        small,
        focused,
        updateValue,
        multiple,
        valueType
    } = props;

    const validValue = (Array.isArray(internalValue) && multiple) ||
        (!Array.isArray(internalValue) && !multiple);

    const ref = React.useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (ref.current && focused) {
            ref.current?.focus({ preventScroll: true });
        }
    }, [focused, ref]);

    const onChange = useCallback((updatedValue: string | string[]) => {
        console.trace("onChange");
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

    const renderValue = (enumKey?: string | number) => {
        return <EnumValuesChip
            key={`${enumKey}`}
            enumKey={String(enumKey)}
            enumValues={enumValues}
            size={small ? "small" : "medium"}/>;
    };

    return (
        multiple
            ? <MultiSelect
                inputRef={ref}
                className="w-full h-full p-0 bg-transparent"
                position={"item-aligned"}
                disabled={disabled}
                includeClear={false}
                useChips={false}
                value={validValue
                    ? ((internalValue as any[]).map(v => v.toString()))
                    : ([])}
                onValueChange={onChange}>
                {enumValues?.map((enumConfig) => (
                    <MultiSelectItem
                        key={enumConfig.id}
                        value={String(enumConfig.id)}>
                        <EnumValuesChip
                            enumKey={enumConfig.id}
                            enumValues={enumValues}
                            size={small ? "small" : "medium"}/>
                    </MultiSelectItem>
                ))}
            </MultiSelect>
            : <Select
                inputRef={ref}
                size={"large"}
                fullWidth={true}
                className="w-full h-full p-0 bg-transparent"
                position={"item-aligned"}
                disabled={disabled}
                padding={false}
                value={validValue
                    ? internalValue?.toString()
                    : ""}
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
