import { Property } from "../../models";
import { ReactElement } from "react";
import { FieldProps } from "formik/dist/Field";

export interface CMSFieldProps<T> extends FieldProps<T> {
    property: Property<T>,
    includeDescription: boolean,
    createFormField: (name: string, property: Property, includeDescription: boolean) => ReactElement,
    additionalProps: any
}


