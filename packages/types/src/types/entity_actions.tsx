import React from "react";
import { FireCMSContext } from "./firecms_context";
import { Entity } from "./entities";
import { EntityCollection, SelectionController } from "./collections";
import { User } from "./user";
import { SideEntityController } from "./side_entity_controller";
import { FormContext } from "./fields";

/**
 * An entity action is a custom action that can be performed on an entity.
 * They are displayed in the entity view and in the collection view.
 */
export type EntityAction<M extends object = any, USER extends User = User> = {
    /**
     * Title of the action
     */
    name: string;

    /**
     * Key of the action. You only need to provide this if you want to
     * override the default actions, or if you are not passing the action
     * directly to the `entityActions` prop of a collection.
     * You can define your actions at the app level, in which case you
     * must provide a key.
     * The default actions are:
     * - edit
     * - delete
     * - copy
     */
    key?: string;

    /**
     * Icon of the action
     */
    icon?: React.ReactElement;

    /**
     * Callback when the action is clicked
     * @param props
     */
    onClick: (props: EntityActionClickProps<M, USER>) => Promise<void> | void;

    /**
     * Optional callback in case you want to disable the action
     * @param props
     */
    isEnabled?: (props: EntityActionClickProps<M, USER>) => boolean;

    /**
     * Show this action collapsed in the menu of the collection view.
     * Defaults to true
     * If false, the action will be shown in the menu
     */
    collapsed?: boolean;

    /**
     * Show this action in the form, defaults to true
     */
    includeInForm?: boolean;

}

export type EntityActionClickProps<M extends object, USER extends User = User> = {
    entity?: Entity<M>;
    context: FireCMSContext<USER>;

    path?: string;
    collection?: EntityCollection<M>;

    /**
     * Optional form context, present if the action is being called from a form.
     * This allows you to access the form state and methods, including modifying the form values.
     */
    formContext?: FormContext;

    /**
     * Present if this actions is being called from a side dialog only
     */
    sideEntityController?: SideEntityController;

    /**
     * Is the action being called from the collection view or from the entity form view?
     */
    view: "collection" | "form";

    /**
     * If the action is rendered in the form, is it open in a side panel or full screen?
     */
    openEntityMode: "side_panel" | "full_screen";

    /**
     * Optional selection controller, present if the action is being called from a collection view
     */
    selectionController?: SelectionController;

    /**
     * Optional highlight function to highlight the entity in the collection view
     * @param entity
     */
    highlightEntity?: (entity: Entity<any>) => void;

    /**
     * Optional unhighlight function to remove the highlight from the entity in the collection view
     * @param entity
     */
    unhighlightEntity?: (entity: Entity<any>) => void;

    /**
     * Optional function to navigate back (e.g. when deleting an entity or navigating from a form)
     */
    navigateBack?: () => void;

    /**
     * Callback to be called when the collection changes, e.g. after an entity is deleted or created.
     */
    onCollectionChange?: () => void;

};
