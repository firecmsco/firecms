import { NumberProperty, StringProperty } from "../../models";
import React, { useEffect, useState } from "react";
import { Input } from "@material-ui/core";
import clsx from "clsx";
import { useInputStyles } from "./styles";

export function NumberTableInput(props: {
    error: Error | undefined,
    property: StringProperty | NumberProperty,
    value: number,
    align: "right" | "left" | "center",
    updateValue: (newValue: (number | null)) => void,
    focused: boolean,
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
}) {

    const { align, property, value, updateValue, focused, onBlur } = props;
    const [internalValue, setInternalValue] = useState<string | null>(typeof value === "number" ? value.toString() : "");

    useEffect(
        () => {
            const handler = setTimeout(() => {
                if (internalValue) {
                    const numberValue = parseFloat(internalValue);
                    if (numberValue)
                        updateValue(numberValue);
                } else {
                    updateValue(null);
                }
            }, 300);

            return () => {
                clearTimeout(handler);
            };
        },
        [internalValue]
    );

    const ref = React.createRef<HTMLInputElement>();
    const classes = useInputStyles();

    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
        }
    }, [focused]);

    const regexp = new RegExp("^[0-9]+[,.]?[0-9]*$");

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
            className={clsx(classes.input, classes.numberInput)}
            disableUnderline
            value={internalValue ?? ""}
            onBlur={onBlur}
            onChange={(evt) => {
                const newValue = evt.target.value.replace(",", ".");
                if (newValue.length === 0)
                    setInternalValue(null);
                if (regexp.test(newValue))
                    setInternalValue(newValue);
            }}
        />
    );
}
