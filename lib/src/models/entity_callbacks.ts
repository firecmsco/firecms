import { Entity, EntityStatus, EntityValues, } from "./entities";
import { FireCMSContext } from "./firecms_context";
import { ResolvedEntityCollection } from "./resolved_entities";

/**
 * This interface defines all the callbacks that can be used when an entity
 * is being created, updated or deleted.
 * Useful for adding your own logic or blocking the execution of the operation.
 * @category Models
 */
export interface EntityCallbacks<M extends { [Key: string]: any } = any> {

    /**
     * Callback used when save is successful
     * @param entitySaveProps
     */
    onSaveSuccess?(entitySaveProps: EntityOnSaveProps<M>)
        : Promise<void> | void;

    /**
     * Callback used when saving fails
     * @param entitySaveProps
     */
    onSaveFailure?(entitySaveProps: EntityOnSaveProps<M>)
        : Promise<void> | void;

    /**
     * Callback used before saving, you need to return the values that will get
     * saved. If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     * @param entitySaveProps
     */
    onPreSave?(entitySaveProps: EntityOnSaveProps<M>)
        : Promise<Partial<EntityValues<M>>> | Partial<EntityValues<M>>;

    /**
     * Callback used after the entity is deleted.
     * If you throw an error in this method the process stops, and an
     * error snackbar gets displayed.
     *
     * @param entityDeleteProps
     */
    onPreDelete?(entityDeleteProps: EntityOnDeleteProps<M>): void;

    /**
     * Callback used after the entity is deleted.
     *
     * @param entityDeleteProps
     */
    onDelete?(entityDeleteProps: EntityOnDeleteProps<M>): void;
}


/**
 * Parameters passed to hooks when an entity is saved
 * @category Models
 */
export interface EntityOnSaveProps<M extends { [Key: string]: any }> {

    /**
     * Resolved collection of the entity
     */
    collection: ResolvedEntityCollection<M>;

    /**
     * Full path where this entity is being saved
     */
    path: string;

    /**
     * Id of the entity or undefined if new
     */
    entityId?: string;

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
    context: FireCMSContext;
}

/**
 * Parameters passed to hooks when an entity is deleted
 * @category Models
 */
export interface EntityOnDeleteProps<M extends { [Key: string]: any }> {

    /**
     * collection of the entity being deleted
     */
    collection: ResolvedEntityCollection<M>;

    /**
     * Path of the parent collection
     */
    path: string;

    /**
     * Deleted entity id
     */
    entityId: string;

    /**
     * Deleted entity
     */
    entity: Entity<M>;

    /**
     * Context of the app status
     */
    context: FireCMSContext;
}
