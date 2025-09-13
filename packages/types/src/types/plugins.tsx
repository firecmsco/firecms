import React, { PropsWithChildren } from "react";

import { CollectionActionsProps, EntityCollection, EntityTableController } from "./collections";
import { FieldProps, FormContext } from "./fields";
import { Property } from "./properties";
import { EntityStatus } from "./entities";
import { FireCMSContext } from "../firecms_context";
import { NavigationGroupMapping } from "../controllers";
import { User } from "../users";

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
            property: Property,
            propertyKey: string,
            path: string,
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
            path: string,
            parentCollectionIds: string[],
            collection: EC;
            tableController: EntityTableController;
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

        fieldBuilder?: <T>(props: PluginFieldBuilderParams<any, EC>) => React.ComponentType<FieldProps<any>> | null;

        fieldBuilderEnabled?: <T>(props: PluginFieldBuilderParams) => boolean;
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
    slug: string;

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
    entityId?: string | number;
    path: string;
    parentCollectionIds: string[];
    status: EntityStatus;
    collection: EC;
    disabled: boolean;
    formContext?: FormContext<any>;
    context: FireCMSContext<USER>;
    openEntityMode: "side_panel" | "full_screen";
}

export type PluginFieldBuilderParams<M extends Record<string, any> = any, EC extends EntityCollection<M> = EntityCollection<M>> = {
    fieldConfigId: string;
    propertyKey: string;
    property: Property;
    Field: React.ComponentType<FieldProps<any, any, M>>;
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
