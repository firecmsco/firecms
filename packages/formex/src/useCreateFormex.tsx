import React, { FormEvent, useEffect, useState } from "react";
import { getIn, setIn } from "./utils";
import equal from "react-fast-compare"

import { FormexController, FormexResetProps } from "./types";

export function useCreateFormex<T extends object>({
                                                      initialValues,
                                                      initialErrors,
                                                      validation,
                                                      validateOnChange = false,
                                                      onSubmit,
                                                      validateOnInitialRender = false
                                                  }: {
    initialValues: T,
    initialErrors?: Record<string, string>,
    validateOnChange?: boolean,
    validateOnInitialRender?: boolean,
    validation?: (values: T) => Record<string, string> | Promise<Record<string, string>> | undefined | void,
    onSubmit?: (values: T, controller: FormexController<T>) => void | Promise<void>
}): FormexController<T> {

    const initialValuesRef = React.useRef<T>(initialValues);
    const valuesRef = React.useRef<T>(initialValues);

    const [values, setValuesInner] = useState<T>(initialValues);
    const [touchedState, setTouchedState] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>(initialErrors ?? {});
    const [dirty, setDirty] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (validateOnInitialRender) {
            validate();
        }
    }, []);

    const setValues = (newValues: T) => {
        valuesRef.current = newValues;
        setValuesInner(newValues);
        setDirty(equal(initialValuesRef.current, newValues));
    }

    const validate = async () => {
        setIsValidating(true);
        const values = valuesRef.current;
        const validationErrors = await validation?.(values);
        setErrors(validationErrors ?? {});
        setIsValidating(false);
        return validationErrors;
    }

    const setFieldValue = (key: string, value: any, shouldValidate?: boolean) => {
        const newValues = setIn(valuesRef.current, key, value);
        valuesRef.current = newValues;
        setValuesInner(newValues);
        if (!equal(getIn(initialValuesRef.current, key), value)) {
            setDirty(true);
        }
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
        const target = event.target as HTMLInputElement;
        const name = target.name;
        setFieldTouched(name, true);
    }

    const submit = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsSubmitting(true);
        setSubmitCount(submitCount + 1);
        const validationErrors = await validation?.(valuesRef.current);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            await onSubmit?.(valuesRef.current, controllerRef.current);
        }
        setIsSubmitting(false);
        setVersion(version + 1);
    }

    const resetForm = (props?: FormexResetProps<T>) => {
        const {
            submitCount: submitCountProp,
            values: valuesProp,
            errors: errorsProp,
            touched: touchedProp
        } = props ?? {};
        initialValuesRef.current = valuesProp ?? initialValues;
        valuesRef.current = valuesProp ?? initialValues;
        setValuesInner(valuesProp ?? initialValues);
        setErrors(errorsProp ?? {});
        setTouchedState(touchedProp ?? {});
        setDirty(false);
        setSubmitCount(submitCountProp ?? 0);
        setVersion(version + 1);
    }

    const controller: FormexController<T> = {
        values,
        initialValues: initialValuesRef.current,
        handleChange,
        isSubmitting,
        setSubmitting: setIsSubmitting,
        setValues,
        setFieldValue,
        errors,
        setFieldError,
        touched: touchedState,
        setFieldTouched,
        dirty,
        setDirty,
        handleSubmit: submit,
        submitCount,
        setSubmitCount,
        handleBlur,
        validate,
        isValidating,
        resetForm,
        version
    };

    const controllerRef = React.useRef<FormexController<T>>(controller);
    controllerRef.current = controller;
    return controller
}
