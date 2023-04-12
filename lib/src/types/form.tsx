export type FormController<M> = {
    values: M;
    setFieldValue: (key: string, value: any, shouldValidate?: boolean) => void;
}
