import React, { PropsWithChildren } from "react";

import { FireCMSContext } from "./firecms_context";
import { CollectionActionsProps, EntityCollection } from "./collections";
import { User } from "./user";
import { FieldProps, FormContext } from "./fields";
import { CMSType, Property } from "./properties";
import { EntityStatus } from "./entities";
import { ResolvedProperty } from "./resolved_entities";
import { CMSView } from "./navigation";

/**
 * Interface used to define plugins for FireCMS.
 * NOTE: This is a work in progress and the API is not stable yet.
 * @group Core
 */
export type FireCMSPlugin<PROPS = any, FORM_PROPS = any, EC extends EntityCollection = EntityCollection, COL_ACTIONS_PROPS = any> = {

    /**
     * Name of the plugin
     */
    name: string;

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

    }

    collectionView?: {

        /**
         * Use this component to add custom actions to the entity collections
         * toolbar.
         */
        CollectionActions?: React.ComponentType<CollectionActionsProps<any, any, EC> & COL_ACTIONS_PROPS> | React.ComponentType<CollectionActionsProps<any, any, EC> & COL_ACTIONS_PROPS>[];

        collectionActionsProps?: COL_ACTIONS_PROPS;

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
        }>;

        /**
         * If you add this callback to your plugin, an add button will be added to the collection table.
         * TODO: Only the first plugin that defines this callback will be used, at the moment.
         */
        AddColumnComponent?: React.ComponentType<{
            fullPath: string,
            parentCollectionIds: string[],
            collection: EC;
        }>;
    }

    form?: {
        provider?: {
            Component: React.ComponentType<PropsWithChildren<FORM_PROPS & PluginFormActionProps<any, EC>>>;
            props?: FORM_PROPS;
        }

        Actions?: React.ComponentType<PluginFormActionProps<any, EC>>;

        fieldBuilder?: <T extends CMSType = CMSType>(props: PluginFieldBuilderParams<T, any, EC>) => React.ComponentType<FieldProps<T>> | null;

        fieldBuilderEnabled?: <T extends CMSType = CMSType>(props: PluginFieldBuilderParams<T>) => boolean;
    }

}

/**
 * Props passed to the {@link FireCMSPlugin.homePage.CollectionActions} method.
 * You can use it to add custom actions to the navigation card of each collection.
 *
 * @group Models
 */
export interface PluginHomePageActionsProps<EP extends object = object, M extends Record<string, any> = any, UserType extends User = User, EC extends EntityCollection<M> = EntityCollection<M>> {
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
    context: FireCMSContext<UserType>;

    extraProps?: EP;

}

export interface PluginFormActionProps<UserType extends User = User, EC extends EntityCollection = EntityCollection> {
    entityId?: string;
    path: string;
    status: EntityStatus;
    collection: EC;
    formContext?: FormContext<any>;
    context: FireCMSContext<UserType>;
    currentEntityId?: string;
}

export type PluginFieldBuilderParams<T extends CMSType = CMSType, M extends Record<string, any> = any, EC extends EntityCollection<M> = EntityCollection<M>> = {
    fieldConfigId: string;
    propertyKey: string;
    property: Property<T> | ResolvedProperty<T>;
    Field: React.ComponentType<FieldProps<T, any, M>>;
    plugin: FireCMSPlugin;
    path: string;
    collection: EC;
};

export interface PluginGenericProps<UserType extends User = User> {
    context: FireCMSContext<UserType>;
}

export interface PluginHomePageAdditionalCardsProps<UserType extends User = User> {
    group?: string;
    context: FireCMSContext<UserType>;
}
