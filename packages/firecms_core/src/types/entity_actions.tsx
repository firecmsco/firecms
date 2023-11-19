import React from "react";
import { FireCMSContext } from "./firecms_context";
import { Entity } from "./entities";
import { EntityCollection, SelectionController } from "./collections";
import { User } from "./user";
import { SideEntityController } from "./side_entity_controller";

export type EntityAction<M extends object = any, UserType extends User = User> = {
    name: string;
    icon?: React.ReactElement;
    onClick: (props: EntityActionClickProps<M, UserType>) => Promise<void>;
    /**
     * Show this action in the menu, defaults to true
     */
    collapsed?: boolean;

    /**
     * Show this action in the form, defaults to true
     */
    includeInForm?: boolean;
}

export type EntityActionClickProps<M extends object, UserType extends User = User> = {
    entity: Entity<M>;
    context: FireCMSContext<UserType>;
    fullPath?: string;
    collection?: EntityCollection<M>;
    selectionController?: SelectionController;
    highlightEntity?: (entity: Entity<any>) => void;
    unhighlightEntity?: (entity: Entity<any>) => void;
    onCollectionChange?: () => void;
    /**
     * If this actions is being called from a side dialog
     */
    sideEntityController?: SideEntityController;
};
