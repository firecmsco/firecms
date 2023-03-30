import React, { Dispatch, SetStateAction } from "react";
import { Entity, EntityValues } from "./entities";
import { User } from "./user";
import { FireCMSContext } from "./firecms_context";
import { EntityCallbacks } from "./entity_callbacks";
import { Permissions, PermissionsBuilder } from "./permissions";
import { EnumValues, PropertiesOrBuilders } from "./properties";

/**
 * This interface represents a view that includes a collection of entities.
 * It can be in the root level of the configuration, defining the main
 * menu navigation. You can also find it as a subcollection of a different one.
 *
 * @category Models
 */
export interface EntityCollection<M extends Record<string, any> = any,
    AdditionalKey extends string = string,
    UserType extends User = User> {

    /**
     * Name of the collection, typically plural.
     * E.g. `Products`, `Blog`
     */
    name: string;

    /**
     * Singular name of an entry in this collection
     * E.g. `Product`, `Blog entry`
     */
    singularName?: string;

    /**
     * Optional description of this view. You can use Markdown.
     */
    description?: string;

    /**
     * Relative path of this view to its parent.
     * If this view is in the root the path is equal to the absolute one.
     * This path also determines the URL in FireCMS, unless an alias is specified
     */
    path: string;

    /**
     * You can set an alias that will be used internally instead of the `path`.
     * The `alias` value will be used to determine the URL of the collection,
     * while `path` will still be used in the datasource.
     * Note that you can use this value in reference properties too.
     */
    alias?: string;

    /**
     * Icon key to use in this collection.
     * You can use any of the icons in the MUI specs:
     * https://mui.com/material-ui/material-icons/
     * e.g. 'AccountTree' or 'Person'
     */
    icon?: string;

    /**
     * Optional field used to group top level navigation entries under a~
     * navigation view. If you set this value in a subcollection it has no
     * effect.
     */
    group?: string;

    /**
     * Set of properties that compose an entity
     */
    properties: PropertiesOrBuilders<M>;

    /**
     * Order in which the properties are displayed.
     * If you are specifying your collection as code, the order is the same as the
     * one you define in `properties`. Additional columns are added at the
     * end of the list, if the order is not specified.
     * You can use this prop to hide some properties from the table view.
     * Note that if you set this prop, other ways to hide fields, like
     * `hidden` in the property definition, will not work.
     */
    propertiesOrder?: Extract<keyof M | AdditionalKey, string>[];

    /**
     * If enabled, content is loaded in batches. If `false` all entities in the
     * collection are loaded.
     * You can specify a number to specify the pagination size (50 by default)
     * Defaults to `true`
     */
    pagination?: boolean | number;

    /**
     * Flag to indicate if a search bar should be displayed on top of
     * the collection table.
     */
    textSearchEnabled?: boolean;

    /**
     * Permissions the logged-in user can perform on this collection.
     * If not specified everything defaults to `true`.
     */
    permissions?: Permissions | PermissionsBuilder<EntityCollection<M>, UserType, M>;

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
    exportable?: boolean | ExportConfig<UserType>;

    /**
     * You can add subcollections to your entity in the same way you define the root
     * collections. The collections added here will be displayed when opening
     * the side dialog of an entity.
     */
    subcollections?: EntityCollection<any, any>[];

    /**
     * This interface defines all the callbacks that can be used when an entity
     * is being created, updated or deleted.
     * Useful for adding your own logic or blocking the execution of the operation.
     */
    callbacks?: EntityCallbacks<M>;

    /**
     * Builder for rendering additional components such as buttons in the
     * collection toolbar
     */
    Actions?: React.ComponentType<CollectionActionsProps> | React.ComponentType<CollectionActionsProps>[];

    /**
     * Pass your own selection controller if you want to control selected
     * entities externally.
     * @see useSelectionController
     */
    selectionController?: SelectionController<M>;

    /**
     * If this property is not set, the property will be created by the
     * datasource.
     * You can set the value to true to allow the users to choose the ID.
     * You can also pass a set of values (as an EnumValues object) to allow them
     * to pick from only those.
     */
    customId?: boolean | EnumValues | "optional";

    /**
     * Force a filter in this view. If applied, the rest of the filters will
     * be disabled. Filters applied with this prop cannot be changed.
     * e.g. `forceFilter: { age: [">=", 18] }`
     */
    forceFilter?: FilterValues<Extract<keyof M, string>>;

    /**
     * Initial filters applied to the collection this collection is related to.
     * Defaults to none. Filters applied with this prop can be changed.
     * e.g. `initialFilter: { age: [">=", 18] }`
     */
    initialFilter?: FilterValues<Extract<keyof M, string>>; // setting FilterValues<M> can break defining collections by code

    /**
     * Default sort applied to this collection.
     * When setting this prop, entities will have a default order
     * applied in the collection.
     * e.g. `initialSort: ["order", "asc"]`
     */
    initialSort?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * Array of builders for rendering additional panels in an entity view.
     * Useful if you need to render custom views
     */
    views?: EntityCustomView<M>[];

    /**
     * You can add additional fields to the collection view by implementing
     * an additional field delegate.
     */
    additionalFields?: AdditionalFieldDelegate<M, AdditionalKey, UserType>[];

    /**
     * DEPRECATED: Use `additionalFields` instead
     *
     * This prop will be removed in the final version
     *
     * You can add additional fields to the collection view by implementing
     * an additional field delegate.
     */
    additionalColumns?: AdditionalFieldDelegate<M, AdditionalKey, UserType>[];

    /**
     * Default size of the rendered collection
     */
    defaultSize?: CollectionSize;

    /**
     * Can the elements in this collection be edited inline in the collection
     * view. If this flag is set to false but `permissions.edit` is `true`, entities
     * can still be edited in the side panel
     */
    inlineEditing?: boolean;

    /**
     * If you need to filter/sort by multiple properties in this
     * collection, you can define the supported filter combinations here.
     * In the case of Firestore, you need to create special indexes in the console to
     * support filtering/sorting by more than one property. You can then
     * specify here the indexes created.
     */
    filterCombinations?: FilterCombination<Extract<keyof M, string>>[];

    /**
     * Should this collection be hidden from the main navigation panel, if
     * it is at the root level, or in the entity side panel if it's a
     * subcollection.
     * It will still be accessible if you reach the specified path.
     * You can also use this collection as a reference target.
     */
    hideFromNavigation?: boolean;

    /**
     * If you want to open custom views or subcollections by default when opening the edit
     * view of an entity, you can specify the path to the view here.
     * The path is relative to the current collection. For example if you have a collection
     * that has a custom view as well as a subcollection that refers to another entity, you can
     * either specify the path to the custom view or the path to the subcollection.
     */
    defaultSelectedView?: string;

    /**
     * Should the ID of this collection be hidden from the form view.
     */
    hideIdFromForm?: boolean;

    /**
     * Should the ID of this collection be hidden from the grid view.
     */
    hideIdFromCollection?: boolean;

}

/**
 * Parameter passed to the `Actions` prop in the collection configuration.
 * Note that actions are rendered in the collection toolbar, as well
 * as in the home page card.
 * If you don't want to render the actions in the home page card, you can
 * return `null` if mode is `home`.
 *
 * @category Models
 */
export interface CollectionActionsProps<M extends Record<string, any> = any, UserType extends User = User, EC extends EntityCollection<M> = EntityCollection<M>> {
    /**
     * Collection path of this entity. This is the full path, like
     * `users/1234/addresses`
     */
    path: string;

    /**
     * The collection configuration
     */
    collection: EC;

    /**
     * Use this controller to get the selected entities and to update the
     * selected entities state.
     */
    selectionController: SelectionController<M>;

    /**
     * Entities that are currently loaded in the collection view.
     * Note that this is not the full list of entities, but only the ones
     * currently loaded in the collection view.
     */
    loadedEntities: Entity<M>[];

    /**
     * Context of the app status
     */
    context: FireCMSContext<UserType>;

}

/**
 * Use this controller to retrieve the selected entities or modify them in
 * an {@link EntityCollection}
 * If you want to pass a `SelectionController` to
 * @category Models
 */
export type SelectionController<M extends Record<string, any> = any> = {
    selectedEntities: Entity<M>[];
    setSelectedEntities: Dispatch<SetStateAction<Entity<M>[]>>;
    isEntitySelected: (entity: Entity<M>) => boolean;
    toggleEntitySelection: (entity: Entity<M>) => void;
}

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings '<', '<=', '==', '>=', '>', 'array-contains', 'in', and 'array-contains-any'.
 * @category Models
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
    | "not-in"
    | "array-contains-any";

/**
 * Used to define filters applied in collections
 * @category Models
 */
export type FilterValues<Key extends string> =
    Partial<Record<Key, [WhereFilterOp, any]>>;

/**
 * You can use this configuration to add additional fields to the data
 * exports
 * @category Models
 */
export interface ExportConfig<UserType extends User = User> {
    additionalFields: ExportMappingFunction<UserType> []
}

/**
 * @category Models
 */
export interface ExportMappingFunction<UserType extends User = User> {
    key: string;
    builder: ({
                  entity,
                  context
              }: { entity: Entity<any>, context: FireCMSContext<UserType> }) => Promise<string> | string;
}

/**
 * Used to indicate valid filter combinations (e.g. created in Firestore)
 * If the user selects a specific filter/sort combination, the CMS checks if it's
 * valid, otherwise it reverts to the simpler valid case
 * @category Models
 */
export type FilterCombination<Key extends string> = Partial<Record<Key, "asc" | "desc">>;

/**
 * Sizes in which a collection can be rendered
 * @category Models
 */
export type CollectionSize = "xs" | "s" | "m" | "l" | "xl";

/**
 * DEPRECATED: Use `AdditionalFieldDelegate` instead
 */
export type AdditionalColumnDelegate = AdditionalFieldDelegate;

export type AdditionalFieldDelegateProps<M extends Record<string, any> = any, UserType extends User = User> = { entity: Entity<M>, context: FireCMSContext<UserType> };

/**
 * Use this interface for adding additional fields to entity collection views.
 * If you need to do some async loading you can use {@link AsyncPreviewComponent}
 * @category Models
 */
export interface AdditionalFieldDelegate<M extends Record<string, any> = any,
    AdditionalKey extends string = string,
    UserType extends User = User> {

    /**
     * ID of this column. You can use this id in the `properties` field of the
     * collection in any order you want
     */
    id: AdditionalKey;

    /**
     * Header of this column
     */
    name: string;

    /**
     * Width of the generated column in pixels
     */
    width?: number;

    /**
     * DEPRECATED: Use `Builder` instead
     * Builder for the content of the cell for this column
     */
    builder?: React.ComponentType<AdditionalFieldDelegateProps<M, UserType>>;

    /**
     * Builder for the content of the cell for this column
     */
    Builder?: React.ComponentType<AdditionalFieldDelegateProps<M, UserType>>;

    /**
     * If this column needs to update dynamically based on other properties,
     * you can define an array of keys as strings with the
     * `dependencies` prop.
     * e.g. ["name", "surname"]
     * This is a performance optimization, if you don't define dependencies
     * it will be updated in every render.
     */
    dependencies?: Extract<keyof M, string>[];
}

/**
 * You can use this builder to render a custom panel in the entity detail view.
 * It gets rendered as a tab.
 * @category Models
 */
export type EntityCustomView<M extends Record<string, any> = any> =
    {
        path: string,
        name: string,
        /**
         * DEPRECATED: Use `Builder` instead
         */
        builder?: React.ComponentType<EntityCustomViewParams<M>>;
        Builder?: React.ComponentType<EntityCustomViewParams<M>>;
    }

/**
 * Parameters passed to the builder in charge of rendering a custom panel for
 * an entity view.
 * @category Models
 */
export interface EntityCustomViewParams<M extends Record<string, any> = any> {

    /**
     * collection used by this entity
     */
    collection: EntityCollection<M>;

    /**
     * Entity that this view refers to. It can be undefined if the entity is new
     */
    entity?: Entity<M>;

    /**
     * Modified values in the form that have not been saved yet.
     * If the entity is not new and the values are not modified, these values
     * are the same as in `entity`
     */
    modifiedValues?: EntityValues<M>;
}

export type InferCollectionType<S extends EntityCollection> = S extends EntityCollection<infer M> ? M : never;
