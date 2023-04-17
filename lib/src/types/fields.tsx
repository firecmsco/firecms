import { EntityValues } from "./entities";
import { CMSType, PropertyOrBuilder } from "./properties";
import {
    ResolvedEntityCollection,
    ResolvedProperty
} from "./resolved_entities";

/**
 * When building a custom field you need to create a React component that takes
 * this interface as props.
 *
 * @category Form custom fields
 */
export interface FieldProps<T extends CMSType = CMSType, CustomProps = any, M extends Record<string, any> = any> {

    /**
     * Key of the property
     * E.g. "user.name" for a property with path "user.name"
     */
    propertyKey: string;

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
     * Set value of a different field directly
     * @param propertyKey
     * @param value
     * @param shouldValidate
     */
    setFieldValue: (propertyKey: string, value: CMSType | null, shouldValidate?: boolean) => void;

    /**
     * Is the form currently submitting
     */
    isSubmitting: boolean;

    /**
     * Should this field show the error indicator.
     * Note that there might be an error (like an empty field that should be
     * filled) but we don't want to show the error until the user has tried
     * saving.
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
    property: ResolvedProperty<T>;

    /**
     * Should this field include a description
     */
    includeDescription: boolean;

    /**
     * Flag to indicate that the underlying value has been updated in the
     * datasource
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
    context: FormContext<M>;

    /**
     * Flag to indicate if this field should be disabled
     */
    disabled: boolean;

}

/**
 * Context passed to custom fields
 * @category Form custom fields
 */
export interface FormContext<M extends Record<string, any> = any> {

    /**
     * Collection of the entity being modified
     */
    collection: ResolvedEntityCollection<M>;

    /**
     * Current values of the entity
     */
    values: EntityValues<M>;

    /**
     * Entity id, it can be null if it's a new entity
     */
    entityId?: string;

    /**
     * Path this entity is located at
     */
    path: string;

    /**
     * Update the value of a field
     * @param key
     * @param value
     * @param shouldValidate
     */
    setFieldValue: (key: string, value: any, shouldValidate?: boolean) => void;
}

/**
 * In case you need to render a field bound to a Property inside your
 * custom field you can use {@link PropertyFieldBinding} with these props.
 * @category Form custom fields
 */
export interface PropertyFieldBindingProps<T extends CMSType, M extends Record<string, any> = any> {

    /**
     * The key/path of the property, such as `age`. You can use nested and array
     * indexed such as `address.street` or `people[3]`
     */
    propertyKey: string;

    /**
     * The CMS property you are binding this field to
     */
    property: PropertyOrBuilder<T> | ResolvedProperty<T>;

    /**
     * The context where this field is being rendered. You get a context as a
     * prop when creating a custom field.
     */
    context: FormContext<M>;

    /**
     * Should the description be included in this field
     */
    includeDescription?: boolean;

    /**
     * Has the value of this property been updated in the database while this
     * field is being edited
     */
    underlyingValueHasChanged?: boolean;

    /**
     * Is this field being rendered in a table
     */
    tableMode?: boolean;

    /**
     * Is this field part of an array
     */
    partOfArray?: boolean;

    /**
     * Should the field take focus when rendered. When opening the popup view
     * in table mode, it makes sense to put the focus on the only field rendered.
     */
    autoFocus?: boolean;

    /**
     * Should this field be disabled
     */
    disabled?: boolean;
}
