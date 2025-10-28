import { FormexController } from "@firecms/formex";

export function createFormexStub<T extends object>(values: T): FormexController<T> {
    const errorMessage = "You are in a read-only context. You cannot modify the formex controller.";

    return {
        debugId: "",
        values,
        initialValues: values,
        touched: {} as Record<string, boolean>,
        dirty: false,
        errors: {} as Record<string, string>,
        submitCount: 0,
        isSubmitting: false,
        isValidating: false,
        version: 0,
        canUndo: false,
        canRedo: false,

        setValues: () => {
            throw new Error(errorMessage);
        },
        setTouched(touched: Record<string, boolean>): void {
            throw new Error(errorMessage);
        },
        setFieldValue: () => {
            throw new Error(errorMessage);
        },
        setFieldTouched: () => {
            throw new Error(errorMessage);
        },
        setDirty: () => {
            throw new Error(errorMessage);
        },
        setSubmitCount: () => {
            throw new Error(errorMessage);
        },
        setFieldError: () => {
            throw new Error(errorMessage);
        },
        handleChange: () => {
            throw new Error(errorMessage);
        },
        handleBlur: () => {
            throw new Error(errorMessage);
        },
        handleSubmit: () => {
            throw new Error(errorMessage);
        },
        validate: () => {
            throw new Error(errorMessage);
        },
        resetForm: () => {
            throw new Error(errorMessage);
        },
        setSubmitting: () => {
            throw new Error(errorMessage);
        },
        undo: () => {
            throw new Error(errorMessage);
        },
        redo: () => {
            throw new Error(errorMessage);
        }
    };
}
