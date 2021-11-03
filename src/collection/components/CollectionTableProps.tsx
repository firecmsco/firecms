import React from "react";
import {
    CollectionSize,
    Entity, EntityCollection,
    FilterCombination,
    FilterValues,
    Property
} from "../../models";


/**
 * @category Collection components
 */
export type OnColumnResizeParams = { width: number, key: string, type: "property" | "additional" };

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
}

/**
 * @category Collection components
 */
export type UniqueFieldValidator = (props: { name: string, value: any, property: Property, entityId?: string }) => Promise<boolean>;

/**
 * Callback when a cell has changed in a table
 * @category Collection components
 */
export type OnCellValueChange<T, M extends { [Key: string]: any }> = (params: OnCellValueChangeParams<T, M>) => Promise<void>;

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 * @category Collection components
 */
export interface OnCellValueChangeParams<T, M extends { [Key: string]: any }> {
    value: T,
    name: string,
    entity: Entity<M>,
    setSaved: (saved: boolean) => void
    setError: (e: Error) => void
}

