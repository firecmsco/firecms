import React, { FormEvent } from "react";

export type FormexController<T extends object> = {
    values: T;
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
    submitForm: (event?: FormEvent<HTMLFormElement>) => void;
    validate: () => void;
    resetForm: (props?: FormexResetProps<T>) => void;
    submitCount: number;
    isSubmitting: boolean;
}

export type FormexResetProps<T extends object> = {
    values?: T;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
};
