import { EntityCollection } from "./collections";
import { EntitySchema, EntitySchemaResolver } from "./entities";
import { EntityCallbacks } from "./entity_callbacks";
import { PermissionsBuilder } from "./permissions";
import { User } from "./user";

/**
 * Props used to open a side dialog
 * @category Hooks and utilities
 */
export interface SideEntityPanelProps<M = any, UserType = User> {

    /**
     * Absolute path of the entity
     */
    path: string;

    /**
     * Id of the entity, if not set, it means we are creating a new entity
     */
    entityId?: string;

    /**
     * Set this flag to true if you want to make a copy of an existing entity
     */
    copy?: boolean;

    /**
     * Open the entity with a selected sub-collection view. If the panel for this
     * entity was already open, it is replaced.
     */
    selectedSubpath?: string;

    /**
     * Use this prop to override the width of the side dialog.
     * e.g. "600px"
     */
    width?: number | string;

    /**
     * Can the elements in this collection be added and edited.
     */
    permissions?: PermissionsBuilder<M, UserType>;

    /**
     * Schema representing the entities of this view
     */
    schema?: EntitySchema<M> | EntitySchemaResolver<M>;

    /**
     * You can add subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollection[];

    /**
     * This interface defines all the callbacks that can be used when an entity
     * is being created, updated or deleted.
     * Useful for adding your own logic or blocking the execution of the operation
     */
    callbacks?: EntityCallbacks<M>;

    /**
     * Should update the URL when opening the dialog.
     * Consider that if the schema that you provide is not defined in the base
     * config of your `FireCMS` component, you will not be able to recreate
     * the state if copying the URL to a different window.
     */
    updateUrl?: boolean;
}

/**
 * Controller to open the side dialog displaying entity forms
 * @category Hooks and utilities
 */
export interface SideEntityController {
    /**
     * Close the last panel
     */
    close: () => void;

    /**
     * List of side entity panels currently open
     */
    sidePanels: SideEntityPanelProps[];

    /**
     * Open a new entity sideDialog. By default, the schema and configuration
     * of the view is fetched from the collections you have specified in the
     * navigation.
     * At least you need to pass the path of the entity you would like
     * to edit. You can set an entityId if you would like to edit and existing one
     * (or a new one with that id).
     * If you wish, you can also override the `SchemaConfig` and choose
     * to override the FireCMS level `SchemaRegistryController`.
     * @param props
     */
    open: (props: SideEntityPanelProps) => void;
}
