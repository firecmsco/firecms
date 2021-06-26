import { TextSearchDelegate } from "./text_search_delegate";
import { Entity, EntitySchema } from "./models";
import React from "react";
import firebase from "firebase/app";

/**
 * This interface represents a view that includes a collection of entities.
 * It can be in the root level of the configuration, defining the main
 * menu navigation.
 *
 * If you need a lower level implementation you can check CollectionTable
 */
export interface EntityCollection<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>,
    AdditionalKey extends string = string> {
    /**
     * Plural name of the view. E.g. 'products'
     */
    name: string;

    /**
     * Optional description of this view. You can use Markdown.
     */
    description?: string;

    /**
     * Relative Firestore path of this view to its parent.
     * If this view is in the root the path is equal to the absolute one.
     * This path also determines the URL in FireCMS
     */
    relativePath: string;

    /**
     * Schema representing the entities of this view
     */
    schema: S;

    /**
     * Default size of the rendered collection
     */
    defaultSize?: CollectionSize;

    /**
     * Optional field used to group top level navigation entries under a
     * navigation view. If you set this value in a subcollection it has no
     * effect.
     */
    group?: string;

    /**
     * If enabled, content is loaded in batches. If `false` all entities in the
     * collection are loaded.
     * You can specify a number to specify the pagination size (50 by default)
     * Defaults to `true`
     */
    pagination?: boolean | number;

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.q
     */
    additionalColumns?: AdditionalColumnDelegate<AdditionalKey, S, Key>[];

    /**
     * If a text search delegate is supplied, a search bar is displayed on top
     */
    textSearchDelegate?: TextSearchDelegate;

    /**
     * Permissions the logged-in user can perform on this collection.
     * If not specified everything defaults to `true`
     */
    permissions?: PermissionsBuilder<S, Key>;

    /**
     * Can the elements in this collection be edited inline in the collection
     * view. If this flag is set to false but `permissions.edit` is `true`, entities
     * can still be edited in the side panel
     */
    inlineEditing?: boolean;

    /**
     * Are the entities in this collection selectable. Defaults to true
     */
    selectionEnabled?: boolean;

    /**
     * Should the data in this collection view include an export button.
     * You can also set an `ExportConfig` configuration object to customize
     * the export and add additional values.
     * Defaults to `true`
     */
    exportable?: boolean | ExportConfig;

    /**
     * Following the Firestore document and collection schema, you can add
     * subcollections to your entity in the same way you define the root
     * collections.
     */
    subcollections?: EntityCollection[];

    /**
     * Properties displayed in this collection. If this property is not set
     * every property is displayed
     */
    properties?: (Key | AdditionalKey)[];

    /**
     * Properties that should NOT get displayed in the collection view.
     * All the other properties from the the entity are displayed
     * It has no effect if the properties value is set.
     */
    excludedProperties?: (Key | AdditionalKey)[];

    /**
     * Properties that can be filtered in this view
     */
    filterableProperties?: Key[];

    /**
     * Initial filters applied to this collection. Consider that you
     * can filter any property, but only those included in
     * `filterableProperties` will include the corresponding filter widget.
     * Defaults to none.
     */
    initialFilter?: FilterValues<S, Key>;

    /**
     * Default sort applied to this collection
     */
    initialSort?: [Key, "asc" | "desc"];

    /**
     * Builder for rendering additional components such as buttons in the
     * collection toolbar
     * @param entityCollection this collection view
     * @param selectedEntities current selected entities by the end user or
     * undefined if none
     */
    extraActions?: (extraActionsParams: ExtraActionsParams<S, Key>) => React.ReactNode;


}

export type ExtraActionsParams<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>> = {
    view: EntityCollection,
    selectedEntities?: Entity<S, Key>[]
};


/**
 * Sizes in which a collection can be rendered
 */
export type CollectionSize = "xs" | "s" | "m" | "l" | "xl";


export type Permissions = {
    /**
     * Can the user add new entities. Defaults to `true`
     */
    create?: boolean;
    /**
     * Can the elements in this collection be edited. Defaults to `true`
     */
    edit?: boolean;
    /**
     * Can the user delete entities. Defaults to `true`
     */
    delete?: boolean;
}

export type PermissionsBuilder<S extends EntitySchema<Key>, Key extends string> =
    Permissions
    | ((props: { user: firebase.User | null, entity: Entity<S, Key> | null }) => Permissions);


/**
 * Use this interface for adding additional columns to entity collection views.
 * If you need to do some async loading you can use AsyncPreviewComponent
 */
export interface AdditionalColumnDelegate<AdditionalKey extends string = string,
    S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>> {

    /**
     * Id of this column. You can use this id in the `properties` field of the
     * collection in any order you want
     */
    id: AdditionalKey;

    /**
     * Header of this column
     */
    title: string;

    /**
     * Width of the generated column in pixels
     */
    width?: number;

    /**
     * Builder for the content of the cell for this column
     */
    builder: (entity: Entity<S, Key>) => React.ReactNode;

}

/**
 * Used to define filters applied in collections
 */
export type FilterValues<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>> = Partial<{ [K in Key]: [WhereFilterOp, any] }>;

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', and 'array-contains-any'.
 */
export type WhereFilterOp =
    | "<"
    | "<="
    | "=="
    | "!="
    | ">="
    | ">"
    | "array-contains"
    | "in"
    | "array-contains-any";

export type ExportConfig = {
    additionalColumns: ExportMappingFunction[]
}

export type ExportMappingFunction = {
    key: string;
    builder: (props: { entity: Entity<any> }) => Promise<string> | string
}

