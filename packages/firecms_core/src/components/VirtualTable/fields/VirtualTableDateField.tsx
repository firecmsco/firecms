import React from "react";
import { cls, DateTimeField, focusedDisabled } from "@firecms/ui";
import { useCustomizationController } from "../../../hooks";

export function VirtualTableDateField(props: {
    name: string;
    error: Error | undefined;
    mode?: "date" | "date_time";
    timezone?: string;
    internalValue: Date | undefined | null;
    updateValue: (newValue: (Date | null)) => void;
    focused: boolean;
    disabled: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const { locale } = useCustomizationController();
    const {
        disabled,
        error,
        mode,
        timezone,
        internalValue,
        updateValue
    } = props;

    return (
        <DateTimeField
            value={internalValue ?? undefined}
            onChange={(dateValue) => updateValue(dateValue ?? null)}
            size={"large"}
            invisible={true}
            inputClassName={cls("w-full h-full", focusedDisabled)}
            className={cls("w-full h-full", focusedDisabled)}
            mode={mode}
            timezone={timezone}
            locale={locale}
        />
    );
}
