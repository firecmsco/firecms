import React, { PropsWithChildren } from "react";

import { FireCMSContext } from "./firecms_context";
import { CollectionActionsProps, EntityCollection, EntityTableController } from "./collections";
import { User } from "./user";
import { FieldProps, FormContext } from "./fields";
import { CMSType, Property } from "./properties";
import { EntityStatus } from "./entities";
import { ResolvedProperty } from "./resolved_entities";
import { NavigationGroupMapping, CMSView } from "./navigation";
import { InternalUserManagement } from "./internal_user_management";

/**
 * Interface used to define plugins for FireCMS.
 * NOTE: This is a work in progress and the API is not stable yet.
 * @group Core
 */
export type FireCMSPlugin<PROPS = any, FORM_PROPS = any, EC extends EntityCollection = EntityCollection, COL_ACTIONS_PROPS = any, COL_ACTIONS_START__PROPS = any> = {

    /**
     * Key of the plugin. This is used to identify the plugin in the CMS.
     */
    key: string;

    /**
     * If this flag is set to true, no content will be shown in the CMS
     * until the plugin is fully loaded.
     */
    loading?: boolean;

    /**
     * You can use this prop to add higher order components to the CMS.
     * The components will be added to the root of the CMS, so any component
     * rendered underneath by this plugin will have access to the context
     * provided by this HOC.
     * Anyhow, this is rendered below the {@link FireCMSContext} provider, so
     * you can use the hooks provided by the CMS.
     * @param props
     */
    provider?: {
        Component: React.ComponentType<PropsWithChildren<PROPS & {
            context: FireCMSContext
        }>>;
        props?: PROPS;
    };

    userManagement?: InternalUserManagement

    /**
     * Views to be automatically added to the navigation.
     * These views will be merged with the views provided to useBuildNavigationController.
     */
    views?: CMSView[];

    homePage?: {

        /**
         * Additional actions to be rendered in the home page, close to the search bar.
         */
        additionalActions?: React.ReactNode;

        /**
         * Additional children to be rendered in the beginning of the home page.
         */
        additionalChildrenStart?: React.ReactNode;

        /**
         * Additional children to be rendered at the end of the home page.
         */
        additionalChildrenEnd?: React.ReactNode;

        /**
         * Use this component to add custom actions to the navigation card
         * in the home page.
         */
        CollectionActions?: React.ComponentType<PluginHomePageActionsProps>;

        /**
         * Additional props passed to `CollectionActions`
         */
        extraProps?: any;

        /**
         * Add additional cards to each collection group in the home page.
         */
        AdditionalCards?: React.ComponentType<PluginHomePageAdditionalCardsProps> | React.ComponentType<PluginHomePageAdditionalCardsProps>[];

        /**
         * Include a section in the home page with a custom component and title.
         * @param props
         */
        includeSection?: (props: PluginGenericProps) => {
            title: string;
            children: React.ReactNode;
        }

        /**
         * Allow reordering with drag and drop of the collections in the home page.
         */
        allowDragAndDrop?: boolean;

        navigationEntries?: NavigationGroupMapping[];

        /**
         * This method will be called when the entries are updated in the home page.
         * group => navigationEntriesOrder (path)
         * @param entries
         */
        onNavigationEntriesUpdate?: (entries: NavigationGroupMapping[]) => void;

    }

    collectionView?: {

        /**
         * Custom component to render when a collection loading error occurs.
         * If provided, this replaces the default error view in all collection view modes
         * (table, card, kanban).
         * Return `null` from the component to fall back to the default error view.
         */
        CollectionError?: React.ComponentType<{
            path: string;
            collection: EC;
            parentCollectionIds?: string[];
            error: Error;
        }>;

        /**
         * Use this component to add custom actions to the entity collections
         * toolbar.
         */
        CollectionActions?: React.ComponentType<CollectionActionsProps<any, any, EC> & COL_ACTIONS_PROPS> | React.ComponentType<CollectionActionsProps<any, any, EC> & COL_ACTIONS_PROPS>[];
        collectionActionsProps?: COL_ACTIONS_PROPS;

        CollectionActionsStart?: React.ComponentType<CollectionActionsProps<any, any, EC> & COL_ACTIONS_START__PROPS> | React.ComponentType<CollectionActionsProps<any, any, EC> & COL_ACTIONS_START__PROPS>[];
        collectionActionsStartProps?: COL_ACTIONS_START__PROPS;

        blockSearch?: (props: {
            context: FireCMSContext,
            path: string,
            collection: EC,
            parentCollectionIds?: string[]
        }) => boolean;

        showTextSearchBar?: (props: {
            context: FireCMSContext,
            path: string,
            collection: EC,
            parentCollectionIds?: string[]
        }) => boolean;

        onTextSearchClick?: (props: {
            context: FireCMSContext,
            path: string,
            collection: EC,
            parentCollectionIds?: string[]
        }) => Promise<boolean>;

        /**
         * Use this method to inject widgets to the entity collections header
         * @param props
         */
        HeaderAction?: React.ComponentType<{
            property: ResolvedProperty,
            propertyKey: string,
            fullPath: string,
            parentCollectionIds: string[],
            onHover: boolean,
            collection: EC;
            tableController: EntityTableController;
        }>;

        /**
         * If you add this callback to your plugin, an add button will be added to the collection table.
         * TODO: Only the first plugin that defines this callback will be used, at the moment.
         */
        AddColumnComponent?: React.ComponentType<{
            fullPath: string,
            parentCollectionIds: string[],
            collection: EC;
            tableController: EntityTableController;
        }>;

        /**
         * Callback called when columns are reordered via drag and drop.
         * Used by plugins to persist the new column order.
         */
        onColumnsReorder?: (props: {
            fullPath: string;
            parentCollectionIds: string[];
            collection: EC;
            newPropertiesOrder: string[];
        }) => void;

        /**
         * Callback called when Kanban board columns are reordered via drag and drop.
         * Used by plugins to persist the new Kanban column order.
         */
        onKanbanColumnsReorder?: (props: {
            fullPath: string;
            parentCollectionIds: string[];
            collection: EC;
            kanbanColumnProperty: string;
            newColumnsOrder: string[];
        }) => void;

        /**
         * Component to render when Kanban view is missing configuration.
         * Used to provide a CTA to open the collection editor to configure Kanban.
         */
        KanbanSetupComponent?: React.ComponentType<{
            collection: EC;
            fullPath: string;
            parentCollectionIds: string[];
        }>;

        /**
         * Component to render an "Add Column" button at the end of the Kanban board.
         * Used to allow adding new enum values to the column property.
         */
        AddKanbanColumnComponent?: React.ComponentType<{
            collection: EC;
            fullPath: string;
            parentCollectionIds: string[];
            columnProperty: string;
        }>;
    }

    form?: {
        provider?: {
            Component: React.ComponentType<PropsWithChildren<FORM_PROPS & PluginFormActionProps<any, EC>>>;
            props?: FORM_PROPS;
        }

        /**
         * Add custom actions to the default ones ("Save", "Discard"...)
         */
        Actions?: React.ComponentType<PluginFormActionProps<any, EC>>;

        /**
         * Add custom actions to the top of the form
         */
        ActionsTop?: React.ComponentType<PluginFormActionProps<any, EC>>;

        /**
         * Add custom content above the entity title in the form view
         */
        BeforeTitle?: React.ComponentType<PluginFormActionProps<any, EC>>;

        fieldBuilder?: <T extends CMSType = CMSType>(props: PluginFieldBuilderParams<T, any, EC>) => React.ComponentType<FieldProps<T>> | null;

        fieldBuilderEnabled?: <T extends CMSType = CMSType>(props: PluginFieldBuilderParams<T>) => boolean;
    }

    collection?: {

        /**
         * Use this method to modify a single collection before it is rendered.
         * @param collection
         */
        modifyCollection?: (collection: EntityCollection) => EntityCollection;

        /**
         * Use this method to modify, add or remove collections.
         * @param collections
         */
        injectCollections?: (collections: EntityCollection[]) => EntityCollection[];

    }

}

/**
 * Props passed to the {@link FireCMSPlugin.homePage.CollectionActions} method.
 * You can use it to add custom actions to the navigation card of each collection.
 *
 * @group Models
 */
export interface PluginHomePageActionsProps<EP extends object = object, M extends Record<string, any> = any, USER extends User = User, EC extends EntityCollection<M> = EntityCollection<M>> {
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
     * Context of the app status
     */
    context: FireCMSContext<USER>;

    extraProps?: EP;

}

export interface PluginFormActionProps<USER extends User = User, EC extends EntityCollection = EntityCollection> {
    entityId?: string;
    path: string;
    parentCollectionIds: string[];
    status: EntityStatus;
    collection: EC;
    disabled: boolean;
    formContext?: FormContext<any>;
    context: FireCMSContext<USER>;
    openEntityMode: "side_panel" | "full_screen";
}

export type PluginFieldBuilderParams<T extends CMSType = CMSType, M extends Record<string, any> = any, EC extends EntityCollection<M> = EntityCollection<M>> = {
    fieldConfigId: string;
    propertyKey: string;
    property: Property<T> | ResolvedProperty<T>;
    Field: React.ComponentType<FieldProps<T, any, M>>;
    plugin: FireCMSPlugin;
    path?: string;
    collection?: EC;
};

export interface PluginGenericProps<USER extends User = User> {
    context: FireCMSContext<USER>;
}

export interface PluginHomePageAdditionalCardsProps<USER extends User = User> {
    group?: string;
    context: FireCMSContext<USER>;
}
