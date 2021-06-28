import firebase from "firebase/app";
import { CMSAppContext } from "../contexts/CMSAppContext";
import {
    EnumValues,
    PropertiesOrBuilder,
    Property,
    PropertyBuilder
} from "./properties";

/**
 * Specification for defining an entity
 * @category Entities
 */
export interface EntitySchema<Key extends string = string> {

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
    customId?: boolean | EnumValues;

    /**
     * Set of properties that compose an entity
     */
    properties: PropertiesOrBuilder<this, Key>;

    /**
     * When creating a new entity, set some values as already initialized
     */
    defaultValues?: Partial<EntityValues<this, Key>>;

    /**
     * Hook called when save is successful
     * @param entitySaveProps
     */
    onSaveSuccess?(entitySaveProps: EntitySaveProps<this, Key>)
        : Promise<void> | void;

    /**
     * Hook called when saving fails
     * @param entitySaveProps
     */
    onSaveFailure?(entitySaveProps: EntitySaveProps<this, Key>)
        : Promise<void> | void;

    /**
     * Hook called before saving, you need to return the values that will get
     * saved. If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     * @param entitySaveProps
     */
    onPreSave?(entitySaveProps: EntitySaveProps<this, Key>)
        : Promise<EntityValues<this, Key>> | EntityValues<this, Key>

    /**
     * Hook called after the entity is deleted in Firestore.
     * If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     *
     * @param entityDeleteProps
     */
    onPreDelete?(entityDeleteProps: EntityDeleteProps<this, Key>): void;

    /**
     * Hook called after the entity is deleted in Firestore.
     *
     * @param entityDeleteProps
     */
    onDelete?(entityDeleteProps: EntityDeleteProps<this, Key>): void;
}

/**
 * Parameters passed to hooks when an entity is saved
 * @category Entities
 */
export interface EntitySaveProps<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>> {

    /**
     * Resolved schema of the entity
     */
    schema: S;

    /**
     * Full path where this entity is being saved
     */
    collectionPath: string;

    /**
     * Id of the entity or undefined if new
     */
    id?: string;

    /**
     * Values being saved
     */
    values: EntityValues<S, Key>;

    /**
     * New or existing entity
     */
    status: EntityStatus;

    /**
     * Context of the app status
     */
    context: CMSAppContext;
}

/**
 * Parameters passed to hooks when an entity is deleted
 * @category Entities
 */
export interface EntityDeleteProps<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>> {

    /**
     * Schema of the entity being deleted
     */
    schema: S;

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
    entity: Entity<S, Key>;

    /**
     * Context of the app status
     */
    context: CMSAppContext;
}


/**
 * New or existing status
 * @category Entities
 */
export type EntityStatus = "new" | "existing" | "copy";

/**
 * Representation of an entity fetched from Firestore
 * @category Entities
 */
export interface Entity<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>> {
    id: string;
    reference: firebase.firestore.DocumentReference;
    values: EntityValues<S, Key>;
}


/**
 * This type represents a record of key value pairs as described in an
 * entity schema.
 * @category Entities
 */
export type EntityValues<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>
    = {
    [K in Key]: S["properties"][K] extends Property<infer T> ? T :
        (S["properties"][K] extends PropertyBuilder<infer T, S, Key> ? T : any);
};

