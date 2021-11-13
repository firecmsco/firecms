import React, { useEffect } from "react";
import { Switch } from "@mui/material";

export function TableSwitch(props: {
    error: Error | undefined;
    internalValue?: boolean;
    focused: boolean;
    disabled: boolean;
    updateValue: (newValue: (boolean | undefined)) => void;
}) {
    const { disabled, internalValue, updateValue, focused } = props;

    const ref = React.createRef<HTMLTextAreaElement>();
    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
        }
    }, [focused]);

    return (
        <Switch
            inputRef={ref}
            color={"secondary"}
            checked={!!internalValue}
            disabled={disabled}
            onChange={(evt) => {
                const value = evt.target.checked as boolean;
                updateValue(value);
            }}
        />
    );
}
