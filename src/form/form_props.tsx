import { Property } from "../models";
import { ReactElement } from "react";
import { FieldProps } from "formik/dist/Field";

interface BaseCMSFieldProps<T> extends FieldProps<T> {
    property: Property<T>,
    includeDescription: boolean,
    createFormField: (name: string, property: Property, includeDescription: boolean) => ReactElement,
}

export type CMSFieldProps<T> = any & BaseCMSFieldProps<T>;

