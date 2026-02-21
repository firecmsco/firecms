import React from "react";
import { FieldProps } from "./fields";
import { EntityReference, EntityRelation, EntityValues, GeoPoint } from "./entities";
import { FilterValues } from "./collections";
import { PropertyPreviewProps } from "../components";
import { ColorKey, ColorScheme } from "./chips";
import { AuthController } from "../controllers";
import { Relation } from "./relations";

/**
 * @group Entity properties
 */
export type DataType =
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "geopoint"
    | "reference"
    | "relation"
    | "array"
    | "map";

export type Property =
    | StringProperty
    | NumberProperty
    | BooleanProperty
    | DateProperty
    | GeopointProperty
    | ReferenceProperty
    | RelationProperty
    | ArrayProperty
    | MapProperty;

export type Properties = {
    [key: string]: Property;
};

/**
 * A helper type to infer the underlying data type from a Property definition.
 * This is the core of the type inference system.
 */
export type InferPropertyType<P extends Property> =
    P extends StringProperty ? string :
    P extends NumberProperty ? number :
    P extends BooleanProperty ? boolean :
    P extends DateProperty ? Date :
    P extends GeopointProperty ? GeoPoint :
    P extends ReferenceProperty ? EntityReference :
    P extends RelationProperty ? EntityRelation | EntityRelation[] :
    P extends ArrayProperty ? (P["of"] extends Property ? InferPropertyType<P["of"]>[] : any[]) :
    P extends MapProperty ? (P["properties"] extends Properties ? InferEntityType<P["properties"]> : Record<string, any>) :
    never;

/**
 * A generic type that converts a `Properties` schema definition into a corresponding
 * TypeScript entity type. It correctly handles required and optional properties.
 *
 * @example
 * const productSchema = {
 * name: { type: 'string', validation: { required: true } },
 * price: { type: 'number' }
 * };
 * type Product = InferEntityType<typeof productSchema>;
 * // Result: { name: string; price?: number; }
 */
export type InferEntityType<P extends Properties> = {
    -readonly [K in keyof P as P[K] extends { validation?: { required: true } } ? K : never]: InferPropertyType<P[K]>;
} & {
    -readonly [K in keyof P as P[K] extends { validation?: { required: true } } ? never : K]?: InferPropertyType<P[K]>;
};

/**
 * Interface including all common properties of a CMS property.
 * @group Entity properties
 */
export interface BaseProperty<CustomProps = any> {
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
     * This value will be set by default for new entities.
     */
    defaultValue?: any;

    /**
     * A number between 0 and 100 that indicates the width of the field in the form view.
     * It defaults to 100, but you can set it to 50 to have two fields in the same row.
     */
    widthPercentage?: number;

    /**
     * Additional props that are passed to the components defined in `field`
     * or in `preview`.
     */
    customProps?: CustomProps;

    /**
     * If you need to render a custom field, you can create a component that
     * takes `FieldProps` as props. You receive the value, a function to
     * update the value and additional utility props such as if there is an error.
     * You can customize it by passing custom props that are received
     * in the component.
     */
    Field?: React.ComponentType<FieldProps<any, CustomProps>>;

    /**
     * Configure how a property is displayed as a preview, e.g. in the collection
     * view. You can customize it by passing custom props that are received
     * in the component.
     */
    Preview?: React.ComponentType<PropertyPreviewProps<any, CustomProps>>;

    /**
     * Use this to define dynamic properties that change based on certain conditions
     * or on the entity's values. For example, you can make a field read-only if
     * another field has a certain value.
     * This function receives the same props as a `PropertyBuilder` and should return a partial `Property` object.
     */
    dynamicProps?: (props: PropertyBuilderProps) => Partial<Property>;

    /**
     * Declarative conditions for dynamic property behavior using JSON Logic.
     *
     * An alternative to PropertyBuilder functions that can be:
     * - Stored in the database as JSON
     * - Edited via the collection editor UI
     * - Evaluated at runtime like property builders
     *
     * @see PropertyConditions for available condition options
     * @see https://jsonlogic.com/ for JSON Logic syntax
     */
    conditions?: PropertyConditions;
}

/**
 * @group Entity properties
 */
export interface StringProperty extends BaseProperty {
    type: "string";
    /**
     * Rules for validating this property
     */
    validation?: StringPropertyValidationSchema;
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
     * You can specify a `Storage` configuration. It is used to
     * indicate that this string refers to a path in your storage provider.
     */
    storage?: StorageConfig;

    /**
     * This property is used to indicate that the string is a user ID, and
     * it will be rendered as a user picker.
     * Note that the user ID needs to be the one used in your authentication
     * provider, e.g. Firebase Auth.
     * You can also use a property builder to specify the user path dynamically
     * based on other values of the entity.
     */
    userSelect?: boolean;

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
export interface NumberProperty extends BaseProperty {
    type: "number";
    /**
     * Rules for validating this property
     */
    validation?: NumberPropertyValidationSchema;
    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enum?: EnumValues;
    /**
     * Add an icon to clear the value and set it to `null`. Defaults to `false`
     */
    clearable?: boolean;
}

/**
 * @group Entity properties
 */
export interface BooleanProperty extends BaseProperty {
    type: "boolean";
    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema;
}

/**
 * @group Entity properties
 */
export interface DateProperty extends BaseProperty {
    type: "date";
    /**
     * Rules for validating this property
     */
    validation?: DatePropertyValidationSchema;
    /**
     * Set the granularity of the field to a date or date + time.
     * Defaults to `date_time`.
     *
     */
    mode?: "date" | "date_time";
    /**
     * Timezone string to evaluate the date in.
     */
    timezone?: string;
    /**
     * If this flag is  set to `on_create` or `on_update` this timestamp is
     * updated automatically on creation of the entity only or on every
     * update (including creation). Useful for creating `created_on` or
     * `updated_on` fields
     */
    autoValue?: "on_create" | "on_update";
    /**
     * Add an icon to clear the value and set it to `null`. Defaults to `false`
     */
    clearable?: boolean;
}

/**
 * @group Entity properties
 */
export interface GeopointProperty extends BaseProperty {
    type: "geopoint";
    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema;
}

/**
 * @group Entity properties
 */
export interface ReferenceProperty extends BaseProperty {
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
export interface RelationProperty extends BaseProperty {
    type: "relation";
    /**
     * The name of the relation this property refers to. This name must match
     * one of the `relationName`s defined in the top-level `relations` array
     * of the collection.
     */
    relationName: string;

    /**
     * The resolved relation object.
     * This is set by the framework
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
     * Choose the widget to use for selecting the relation.
     * Defaults to `select`.
     */
    widget?: "select" | "dialog";
}

/**
 * @group Entity properties
 */
export interface ArrayProperty extends BaseProperty {
    type: "array";
    /**
     * The property of this array.
     * You can specify any property (except another Array property)
     * You can leave this field empty only if you are providing a custom field,
     * or using the `oneOf` prop, otherwise an error will be thrown.
     */
    of?: Property;
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
export interface MapProperty extends BaseProperty {
    type: "map";
    /**
     * Record of properties included in this map.
     */
    properties?: Properties;
    /**
     * Order in which the properties are displayed.
     * If you are specifying your collection as code, the order is the same as the
     * one you define in `properties`, and you don't need to specify this prop.
     */
    propertiesOrder?: string[];
    /**
     * Rules for validating this property.
     * NOTE: If you don't set `required` in the map property, an empty object
     * will be considered valid, even if you set `required` in the properties.
     */
    validation?: PropertyValidationSchema;
    /**
     * Properties that are displayed when rendered as a preview
     */
    previewProperties?: string[];
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
export type PropertyBuilderProps<M extends Record<string, any> = any> = {
    values: Partial<M>;
    previousValues?: Partial<M>;
    propertyValue?: any;
    index?: number;
    path: string;
    entityId?: string | number;
    authController: AuthController;
};

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
export type EnumValues = EnumValueConfig[] | Record<string | number, string | EnumValueConfig>;

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
     * @deprecated Use `imageResize` instead
     */
    imageCompression?: ImageResize;

    /**
     * Advanced image resizing and cropping configuration.
     * Applied before upload to optimize storage and bandwidth.
     * Only applies to image MIME types: image/jpeg, image/png, image/webp
     */
    imageResize?: ImageResize;

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
     * When set to true, this flag indicates that the bucket name will be
     * included in the saved storage path.
     *
     * E.g. `gs://my-bucket/path/to/file.png` instead of just `path/to/file.png`
     *
     * Defaults to false.
     */
    includeBucketUrl?: boolean;

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
    property: StringProperty | ArrayProperty;

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
    | "image/*"
    | "video/*"
    | "audio/*"
    | "application/*"
    | "text/*"
    | "font/*"
    | string;

export interface ImageResize {
    /**
     * Maximum width in pixels. Image will be scaled down proportionally if wider.
     */
    maxWidth?: number;

    /**
     * Maximum height in pixels. Image will be scaled down proportionally if taller.
     */
    maxHeight?: number;

    /**
     * Resize mode determines how the image fits within maxWidth/maxHeight bounds.
     * - `contain`: Scale down to fit within bounds, preserving aspect ratio (default)
     * - `cover`: Scale to fill bounds, preserving aspect ratio (may crop)
     */
    mode?: 'contain' | 'cover';

    /**
     * Output format for the resized image.
     * - `original`: Keep the original format (default)
     * - `jpeg`: Convert to JPEG
     * - `png`: Convert to PNG
     * - `webp`: Convert to WebP
     */
    format?: 'original' | 'jpeg' | 'png' | 'webp';

    /**
     * Quality for lossy formats (JPEG, WebP). Number between 0 and 100.
     * Higher is better quality but larger file size. Defaults to 80.
     */
    quality?: number;
}

/**
 * A JSON Logic rule that gets evaluated at runtime.
 * @see https://jsonlogic.com/
 *
 * Common operators:
 * - Comparison: ==, !=, ===, !==, >, <, >=, <=
 * - Logic: and, or, !, !!
 * - Data access: var, missing, missing_some
 * - Array: in, map, filter, reduce, all, some, none, merge
 * - String: substr, cat
 * - Numeric: +, -, *, /, %, min, max
 *
 * Custom operators:
 * - hasRole(roleId) - check if user has role by ID
 * - hasAnyRole([roleIds]) - check if user has any of the roles
 * - isToday(timestamp) - check if timestamp is today
 * - isPast(timestamp) - check if timestamp is in the past
 * - isFuture(timestamp) - check if timestamp is in the future
 *
 * @group Entity properties
 */
export type JsonLogicRule = Record<string, any>;

/**
 * Conditions for individual enum values within a property.
 * @group Entity properties
 */
export interface EnumValueConditions {
    /**
     * Disable this enum option when condition is true.
     * The option appears grayed out and cannot be selected.
     */
    disabled?: JsonLogicRule;

    /**
     * Message explaining why this option is disabled.
     */
    disabledMessage?: string;

    /**
     * Completely hide this enum option when condition is true.
     * The option is removed from the dropdown/list.
     */
    hidden?: JsonLogicRule;
}

/**
 * Declarative conditions for dynamic property behavior.
 * All conditions are JSON Logic rules evaluated against ConditionContext.
 *
 * An alternative to PropertyBuilder functions that can be:
 * - Stored in the database as JSON
 * - Edited via the collection editor UI
 * - Evaluated at runtime like property builders
 *
 * @see https://jsonlogic.com/ for JSON Logic syntax
 * @group Entity properties
 */
export interface PropertyConditions {

    // ═══════════════════════════════════════════════════════════════════════
    // FIELD STATE CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Disable the field when this condition evaluates to true.
     * The field becomes non-editable but still visible (unless also hidden).
     *
     * @example Disable when another field has a specific value
     * \`\`\`json
     * { "==": [{ "var": "values.status" }, "archived"] }
     * \`\`\`
     */
    disabled?: JsonLogicRule;

    /**
     * Message to display when the field is disabled by a condition.
     */
    disabledMessage?: string;

    /**
     * Clear the field's value when it becomes disabled.
     * @default false
     */
    clearOnDisabled?: boolean;

    /**
     * Hide the field completely when this condition evaluates to true.
     * The field is removed from the form (not just visually hidden).
     */
    hidden?: JsonLogicRule;

    /**
     * Make the field read-only when this condition evaluates to true.
     * Renders as a preview instead of an input.
     */
    readOnly?: JsonLogicRule;

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Make the field required when this condition evaluates to true.
     * Overrides the static `validation.required` setting.
     */
    required?: JsonLogicRule;

    /**
     * Custom message when conditional required validation fails.
     */
    requiredMessage?: string;

    /**
     * Dynamic minimum value for number/string length.
     * Should evaluate to a number.
     */
    min?: JsonLogicRule;

    /**
     * Dynamic maximum value for number/string length.
     * Should evaluate to a number.
     */
    max?: JsonLogicRule;

    // ═══════════════════════════════════════════════════════════════════════
    // VALUE CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Dynamic default value for new entities.
     * Should evaluate to a value of the appropriate type for the field.
     * Only applied when entityId is empty (new entity).
     */
    defaultValue?: JsonLogicRule;

    // ═══════════════════════════════════════════════════════════════════════
    // ENUM CONDITIONS (for string/number properties with enumValues)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Conditions for individual enum values.
     * Keys are the enum value IDs, values are condition configs.
     *
     * @example Disable certain enum options based on user role
     * \`\`\`json
     * {
     *   "admin": {
     *     "disabled": { "!": { "hasRole": "admin" } },
     *     "disabledMessage": "Admin option requires admin role"
     *   }
     * }
     * \`\`\`
     */
    enumConditions?: Record<string | number, EnumValueConditions>;

    /**
     * Filter which enum values are available.
     * Should evaluate to an array of allowed enum value IDs.
     */
    allowedEnumValues?: JsonLogicRule;

    /**
     * Exclude specific enum values.
     * Should evaluate to an array of enum value IDs to exclude.
     */
    excludedEnumValues?: JsonLogicRule;

    // ═══════════════════════════════════════════════════════════════════════
    // REFERENCE CONDITIONS (for reference properties)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Dynamic path for reference properties.
     * Should evaluate to a collection path string.
     */
    referencePath?: JsonLogicRule;

    /**
     * Dynamic filter for reference selection.
     * Should evaluate to a FilterValues object.
     */
    referenceFilter?: JsonLogicRule;

    // ═══════════════════════════════════════════════════════════════════════
    // ARRAY CONDITIONS (for array properties)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Can elements be added to the array?
     */
    canAddElements?: JsonLogicRule;

    /**
     * Can elements be reordered in the array?
     */
    sortable?: JsonLogicRule;

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE CONDITIONS (for file upload properties)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Dynamic accepted file types.
     * Should evaluate to an array of MIME types.
     */
    acceptedFiles?: JsonLogicRule;

    /**
     * Dynamic maximum file size in bytes.
     * Should evaluate to a number.
     */
    maxFileSize?: JsonLogicRule;
}

/**
 * Context available during JSON Logic condition evaluation.
 * Mirrors PropertyBuilderProps but adapted for JSON serialization.
 * @group Entity properties
 */
export interface ConditionContext {
    /**
     * Current form/entity values.
     * Date values are converted to Unix timestamps (milliseconds).
     */
    values: Record<string, any>;

    /**
     * Previous values before the current edit session.
     */
    previousValues: Record<string, any>;

    /**
     * Current value of this property specifically.
     */
    propertyValue: any;

    /**
     * Collection path (e.g., "products", "users/uid123/orders")
     */
    path: string;

    /**
     * Entity ID. Undefined for new entities.
     */
    entityId?: string;

    /**
     * Whether this is a new entity being created.
     */
    isNew: boolean;

    /**
     * Index of this property (only for array items).
     */
    index?: number;

    /**
     * Current authenticated user information.
     */
    user: {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        /** Role IDs the user has (extracted from Role[].id) */
        roles: string[];
    };

    /**
     * Current timestamp as Unix milliseconds.
     */
    now: number;
}
