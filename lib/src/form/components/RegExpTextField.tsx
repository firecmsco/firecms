import React, { ChangeEvent } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import {
    hydrateRegExp,
    isValidRegExp,
    serializeRegExp
} from "../../core/util/regexp";

export default function RegExpTextField(props: TextFieldProps) {

    const [internalValue, setInternalValue] = React.useState<string>(props.value instanceof RegExp ? serializeRegExp(props.value) : "");

    React.useEffect(() => {
        setInternalValue(props.value instanceof RegExp ? serializeRegExp(props.value) : "");
    }, [props.value]);

    const internalOnChange = (event: ChangeEvent<any>) => {
        setInternalValue(event.target.value);
        if (props.onChange) {
            const regexp = hydrateRegExp(event.target.value);
            props.onChange(regexp as any);
        }
    };

    const error = !!internalValue && !isValidRegExp(internalValue);
    return <TextField {...props}
                      error={error}
                      onChange={internalOnChange}
                      value={internalValue}
                      helperText={"Use the JS format. e.g. /\\d.*/g"}/>
}
