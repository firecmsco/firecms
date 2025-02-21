import React, { useEffect, useState } from "react";
import { getIn, setIn } from "./utils";
import equal from "react-fast-compare"

import { FormexController, FormexResetProps } from "./types";

export function useCreateFormex<T extends object>({
                                                      initialValues,
                                                      initialErrors,
                                                      initialDirty,
                                                      validation,
                                                      validateOnChange = false,
                                                      validateOnInitialRender = false,
                                                      onSubmit,
                                                      onReset,
                                                      debugId,
                                                  }: {
    initialValues: T;
    initialErrors?: Record<string, string>;
    initialDirty?: boolean;
    validateOnChange?: boolean;
    validateOnInitialRender?: boolean;
    validation?: (
        values: T
    ) =>
        | Record<string, string>
        | Promise<Record<string, string>>
        | undefined
        | void;
    onSubmit?: (values: T, controller: FormexController<T>) => void | Promise<void>;
    onReset?: (controller: FormexController<T>) => void | Promise<void>;
    debugId?: string;
}): FormexController<T> {
    // Refs (for current state which shouldn’t trigger re – renders)
    const initialValuesRef = React.useRef<T>(initialValues);
    const valuesRef = React.useRef<T>(initialValues);
    const debugIdRef = React.useRef<string | undefined>(debugId);

    // State
    const [values, setValuesInner] = useState<T>(initialValues);
    const [touchedState, setTouchedState] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>(initialErrors ?? {});
    const [dirty, setDirty] = useState(initialDirty ?? false);
    const [submitCount, setSubmitCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [version, setVersion] = useState(0);

    // Run initial validation if required
    useEffect(() => {
        if (validateOnInitialRender) {
            validate();
        }
    }, []);

    // Memoize setValues so that it doesn’t change unless nothing inside changes.
    const setValues = React.useCallback((newValues: T) => {
        valuesRef.current = newValues;
        setValuesInner(newValues);
        // Adjust dirty flag by comparing with the initial values
        setDirty(!equal(initialValuesRef.current, newValues));
    }, []);

    // Memoized validate function
    const validate = React.useCallback(async () => {
        setIsValidating(true);
        const validationErrors = await validation?.(valuesRef.current);
        setErrors(validationErrors ?? {});
        setIsValidating(false);
        return validationErrors;
    }, [validation]);

    // setFieldValue updates a single field and optionally triggers validation
    const setFieldValue = React.useCallback(
        (key: string, value: any, shouldValidate?: boolean) => {
            const newValues = setIn(valuesRef.current, key, value);
            valuesRef.current = newValues;
            setValuesInner(newValues);
            // Compare with initial value using getIn
            if (!equal(getIn(initialValuesRef.current, key), value)) {
                setDirty(true);
            }
            if (shouldValidate) {
                validate();
            }
        },
        [validate]
    );

    // setFieldError uses functional updates to ensure we’re working off the current error state.
    const setFieldError = React.useCallback((key: string, error: string | undefined) => {
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (error) {
                newErrors[key] = error;
            } else {
                delete newErrors[key];
            }
            return newErrors;
        });
    }, []);

    // setFieldTouched updates touched state and can optionally trigger validation.
    const setFieldTouched = React.useCallback(
        (key: string, touched: boolean, shouldValidate?: boolean) => {
            setTouchedState((prev) => {
                const newTouched = {
                    ...prev,
                    [key]: touched
                };
                return newTouched;
            });
            if (shouldValidate) {
                validate();
            }
        },
        [validate]
    );

    // handleChange reads the event, determines the proper value,
    // and then delegates to setFieldValue and setFieldTouched.
    const handleChange = React.useCallback(
        (event: React.SyntheticEvent) => {
            const target = event.target as HTMLInputElement;
            let value;
            if (target.type === "checkbox") {
                value = target.checked;
            } else if (target.type === "number") {
                value = target.valueAsNumber;
            } else {
                value = target.value;
            }
            const name = target.name;
            setFieldValue(name, value, validateOnChange);
            setFieldTouched(name, true);
        },
        [setFieldValue, setFieldTouched, validateOnChange]
    );

    // handleBlur simply marks the field as touched.
    const handleBlur = React.useCallback((event: React.FocusEvent) => {
        const target = event.target as HTMLInputElement;
        const name = target.name;
        setFieldTouched(name, true);
    }, [setFieldTouched]);

    // submit uses functional updates on submitCount and version.
    const submit = React.useCallback(
        async (e?: React.FormEvent<HTMLFormElement>) => {
            e?.preventDefault();
            e?.stopPropagation();
            setIsSubmitting(true);
            setSubmitCount((prev) => prev + 1);
            const validationErrors = await validation?.(valuesRef.current);
            if (validationErrors && Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
            } else {
                setErrors({});
                await onSubmit?.(valuesRef.current, controllerRef.current);
            }
            setIsSubmitting(false);
            setVersion((prev) => prev + 1);
        },
        [onSubmit, validation]
    );

    // resetForm resets to the passed props (or initial configuration).
    const resetForm = React.useCallback((props?: FormexResetProps<T>) => {
        const {
            submitCount: submitCountProp,
            values: valuesProp,
            errors: errorsProp,
            touched: touchedProp
        } =
        props ?? {};
        valuesRef.current = valuesProp ?? initialValuesRef.current;
        initialValuesRef.current = valuesProp ?? initialValuesRef.current;
        setValuesInner(valuesProp ?? initialValuesRef.current);
        setErrors(errorsProp ?? {});
        setTouchedState(touchedProp ?? {});
        setDirty(false);
        setSubmitCount(submitCountProp ?? 0);
        setVersion((prev) => prev + 1);
        onReset?.(controllerRef.current);
    }, [onReset]);

    // Create a ref for the controller so that it remains stable over time.
    const controllerRef = React.useRef<FormexController<T>>({} as FormexController<T>);

    // Memoize the controller object so that consumers don’t see new references on every render.
    const controller = React.useMemo<FormexController<T>>(
        () => ({
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
            setDirty, // setter from useState is stable
            handleSubmit: submit,
            submitCount,
            setSubmitCount, // setter from useState is stable
            handleBlur,
            validate,
            isValidating,
            resetForm,
            version,
            debugId: debugIdRef.current,
        }),
        [
            values,
            errors,
            touchedState,
            dirty,
            isSubmitting,
            submitCount,
            isValidating,
            version,
            handleChange,
            handleBlur,
            setValues,
            setFieldValue,
            setFieldTouched,
            setFieldError,
            validate,
            submit,
            resetForm,
        ]
    );

    // Keep the ref updated with the latest controller
    React.useEffect(() => {
        controllerRef.current = controller;
    }, [controller]);

    return controller;
}
