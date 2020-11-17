import React, { useEffect } from "react";
import { Switch } from "@material-ui/core";

export function TableSwitch(props: {
    error: Error | undefined,
    internalValue?: boolean,
    focused: boolean,
    updateValue: (newValue: (boolean | undefined)) => void,
}) {
    const { error, internalValue, updateValue, focused } = props;

    const ref = React.createRef<HTMLTextAreaElement>();
    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
        }
    }, [focused]);

    return (
        <Switch
            inputRef={ref}
            checked={!!internalValue}
            onChange={(evt) => {
                const value = evt.target.checked as boolean;
                updateValue(value);
            }}
        />
    );
}
