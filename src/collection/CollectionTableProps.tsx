import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntitySchema,
    FilterValues,
    Properties,
    TextSearchDelegate
} from "../models";
import { FormFieldBuilder } from "../form";
import React from "react";

export interface CollectionTableProps<S extends EntitySchema,
    Key extends string = Extract<keyof S["properties"], string>,
    P extends Properties = Properties<Key>> {

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
     * every property is displayed
     */
    properties?: Key[];

    /**
     * Properties that should NOT get displayed in the collection view.
     * All the other properties from the the entity are displayed
     * It has no effect if the properties value is set.
     */
    excludedProperties?: Key[];

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     */
    additionalColumns?: AdditionalColumnDelegate<S>[];

    /**
     * Properties that can be filtered
     */
    filterableProperties?: Key[];

    /**
     * Should the table add an edit button. If set to false `inlineEditing`
     * has no effect.
     */
    editEnabled: boolean;

    /**
     * Can the table be edited inline
     */
    inlineEditing: boolean;

    /**
     * Should the table add a delete button
     */
    deleteEnabled?: boolean;

    /**
     * Callback when anywhere on the table is clicked
     */
    onEntityClick?(collectionPath: string, entity: Entity<S>): void;

    /**
     * Callback when an entity gets deleted
     */
    onEntityDelete?(collectionPath: string, entity: Entity<S>): void;

    /**
     * Callback when a multiple entities gets deleted
     */
    onMultipleEntitiesDelete?(collectionPath: string, entities: Entity<S>[]): void;

    /**
     * Factory method for creating form fields
     */
    createFormField: FormFieldBuilder;

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
                                  entity,
                                  size
                              }: { entity: Entity<S>, size: CollectionSize }) => React.ReactNode;

}
