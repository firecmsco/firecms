import React, { useState } from "react";
import { setIn } from "./utils";
import { FormexController, FormexResetProps } from "./types";

export function useFormController<T extends object>({ initialValues, validate, onSubmit }: {
    initialValues: T,
    validate?: (values: T) => Record<string, string> | Promise<Record<string, string>>,
    onSubmit?: (values: T, controller: FormexController<T>) => void | Promise<void>
}): FormexController<T> {

    const [values, setValues] = useState<T>(initialValues);
    const [touchedState, setTouchedState] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dirty, setDirty] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleChange = (event: React.SyntheticEvent) => {
        const target = event.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        setFieldValue(name, value);
        setFieldTouched(name, true, true);
    }

    const submit = async () => {
        setIsSubmitting(true);
        setSubmitCount(submitCount + 1);
        const validationErrors = await validate?.(values);
        if (validationErrors) {
            setErrors(validationErrors);
        } else {
            await onSubmit?.(values, controllerRef.current);
        }
        setIsSubmitting(false);
    }

    const resetForm = ({
                       values: valuesProp,
                       errors: errorsProp,
                       touched: touchedProp
                   }: FormexResetProps<T>) => {
        setValues(valuesProp ?? initialValues);
        setErrors(errorsProp ?? {});
        setTouchedState(touchedProp ?? {});
        setDirty(false);
        setSubmitCount(0);
    }

    const controller: FormexController<T> = {
        values,
        handleChange,
        isSubmitting,
        setValues,
        setFieldValue,
        errors,
        setFieldError,
        touched: touchedState,
        setFieldTouched,
        dirty,
        setDirty,
        submitForm: submit,
        submitCount,
        setSubmitCount,
        resetForm
    };

    const controllerRef = React.useRef<FormexController<T>>(controller);
    controllerRef.current = controller;
    return controller
}
