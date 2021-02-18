import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity, EntityCollection,
    EntitySchema,
    FilterValues,
    Properties,
    TextSearchDelegate
} from "../models";
import { FormFieldBuilder } from "../form";
import React from "react";

export interface CollectionTableProps<S extends EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties = Properties<Key>,
    AdditionalKey extends string = string> {

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
    initialFilter?: FilterValues<S>;

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
    additionalColumns?: AdditionalColumnDelegate<AdditionalKey, S>[];

    /**
     * Properties that can be filtered
     */
    filterableProperties?: Key[];

    /**
     * Can the table be edited inline
     */
    inlineEditing: boolean;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(collectionPath: string, entity: Entity<S, Key>): void;

    /**
     * Callback when an entity gets deleted
     */
    onEntityDelete?(collectionPath: string, entity: Entity<S, Key>): void;

    /**
     * Callback when a multiple entities gets deleted
     */
    onMultipleEntitiesDelete?(collectionPath: string, entities: Entity<S>[]): void;

    /**
     * Factory method for creating form fields
     */
    createFormField: FormFieldBuilder;

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<S, Key>[];

    /**
     * Additional components builder such as buttons in the
     * collection toolbar
     */
    toolbarWidgetBuilder?: ({ size }: { size: CollectionSize }) => React.ReactNode;

    /**
     * Builder for creating the buttons in each row
     * @param entity
     * @param size
     */
    tableRowWidgetBuilder?: ({
                                 collectionPath,
                                 entity,
                                 size
                             }: { collectionPath: string, entity: Entity<S, Key>, size: CollectionSize }) => React.ReactNode;

    /**
     * Is the id column frozen to the left.
     */
    frozenIdColumn?: boolean;
}
