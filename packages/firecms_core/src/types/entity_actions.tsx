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
     * override the default actions.
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

    fullPath?: string;
    fullIdPath?: string;
    collection?: EntityCollection<M>;
    selectionController?: SelectionController;
    highlightEntity?: (entity: Entity<any>) => void;
    unhighlightEntity?: (entity: Entity<any>) => void;
    onCollectionChange?: () => void;
    navigateBack?: () => void;

    /**
     * Optional form context, present if the action is being called from a form.
     * This allows you to access the form state and methods, including modifying the form values.
     */
    formContext?: FormContext;

    /**
     * Present if this actions is being called from a side dialog only
     */
    sideEntityController?: SideEntityController;

    openEntityMode: "side_panel" | "full_screen";
};
