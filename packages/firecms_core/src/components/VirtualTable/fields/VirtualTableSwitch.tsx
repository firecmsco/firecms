import React, { useEffect } from "react";
import { BooleanSwitch } from "@firecms/ui";

export function VirtualTableSwitch(props: {
    error: Error | undefined;
    internalValue?: boolean;
    focused: boolean;
    disabled: boolean;
    updateValue: (newValue: (boolean | null)) => void;
}) {
    const {
        internalValue,
        updateValue,
        focused
    } = props;
    const ref = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
        }
    }, [focused, ref]);

    return (
        <BooleanSwitch
            ref={ref}
            size={"small"}
            value={Boolean(internalValue)}
            onValueChange={updateValue}
        />
    );
}
