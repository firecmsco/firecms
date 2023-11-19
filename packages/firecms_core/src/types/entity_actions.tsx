import React from "react";
import { FireCMSContext } from "./firecms_context";
import { Entity } from "./entities";
import { EntityCollection, SelectionController } from "./collections";

export type EntityAction<M extends object = any> = {
    name: string;
    icon?: React.ReactElement;
    onClick: (props: EntityActionClickProps<M>) => Promise<void>;
    /**
     * Show this action in the menu, defaults to true
     */
    collapsed?: boolean;
}

export type EntityActionClickProps<M extends object> = {
    entity: Entity<M>;
    context: FireCMSContext;
    fullPath?: string;
    collection?: EntityCollection<M>;
    selectionController?: SelectionController;
    highlightEntity?: (entity: Entity<any>) => void;
    unhighlightEntity?: (entity: Entity<any>) => void;
    onCollectionChange?: () => void;
};
