import React, { useEffect, useState } from "react";
import { TextareaAutosize, Theme } from "@mui/material";
import clsx from "clsx";


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

    useEffect(
        () => {
            const doUpdate = () => {
                const emptyInitialValue = !value || value.length === 0;
                if (emptyInitialValue && !internalValue)
                    return;
                if (internalValue !== value)
                    updateValue(internalValue);
            };
            const handler = setTimeout(doUpdate, 300);

            return () => {
                clearTimeout(handler);
            };

        },
        [internalValue]
    );

    useEffect(
        () => {
            if (!focused && value !== internalValue)
                setInternalValue(value);
        },
        [value, focused]
    );

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
            />
        </div>
    );
}
