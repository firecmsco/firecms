import React from "react";
import { CollectionSize, Entity, EntityCollection } from "../../../types";

/**
 * @category Collection components
 */
export type OnColumnResizeParams = { width: number, key: string };

/**
 * @category Collection components
 */
export type EntityCollectionTableProps<M extends Record<string, any>> = Omit<EntityCollection<M>, "Actions"> & {

    /**
     * Absolute collection path
     */
    fullPath: string;

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<M>[];

    /**
     * Display these entities as selected
     */
    selectedEntities?: Entity<M>[];

    /**
     * Override the title in the toolbar
     */
    title?: React.ReactNode;

    /**
     * Additional component that renders actions such as buttons in the
     * collection toolbar, displayed on the right side
     */
    actions?: React.ReactNode;

    /**
     * Additional component that renders actions such as buttons in the
     * collection toolbar, displayed on the left side
     */
    actionsStart?: React.ReactNode;

    /**
     * Builder for creating the buttons in each row
     * @param entity
     * @param size
     */
    tableRowActionsBuilder?: (params: { entity: Entity<M>, size: CollectionSize, width: number, frozen?:boolean }) => React.ReactNode;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(entity: Entity<M>): void;

    /**
     * Callback when a column is resized
     */
    onColumnResize?(params: OnColumnResizeParams): void;

    /**
     * Callback when the selected size of the table is changed
     */
    onSizeChanged?(size: CollectionSize): void;

    /**
     * Should apply a different style to a row when hovering
     */
    hoverRow?: boolean;
}
