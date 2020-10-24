import { EntitySchema, Property } from "../models";
import { ReactElement } from "react";
import { FieldProps as FormikFieldProps } from "formik/dist/Field";

interface BaseCMSFieldProps<T> extends FormikFieldProps<T> {
    name: string,
    property: Property<T>,
    includeDescription: boolean,
    createFormField: (name: string,
                      property: Property,
                      includeDescription: boolean,
                      underlyingValueHasChanged: boolean,
                      entitySchema: EntitySchema) => ReactElement,
    underlyingValueHasChanged: boolean;
    /**
     * Full schema of the entity
     */
    entitySchema: EntitySchema,

    [key: string]: any
}

export type CMSFieldProps<T> = any & BaseCMSFieldProps<T>;

