import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getIn, setIn } from "./utils";
import equal from "react-fast-compare";

import { FormexController, FormexResetProps } from "./types";

export function useCreateFormex<T extends object>({
                                                      initialValues,
                                                      initialErrors,
                                                      initialDirty,
                                                      initialTouched,
                                                      validation,
                                                      validateOnChange = false,
                                                      validateOnInitialRender = false,
                                                      onSubmit,
                                                      onReset,
                                                      onValuesChangeDeferred,
                                                      debugId,
                                                  }: {
    initialValues: T;
    initialErrors?: Record<string, string>;
    initialDirty?: boolean;
    initialTouched?: Record<string, boolean>;
    validateOnChange?: boolean;
    validateOnInitialRender?: boolean;
    validation?: (
        values: T
    ) =>
        | Record<string, string>
        | Promise<Record<string, string>>
        | undefined
        | void;
    onValuesChangeDeferred?: (values: T, controller: FormexController<T>) => void;
    onSubmit?: (values: T, controller: FormexController<T>) => void | Promise<void>;
    onReset?: (controller: FormexController<T>) => void | Promise<void>;
    debugId?: string;
}): FormexController<T> {
    const initialValuesRef = useRef<T>(initialValues);
    const valuesRef = useRef<T>(initialValues);
    const debugIdRef = useRef<string | undefined>(debugId);

    const [values, setValuesInner] = useState<T>(initialValues);
    const [touchedState, setTouchedState] = useState<Record<string, boolean>>(initialTouched ?? {});
    const [errors, setErrors] = useState<Record<string, string>>(initialErrors ?? {});
    const [dirty, setDirty] = useState(initialDirty ?? false);
    const [submitCount, setSubmitCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [version, setVersion] = useState(0);

    const onValuesChangeRef = useRef(onValuesChangeDeferred);
    onValuesChangeRef.current = onValuesChangeDeferred;
    const debounceTimeoutRef = useRef<any>();

    const callDebouncedOnValuesChange = useCallback((values: T) => {
        if (onValuesChangeRef.current) {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
                onValuesChangeRef.current?.(values, controllerRef.current);
            }, 300);
        }
    }, []);

    // Replace state for history with refs
    const historyRef = useRef<T[]>([initialValues]);
    const historyIndexRef = useRef<number>(0);

    useEffect(() => {
        if (validateOnInitialRender) {
            validate();
        }
    }, []);

    const setValues = useCallback((newValues: T) => {
        valuesRef.current = newValues;
        setValuesInner(newValues);
        setDirty(!equal(initialValuesRef.current, newValues));
        // Update history using refs
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(newValues);
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
        callDebouncedOnValuesChange(newValues);
    }, [callDebouncedOnValuesChange]);

    const validate = useCallback(async () => {
        setIsValidating(true);
        const validationErrors = await validation?.(valuesRef.current);
        setErrors(validationErrors ?? {});
        setIsValidating(false);
        return validationErrors;
    }, [validation]);

    const setFieldValue = useCallback(
        (key: string, value: any, shouldValidate?: boolean) => {
            const newValues = setIn(valuesRef.current, key, value);
            valuesRef.current = newValues;
            setValuesInner(newValues);
            if (!equal(getIn(initialValuesRef.current, key), value)) {
                setDirty(true);
            }
            if (shouldValidate) {
                validate();
            }
            // Update history using refs
            const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
            newHistory.push(newValues);
            historyRef.current = newHistory;
            historyIndexRef.current = newHistory.length - 1;
            callDebouncedOnValuesChange(newValues);
        },
        [validate, callDebouncedOnValuesChange]
    );

    const setFieldError = useCallback((key: string, error: string | undefined) => {
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

    const setFieldTouched = useCallback(
        (key: string, touched: boolean, shouldValidate?: boolean) => {
            setTouchedState((prev) => ({
                ...prev,
                [key]: touched,
            }));
            if (shouldValidate) {
                validate();
            }
        },
        [validate]
    );

    const handleChange = useCallback(
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

    const handleBlur = useCallback((event: React.FocusEvent) => {
        const target = event.target as HTMLInputElement;
        const name = target.name;
        setFieldTouched(name, true);
    }, [setFieldTouched]);

    const submit = useCallback(
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

    const resetForm = useCallback((props?: FormexResetProps<T>) => {
        const {
            submitCount: submitCountProp,
            values: valuesProp,
            errors: errorsProp,
            touched: touchedProp
        } = props ?? {};
        valuesRef.current = valuesProp ?? initialValuesRef.current;
        initialValuesRef.current = valuesProp ?? initialValuesRef.current;
        setValuesInner(valuesProp ?? initialValuesRef.current);
        setErrors(errorsProp ?? {});
        setTouchedState(touchedProp ?? initialTouched ?? {});
        setDirty(false);
        setSubmitCount(submitCountProp ?? 0);
        setVersion((prev) => prev + 1);
        onReset?.(controllerRef.current);
        // Reset history with refs
        historyRef.current = [valuesProp ?? initialValuesRef.current];
        historyIndexRef.current = 0;
    }, [onReset, initialTouched]);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            const newIndex = historyIndexRef.current - 1;
            const newValues = historyRef.current[newIndex];
            setValuesInner(newValues);
            valuesRef.current = newValues;
            historyIndexRef.current = newIndex;
            setDirty(!equal(initialValuesRef.current, newValues));
            callDebouncedOnValuesChange(newValues);
        }
    }, [callDebouncedOnValuesChange]);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            const newIndex = historyIndexRef.current + 1;
            const newValues = historyRef.current[newIndex];
            setValuesInner(newValues);
            valuesRef.current = newValues;
            historyIndexRef.current = newIndex;
            setDirty(!equal(initialValuesRef.current, newValues));
            callDebouncedOnValuesChange(newValues);
        }
    }, [callDebouncedOnValuesChange]);

    const controllerRef = useRef<FormexController<T>>({} as FormexController<T>);

    const controller = useMemo<FormexController<T>>(
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
            setDirty,
            handleSubmit: submit,
            submitCount,
            setSubmitCount,
            handleBlur,
            validate,
            isValidating,
            resetForm,
            version,
            debugId: debugIdRef.current,
            undo,
            redo,
            canUndo: historyIndexRef.current > 0,
            canRedo: historyIndexRef.current < historyRef.current.length - 1,
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
            undo,
            redo,
        ]
    );

    useEffect(() => {
        controllerRef.current = controller;
    }, [controller]);

    return controller;
}
