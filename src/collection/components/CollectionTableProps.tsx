import React from "react";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntitySchema,
    FilterCombination,
    FilterValues,
    Property
} from "../../models";
import { CMSColumn } from "../internal/common";

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
     * Schema of the entity displayed by this collection
     */
    schema: EntitySchema<M>;

    /**
     * Override the title in the toolbar
     */
    title?: React.ReactNode;

    /**
     * In case this table should have some filters set by default
     */
    initialFilter?: FilterValues<M>;

    /**
     * Default sort applied to this collection
     */
    initialSort?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * If enabled, content is loaded in batch
     */
    paginationEnabled: boolean;

    /**
     * Default table size before being changed with the selector
     */
    defaultSize?: CollectionSize;

    /**
     * Flag to indicate if a search bar should be displayed on top of
     * the collection table.
     */
    textSearchEnabled?: boolean;

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed, you can filter
     */
    columns: CMSColumn[];

    /**
     * Can the table be edited inline
     */
    inlineEditing: ((entity: Entity<any>) => boolean) | boolean;

    /**
     * If you need to filter/sort by multiple properties in this collection, you
     * may need to create special indexes in your datasource (e.g. Firestore).
     * You can then specify here the indexes created.
     */
    filterCombinations?: FilterCombination<Extract<keyof M, string>>[];

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
     * Is the id column frozen to the left.
     */
    frozenIdColumn?: boolean;

    /**
     * How many entries are loaded per page
     */
    pageSize?: number;

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

