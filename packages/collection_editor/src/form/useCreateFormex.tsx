import React, { FormEvent, useState } from "react";
import { setIn } from "./utils";
import { FormexController, FormexResetProps } from "./types";

export function useCreateFormex<T extends object>({ initialValues, initialErrors, validation, validateOnChange = false, onSubmit }: {
    initialValues: T,
    initialErrors?: Record<string, string>,
    validateOnChange?: boolean,
    validation?: (values: T) => Record<string, string>,
    onSubmit?: (values: T, controller: FormexController<T>) => void | Promise<void>
}): FormexController<T> {

    const valuesRef = React.useRef<T>(initialValues);

    const [values, setValuesInner] = useState<T>(initialValues);
    const [touchedState, setTouchedState] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>(initialErrors ?? {});
    const [dirty, setDirty] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setValues = (newValues: T) => {
        valuesRef.current = newValues;
        setValuesInner(newValues);
    }

    const validate = () => {
        const values = valuesRef.current;
        const validationErrors = validation?.(values);
        setErrors(validationErrors ?? {});
        return validationErrors;
    }

    const setFieldValue = (key: string, value: any, shouldValidate?: boolean) => {
        const newValues = setIn(valuesRef.current, key, value);
        valuesRef.current = newValues;
        setValues(newValues);
        if (shouldValidate) {
            validate();
        }
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

    const setFieldTouched = (key: string, touched: boolean, shouldValidate?: boolean | undefined) => {
        const newTouched = { ...touchedState };
        newTouched[key] = touched;
        setTouchedState(newTouched);
        if (shouldValidate) {
            validate();
        }
    }

    const handleChange = (event: React.SyntheticEvent) => {
        const target = event.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        setFieldValue(name, value, validateOnChange);
        setFieldTouched(name, true);
    }

    const handleBlur = (event: React.FocusEvent) => {
        console.log("handleBlur")
        const target = event.target as HTMLInputElement;
        const name = target.name;
        setFieldTouched(name, true);
    }

    const submit = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        setIsSubmitting(true);
        setSubmitCount(submitCount + 1);
        const validationErrors = validation?.(valuesRef.current);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            await onSubmit?.(valuesRef.current, controllerRef.current);
        }
        setIsSubmitting(false);
    }

    const resetForm = (props?: FormexResetProps<T>) => {
        const {
            values: valuesProp,
            errors: errorsProp,
            touched: touchedProp
        } = props ?? {};
        valuesRef.current = valuesProp ?? initialValues;
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
        handleBlur,
        validate,
        resetForm
    };

    const controllerRef = React.useRef<FormexController<T>>(controller);
    controllerRef.current = controller;
    return controller
}
