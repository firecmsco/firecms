import React, { FormEvent } from "react";

// this is duplicated from the formex package
export type FormexController<T extends object> = {
    values: T;
    initialValues: T;
    setValues: (values: T) => void;
    setFieldValue: (key: string, value: any, shouldValidate?: boolean) => void;
    touched: Record<string, boolean>;
    setFieldTouched: (key: string, touched: boolean, shouldValidate?: boolean) => void;
    dirty: boolean;
    setDirty: (dirty: boolean) => void;
    setSubmitCount: (submitCount: number) => void;
    errors: Record<string, string>;
    setFieldError: (key: string, error?: string) => void;
    handleChange: (event: React.SyntheticEvent) => void,
    handleBlur: (event: React.FocusEvent) => void,
    handleSubmit: (event?: FormEvent<HTMLFormElement>) => void;
    validate: () => void;
    resetForm: (props?: FormexResetProps<T>) => void;
    submitCount: number;
    isSubmitting: boolean;
    setSubmitting: (isSubmitting: boolean) => void;
    isValidating: boolean;
    /**
     * The version of the form. This is incremented every time the form is reset
     * or the form is submitted.
     */
    version: number;

    debugId?: string;

    undo: () => void;
    redo: () => void;

    canUndo: boolean;
    canRedo: boolean;
}

export type FormexResetProps<T extends object> = {
    values?: T;
    submitCount?: number;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
};
