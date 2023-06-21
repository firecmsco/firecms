import React, { useEffect } from "react";
import { BooleanSwitch } from "../../../../components";

export function TableSwitch(props: {
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
    const ref = React.createRef<HTMLButtonElement>();

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
