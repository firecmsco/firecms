import React, { useEffect, useRef, useState } from "react";

import { useDebounce } from "../../../util";
import { TextareaAutosize } from "../../fields/TextareaAutosize";

export function TableInput(props: {
    error: Error | undefined;
    value: string;
    multiline: boolean;
    focused: boolean;
    disabled: boolean;
    updateValue: (newValue: (string | null)) => void;
}) {

    const { disabled, value, multiline, updateValue, focused } = props;
    const [internalValue, setInternalValue] = useState<typeof value>(value);
    const focusedState = useRef<boolean>(false);

    const doUpdate = React.useCallback(() => {
        const emptyInitialValue = !value;
        if (emptyInitialValue && !internalValue)
            return;
        if (internalValue !== value)
            updateValue(internalValue);
    }, [internalValue, value]);

    useDebounce(internalValue, doUpdate, 3000);

    // update on external value change
    useEffect(
        () => {
            if (value !== internalValue)
                setInternalValue(value);
        }, [value]
    );

    const ref = React.createRef<HTMLTextAreaElement>();
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
            ref={ref}
            style={{
                padding: 0,
                margin: 0,
                width: "100%",
                color: "unset",
                fontWeight: "unset",
                lineHeight: "unset",
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
            onBlur={() => {
                doUpdate();
            }}
        />
    );
}
