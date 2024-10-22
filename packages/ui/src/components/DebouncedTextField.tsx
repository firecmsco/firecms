"use client";
import React, { ChangeEvent, useCallback, useDeferredValue, useEffect } from "react";
import { TextField, TextFieldProps } from "./index";

export function DebouncedTextField<T extends string | number>(props: TextFieldProps<T>) {

    const previousEventRef = React.useRef<ChangeEvent<any>>();
    const [internalValue, setInternalValue] = React.useState(props.value);

    const deferredValue = useDeferredValue(internalValue);

    useEffect(() => {
        setInternalValue(props.value);
    }, [props.value]);

    useEffect(() => {
        const emptyInitialValue = !props.value;
        if (emptyInitialValue && !deferredValue)
            return;
        if (deferredValue !== props.value && previousEventRef.current && props.onChange) {
            props.onChange(previousEventRef.current);
        }
    }, [deferredValue, props.value]);

    const internalOnChange = useCallback((event: ChangeEvent<any>) => {
        previousEventRef.current = event;
        setInternalValue(event.target.value);
    }, []);

    return <TextField {...props}
                      onChange={internalOnChange}
                      value={internalValue}/>
}
