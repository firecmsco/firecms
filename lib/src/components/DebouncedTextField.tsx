import React, { ChangeEvent, useCallback, useDeferredValue, useEffect } from "react";
import { TextInput, TextInputProps } from "./index";

export function DebouncedTextField<T extends string | number>(props: TextInputProps<T>) {

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
        if (deferredValue !== props.value && previousEventRef.current && props.onChange)
            props.onChange(previousEventRef.current);
    }, [deferredValue, props.value, props.onChange]);

    const internalOnChange = useCallback((event: ChangeEvent<any>) => {
        previousEventRef.current = event;
        setInternalValue(event.target.value);
    }, []);

    return <TextInput {...props}
                      onChange={internalOnChange}
                      value={internalValue}/>
}
