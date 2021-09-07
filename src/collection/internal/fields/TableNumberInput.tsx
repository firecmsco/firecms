import React, { useEffect, useState } from "react";
import { Input } from "@mui/material";
import clsx from "clsx";
import { useInputStyles } from "./styles";

export function NumberTableInput(props: {
    error: Error | undefined;
    value: number;
    align: "right" | "left" | "center";
    updateValue: (newValue: (number | null)) => void;
    focused: boolean;
    disabled: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const { align, value, updateValue, focused, onBlur, disabled } = props;
    const propStringValue = (value && typeof value === "number") ? value.toString() : "";
    const [internalValue, setInternalValue] = useState<string | null>(propStringValue);

    useEffect(
        () => {
            const doUpdate = () => {
                if (internalValue !== propStringValue) {
                    if (internalValue !== undefined && internalValue !== null) {
                        const numberValue = parseFloat(internalValue);
                        if (isNaN(numberValue))
                            return;
                        if (numberValue !== undefined && numberValue !== null)
                            updateValue(numberValue);
                    } else {
                        updateValue(null);
                    }
                }
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
            if (!focused && propStringValue !== internalValue)
                setInternalValue(value !== undefined && value !== null ? value.toString() : null);
        },
        [value, focused]
    );

    const ref = React.createRef<HTMLInputElement>();
    const classes = useInputStyles();

    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
        }
    }, [focused]);

    const regexp = new RegExp("^\-?[0-9]+[,.]?[0-9]*$");

    return (
        <Input
            inputRef={ref}
            style={{
                width: "100%",
                fontSize: "unset",
                fontFamily: "unset",
                background: "unset",
                border: "unset",
                resize: "none",
                outline: "none",
                padding: 0

            }}
            inputProps={{
                style: {
                    textAlign: align
                }
            }}
            disabled={disabled}
            className={clsx(classes.input, classes.numberInput)}
            disableUnderline
            value={internalValue ?? ""}
            onBlur={onBlur}
            onChange={(evt) => {
                const newValue = evt.target.value.replace(",", ".");
                if (newValue.length === 0)
                    setInternalValue(null);
                if (regexp.test(newValue) || newValue.startsWith("-"))
                    setInternalValue(newValue);
            }}
        />
    );
}
