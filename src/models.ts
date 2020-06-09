import firebase from "firebase";
import * as React from "react";
import { TextSearchDelegate } from "./text_search_delegate";
import { CMSFieldProps } from "./form/form_props";

/**
 * This interface represents a view that includes a collection of entities.
 * It can be in the root level of the configuration, defining the main
 * menu navigation.
 */
export interface EntityCollectionView<S extends EntitySchema> {

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
}

/**
 * Specification for defining an entity
 */
export interface EntitySchema {

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
    properties: Properties;

}

/**
 * New or existing status
 */
export enum EntityStatus { new = "new", existing = "existing"}

/**
 * Representation of an entity fetched from Firestore
 */
export interface Entity<S extends EntitySchema> {
    id: string;
    snapshot: firebase.firestore.DocumentSnapshot;
    reference: firebase.firestore.DocumentReference;
    values: EntityValues<S>
}

/**
 * This type represents a record of key value pairs as described in an
 * entity schema.
 */
export type EntityValues<S extends EntitySchema> = {
    [K in keyof S["properties"]]: S["properties"][K] extends Property<infer X> ? X : never
};

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
export interface AdditionalColumnDelegate<S extends EntitySchema> {

    title: string;

    builder: (entity:Entity<S>) => React.ReactNode;

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
     * Property description
     */
    description?: string;

    /**
     * Rules for validating this property
     */
    validation?: PropertyValidationSchema,

    /**
     * Is this property displayed in the collection view
     */
    includeInListView?: boolean;

    /**
     * When the entity is rendered as the target of a reference or as part of a
     * map, should this property be included.
     * Basically, if it is rendered in second level references.
     * e.g: One entity -> Array property -> This property
     * If includeAsMapPreview is not specified in any property of an entity, when
     * the given entity is rendered, the first 3 properties are displayed.
     */
    includeAsMapPreview?: boolean;

    /**
     * Should this property have a filter entry in the collection view.
     * Defaults to false
     */
    filterable?: boolean;

    /**
     * Is this a read only property
     */
    disabled?: boolean;

    /**
     * If you need to render a custom field.
     */
    customField?: React.ComponentType<CMSFieldProps<T>>;

    /**
     * Additional props that are passed to the default field generated by
     * FireCMS or to the customField
     */
    additionalProps?: any;
}

export type EnumType = number | string ;

/**
 * We use this interface to define mapping between string or number values in
 * Firestore to a label (such in a select dropdown)
 * The key in this Record is the value saved in Firetore, and the value in
 * this record is the label displayed in the UI
 */
export type EnumValues<T extends EnumType> = Record<T, string>; // id -> Label

/**
 * Record of properties of an entity or a map property
 */
export type Properties = Record<string, Property>;

/**
 * Rules to validate a property
 */
export interface PropertyValidationSchema {
    required?: boolean;
    requiredMessage?: string;
}

export interface NumberProperty extends BaseProperty<number> {
    dataType: "number";

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enumValues?: EnumValues<number>;
}

export interface BooleanProperty extends BaseProperty<boolean> {
    dataType: "boolean";
}

export interface TimestampProperty extends BaseProperty<firebase.firestore.Timestamp> {
    dataType: "timestamp";
}

// TODO: currently this is the only unsupported field
export interface GeopointProperty extends BaseProperty<firebase.firestore.GeoPoint> {
    dataType: "geopoint";
}

export interface ReferenceProperty<S extends EntitySchema> extends BaseProperty<firebase.firestore.DocumentReference> {

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
}

export interface StringProperty extends BaseProperty<string> {

    dataType: "string";

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

    /**
     * You can use the enum values providing a map of possible
     * exclusive values the property can take, mapped to the label that it is
     * displayed in the dropdown.
     */
    enumValues?: EnumValues<string>;
}

export interface ArrayProperty<T> extends BaseProperty<T[]> {

    dataType: "array";

    /**
     * The property of this array. You can specify any property.
     */
    of: Property<T>;
}

export interface MapProperty<T> extends BaseProperty<T> {

    dataType: "map";

    /**
     * Record of properties included in this map.
     */
    properties: Properties;
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
     * Absolute path in you bucket
     */
    storagePath: string;

    /**
     * File MIME types that can be uploaded to this reference
     */
    acceptedFiles?: StorageFileTypes[];
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
