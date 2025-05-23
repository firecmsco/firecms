import React, { useEffect, useRef, useState } from "react";

import { useDebouncedCallback } from "../../../util";
import { focusedDisabled, TextareaAutosize } from "@firecms/ui";

export function VirtualTableInput(props: {
    error: Error | undefined;
    value: string;
    multiline: boolean;
    focused: boolean;
    disabled: boolean;
    updateValue: (newValue: (string | null)) => void;
}) {

    const ref = React.useRef<HTMLTextAreaElement>(null);

    const {
        disabled,
        value,
        multiline,
        updateValue,
        focused
    } = props;

    const prevValue = useRef<string | null>(value);

    const [internalValue, setInternalValue] = useState<typeof value>(value);
    const focusedState = useRef<boolean>(false);

    useEffect(() => {
        if (prevValue.current !== value && value !== internalValue)
            setInternalValue(value);
        prevValue.current = value;
    }, [value]);

    const doUpdate = React.useCallback(() => {
        const emptyInitialValue = !value;
        if (emptyInitialValue && !internalValue)
            return;
        if (internalValue !== value) {
            prevValue.current = internalValue;
            updateValue(internalValue);
        }
    }, [internalValue, updateValue, value]);

    useDebouncedCallback(internalValue, doUpdate, !focused, 2000);

    useEffect(() => {
        if (ref.current && focused && !focusedState.current) {
            focusedState.current = true;
            ref.current.focus({ preventScroll: true });
            ref.current.selectionStart = ref.current.value.length;
            ref.current.selectionEnd = ref.current.value.length;
        } else {
            focusedState.current = focused;
        }
    }, [focused, ref]);

    return (
        <TextareaAutosize
            className={focusedDisabled}
            ref={ref}
            style={{
                padding: 0,
                margin: 0,
                width: "100%",
                color: "unset",
                fontWeight: "unset",
                fontSize: "unset",
                fontFamily: "unset",
                background: "unset",
                border: "unset",
                resize: "none",
                outline: "none"
            }}
            value={internalValue ?? ""}
            onChange={(evt) => {
                const newValue = evt.target.value as string;
                if (multiline || !newValue.endsWith("\n"))
                    setInternalValue(newValue);
            }}
            onFocus={() => {
                focusedState.current = true;
            }}
            onBlur={() => {
                focusedState.current = false;
                doUpdate();
            }}
        />
    );
}
