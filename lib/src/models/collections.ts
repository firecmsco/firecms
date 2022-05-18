import React from "react";
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
export interface EntityCollection<M extends { [Key: string]: any } = any,
    AdditionalKey extends string = string,
    UserType extends User = User> {

    /**
     * Singular name of the entity as displayed in an Add button . E.g. Product
     */
    name: string;

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
    icon?:string;

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
     * one you define in `properties`
     */
    propertiesOrder?: (keyof M)[];

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
     * Note that defining permissions at the collection level will override any
     * configuration defined by {@link FireCMSProps#roles}
     */
    permissions?: Permissions | PermissionsBuilder<M, UserType>;

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
    extraActions?: (extraActionsParams: ExtraActionsParams<M, UserType>) => React.ReactNode;

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
     * Initial filters applied to the collection this collection is related to.
     * Defaults to none.
     */
    initialFilter?: FilterValues<Extract<keyof M, string>>; // setting FilterValues<M> can break defining collections by code

    /**
     * Default sort applied to this collection
     */
    initialSort?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * Array of builders for rendering additional panels in an entity view.
     * Useful if you need to render custom views
     */
    views?: EntityCustomView<M>[];

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     */
    additionalColumns?: AdditionalColumnDelegate<M, AdditionalKey, UserType>[];

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

}

/**
 * Parameter passed to the `extraActions` builder in the collection configuration
 *
 * @category Models
 */
export interface ExtraActionsParams<M extends { [Key: string]: any } = any, UserType extends User = User> {
    /**
     * Collection path of this entity
     */
    path: string;

    /**
     * The collection configuration
     */
    collection: EntityCollection<M>;

    /**
     * Use this controller to get the selected entities and to update the
     * selected entities state
     */
    selectionController: SelectionController<M>;

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
export type SelectionController<M = any> = {
    selectedEntities: Entity<M>[];
    setSelectedEntities: (selectedEntities: Entity<M>[]) => void;
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
    | "array-contains-any";

/**
 * Used to define filters applied in collections
 * @category Models
 */
export type FilterValues<Key extends string> = Partial<Record<Key, [WhereFilterOp, any]>>;

/**
 * You can use this configuration to add additional columns to the data
 * exports
 * @category Models
 */
export interface ExportConfig<UserType extends User = User> {
    additionalColumns: ExportMappingFunction<UserType> []
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
 * Use this interface for adding additional columns to entity collection views.
 * If you need to do some async loading you can use AsyncPreviewComponent
 * @category Models
 */
export interface AdditionalColumnDelegate<M extends { [Key: string]: any } = any,
    AdditionalKey extends string = string,
    UserType extends User = User> {

    /**
     * Id of this column. You can use this id in the `properties` field of the
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

    hideFromCollection?: boolean;

    /**
     * Builder for the content of the cell for this column
     */
    builder: ({ entity, context }: {
        entity: Entity<M>,
        context: FireCMSContext<UserType>;
    }) => React.ReactNode;

    /**
     * If this column needs to update dynamically based on other properties,
     * you can define an array of keys as strings with the
     * `dependencies` prop.
     * e.g. ["name", "surname"]
     * If you don't specify this prop, the generated column will not rerender
     * on entity property updates.
     */
    dependencies?: Partial<Extract<keyof M, string>>[];
}

/**
 * You can use this builder to render a custom panel in the entity detail view.
 * It gets rendered as a tab.
 * @category Models
 */
export type EntityCustomView<M = any> =
    {
        path: string,
        name: string,
        builder: (extraActionsParams: EntityCustomViewParams<M>) => React.ReactNode
    }

/**
 * Parameters passed to the builder in charge of rendering a custom panel for
 * an entity view.
 * @category Models
 */
export interface EntityCustomViewParams<M extends { [Key: string]: any } = any> {

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
     * If the entity is not new and the values are not modified, this values
     * are the same as in `entity`
     */
    modifiedValues?: EntityValues<M>;
}
