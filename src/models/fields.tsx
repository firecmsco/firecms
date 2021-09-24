import { EntitySchema, EntityValues } from "./entities";
import {
    ArrayProperty,
    BooleanProperty,
    CMSType,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    Property,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
} from "./properties";

/**
 * When building a custom field you need to create a React component that takes
 * this interface as props.
 *
 * @category Form custom fields
 */
export interface FieldProps<T extends CMSType, CustomProps = any, M extends { [Key: string]: any } = any> {

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
    property: Property<T>;

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

    /**
     * Flag to indicate if this field was built from a property that gets
     * rendered conditionally
     */
    dependsOnOtherProperties: boolean;

}

/**
 * Context passed to custom fields
 * @category Form custom fields
 */
export interface FormContext<M extends { [Key: string]: any }> {

    /**
     * Schema of the entity being modified
     */
    schema: EntitySchema<M>;

    /**
     * Current values of the entity
     */
    values: EntityValues<M>;

    /**
     * Entity, it can be null if it's a new entity
     */
    entityId?: string;
}

/**
 * In case you need to render a field bound to a Property inside your
 * custom field you can call {@link buildPropertyField} with these props.
 * @category Form custom fields
 */
export interface CMSFormFieldProps<M extends { [Key: string]: any } = any> {

    /**
     * The name of the property, such as `age`. You can use nested and array
     * indexed such as `address.street` or `people[3]`
     */
    name: string;

    /**
     * The CMS property you are binding this field to
     */
    property: StringProperty |
        NumberProperty |
        BooleanProperty |
        TimestampProperty |
        GeopointProperty |
        ReferenceProperty |
        ArrayProperty |
        MapProperty;

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

    /**
     * This flag is used to avoid using Formik FastField internally, which
     * prevents being updated from the values.
     * Set this value to `true` if you are developing a custom field which
     * value gets updated dynamically based on others.
     */
    dependsOnOtherProperties?: boolean;
}
