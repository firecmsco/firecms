import { EntitySchema, Property } from "../models";
import { ReactElement } from "react";
import { FieldProps as FormikFieldProps } from "formik/dist/Field";
import { FormFieldProps } from "./index";

interface BaseCMSFieldProps<T> extends FormikFieldProps<T> {
    name: string,
    property: Property<T>,
    includeDescription: boolean,
    createFormField: ({
                          name,
                          property,
                          includeDescription,
                          underlyingValueHasChanged,
                          entitySchema
                      }: FormFieldProps) => ReactElement,
    underlyingValueHasChanged: boolean;
    /**
     * Full schema of the entity
     */
    entitySchema: EntitySchema,

    partOfArray: boolean,

}

export type CMSFieldProps<T> = any & BaseCMSFieldProps<T>;

