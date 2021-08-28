import { TextSearchDelegate } from "./text_search_delegate";
import { Entity, EntitySchema } from "./entities";
import React from "react";
import "firebase/auth";
import { AuthController } from "../contexts/AuthController";
import { CMSAppContext } from "../contexts";
import { User } from "./user";

/**
 * This interface represents a view that includes a collection of entities.
 * It can be in the root level of the configuration, defining the main
 * menu navigation.
 *
 * If you need a lower level implementation you can check {@link CollectionTable}
 * @category Collections
 */
export interface EntityCollection<M extends { [Key: string]: any } = any,
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
    schema: EntitySchema<M>;

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
    additionalColumns?: AdditionalColumnDelegate<M, AdditionalKey>[];

    /**
     * If a text search delegate is supplied, a search bar is displayed on top
     */
    textSearchDelegate?: TextSearchDelegate;

    /**
     * Permissions the logged-in user can perform on this collection.
     * If not specified everything defaults to `true`
     */
    permissions?: PermissionsBuilder<M>;

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
     * If you need to filter/sort by multiple properties in this collection, you
     * need to create special indexes in Firestore.
     * You can then specify here the indexes created.
     */
    indexes?: CompositeIndex<Extract<keyof M, string>>[];

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
    subcollections?: EntityCollection<any, any>[];

    /**
     * Properties displayed in this collection. If this prop is not set
     * every property is displayed
     */
    properties?: (Extract<keyof M, string> | AdditionalKey)[];

    /**
     * Properties that should NOT get displayed in the collection view.
     * All the other properties from the the entity are displayed
     * It has no effect if the properties value is set.
     */
    excludedProperties?: (Extract<keyof M, string> | AdditionalKey)[];

    /**
     * Properties that can be filtered in this view
     * DEPRECATED, it has no effect if set
     */
    filterableProperties?: (Extract<keyof M, string>)[];

    /**
     * Initial filters applied to this collection.
     * Defaults to none.
     */
    initialFilter?: FilterValues<M>;

    /**
     * Default sort applied to this collection
     */
    initialSort?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * Builder for rendering additional components such as buttons in the
     * collection toolbar
     * @param entityCollection this collection view
     * @param selectedEntities current selected entities by the end user or
     * undefined if none
     */
    extraActions?: (extraActionsParams: ExtraActionsParams<M>) => React.ReactNode;

}

/**
 * Parameter passed to the `extraActions` builder in the collection configuration
 *
 * @category Collections
 */
export type ExtraActionsParams<M extends { [Key: string]: any } = any> = {
    /**
     * Collection path of this entity
     */
    collectionPath: string;

    /**
     * The collection configuration
     */
    collection: EntityCollection<M>;

    /**
     * The entities currently selected in this collection
     */
    selectedEntities?: Entity<M>[];

    /**
     * Context of the app status
     */
    context: CMSAppContext;
};


/**
 * Sizes in which a collection can be rendered
 * @category Collections
 */
export type CollectionSize = "xs" | "s" | "m" | "l" | "xl";


/**
 * @category Collections
 */
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

/**
 *
 * @category Collections
 */
export type PermissionsBuilder<M extends { [Key: string]: any }> =
    Permissions
    | ((props: {
    /**
     * Logged in user
     */
    user: User | null;
    /**
     * Entity being edited, might be null if it is new
     */
    entity: Entity<M> | null;
    /**
     * Collection path of this entity
     */
    collectionPath: string;
    /**
     * Auth controller for additional auth operations
     */
    authController: AuthController;
    /**
     * Context of the app status
     */
    context: CMSAppContext;
}) => Permissions);


/**
 * Use this interface for adding additional columns to entity collection views.
 * If you need to do some async loading you can use AsyncPreviewComponent
 * @category Collections
 */
export interface AdditionalColumnDelegate<M extends { [Key: string]: any } = any, AdditionalKey extends string = string> {

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
    builder: ({ entity, context }: {
        entity: Entity<M>,
        context: CMSAppContext;
    }) => React.ReactNode;

}

/**
 * Used to define filters applied in collections
 * @category Collections
 */
export type FilterValues<M extends { [Key: string]: any }>
    = { [K in keyof M]?: [WhereFilterOp, any] };


/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', and 'array-contains-any'.
 * @category Collections
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

/**
 * You can use this configuration to add additional columns to the data
 * exports
 * @category Collections
 */
export type ExportConfig = {
    additionalColumns: ExportMappingFunction[]
}

/**
 * @category Collections
 */
export type ExportMappingFunction = {
    key: string;
    builder: (props: { entity: Entity<any> }) => Promise<string> | string
}

/**
 * Used to indicate valid filter combinations (as created in Firestore)
 * If the user selects a specific filter/sort combination, the CMS checks if it's
 * valid, otherwise it reverts to the simpler valid case
 * @category Collections
 */
export type CompositeIndex<Key extends string> = Partial<Record<Key, "asc" | "desc">>

