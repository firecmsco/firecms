export type FormexController<T> = {
    values: T;
    setValues: (values: T) => void;
    setFieldValue: (key: string, value: any, shouldValidate?: boolean) => void;
    touched: Record<string, boolean>;
    setFieldTouched: (key: string, touched: boolean, shouldValidate?: boolean) => void;
    dirty: boolean;
    setDirty: (dirty: boolean) => void;
    submitCount: number;
    setSubmitCount: (submitCount: number) => void;
    errors: Record<string, string>;
    setFieldError: (key: string, error?: string) => void;
}
