import React from "react";
import { EntitySchema, EntityValues, Property } from "./models";

/**
 * When building a custom field you need to create a React Element that takes
 * this interface as props.
 */
export interface FieldProps<T, CustomProps = any, S extends EntitySchema<Key> = EntitySchema, Key extends string = Extract<keyof S["properties"], string>> {

    /**
     * Name of the property
     */
    name: string;

    /**
     * Current value of this field
     */
    value: T;

    /**
     * Initial value of this field
     */
    initialValue: T | undefined;

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
    CMSFormField: React.FunctionComponent<CMSFormFieldProps<S, Key>>;

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
    context: FormContext<S, Key>;

    /**
     * Flag to indicate if this field should be disabled
     */
    disabled:boolean;

    /**
     * Flag to indicate if this field was built from a property that gets
     * rendered conditionally
     */
    dependsOnOtherProperties:boolean;

}

export interface FormContext<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>> {

    /**
     * Schema of the entity being modified
     */
    entitySchema: S;

    /**
     * Current values of the entity
     */
    values: EntityValues<S, Key>;
}

export interface CMSFormFieldProps<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>> {
    name: string;
    property: Property;
    includeDescription: boolean;
    underlyingValueHasChanged: boolean;
    context: FormContext<S, Key>;
    tableMode: boolean;
    partOfArray: boolean;
    autoFocus: boolean;
    disabled:boolean;
    // This flag is used to avoid using FastField internally, which prevents being updated from the values
    dependsOnOtherProperties:boolean;
}
