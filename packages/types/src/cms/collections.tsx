import React from "react";
import { EntityCollection as CoreEntityCollection, Entity, EntityValues, FilterValues, AdditionalFieldDelegate as CoreAdditionalFieldDelegate, DefaultSelectedViewBuilder, SelectionController, EntityTableController, CollectionActionsProps, KanbanConfig, ViewMode, ExportConfig } from "../types";
import { User, RebaseContext } from "..";
import { FormContext } from "./fields";
import { Properties } from "./properties";
/**
 * You can use this builder to render a custom panel in the entity detail view.
 * It gets rendered as a tab.
 * @group Models
 */
export type EntityCustomView<M extends Record<string, any> = any> =
    {
        /**
         * Key of this custom view.
         */
        key: string;

        /**
         * Name of this custom view.
         */
        name: string;

        /**
         * Render this custom view in the tab of the entity view, instead of the name
         */
        tabComponent?: React.ReactNode;

        /**
         * If set to true, the actions of the entity (save, discard,delete) will be
         * included in the view. By default the actions are located in the right or bottom,
         * based on the screen size. You can force the actions to be located at the bottom
         * by setting this prop to "bottom".
         */
        includeActions?: boolean | "bottom";

        /**
         * Builder for rendering the custom view
         */
        Builder?: React.ComponentType<EntityCustomViewParams<M>>;

        /**
         * Position of this tab in the entity view. Defaults to `end`.
         */
        position?: "start" | "end";
    };

/**
 * Parameters passed to the builder in charge of rendering a custom panel for
 * an entity view.
 * @group Models
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

    /**
     * Use the form context to access the form state and methods
     */
    formContext: FormContext;

    /**
     * If this is a subcollection, this is the path of the parent collections
     */
    parentCollectionIds?: string[];
}

export interface AdditionalFieldDelegate<M extends Record<string, any> = any, USER extends User = User> extends CoreAdditionalFieldDelegate<M, USER> {
    Builder?: React.ComponentType<{ entity: Entity<M>, context: RebaseContext<USER> }>;
}

export type CMSEntityCollectionBase<M extends Record<string, any> = any, USER extends User = any> = Omit<CoreEntityCollection<M, USER>, 'icon' | 'subcollections' | 'properties'>;

export interface EntityCollection<M extends Record<string, any> = any, USER extends User = any> extends CMSEntityCollectionBase<M, USER> {
    properties: Properties<M>;
    icon?: string | React.ReactNode;
    group?: string;
    previewProperties?: string[];
    titleProperty?: Extract<keyof M, string>;
    openEntityMode?: "side_panel" | "full_screen";
    propertiesOrder?: (Extract<keyof M, string> | string | `subcollection:${string}`)[];
    pagination?: boolean | number;
    selectionEnabled?: boolean;
    subcollections?: () => EntityCollection<any>[];
    Actions?: React.ComponentType<CollectionActionsProps> | React.ComponentType<CollectionActionsProps>[];
    entityActions?: any[];
    selectionController?: SelectionController<M>;
    forceFilter?: FilterValues<Extract<keyof M, string>>;
    filter?: FilterValues<Extract<keyof M, string>>;
    sort?: [Extract<keyof M, string>, "asc" | "desc"];
    entityViews?: (string | EntityCustomView<M>)[];
    additionalFields?: AdditionalFieldDelegate<M, USER>[];
    defaultSize?: "xs" | "s" | "m" | "l" | "xl";
    inlineEditing?: boolean;
    hideFromNavigation?: boolean;
    defaultSelectedView?: string | DefaultSelectedViewBuilder;
    hideIdFromForm?: boolean;
    hideIdFromCollection?: boolean;
    formAutoSave?: boolean;
    exportable?: boolean | ExportConfig<USER>;
    ownerId?: string;
    overrides?: any;
    sideDialogWidth?: number | string;
    alwaysApplyDefaultValues?: boolean;
    includeJsonView?: boolean;
    history?: boolean;
    localChangesBackup?: "manual_apply" | "auto_apply" | false;
    defaultViewMode?: ViewMode;
    enabledViews?: ViewMode[];
    kanban?: KanbanConfig<M>;
    orderProperty?: Extract<keyof M, string>;
}
