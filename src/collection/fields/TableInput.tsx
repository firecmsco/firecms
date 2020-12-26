import { useInputStyles } from "./styles";
import React, { useEffect, useState } from "react";
import { TextareaAutosize } from "@material-ui/core";
import clsx from "clsx";

export function TableInput(props: {
    error: Error | undefined,
    value: string,
    multiline: boolean,
    focused: boolean,
    updateValue: (newValue: (string | undefined)) => void,
}) {
    const { error, value, multiline, updateValue, focused } = props;
    const [internalValue, setInternalValue] = useState<typeof value>(value);

    useEffect(
        () => {
            const handler = setTimeout(() => {
                const emptyInitialValue = !value || value.length === 0;
                if (emptyInitialValue && !internalValue)
                    return;
                updateValue(internalValue);
            }, 300);

            return () => {
                clearTimeout(handler);
            };
        },
        [internalValue]
    );

    const classes = useInputStyles();

    const ref = React.createRef<HTMLTextAreaElement>();
    useEffect(() => {
        if (ref.current && focused) {
            ref.current.focus({ preventScroll: true });
            ref.current.selectionStart = ref.current.value.length;
            ref.current.selectionEnd = ref.current.value.length;
        }
    }, [focused]);

    return (
        <TextareaAutosize
            ref={ref}
            className={clsx(classes.input)}
            value={internalValue ?? ""}
            onChange={(evt) => {
                const newValue = evt.target.value as string;
                if (multiline || !newValue.endsWith("\n"))
                    setInternalValue(newValue);
            }}
        />
    );
}
