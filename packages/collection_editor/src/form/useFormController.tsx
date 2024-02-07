import { useState } from "react";
import { setIn } from "./utils";
import { FormexController } from "./types";

export function useFormController<T extends object>({ initialValues }: { initialValues: T }): FormexController<T> {

    console.log("useFormController", initialValues);
    const [values, setValues] = useState<T>(initialValues);
    const [touchedState, setTouchedState] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dirty, setDirty] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);

    const setFieldValue = (key: string, value: any) => {
        const newState = setIn(values, key, value);
        setValues(newState);
    }
    const setFieldError = (key: string, error: string | undefined) => {
        const newErrors = { ...errors };
        if (error) {
            newErrors[key] = error;
        } else {
            delete newErrors[key];
        }
        setErrors(newErrors);
    }

    const setFieldTouched = (key: string, touched: boolean, shouldValidate: boolean | undefined) => {
        const newTouched = { ...touchedState };
        newTouched[key] = touched;
        setTouchedState(newTouched);
    }

    return {
        values,
        setValues,
        setFieldValue,
        errors,
        setFieldError,
        touched: touchedState,
        setFieldTouched,
        dirty,
        setDirty,
        submitCount,
        setSubmitCount
    }
}
