import React from "react";
import { DateTimeField } from "../../../ui";

export function VirtualTableDateField(props: {
    name: string;
    error: Error | undefined;
    mode?: "date" | "date_time";
    internalValue: Date | undefined | null;
    updateValue: (newValue: (Date | null)) => void;
    focused: boolean;
    disabled: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const {
        disabled,
        error,
        mode,
        internalValue,
        updateValue
    } = props;

    return (
        <DateTimeField
            value={internalValue ?? undefined}
            onChange={(dateValue) => updateValue(dateValue)}
            size={"medium"}
            invisible={true}
            className={"w-full h-full"}
            inputClassName={"w-full h-full"}
            mode={mode}
        />
    );
}
