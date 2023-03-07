export type FormController<M> = {
    values: M;
    setFieldValue: (key: string, value: any) => void;
}
