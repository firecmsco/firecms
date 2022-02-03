import { useInputStyles } from "./styles";
import React, { useEffect, useState } from "react";
import { TextareaAutosize } from "@mui/material";
import clsx from "clsx";

import { useDebounce } from "../../../../internal/useDebounce";

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

    const doUpdate = React.useCallback(() => {
        const emptyInitialValue = !value;
        if (emptyInitialValue && !internalValue)
            return;
        if (internalValue !== value)
            updateValue(internalValue);
    }, [internalValue, value]);

    useDebounce(internalValue, doUpdate);

    useEffect(
        () => {
            if (!focused && value !== internalValue)
                setInternalValue(value);
        },
        [value, focused]
    );

    const classes = useInputStyles();

    const ref = React.createRef<HTMLTextAreaElement>();
    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
            ref.current.selectionStart = ref.current.value.length;
            ref.current.selectionEnd = ref.current.value.length;
        }
    }, [focused, ref]);

    return (
        <div style={{ display: "flex" }}>
            <TextareaAutosize
                ref={ref}
                disabled={disabled}
                className={clsx(classes.input)}
                value={internalValue ?? ""}
                onChange={(evt) => {
                    const newValue = evt.target.value as string;
                    if (multiline || !newValue.endsWith("\n"))
                        setInternalValue(newValue);
                }}
            />
        </div>
    );
}
