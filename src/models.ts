import * as React from "react";
import { TextSearchDelegate } from "./text_search_delegate";
import { CMSFieldProps } from "./form/form_props";
import { PreviewComponentProps } from "./preview";
import { storage } from "firebase";

/**
 * This interface represents a view that includes a collection of entities.
 * It can be in the root level of the configuration, defining the main
 * menu navigation.
 */
export interface EntityCollectionView<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>> {

    /**
     * Plural name of the view. E.g. 'products'
     */
    name: string;

    /**
     * Relative Firestore path of this view to its parent.
     * If this view is in the root the path is equal to the absolute one.
     * This path also determines the URL in FireCMS
     */
    relativePath: string;

    /**
     * Schema representing the entities of this view
     */
    schema: S;

    /**
     * Is pagination enabled in this view. True if not specified
     */
    pagination?: boolean;

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     */
    additionalColumns?: AdditionalColumnDelegate<S>[];

    /**
     * If a text search delegate is supplied, a search bar is displayed on top
     */
    textSearchDelegate?: TextSearchDelegate;

    /**
     * Can the elements in this collection be deleted. Defaults to true
     */
    deleteEnabled?: boolean;

    /**
     * Following the Firestore document and collection schema, you can add
     * subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollectionView<any>[];

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed
     */
    properties?: Key[];

    /**
     * Properties that can be filtered in this view
     */
    filterableProperties?: Key[];
}

/**
 * Specification for defining an entity
 */
export interface EntitySchema<Key extends string = string, P extends Properties<Key> = Properties<Key>> {

    /**
     * Singular name of the entity as displayed in an Add button . E.g. Product
     */
    name: string;

    /**
     * Description of this entity
     */
    description?: string;

    /**
     * If this property is not set Firestore will create a random ID.
     * You can set the value to true to allow the users to choose the ID.
     * You can also pass a set of values (as an EnumValues object) to allow them
     * to pick from only those
     */
    customId?: boolean | EnumValues<string>;

    /**
     * Set of properties that compose an entity
     */
    properties: P;

    /**
     * Hook called when save is successful
     * @param entitySaveProps
     */
    onSaveSuccess?(entitySaveProps: EntitySaveProps<this>)
        : Promise<void> | void;

    /**
     * Hook called when saving fails
     * @param entitySaveProps
     */
    onSaveFailure?(entitySaveProps: EntitySaveProps<this>)
        : Promise<void> | void;

    /**
     * Hook called before saving, you need to return the values that will get
     * saved. If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     * @param entitySaveProps
     */
    onPreSave?(entitySaveProps: EntitySaveProps<this>)
        : Promise<EntityValues<this>> | EntityValues<this>

}

/**
 *
 */
export interface EntitySaveProps<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>> {
    schema: S;
    collectionPath: string;
    id?: string;
    values: EntityValues<S, P, Key>;
    status: EntityStatus;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the schema keys
 * @param schema
 */
export function buildSchema<Key extends string, P extends Properties<Key>>(schema: EntitySchema<Key, P>): EntitySchema<Key, P> {
    return schema;
}

/**
 * New or existing status
 */
export enum EntityStatus { new = "new", existing = "existing"}

/**
 * Representation of an entity fetched from Firestore
 */
export interface Entity<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>> {
    id: string;
    snapshot: firebase.firestore.DocumentSnapshot;
    reference: firebase.firestore.DocumentReference;
    values: EntityValues<S, P, Key>;
}

type DataType =
    | "number"
    | "string"
    | "boolean"
    | "map"
    | "array"
    | "timestamp"
    | "geopoint"
    | "reference";

export type MediaType =
    | "image"
    | "video"
    | "audio";

export type Property<T = any, ArrayT = any> =
    T extends string ? StringProperty :
        T extends number ? NumberProperty :
            T extends boolean ? BooleanProperty :
                T extends firebase.firestore.Timestamp ? TimestampProperty :
                    T extends firebase.firestore.GeoPoint ? GeopointProperty :
                        T extends firebase.firestore.DocumentReference ? ReferenceProperty<EntitySchema> :
                            T extends Array<ArrayT> ? ArrayProperty<ArrayT> :
                                MapProperty<T>;

/**
 * Use this interface for adding additional columns to entity collection views.
 * If you need to do some async loading you can use AsyncPreviewComponent
 */
export interface AdditionalColumnDelegate<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>> {

    title: string;

    builder: (entity: Entity<S, P, Key>) => React.ReactNode;

}

/**
 * Interface including all common properties of a CMS property
 */
export interface BaseProperty<T> {

    /**
     * Firestore datatype of the property
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
     * Is this a read only property
     */
    disabled?: boolean;

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<T>;

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

}

export type EnumType = number | string ;

/**
 * We use this interface to define mapping between string or number values in
 * Firestore to a label (such in a select dropdown)
 * The key in this Record is the value saved in Firestore, and the value in
 * this record is the label displayed in the UI
 */
export type EnumValues<T extends EnumType> = Record<T, string>; // id -> Label

/**
 * Record of properties of an entity or a map property
 */
export type Properties<Key extends string = string, T extends any = any> = Record<Key, Property<T>>;

/**
 * This type represents a record of key value pairs as described in an
 * entity schema.
 */
export type EntityValues<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>>
    = {
    [K in Key]: P[K] extends Property<infer T> ? T : any;
};

export interface NumberProperty extends BaseProperty<number> {

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

export interface BooleanProperty extends BaseProperty<boolean> {

    dataType: "boolean";

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,
}

export interface StringProperty extends BaseProperty<string> {

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

export interface ArrayProperty<T = any> extends BaseProperty<T[]> {

    dataType: "array";

    /**
     * The property of this array. You can specify any property.
     */
    of: Property;

    /**
     * Rules for validating this property
     */
    validation?: ArrayPropertyValidationSchema,
}

export interface MapProperty<T = any, P extends Properties = Properties> extends BaseProperty<T> {

    dataType: "map";

    /**
     * Record of properties included in this map.
     */
    properties: P;

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

    /**
     * Properties that need to be rendered when as a preview of this reference
     */
    previewProperties?: (keyof P)[];
}

export interface TimestampProperty extends BaseProperty<firebase.firestore.Timestamp> {
    dataType: "timestamp";

    /**
     * Rules for validating this property
     */
    validation?: DatePropertyValidationSchema,
}

// TODO: currently this is the only unsupported field
export interface GeopointProperty extends BaseProperty<firebase.firestore.GeoPoint> {
    dataType: "geopoint";

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,
}

export interface ReferenceProperty<S extends EntitySchema = EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>>
    extends BaseProperty<firebase.firestore.DocumentReference> {

    dataType: "reference";

    /**
     * Absolute collection path.
     */
    collectionPath: string;

    /**
     * Schema of the entity this reference points to.
     */
    schema: S,

    /**
     * When the dialog for selecting the value of this reference, should
     * a filter be applied to the possible entities.
     */
    filter?: FilterValues<S>;

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

    /**
     * Properties that need to be rendered when as a preview of this reference
     */
    previewProperties?: Key[];
}


/**
 * Used to define filters applied in collections
 */
export type FilterValues<S extends EntitySchema> = { [K in keyof Partial<S["properties"]>]: [WhereFilterOp, any] };

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', and 'array-contains-any'.
 */
export type WhereFilterOp =
    | "<"
    | "<="
    | "=="
    | ">="
    | ">"
    | "array-contains"
    | "in"
    | "array-contains-any";

/**
 * Rules to validate a property
 */
export interface PropertyValidationSchema {
    required?: boolean;
    requiredMessage?: string;
}

/**
 * Validation rules for numbers
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
 */
interface StringPropertyValidationSchema extends PropertyValidationSchema {
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
 */
interface DatePropertyValidationSchema extends PropertyValidationSchema {
    min?: Date;
    max?: Date;
}

/**
 * Validation rules for arrays
 */
interface ArrayPropertyValidationSchema extends PropertyValidationSchema {
    min?: number;
    max?: number;
}

/**
 * Configure how a field is displayed
 */
export interface FieldConfig<T> {

    /**
     * If you need to render a custom field.
     */
    field?: React.ComponentType<CMSFieldProps<T>>;

    /**
     * Additional props that are passed to the default field generated by
     * FireCMS or to the custom field
     */
    fieldProps?: any;

    /**
     * Whether if this field should take the full width in the field.
     * Defaults to false, but some fields like images take full width by
     * default.
     */
    forceFullWidth?: boolean;

    /**
     * Configure how a property is displayed as a preview, e.g. in the collection
     * view
     */
    customPreview?: React.ComponentType<PreviewComponentProps<T>>;
}

export interface StringFieldConfig extends FieldConfig<string> {

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enumValues?: EnumValues<string>;

    /**
     * You can specify a `StorageMeta` configuration. It is used to
     * indicate that this string refers to a path in Google Cloud Storage.
     */
    storageMeta?: StorageMeta;

    /**
     * If the value of this property is a URL, we can use the urlMediaType
     * to render the content
     */
    urlMediaType?: MediaType;

}

/**
 * Additional configuration related to Storage related fields
 */
export interface StorageMeta {

    /**
     * Media type of this reference, used for displaying the preview
     */
    mediaType: MediaType;

    /**
     * Absolute path in your bucket
     */
    storagePath: string;

    /**
     * File MIME types that can be uploaded to this reference
     */
    acceptedFiles?: StorageFileTypes[];

    /**
     * Specific metadata set in your uploaded file
     */
    metadata?: storage.UploadMetadata,
}

/**
 * MIME types for storage fields
 */
export type StorageFileTypes =
    "image/*"
    | "video/*"
    | "audio/*"
    | "application/*"
    | "text/*"
    | "font/*" ;

export interface NumberFieldConfig extends FieldConfig<number> {

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enumValues?: EnumValues<number>;

}
