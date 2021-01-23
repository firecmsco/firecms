import * as React from "react";
import { TextSearchDelegate } from "./text_search_delegate";
import { CMSFieldProps } from "./form_props";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../preview";
import firebase from "firebase/app";

/**
 * This interface represents a view that includes a collection of entities.
 * It can be in the root level of the configuration, defining the main
 * menu navigation.
 */
export interface EntityCollectionView<S extends EntitySchema = EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties = Properties<Key>> {

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
     * Default size of the rendered collection
     */
    defaultSize?: CollectionSize;

    /**
     * Optional field used to group top level navigation entries under a
     * navigation view. If you set this value in a subcollection it has no
     * effect.
     */
    group?: string;

    /**
     * If enabled, content is loaded in batch. If `false` all entities in the
     * collection are loaded. Defaults to `true`
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
     * Can the elements in this collection be added and edited. Defaults to `true`
     */
    editEnabled?: boolean;

    /**
     * Can the elements in this collection be edited inline in the collection
     * view. If this flag is set to false but `editEnabled` is `true`, entities
     * can still be edited in the side panel
     */
    inlineEditing?: boolean;

    /**
     * Can the elements in this collection be deleted. Defaults to `true`
     */
    deleteEnabled?: boolean;

    /**
     * Following the Firestore document and collection schema, you can add
     * subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollectionView[];

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed
     */
    properties?: Key[];

    /**
     * Properties that should NOT get displayed in the collection view.
     * All the other properties from the the entity are displayed
     * It has no effect if the properties value is set.
     */
    excludedProperties?: Key[];

    /**
     * Properties that can be filtered in this view
     */
    filterableProperties?: Key[];

    /**
     * Initial filters applied to this collection. Consider that you
     * can filter any property, but only those included in
     * `filterableProperties` will include the corresponding filter widget.
     * Defaults to none.
     */
    initialFilter?: FilterValues<S>;

    /**
     * Builder for rendering additional components such as buttons in the
     * collection toolbar
     * @param entityCollectionView this collection view
     * @param selectedEntities current selected entities by the end user or
     * undefined if none
     */
    extraActions?: (extraActionsParams: ExtraActionsParams<S>) => React.ReactNode;

    /**
     * Are the entities in this collection selectable. Defaults to true
     */
    selectionEnabled?: boolean;

}

export type ExtraActionsParams<S extends EntitySchema = EntitySchema> = {
    view: EntityCollectionView,
    selectedEntities?: Entity<S>[]
};


/**
 * Sizes in which a collection can be rendered
 */
export type CollectionSize = "xs" | "s" | "m" | "l" | "xl";

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
     * When creating a new entity, set some values as already initialized
     */
    defaultValues?: Partial<EntityValues<this>>;

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

    /**
     * Hook called after the entity is deleted in Firestore.
     * If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     *
     * @param entityDeleteProps
     */
    onPreDelete?(entityDeleteProps: EntityDeleteProps<this>): void;

    /**
     * Hook called after the entity is deleted in Firestore.
     *
     * @param entityDeleteProps
     */
    onDelete?(entityDeleteProps: EntityDeleteProps<this>): void;
}

/**
 * Parameters passed to hooks when an entity is saved
 */
export interface EntitySaveProps<S extends EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties<Key> = S["properties"]> {
    schema: S;
    collectionPath: string;
    id?: string;
    values: EntityValues<S, P, Key>;
    status: EntityStatus;
}

/**
 * Parameters passed to hooks when an entity is deleted
 */
export interface EntityDeleteProps<S extends EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties<Key> = S["properties"]> {

    /**
     * Firestore path of the parent collection
     */
    collectionPath: string;

    /**
     * Deleted entity id
     */
    id: string;

    /**
     * Deleted entity
     */
    entity: Entity<S>;

    /**
     * Schema of the entity being deleted
     */
    schema: S;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collectionView
 */
export function buildCollection<S extends EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties = Properties<Key>>(collectionView: EntityCollectionView<S, Key, P>): EntityCollectionView<S, Key, P> {
    return collectionView;
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
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys. It can be useful if you have entity schemas with the
 * same properties
 * @param properties
 */
export function buildProperties<Key extends string>(properties: Properties<Key>): Properties<Key> {
    return properties;
}

/**
 * New or existing status
 */
export enum EntityStatus { new = "new", existing = "existing", copy = "copy"}

/**
 * Representation of an entity fetched from Firestore
 */
export interface Entity<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>> {
    id: string;
    reference: firebase.firestore.DocumentReference;
    values: EntityValues<S, P, Key>;
}

export type DataType =
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
                T extends Date ? TimestampProperty :
                    T extends firebase.firestore.Timestamp ? TimestampProperty :
                        T extends firebase.firestore.GeoPoint ? GeopointProperty :
                            T extends firebase.firestore.DocumentReference ? ReferenceProperty<EntitySchema> :
                                T extends Array<ArrayT> ? ArrayProperty<ArrayT> :
                                    T extends object ? MapProperty<T> : never;

/**
 * Use this interface for adding additional columns to entity collection views.
 * If you need to do some async loading you can use AsyncPreviewComponent
 */
export interface AdditionalColumnDelegate<S extends EntitySchema,
    P extends Properties = S["properties"],
    Key extends string = Extract<keyof P, string>> {

    /**
     * Id of this column. You can use this id in the `properties` field of the
     * collection in any order you want
     */
    id: string;

    /**
     * Header of this column
     */
    title: string;

    /**
     * Width of the generated column in pixels
     */
    width?: number;

    /**
     * Builder for the content of the cell for this column
     */
    builder: (entity: Entity<S, P, Key>) => React.ReactNode;

}

/**
 * Interface including all common properties of a CMS property
 */
interface BaseProperty {

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
     * Width in pixels of this column in the collection view. If not set
     * the width is inferred based on the other configurations
     */
    columnWidth?: number;

    /**
     * Is this a read only property
     */
    disabled?: boolean;


    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema;

}

export type EnumType = number | string;

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

export interface ArrayProperty<T = any> extends BaseProperty {

    dataType: "array";

    /**
     * The property of this array. You can specify any property.
     * You can also specify an array or properties if you need the array to have
     * a specific limited shape such as [string, number, string]
     */
    of: Property<T>;

    /**
     * Rules for validating this property
     */
    validation?: ArrayPropertyValidationSchema,

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<T[]>;
}

export interface MapProperty<T = any,
    Key extends string = Extract<keyof T, string>,
    P extends Properties = Properties<Key>> extends BaseProperty {

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
     * Properties that are displayed when as a preview
     */
    previewProperties?: Key[];

    /**
     * Configure how this property field is displayed
     */
    config?: MapFieldConfig<T>;
}

export interface TimestampProperty extends BaseProperty {
    dataType: "timestamp";

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
     * Configure how this property field is displayed
     */
    config?: FieldConfig<firebase.firestore.Timestamp>;
}

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
    config?: FieldConfig<firebase.firestore.GeoPoint>;
}

export interface ReferenceProperty<S extends EntitySchema = EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties = Properties<Key>>
    extends BaseProperty {

    dataType: "reference";

    /**
     * Absolute collection path of the collection this reference points to.
     * The schema of the entity is inferred based on the root navigation, so
     * the filters and search delegate existing there are applied to this view
     * as well.
     */
    collectionPath: string;

    /**
     * Properties that need to be rendered when displaying a preview of this
     * reference. If not specified the first 3 are used. Only the first 3
     * specified values are considered.
     */
    previewProperties?: Key[];

    /**
     * Configure how this property field is displayed
     */
    config?: FieldConfig<firebase.firestore.DocumentReference>;
}


/**
 * Used to define filters applied in collections
 */
export type FilterValues<S extends EntitySchema> = Partial<{ [K in keyof S["properties"]]: [WhereFilterOp, any] }>;

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', and 'array-contains-any'.
 */
export type WhereFilterOp =
    | "<"
    | "<="
    | "=="
    | "!="
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
 */
export interface DatePropertyValidationSchema extends PropertyValidationSchema {
    min?: Date;
    max?: Date;
}

/**
 * Validation rules for arrays
 */
export interface ArrayPropertyValidationSchema extends PropertyValidationSchema {
    min?: number;
    max?: number;
}

/**
 * Configure how a field is displayed
 */
export interface FieldConfig<T, CustomProps = any> {

    /**
     * If you need to render a custom field.
     */
    field?: React.ComponentType<CMSFieldProps<T> & CustomProps>;

    /**
     * Additional props that are passed to the default field generated by
     * FireCMS or to the custom field
     */
    fieldProps?: CustomProps;

    /**
     * Configure how a property is displayed as a preview, e.g. in the collection
     * view
     */
    customPreview?: React.ComponentType<PreviewComponentProps<T>> & Partial<PreviewComponentFactoryProps>;
}

/**
 * Possible configuration fields for a string property. Note that setting one
 * config disables the others.
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
     * displayed in the dropdown.
     */
    enumValues?: EnumValues<string>;

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
 */
export interface StorageMeta {

    /**
     * Media type of this reference, used for displaying the preview
     */
    mediaType?: MediaType;

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
    metadata?: firebase.storage.UploadMetadata,

    /**
     * When set to true, this flag indicates that the download URL of the file
     * will be saved in Firestore instead of the Cloud storage path.
     * Note that the generated URL may use a token that, if disabled, may
     * make the URL unusable and lose the original reference to Cloud Storage,
     * so it is not encouraged to use this flag. Defaults to false
     */
    storeUrl?: boolean,

}

/**
 * Possible configuration fields for a string property. Note that setting one
 * config disables the others.
 */
export interface MapFieldConfig<T> extends FieldConfig<T> {

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
 */
export type StorageFileTypes =
    "image/*"
    | "video/*"
    | "audio/*"
    | "application/*"
    | "text/*"
    | "font/*"
    | string; // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

export interface NumberFieldConfig extends FieldConfig<number> {

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enumValues?: EnumValues<number>;

}
