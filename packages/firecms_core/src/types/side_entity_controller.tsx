import { EntityCollection } from "./collections";
import { ResolvedEntityCollection } from "./resolved_entities";
import { Entity } from "./entities";
import { EntityOverrides } from "./entity_overrides";
import { EntityFormProps } from "../form";

/**
 * Props used to open a side dialog
 * @group Hooks and utilities
 */
export interface EntitySidePanelProps<M extends Record<string, any> = any> {

    /**
     * Absolute path of the entity
     */
    path: string;

    /**
     * Full CMS path of the entity, including the collection and sub-collections.
     */
    fullIdPath?: string;

    /**
     * ID of the entity, if not set, it means we are creating a new entity
     */
    entityId?: string | number;

    /**
     * Set this flag to true if you want to make a copy of an existing entity
     */
    copy?: boolean;

    /**
     * Open the entity with a selected sub-collection view. If the panel for this
     * entity was already open, it is replaced.
     */
    selectedTab?: string;

    /**
     * Use this prop to override the width of the form view.
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

    /**
     * Callback when the entity is updated
     * @param params
     */
    onUpdate?: (params: { entity: Entity<any> }) => void;

    /**
     * Callback when the dialog is closed
     */
    onClose?: () => void;

    /**
     * Should this panel close when saving
     */
    closeOnSave?: boolean;

    /**
     * Override some form properties
     */
    formProps?: Partial<EntityFormProps<M>>;

    /**
     * Allow the user to open the entity fullscreen
     */
    allowFullScreen?: boolean;
}

/**
 * Controller to open the side dialog displaying entity forms
 * @group Hooks and utilities
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
     * @param props
     */
    open: <M extends Record<string, any> = any>(props: EntitySidePanelProps<M>) => void;

    /**
     * Replace the last open entity panel with the given one.
     * @param props
     */
    replace: <M extends Record<string, any> = any>(props: EntitySidePanelProps<M>) => void;
}
