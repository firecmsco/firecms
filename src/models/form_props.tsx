import { EntitySchema, Property } from "./models";
import { ReactElement } from "react";

/**
 * When building a custom field you need to create a React Element that takes
 * this interface as props.
 */
export interface CMSFieldProps<T> {

    /**
     * Name of the property
     */
    name: string,

    /**
     * Current value of this field
     */
    value: T,

    /**
     * Set value of field directly
     */
    setValue: (value: T | null, shouldValidate?: boolean) => void;

    /**
     * Is the form currently submitting
     */
    isSubmitting: boolean;

    /**
     * Is there an error in this field. The error field has the same shape as
     * the field, replacing values with a string containing the error.
     * It takes the value `null` if there is no error
     */
    showError: boolean;

    /**
     * Is there an error in this field. The error field has the same shape as
     * the field, replacing values with a string containing the error.
     * It takes the value `null` if there is no error
     */
    error: any | null;

    /**
     * Has this field been touched
     */
    touched: boolean;

    /**
     * Property
     */
    property: Property<T>,

    /**
     * Should this field include a description
     */
    includeDescription: boolean,

    /**
     * Builder in case this fields needs to build additional fields,
     * e.g. arrays or maps
     */
    createFormField: FormFieldBuilder,

    /**
     * Flag to indicate that the underlying value has been updated in Firestore
     */
    underlyingValueHasChanged: boolean;

    /**
     * Full schema of the entity
     */
    entitySchema: EntitySchema,

    /**
     * Is this field part of an array
     */
    partOfArray: boolean,

    /**
     * Is this field being rendered in the table
     */
    tableMode: boolean,

    /**
     * Should this field autofocus on mount
     */
    autoFocus: boolean,

    /**
     * Additional properties set by the developer
     */
    [additional:string]: any

}

/**
 * If you receive a FormFieldBuilder, you can use it to build subfields inside
 * another field. This is the pattern used for arrays or maps.
 */
export type FormFieldBuilder = (props: FormFieldProps) => ReactElement;

export interface FormFieldProps {
    name: string,
    property: Property,
    includeDescription: boolean,
    underlyingValueHasChanged: boolean,
    entitySchema: EntitySchema,
    tableMode: boolean,
    partOfArray: boolean,
    autoFocus:boolean,
}
