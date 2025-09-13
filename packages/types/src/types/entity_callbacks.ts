import { EntityCollection } from "./collections";
import { Entity, EntityStatus, EntityValues, } from "./entities";
import { User } from "../users";
import { FireCMSContext } from "../firecms_context";

/**
 * This interface defines all the callbacks that can be used when an entity
 * is being created, updated or deleted.
 * Useful for adding your own logic or blocking the execution of the operation.
 * @group Models
 */
export type EntityCallbacks<M extends Record<string, any> = any, USER extends User = User> = {

    /**
     * Callback used after fetching data
     * @param entityFetchProps
     */
    onFetch?(entityFetchProps: EntityOnFetchProps<M, USER>)
        : Promise<Entity<M>> | Entity<M>;

    /**
     * Callback used when save is successful
     * @param entitySaveProps
     */
    onSaveSuccess?(entitySaveProps: EntityOnSaveProps<M, USER>)
        : Promise<void> | void;

    /**
     * Callback used when saving fails
     * @param entitySaveProps
     */
    onSaveFailure?(entitySaveProps: EntityOnSaveFailureProps<M, USER>)
        : Promise<void> | void;

    /**
     * Callback used before saving, you need to return the values that will get
     * saved. If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     * @param entitySaveProps
     */
    onPreSave?(entitySaveProps: EntityOnPreSaveProps<M, USER>)
        : Promise<Partial<EntityValues<M>>> | Partial<EntityValues<M>>;

    /**
     * Callback used after the entity is deleted.
     * If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     *
     * @param entityDeleteProps
     */
    onPreDelete?(entityDeleteProps: EntityOnDeleteProps<M, USER>): void;

    /**
     * Callback used after the entity is deleted.
     *
     * @param entityDeleteProps
     */
    onDelete?(entityDeleteProps: EntityOnDeleteProps<M, USER>): void;

    /**
     * Callback fired when any value in the form changes. You can use it
     * to define the ID of a `new` entity based on the current values.
     * The returned string will be used as the ID of the entity.
     *
     * @param idUpdateProps
     */
    onIdUpdate?(idUpdateProps: EntityIdUpdateProps<M>): string | number | Promise<string | number>;

}

/**
 * Parameters passed to hooks when an entity is fetched
 * @group Models
 */
export interface EntityOnFetchProps<M extends Record<string, any> = any, USER extends User = User> {

    /**
     * Collection of the entity
     */
    collection: EntityCollection<M, USER>;

    /**
     * Full path of the CMS where this collection is being fetched.
     * Might contain unresolved aliases.
     */
    path: string;

    /**
     * Fetched entity
     */
    entity: Entity<M>

    /**
     * Context of the app status
     */
    context: FireCMSContext<USER>;
}

/**
 * Parameters passed to hooks before an entity is saved
 * @group Models
 */
export type EntityOnPreSaveProps<M extends Record<string, any> = any, USER extends User = User> =
    Omit<EntityOnSaveProps<M, USER>, "entityId">
    & {
    entityId?: string | number;
}
/**
 * Parameters passed to hooks before an entity is saved
 * @group Models
 */
export type EntityOnSaveFailureProps<M extends Record<string, any> = any, USER extends User = User> =
    Omit<EntityOnSaveProps<M, USER>, "entityId">
    & {
    entityId?: string | number;
}

/**
 * Parameters passed to hooks when an entity is saved
 * @group Models
 */
export interface EntityOnSaveProps<M extends Record<string, any> = any, USER extends User = User> {

    /**
     * Resolved collection of the entity
     */
    collection: EntityCollection<M>;

    /**
     * Full path of the CMS where this entity is being saved.
     * Might contain unresolved aliases.
     */
    path: string;

    /**
     * ID of the entity
     */
    entityId: string | number;

    /**
     * Values being saved
     */
    values: Partial<EntityValues<M>>;

    /**
     * Previous values
     */
    previousValues?: Partial<EntityValues<M>>;

    /**
     * New or existing entity
     */
    status: EntityStatus;

    /**
     * Context of the app status
     */
    context: FireCMSContext<USER>;
}

/**
 * Parameters passed to hooks when an entity is deleted
 * @group Models
 */
export interface EntityOnDeleteProps<M extends Record<string, any> = any, USER extends User = User> {

    /**
     * collection of the entity being deleted
     */
    collection: EntityCollection<M>;

    /**
     * Path of the parent collection
     */
    path: string;

    /**
     * Deleted entity id
     */
    entityId: string | number;

    /**
     * Deleted entity
     */
    entity: Entity<M>;

    /**
     * Context of the app status
     */
    context: FireCMSContext<USER>;
}

/**
 * Parameters passed to hooks when an entity is deleted
 * @group Models
 */
export interface EntityIdUpdateProps<M extends Record<string, any> = any> {

    /**
     * collection of the entity being deleted
     */
    collection: EntityCollection<M>;

    /**
     * Path of the parent collection
     */
    path: string;

    /**
     * Current entity id
     */
    entityId?: string | number;

    /**
     * Entity values
     */
    values: EntityValues<M>;

    /**
     * Context of the app status
     */
    context: FireCMSContext;
}
