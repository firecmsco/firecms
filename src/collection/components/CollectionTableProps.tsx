import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntitySchema,
    FilterValues,
    Property,
    TextSearchDelegate
} from "../../models";
import React from "react";

/**
 * @category Collection components
 */
export interface CollectionTableProps<S extends EntitySchema<Key>, Key extends string, AdditionalKey extends string = string> {

    /**
     * Absolute collection path
     */
    collectionPath: string;

    /**
     * Schema of the entity displayed by this collection
     */
    schema: S;

    /**
     * Override the title in the toolbar
     */
    title?: React.ReactNode;

    /**
     * In case this table should have some filters set by default
     */
    initialFilter?: FilterValues<S, Key>;

    /**
     * Default sort applied to this collection
     */
    initialSort?: [Key, "asc" | "desc"];

    /**
     * If enabled, content is loaded in batch
     */
    paginationEnabled: boolean;

    /**
     * Default table size before being changed with the selector
     */
    defaultSize?: CollectionSize;

    /**
     * If a text search delegate is provided, a searchbar is displayed
     */
    textSearchDelegate?: TextSearchDelegate;

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed, you can filter
     */
    displayedProperties: string[];

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     * Usually defined by the end user.
     */
    additionalColumns?: AdditionalColumnDelegate<AdditionalKey, S, Key>[];

    /**
     * Properties that can be filtered
     */
    filterableProperties?: Key[];

    /**
     * Can the table be edited inline
     */
    inlineEditing: ((entity: Entity<any>) => boolean) | boolean;

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<S, Key>[];

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
                              }: { entity: Entity<S, Key>, size: CollectionSize }) => React.ReactNode;

    /**
     * Is the id column frozen to the left.
     */
    frozenIdColumn?: boolean;

    /**
     * Use this callback to validate if an entity field should be unique
     */
    uniqueFieldValidator?: UniqueFieldValidator;
    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: (params: OnCellChangeParams<any, S, Key>) => Promise<void>;
    /**
     * How many entries are loaded per page
     */
    pageSize?: number;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(entity: Entity<S, Key>): void;
}


export type UniqueFieldValidator = (props: { name: string, value: any, property: Property, entityId?: string }) => Promise<boolean>;

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 */
export type OnCellChangeParams<T, S extends EntitySchema<Key>, Key extends string> = {
    value: T,
    name: string,
    entity: Entity<S, Key>,
    setError: (e: Error) => void
};

