import { EntityCollection } from "./collections";
import { Entity, EntityStatus, EntityValues, } from "./entities";
import { User } from "../users";
import { FireCMSCallContext } from "../firecms_context";

/**
 * This interface defines all the callbacks that can be used when an entity
 * is being created, updated or deleted.
 * Useful for adding your own logic or blocking the execution of the operation.
 * @group Models
 */
export type EntityCallbacks<M extends Record<string, any> = any, USER extends User = User> = {

    /**
     * Callback used after fetching data
     * @param props
     */
    afterRead?(props: EntityAfterReadProps<M, USER>)
        : Promise<Entity<M>> | Entity<M>;


    /**
     * Callback used before saving, you need to return the values that will get
     * saved. If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     * This runs after schema validation.
     * @param props
     */
    beforeSave?(props: EntityBeforeSaveProps<M, USER>)
        : Promise<Partial<EntityValues<M>>> | Partial<EntityValues<M>>;

    /**
     * Callback used when save is successful
     * @param props
     */
    afterSave?(props: EntityAfterSaveProps<M, USER>)
        : Promise<void> | void;

    /**
     * Callback used when saving fails
     * @param props
     */
    afterSaveError?(props: EntityAfterSaveErrorProps<M, USER>)
        : Promise<void> | void;

    /**
     * Callback used before the entity is deleted.
     * If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     *
     * @param props
     */
    beforeDelete?(props: EntityBeforeDeleteProps<M, USER>): void;

    /**
     * Callback used after the entity is deleted.
     *
     * @param props
     */
    afterDelete?(props: EntityAfterDeleteProps<M, USER>): void;

}

/**
 * Parameters passed to hooks when an entity is fetched
 * @group Models
 */
export interface EntityAfterReadProps<M extends Record<string, any> = any, USER extends User = User> {

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
    context: FireCMSCallContext<USER>;
}

/**
 * Parameters passed to hooks before an entity is saved
 * @group Models
 */
export type EntityBeforeSaveProps<M extends Record<string, any> = any, USER extends User = User> =
    Omit<EntityAfterSaveProps<M, USER>, "entityId">
    & {
        entityId?: string | number;
    }
/**
 * Parameters passed to hooks before an entity is saved
 * @group Models
 */
export type EntityAfterSaveErrorProps<M extends Record<string, any> = any, USER extends User = User> =
    Omit<EntityAfterSaveProps<M, USER>, "entityId">
    & {
        entityId?: string | number;
    }

/**
 * Parameters passed to hooks when an entity is saved
 * @group Models
 */
export interface EntityAfterSaveProps<M extends Record<string, any> = any, USER extends User = User> {

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
    context: FireCMSCallContext<USER>;
}

/**
 * Parameters passed to hooks when an entity is deleted
 * @group Models
 */
export interface EntityBeforeDeleteProps<M extends Record<string, any> = any, USER extends User = User> {

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
    context: FireCMSCallContext<USER>;
}

/**
 * Parameters passed to hooks after an entity is deleted
 * @group Models
 */
export interface EntityAfterDeleteProps<M extends Record<string, any> = any, USER extends User = User> {

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
    context: FireCMSCallContext<USER>;
}

