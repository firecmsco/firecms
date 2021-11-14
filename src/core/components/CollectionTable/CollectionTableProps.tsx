import React from "react";
import { CollectionSize, Entity, EntityCollection } from "../../../models";


/**
 * @category Collection components
 */
export type OnColumnResizeParams = { width: number, key: string };

/**
 * @category Collection components
 */
export interface CollectionTableProps<M extends { [Key: string]: any }, AdditionalKey extends string = string> {

    /**
     * Absolute collection path
     */
    path: string;

    /**
     * Collection
     */
    collection: EntityCollection<M>;

    /**
     * Override the title in the toolbar
     */
    title?: React.ReactNode;

    /**
     * Can the table be edited inline
     */
    inlineEditing: ((entity: Entity<any>) => boolean) | boolean;

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<M>[];

    /**
     * Additional components builder such as buttons in the
     * collection toolbar
     */
    toolbarActionsBuilder?: (props: { size: CollectionSize, data: Entity<any>[] }) => React.ReactNode;

    /**
     * Builder for creating the buttons in each row
     * @param entity
     * @param size
     */
    tableRowActionsBuilder?: ({
                                  entity,
                                  size
                              }: { entity: Entity<M>, size: CollectionSize }) => React.ReactNode;

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

