import { EntitySchema, EntityValues, Property } from "./models";
import { ReactElement } from "react";

/**
 * When building a custom field you need to create a React Element that takes
 * this interface as props.
 */
export interface CMSFieldProps<T, CustomProps = any, S extends EntitySchema = EntitySchema> {

    /**
     * Name of the property
     */
    name: string;

    /**
     * Current value of this field
     */
    value: T;

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
     * Property related to this field
     */
    property: Property<T>;

    /**
     * Should this field include a description
     */
    includeDescription: boolean;

    /**
     * Builder in case this fields needs to build additional fields,
     * e.g. arrays or maps
     */
    createFormField: FormFieldBuilder;

    /**
     * Flag to indicate that the underlying value has been updated in Firestore
     */
    underlyingValueHasChanged: boolean;

    /**
     * Is this field part of an array
     */
    partOfArray: boolean;

    /**
     * Is this field being rendered in the table
     */
    tableMode: boolean;

    /**
     * Should this field autofocus on mount
     */
    autoFocus: boolean;

    /**
     * Additional properties set by the developer
     */
    customProps: CustomProps

    /**
     * Additional values related to the state of the form or the entity
     */
    context: FormContext<S>;

}

export interface FormContext<S extends EntitySchema> {

    /**
     * Schema of the entity being modified
     */
    entitySchema: S;

    /**
     * Current values of the entity
     */
    values: EntityValues<S>;
}

/**
 * If you receive a FormFieldBuilder, you can use it to build subfields inside
 * another field. This is the pattern used for arrays or maps.
 */
export type FormFieldBuilder<S extends EntitySchema = EntitySchema> = (props: FormFieldProps<S>) => ReactElement;

export interface FormFieldProps<S extends EntitySchema> {
    name: string;
    property: Property;
    includeDescription: boolean;
    underlyingValueHasChanged: boolean;
    context: FormContext<S>;
    tableMode: boolean;
    partOfArray: boolean;
    autoFocus: boolean;
}
