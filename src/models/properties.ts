import { FieldProps } from "./fields";
import { PreviewComponentProps } from "../preview";
import { ChipColor } from "./colors";
import { EntityReference, EntityValues, GeoPoint } from "./entities";

/**
 * @category Entity properties
 */
export type CMSType =
    | string
    | number
    | boolean
    | Date
    | GeoPoint
    | EntityReference
    | { [Key: string]: any }
    | CMSType[];

/**
 * @ignore
 */
export type AnyProperty =
    StringProperty |
    NumberProperty |
    BooleanProperty |
    TimestampProperty |
    GeopointProperty |
    ReferenceProperty |
    ArrayProperty |
    MapProperty;

/**
 * @category Entity properties
 */
export type Property<T extends CMSType = CMSType> =
    T extends string ? StringProperty :
        T extends number ? NumberProperty :
            T extends boolean ? BooleanProperty :
                T extends Date ? TimestampProperty :
                    T extends GeoPoint ? GeopointProperty :
                        T extends EntityReference ? ReferenceProperty :
                            T extends Array<CMSType> ? ArrayProperty<T> :
                                T extends { [Key: string]: any } ? MapProperty<T> : AnyProperty;

/**
 * @category Entity properties
 */
export type DataType =
    | "number"
    | "string"
    | "boolean"
    | "map"
    | "array"
    | "timestamp"
    | "geopoint"
    | "reference";

/**
 * @category Entity properties
 */
export type MediaType =
    | "image"
    | "video"
    | "audio";

/**
 * Interface including all common properties of a CMS property
 * @category Entity properties
 */
interface BaseProperty {

    /**
     * Datatype of the property
     */
    dataType: DataType;

    /**
     * Property title (e.g. Product)
     */
    title?: string;

    /**
     * Property description, always displayed under the field
     */
    description?: string;

    /**
     * Longer description of a field, displayed under a popover
     */
    longDescription?: string;

    /**
     * Width in pixels of this column in the collection view. If not set
     * the width is inferred based on the other configurations
     */
    columnWidth?: number;

    /**
     * Is this a read only property. When set to true, it gets rendered as a
     * preview.
     */
    readOnly?: boolean;

    /**
     * Is this field disabled. When set to true, it gets rendered as a
     * disabled field. You can also specify a configuration for defining the
     * behaviour of disabled properties
     */
    disabled?: boolean | PropertyDisabledConfig;

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema;

}

/**
 * @category Entity properties
 */
export interface PropertyDisabledConfig {

    /**
     * Enable this flag if you would like to clear the value of the field
     * when the corresponding property gets disabled.
     *
     * This is useful for keeping data consistency when you have conditional
     * properties.
     */
    clearOnDisabled?: boolean;

    /**
     * Explanation of why this property is disabled (e.g. a different field
     * needs to be enabled)
     */
    disabledMessage?: string;

    /**
     * Set this flag to true if you want to hide this field when disabled
     */
    hidden?: boolean;
}

/**
 * @category Entity properties
 */
export type EnumType = number | string;

/**
 * We use this type to define mapping between string or number values in
 * the data source to a label (such in a select dropdown).
 * The key in this Record is the value saved in the datasource, and the value in
 * this record is the label displayed in the UI.
 * You can add additional customization by assigning a `EnumValueConfig` for the
 * label instead of a simple string (for enabling or disabling options and
 * choosing colors).
 * If you need to ensure the order of the elements you can pass a `Map` instead
 * of a plain object.
 * @category Entity properties
 */
export type EnumValues =
    Record<string | number, string | EnumValueConfig>
    | Map<string | number, string | EnumValueConfig>;

/**
 * Configuration for a particular entry in an `EnumValues`
 * @category Entity properties
 */
export interface EnumValueConfig {
    label: string;
    disabled?: boolean;
    color?: ChipColor;
}

/**
 * Record of properties of an entity or a map property
 * @category Entity properties
 */
export type Properties<M extends { [Key: string]: any }> = {
    [k in keyof M]: Property<M[k]>;
};

/**
 * @category Entity properties
 */
export type PropertyBuilderProps<T, M extends { [Key: string]: any }> =
    {
        values: Partial<M>;
        path: string;
        entityId?: string;
    };
/**
 * @category Entity properties
 */
export type PropertyBuilder<T extends CMSType, M> = ({
                                                         values,
                                                         path,
                                                         entityId
                                                     }: PropertyBuilderProps<T, M>) => Property<T>;

/**
 * @category Entity properties
 */
export type PropertyOrBuilder<T extends CMSType, M> =
    Property<T>
    | PropertyBuilder<T, M>;

/**
 * @category Entity properties
 */
export type PropertiesOrBuilder<M extends { [Key: string]: any }> =
    {
        [k in keyof M]: PropertyOrBuilder<M[k], M>;
    };

/**
 * @category Entity properties
 */
export interface NumberProperty extends BaseProperty {

    dataType: "number";

    /**
     * Configure how this field is displayed
     */
    config?: NumberFieldConfig;

    /**
     * Rules for validating this property
     */
    validation?: NumberPropertyValidationSchema,

}

/**
 * @category Entity properties
 */
export interface BooleanProperty extends BaseProperty {

    dataType: "boolean";

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<boolean>;
}

/**
 * @category Entity properties
 */
export interface StringProperty extends BaseProperty {

    dataType: "string";

    /**
     * Configure how this field is displayed
     */
    config?: StringFieldConfig;

    /**
     * Rules for validating this property
     */
    validation?: StringPropertyValidationSchema,
}

/**
 * @category Entity properties
 */
export interface ArrayProperty<T extends ArrayT[] = any[], ArrayT extends CMSType = any> extends BaseProperty {

    dataType: "array";

    /**
     * The property of this array.
     * You can specify any property (except another Array property)
     * You can leave this field empty only if you are providing a custom field,
     * otherwise an error will be thrown.
     */
    of?: Property<ArrayT>;

    /**
     * Use this field if you would like to have an array of properties.
     * It is useful if you need to have values of different types in the same
     * array.
     * Each entry of the array is an object with the shape:
     * ```
     * { type: "YOUR_TYPE", value: "YOUR_VALUE"}
     * ```
     * Note that you can use any property so `value` can take any value (strings,
     * numbers, array, objects...)
     * You can customise the `type` and `value` fields to suit your needs.
     *
     * An example use case for this feature may be a blog entry, where you have
     * images and text blocks using markdown.
     */
    oneOf?: {
        /**
         * Record of properties, where the key is the `type` and the value
         * is the corresponding property
         */
        properties: Record<string, Property>;
        /**
         * Name of the field to use as the discriminator for type
         * Defaults to `type`
         */
        typeField?: string;
        /**
         * Name of the  field to use as the value
         * Defaults to `value`
         */
        valueField?: string;
    };

    /**
     * Rules for validating this property
     */
    validation?: ArrayPropertyValidationSchema,

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<T>;
}

/**
 * @category Entity properties
 */
export interface MapProperty<T extends { [Key: string]: any } = any> extends BaseProperty {

    dataType: "map";

    /**
     * Record of properties included in this map.
     */
    properties?: Properties<any>; // TODO: this should be Properties<T> but it breaks if building properties without `buildProperties`

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

    /**
     * Properties that are displayed when as a preview
     */
    previewProperties?: Extract<keyof T, string>[];

    /**
     * Configure how this property field is displayed
     */
    config?: MapFieldConfig<T>;
}

/**
 * @category Entity properties
 */
export interface TimestampProperty extends BaseProperty {
    dataType: "timestamp";

    /**
     * Rules for validating this property
     */
    validation?: TimestampPropertyValidationSchema;

    /**
     * If this flag is  set to `on_create` or `on_update` this timestamp is
     * updated automatically on creation of the entity only or on every
     * update (including creation). Useful for creating `created_on` or
     * `updated_on` fields
     */
    autoValue?: "on_create" | "on_update"

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<Date>;
}

/**
 * @category Entity properties
 */
// TODO: currently this is the only unsupported field
export interface GeopointProperty extends BaseProperty {
    dataType: "geopoint";

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<GeoPoint>;
}

/**
 * @category Entity properties
 */
export interface ReferenceProperty<M extends { [Key: string]: any } = any>
    extends BaseProperty {

    dataType: "reference";

    /**
     * Absolute collection path of the collection this reference points to.
     * The schema of the entity is inferred based on the root navigation, so
     * the filters and search delegate existing there are applied to this view
     * as well.
     */
    path: string;

    /**
     * Properties that need to be rendered when displaying a preview of this
     * reference. If not specified the first 3 are used. Only the first 3
     * specified values are considered.
     */
    previewProperties?: (keyof M)[];

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<EntityReference>;
}

/**
 * Rules to validate any property. Some properties have specific rules
 * additionally to these.
 * @category Entity properties
 */
export interface PropertyValidationSchema {
    /**
     * Is this field required
     */
    required?: boolean;

    /**
     * Customize the required message when the property is not set
     */
    requiredMessage?: string;

    /**
     * If the unique flag is set to `true`, you can only have one entity in the
     * collection with this value.
     */
    unique?: boolean;

    /**
     * If the uniqueInArray flag is set to `true`, you can only have this value
     * once per entry in the parent `ArrayProperty`. It has no effect if this
     * property is not a child of an `ArrayProperty`. It works on direct
     * children of an `ArrayProperty` or first level children of `MapProperty`
     */
    uniqueInArray?: boolean;
}

/**
 * Validation rules for numbers
 * @category Entity properties
 */
export interface NumberPropertyValidationSchema extends PropertyValidationSchema {
    min?: number;
    max?: number;
    lessThan?: number;
    moreThan?: number;
    positive?: boolean;
    negative?: boolean;
    integer?: boolean;
}

/**
 * Validation rules for strings
 * @category Entity properties
 */
export interface StringPropertyValidationSchema extends PropertyValidationSchema {
    length?: number;
    min?: number;
    max?: number;
    matches?: RegExp;
    email?: boolean;
    url?: boolean;
    trim?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
}

/**
 * Validation rules for dates
 * @category Entity properties
 */
export interface TimestampPropertyValidationSchema extends PropertyValidationSchema {
    min?: Date;
    max?: Date;
}

/**
 * Validation rules for arrays
 * @category Entity properties
 */
export interface ArrayPropertyValidationSchema extends PropertyValidationSchema {
    min?: number;
    max?: number;
}

/**
 * Configure how a field is displayed
 * @category Entity properties
 */
export interface FieldConfig<T extends CMSType, CustomProps = any> {

    /**
     * If you need to render a custom field, you can create a component that
     * takes `FieldProps` as props. You receive the value, a function to
     * update the value and additional utility props such as if there is an error.
     * You can customize it by passing custom props that are received
     * in the component.
     */
    Field?: React.ComponentType<FieldProps<T, CustomProps>>;

    /**
     * Configure how a property is displayed as a preview, e.g. in the collection
     * view. You can customize it by passing custom props that are received
     * in the component.
     */
    Preview?: React.ComponentType<PreviewComponentProps<T, CustomProps>>;

    /**
     * Additional props that are passed to the components defined in `field`
     * or in `preview`.
     */
    customProps?: CustomProps;
}

/**
 * Possible configuration fields for a string property. Note that setting one
 * config disables the others.
 * @category Entity properties
 */
export interface StringFieldConfig extends FieldConfig<string> {

    /**
     * Is this string property long enough so it should be displayed in
     * a multiple line field. Defaults to false. If set to true,
     * the number of lines adapts to the content
     */
    multiline?: boolean;

    /**
     * Should this string property be displayed as a markdown field. If true,
     * the field is rendered as a text editors that supports markdown highlight
     * syntax. It also includes a preview of the result.
     */
    markdown?: boolean;

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown. You can use a simple object with the format
     * `value` => `label`, or with the format `value` => `EnumValueConfig` if you
     * need extra customization, (like disabling specific options or assigning
     * colors). If you need to ensure the order of the elements, you can pass
     * a `Map` instead of a plain object.
     */
    enumValues?: EnumValues;

    /**
     * You can specify a `StorageMeta` configuration. It is used to
     * indicate that this string refers to a path in Google Cloud Storage.
     */
    storageMeta?: StorageMeta;

    /**
     * If the value of this property is a URL, you can set this flag to true
     * to add a link, or one of the supported media types to render a preview
     */
    url?: boolean | MediaType;

    /**
     * Should this string be rendered as a tag instead of just text.
     */
    previewAsTag?: boolean;

}

/**
 * Additional configuration related to Storage related fields
 * @category Entity properties
 */
export interface StorageMeta {

    /**
     * Media type of this reference, used for displaying the preview
     */
    mediaType?: MediaType;

    /**
     * Absolute path in your bucket. You can specify it directly or use a callback
     */
    storagePath: string | ((context: UploadedFileContext) => string);

    /**
     * File MIME types that can be uploaded to this reference
     */
    acceptedFiles?: StorageFileTypes[];

    /**
     * Specific metadata set in your uploaded file.
     * For the default Firebase implementation, the values passed here are of type
     * `firebase.storage.UploadMetadata`
     */
    metadata?: any,

    /**
     * You can use this callback to customize the uploaded filename
     * @param context
     */
    fileName?: (context: UploadedFileContext) => string;

    /**
     * When set to true, this flag indicates that the download URL of the file
     * will be saved in the datasource instead of the Cloud storage path.
     * Note that the generated URL may use a token that, if disabled, may
     * make the URL unusable and lose the original reference to Cloud Storage,
     * so it is not encouraged to use this flag. Defaults to false
     */
    storeUrl?: boolean,

    /**
     * Post process the path
     */
    postProcess?: (pathOrUrl: string) => Promise<string>
}

/**
 * @category Entity properties
 */
export interface UploadedFileContext {
    /**
     * Uploaded file
     */
    file: File;

    /**
     * Property field name
     */
    name: string;

    /**
     * Property related to this upload
     */
    property: StringProperty | ArrayProperty<string[]>;

    /**
     * Entity Id is set if the entity already exists
     */
    entityId?: string;

    /**
     * Values of the current entity
     */
    values: EntityValues<any>;

    /**
     * Storage meta specified by the developer
     */
    storageMeta: StorageMeta;
}

/**
 * Possible configuration fields for a string property. Note that setting one
 * config disables the others.
 * @category Entity properties
 */
export interface MapFieldConfig<T extends {}> extends FieldConfig<T> {

    /**
     * Allow the user to add only some of the keys in this map.
     * By default all properties of the map have the corresponding field in
     * the form view. Setting this flag to true allows to pick only some.
     * Useful for map that can have a lot of subproperties that may not be
     * needed
     */
    pickOnlySomeKeys?: boolean;

}

/**
 * MIME types for storage fields
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * @category Entity properties
 */
export type StorageFileTypes =
    "image/*"
    | "video/*"
    | "audio/*"
    | "application/*"
    | "text/*"
    | "font/*"
    | string;

/**
 * @category Entity properties
 */
export interface NumberFieldConfig extends FieldConfig<number> {

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enumValues?: EnumValues;

}
