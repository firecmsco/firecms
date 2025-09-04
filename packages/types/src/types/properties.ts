import React from "react";
import { FieldProps } from "./fields";
import { EntityReference, EntityRelation, EntityValues, GeoPoint, Vector } from "./entities";
import { ResolvedArrayProperty, ResolvedStringProperty } from "./resolved_entities";
import { FilterValues } from "./collections";
import { PropertyPreviewProps } from "../components";
import { ColorKey, ColorScheme } from "./chips";
import { AuthController } from "../controllers";
import { Relation } from "./relations";

/**
 * @group Entity properties
 */
export type DataType<T extends CMSType = CMSType> =
    T extends string ? "string" :
        T extends number ? "number" :
            T extends boolean ? "boolean" :
                T extends Date ? "date" :
                    T extends GeoPoint ? "geopoint" :
                        T extends Vector ? "vector" :
                            T extends EntityRelation | Array<EntityRelation> ? "relation" :
                                T extends EntityRelation | EntityRelation[] ? "relation" :
                                    T extends EntityReference ? "reference" :
                                        T extends CMSType[] ? "array" :
                                            T extends Record<string, any> ? "map" : never;

/**
 * @group Entity properties
 */
export type CMSType =
    | string
    | number
    | boolean
    | Date
    | GeoPoint
    | EntityRelation
    | EntityReference
    | Record<string, any>
    | CMSType[];

/**
 * @ignore
 */
export type AnyProperty =
    StringProperty |
    NumberProperty |
    BooleanProperty |
    DateProperty |
    GeopointProperty |
    ReferenceProperty |
    RelationProperty |
    ArrayProperty<any, any> |
    MapProperty<any>;

/**
 * @group Entity properties
 */
export type Property<T extends CMSType = any> =
    T extends string ? StringProperty :
        T extends number ? NumberProperty :
            T extends boolean ? BooleanProperty :
                T extends Date ? DateProperty :
                    T extends GeoPoint ? GeopointProperty :
                        T extends EntityRelation | EntityRelation[] ? RelationProperty :
                            T extends EntityReference ? ReferenceProperty :
                                T extends Array<CMSType> ? ArrayProperty<T> :
                                    T extends Record<string, any> ? MapProperty<T> : AnyProperty;

/**
 * Interface including all common properties of a CMS property
 * @group Entity properties
 */
export interface BaseProperty<T extends CMSType, CustomProps = any> {

    /**
     * type of the property
     */
    type: DataType;

    /**
     * Property name (e.g. Product)
     */
    name?: string;

    /**
     * Property description, always displayed under the field
     */
    description?: string;

    /**
     * You can use this prop to reuse a property that has been defined
     * in the top level of the CMS in the prop `fields`.
     * All the configuration will be taken from the inherited config, and
     * overwritten by the current property config.
     */
    propertyConfig?: string;

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
     * Do not show this property in the collection view
     */
    hideFromCollection?: boolean;

    /**
     * Is this a read only property. When set to true, it gets rendered as a
     * preview.
     */
    readOnly?: boolean;

    /**
     * Is this field disabled.
     * When set to true, it gets rendered as a
     * disabled field. You can also specify a configuration for defining the
     * behaviour of disabled properties (including custom messages, clear value on
     * disabled or hide the field completely)
     */
    disabled?: boolean | PropertyDisabledConfig;

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema;

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
    Preview?: React.ComponentType<PropertyPreviewProps<T, CustomProps>>;

    /**
     * Additional props that are passed to the components defined in `field`
     * or in `preview`.
     */
    customProps?: CustomProps;

    /**
     * This value will be set by default for new entities.
     */
    defaultValue?: T | null;

    /**
     * Should this property be editable. If set to true, the user will be able to modify the property and
     * save the new config. The saved config will then become the source of truth.
     */
    editable?: boolean;

    /**
     * A number between 0 and 100 that indicates the width of the field in the form view.
     * It defaults to 100, but you can set it to 50 to have two fields in the same row.
     */
    widthPercentage?: number;

    /**
     * Use this to define dynamic properties that change based on the
     * entity's values. For example, you can make a field read-only if
     * another field has a certain value.
     * This function receives the same props as a `PropertyBuilder` and should return a partial `Property` object.
     */
    dynamicProps?: (props: PropertyBuilderProps) => Partial<Property<T>>;
}

/**
 * @group Entity properties
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
 * @group Entity properties
 */
export type EnumType = number | string;

/**
 * We use this type to define mapping between string or number values in
 * the data source to a label (such in a select dropdown).
 * The key in this Record is the value saved in the datasource, and the value in
 * this record is the label displayed in the UI.
 * You can add additional customization by assigning a {@link EnumValueConfig} for the
 * label instead of a simple string (for enabling or disabling options and
 * choosing colors).
 * If you need to ensure the order of the elements use an array of {@link EnumValueConfig}
 * @group Entity properties
 */
export type EnumValues = EnumValueConfig[]
    | Record<string | number, string | EnumValueConfig>;

/**
 * Configuration for a particular entry in an `EnumValues`
 * @group Entity properties
 */
export type EnumValueConfig = {
    /**
     * Value stored in the data source.
     */
    id: string | number;
    /**
     * Displayed label
     */
    label: string;
    /**
     * This value will not be selectable
     */
    disabled?: boolean;
    /**
     * You can pick from a list of predefined color combinations or define
     * your own {@link ColorScheme}
     */
    color?: ColorKey | ColorScheme;
}

/**
 * Record of properties of an entity or a map property
 * @group Entity properties
 */
export type Properties<M extends Record<string, any> = any> = {
    [k in keyof M]: Property<M[keyof M]>;
};

/**
 * @group Entity properties
 */
export type PropertyBuilderProps<M extends Record<string, any> = any> =
    {
        /**
         * Current values of the entity
         */
        values: Partial<M>;
        /**
         * Previous values of the entity before being saved
         */
        previousValues?: Partial<M>;
        /**
         * Current value of this property
         */
        propertyValue?: any;
        /**
         * Index of this property (only for arrays)
         */
        index?: number;
        /**
         * Path of the entity in the data source
         */
        path: string;
        /**
         * Entity ID
         */
        entityId?: string | number;

        /**
         * Controller to manage authentication
         */
        authController: AuthController;
    };

/**
 * You can use this type to define a property dynamically, based
 * on the current values of the entity, the previous values and the
 * current value of the property, as well as the path and entity ID.
 * @group Entity properties
 * @deprecated Use `dynamicProps` within a static `Property` definition instead. This will be removed in a future version.
 */
export type PropertyBuilder<T extends CMSType = any, M extends Record<string, any> = any> =
    ({
         values,
         previousValues,
         propertyValue,
         index,
         path,
         entityId,
         authController
     }: PropertyBuilderProps<M>) => Property<T> | null;

/**
 * @group Entity properties
 * @deprecated Use `Properties` with `dynamicProps` instead. This will be removed in a future version.
 */
export type PropertyOrBuilder<T extends CMSType = CMSType, M extends Record<string, any> = any> =
    Property<T>
    | PropertyBuilder<T, M>;

/**
 * @group Entity properties
 * @deprecated Use `Properties` with `dynamicProps` instead. This will be removed in a future version.
 */
export type PropertiesOrBuilders<M extends Record<string, any> = any> = {
    [k in keyof M]: PropertyOrBuilder<M[k], M>;
};

/**
 * @group Entity properties
 */
export interface NumberProperty extends BaseProperty<number> {

    type: "number";

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enum?: EnumValues;

    /**
     * Rules for validating this property
     */
    validation?: NumberPropertyValidationSchema,

    /**
     * Add an icon to clear the value and set it to `null`. Defaults to `false`
     */
    clearable?: boolean;
}

/**
 * @group Entity properties
 */
export interface BooleanProperty extends BaseProperty<boolean> {

    type: "boolean";

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

}

/**
 * @group Entity properties
 */
export interface StringProperty extends BaseProperty<string> {

    type: "string";

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
     *
     */
    enum?: EnumValues;

    /**
     * You can specify a `Storage` configuration. It is used to
     * indicate that this string refers to a path in your storage provider.
     */
    storage?: StorageConfig;

    /**
     * If the value of this property is a URL, you can set this flag to true
     * to add a link, or one of the supported media types to render a preview
     */
    url?: boolean | PreviewType;

    /**
     * Does this field include an email
     */
    email?: boolean;

    /**
     * Should this string be rendered as a tag instead of just text.
     */
    previewAsTag?: boolean;

    /**
     * Rules for validating this property
     */
    validation?: StringPropertyValidationSchema;

    /**
     * Add an icon to clear the value and set it to `null`. Defaults to `false`
     */
    clearable?: boolean;

    /**
     * You can use this property (a string) to behave as a reference to another
     * collection. The stored value is the ID of the entity in the
     * collection, and the `path` prop is used to
     * define the collection this reference points to.
     */
    reference?: ReferenceProperty;
}

/**
 * @group Entity properties
 */
export interface ArrayProperty<T extends ArrayT[] = any[], ArrayT extends CMSType = any>
    extends BaseProperty<T> {

    type: "array";

    /**
     * The property of this array.
     * You can specify any property (except another Array property)
     * You can leave this field empty only if you are providing a custom field,
     * or using the `oneOf` prop, otherwise an error will be thrown.
     */
    of?: Property<ArrayT> | Property<ArrayT>[];

    /**
     * Use this field if you would like to have an array of typed objects.
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
        properties: Properties;

        /**
         * Order in which the properties are displayed.
         * If you are specifying your collection as code, the order is the same as the
         * one you define in `properties`, and you don't need to specify this prop.
         */
        propertiesOrder?: string[];

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
    validation?: ArrayPropertyValidationSchema;

    /**
     * Should the field be initially expanded. Defaults to `true`
     */
    expanded?: boolean;

    /**
     * Display the child properties directly, without being wrapped in an
     * extendable panel.
     */
    minimalistView?: boolean;

    /**
     * Can the elements in this array be reordered. Defaults to `true`.
     * This prop has no effect if `disabled` is set to true.
     */
    sortable?: boolean;

    /**
     * Can the elements in this array be added. Defaults to `true`
     * This prop has no effect if `disabled` is set to true.
     */
    canAddElements?: boolean;

}

/**
 * @group Entity properties
 */
export interface MapProperty<T extends Record<string, CMSType> = Record<string, CMSType>> extends BaseProperty<T> {

    type: "map";

    /**
     * Record of properties included in this map.
     */
    properties?: Properties<T>;

    /**
     * Order in which the properties are displayed.
     * If you are specifying your collection as code, the order is the same as the
     * one you define in `properties`, and you don't need to specify this prop.
     */
    propertiesOrder?: Extract<keyof T, string>[];

    /**
     * Rules for validating this property.
     * NOTE: If you don't set `required` in the map property, an empty object
     * will be considered valid, even if you set `required` in the properties.
     */
    validation?: PropertyValidationSchema,

    /**
     * Properties that are displayed when rendered as a preview
     */
    previewProperties?: Partial<Extract<keyof T, string>>[];

    /**
     * Allow the user to add only some keys in this map.
     * By default, all properties of the map have the corresponding field in
     * the form view. Setting this flag to true allows to pick only some.
     * Useful for map that can have a lot of sub-properties that may not be
     * needed
     */
    pickOnlySomeKeys?: boolean;

    /**
     * Display the child properties as independent columns in the collection
     * view
     */
    spreadChildren?: boolean;

    /**
     * Display the child properties directly, without being wrapped in an
     * extendable panel. Note that this will also hide the title of this property.
     */
    minimalistView?: boolean;

    /**
     * Should the field be initially expanded. Defaults to `true`
     */
    expanded?: boolean;

    /**
     * Render this map as a key-value table that allows to use
     * arbitrary keys. You don't need to define the properties in this case.
     */
    keyValue?: boolean;

}

/**
 * @group Entity properties
 */
export interface DateProperty extends BaseProperty<Date> {

    type: "date";

    /**
     * Set the granularity of the field to a date or date + time.
     * Defaults to `date_time`.
     *
     */
    mode?: "date" | "date_time";

    /**
     * Rules for validating this property
     */
    validation?: DatePropertyValidationSchema;

    /**
     * If this flag is  set to `on_create` or `on_update` this timestamp is
     * updated automatically on creation of the entity only or on every
     * update (including creation). Useful for creating `created_on` or
     * `updated_on` fields
     */
    autoValue?: "on_create" | "on_update"

    /**
     * Add an icon to clear the value and set it to `null`. Defaults to `false`
     */
    clearable?: boolean;
}

/**
 * @group Entity properties
 */
// TODO: currently this is the only unsupported field
export interface GeopointProperty extends BaseProperty<GeoPoint> {

    type: "geopoint";

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

}

/**
 * @group Entity properties
 */
export interface ReferenceProperty extends BaseProperty<EntityReference> {

    type: "reference";

    /**
     * Absolute collection path of the collection this reference points to.
     * The collection of the entity is inferred based on the root navigation, so
     * the filters and search delegate existing there are applied to this view
     * as well.
     * You can leave this prop undefined if the path is not yet know, e.g.
     * you are using a property builder and the path depends on a different
     * property.
     */
    path?: string;

    /**
     * Allow selection of entities that pass the given filter only.
     * e.g. `forceFilter: { age: [">=", 18] }`
     */
    forceFilter?: FilterValues<string>;

    /**
     * Properties that need to be rendered when displaying a preview of this
     * reference. If not specified the first 3 are used. Only the first 3
     * specified values are considered.
     */
    previewProperties?: string[];

    /**
     * Should the reference include the ID of the entity. Defaults to `true`
     */
    includeId?: boolean;

    /**
     * Should the reference include a link to the entity (open the entity details). Defaults to `true`
     */
    includeEntityLink?: boolean;

}

/**
 * @group Entity properties
 */
export interface RelationProperty extends BaseProperty<EntityRelation | EntityRelation[]> {

    type: "relation";

    /**
     * Absolute collection path of the collection this reference points to.
     * The collection of the entity is inferred based on the root navigation, so
     * the filters and search delegate existing there are applied to this view
     * as well.
     * You can leave this prop undefined if the path is not yet know, e.g.
     * you are using a property builder and the path depends on a different
     * property.
     */
    path?: string;

    /**
     * For SQL databases, you can specify the table name of the collection this
     * reference points to.
     */
    relation?: Relation;

    /**
     * Allow selection of entities that pass the given filter only.
     * e.g. `forceFilter: { age: [">=", 18] }`
     */
    forceFilter?: FilterValues<string>;

    /**
     * Properties that need to be rendered when displaying a preview of this
     * reference. If not specified the first 3 are used. Only the first 3
     * specified values are considered.
     */
    previewProperties?: string[];

    /**
     * Should the reference include the ID of the entity. Defaults to `true`
     */
    includeId?: boolean;

    /**
     * Should the reference include a link to the entity (open the entity details). Defaults to `true`
     */
    includeEntityLink?: boolean;

    /**
     * How to render this relation in the UI
     */
    widget?: "select" | "subcollection" | "reference";

}

/**
 * Rules to validate any property. Some properties have specific rules
 * additionally to these.
 * @group Entity properties
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
 * @group Entity properties
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
 * @group Entity properties
 */
export interface StringPropertyValidationSchema extends PropertyValidationSchema {
    length?: number;
    min?: number;
    max?: number;
    matches?: string | RegExp;
    /**
     * Message displayed when the input does not satisfy the regex in `matches`
     */
    matchesMessage?: string;
    trim?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
}

/**
 * Validation rules for dates
 * @group Entity properties
 */
export interface DatePropertyValidationSchema extends PropertyValidationSchema {
    min?: Date;
    max?: Date;
}

/**
 * Validation rules for arrays
 * @group Entity properties
 */
export interface ArrayPropertyValidationSchema extends PropertyValidationSchema {
    min?: number;
    max?: number;
}

/**
 * Additional configuration related to Storage related fields
 * @group Entity properties
 */
export type StorageConfig = {

    /**
     * File MIME types that can be uploaded to this reference. Don't specify for
     * all.
     * Note that you can also use the asterisk notation, so `image/*`
     * accepts any image file, and so on.
     */
    acceptedFiles?: FileType[];

    /**
     * Use client side image compression and resizing
     * Will only be applied to these MIME types: image/jpeg, image/png and image/webp
     */
    imageCompression?: ImageCompression;

    /**
     * Specific metadata set in your uploaded file.
     * For the default Firebase implementation, the values passed here are of type
     * `firebase.storage.UploadMetadata`
     */
    metadata?: Record<string, unknown>,

    /**
     * You can use this prop to customize the uploaded filename.
     * You can use a function as a callback or a string where you
     * specify some placeholders that get replaced with the corresponding values.
     * - `{file}` - Full file name
     * - `{file.name}` - Name of the file without extension
     * - `{file.ext}` - Extension of the file
     * - `{rand}` - Random value used to avoid name collisions
     * - `{entityId}` - ID of the entity
     * - `{propertyKey}` - ID of this property
     * - `{path}` - Path of this entity
     *
     * @param context
     */
    fileName?: string | ((context: UploadedFileContext) => string | Promise<string>);

    /**
     * Absolute path in your bucket.
     *
     * You can use a function as a callback or a string where you
     * specify some placeholders that get replaced with the corresponding values.
     * - `{file}` - Full file name
     * - `{file.name}` - Name of the file without extension
     * - `{file.ext}` - Extension of the file
     * - `{rand}` - Random value used to avoid name collisions
     * - `{entityId}` - ID of the entity
     * - `{propertyKey}` - ID of this property
     * - `{path}` - Path of this entity
     */
    storagePath: string | ((context: UploadedFileContext) => string);

    /**
     * When set to true, this flag indicates that the download URL of the file
     * will be saved in the datasource, instead of the storage path.
     *
     * Note that the generated URL may use a token that, if disabled, may
     * make the URL unusable and lose the original reference to Cloud Storage,
     * so it is not encouraged to use this flag.
     *
     * Defaults to false.
     */
    storeUrl?: boolean,

    /**
     * Define maximal file size in bytes
     */
    maxSize?: number,

    /**
     * Use this callback to process the file before uploading it to the storage.
     * If nothing is returned, the file is uploaded as it is.
     * @param file
     */
    processFile?: (file: File) => Promise<File> | undefined;

    /**
     * Postprocess the saved value (storage path or URL)
     * after it has been resolved.
     */
    postProcess?: (pathOrUrl: string) => Promise<string>;

    /**
     * You can use this prop in order to provide a custom preview URL.
     * Useful when the file's path is different from the original field value
     */
    previewUrl?: (fileName: string) => string;
}

/**
 * @group Entity properties
 */
export interface UploadedFileContext {
    /**
     * Uploaded file
     */
    file: File;

    /**
     * Property field name
     */
    propertyKey: string;

    /**
     * Property related to this upload
     */
    property: ResolvedStringProperty | ResolvedArrayProperty<string[]>;

    /**
     * Entity ID
     */
    entityId?: string | number;

    /**
     * Entity path. E.g. `products/PID/locales`
     */
    path?: string;

    /**
     * Values of the current entity
     */
    values: EntityValues<any>;

    /**
     * Storage meta specified by the developer
     */
    storage: StorageConfig;
}

/**
 * Used for previewing urls if the download file is known
 * @group Entity properties
 */
export type PreviewType = "image" | "video" | "audio" | "file";

/**
 * MIME types for storage fields
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * @group Entity properties
 */
export type FileType =
    "image/*"
    | "video/*"
    | "audio/*"
    | "application/*"
    | "text/*"
    | "font/*"
    | string;

export interface ImageCompression {
    /**
     * New image max height (ratio is preserved)
     */
    maxHeight?: number;

    /**
     * New image max width (ratio is preserved)
     */
    maxWidth?: number;

    /**
     * A number between 0 and 100. Used for the JPEG compression.(if no compress is needed, just set it to 100)
     */
    quality?: number;
}
