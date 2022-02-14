import React, { ChangeEvent } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { useDebounce } from "../../../internal/useDebounce";

export default function DebouncedTextField(props: TextFieldProps) {

    const previousEventRef = React.useRef<ChangeEvent<any>>();
    const [internalValue, setInternalValue] = React.useState(props.value);

    const doUpdate = React.useCallback(() => {
        const emptyInitialValue = !props.value;
        if (emptyInitialValue && !internalValue)
            return;
        if (internalValue !== props.value && previousEventRef.current && props.onChange)
            props.onChange(previousEventRef.current);
    }, [internalValue, props.value]);

    useDebounce(internalValue, doUpdate, 64);
    const internalOnChange = (event: ChangeEvent<any>) => {
        previousEventRef.current = event;
        setInternalValue(event.target.value);
    };
    return <TextField {...props}
                      onChange={internalOnChange}
                      value={internalValue}/>
}
