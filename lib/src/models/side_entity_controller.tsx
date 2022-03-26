import { EntityCollection } from "./collections";
import { User } from "./user";
import {
    ResolvedEntityCollection
} from "./resolved_entities";

/**
 * Props used to open a side dialog
 * @category Hooks and utilities
 */
export interface EntityPanelProps<M = any, UserType extends User = User> {

    /**
     * Absolute path of the entity
     */
    path: string;

    /**
     * ID of the entity, if not set, it means we are creating a new entity
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
    selectedSubPath?: string;

    /**
     * Use this prop to override the width of the side dialog.
     * e.g. "600px"
     */
    width?: number | string;

    /**
     * Collection representing the entities of this view.
     * If you leave it blank it will be induced by your navigation
     */
    collection?: EntityCollection<M> | ResolvedEntityCollection<M>;

    /**
     * Should update the URL when opening the dialog.
     * Consider that if the collection that you provide is not defined in the base
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
     * Open a new entity sideDialog. By default, the collection and configuration
     * of the view is fetched from the collections you have specified in the
     * navigation.
     * At least you need to pass the path of the entity you would like
     * to edit. You can set an entityId if you would like to edit and existing one
     * (or a new one with that id).
     * If you wish, you can also override the `CollectionOverrideHandler` at
     * the FireCMS level.
     * @param props
     */
    open: (props: EntityPanelProps) => void;
    replace: (props: EntityPanelProps) => void;
}
