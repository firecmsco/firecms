import { FireCMSContext } from "./firecms_context";
import { CollectionActionsProps, EntityCollection } from "./collections";
import { User } from "./user";
import { PropsWithChildren } from "react";
import { FieldConfig, FieldConfigId } from "./field_config";
import { FieldProps } from "./fields";
import { CMSType } from "./properties";
import { EntityFormProps } from "../form";

/**
 * Interface used to define plugins for FireCMS.
 * NOTE: This is a work in progress and the API is not stable yet.
 * @category Core
 */
export type FireCMSPlugin<PROPS = any, FORM_PROPS = any> = {

    /**
     * Name of the plugin
     */
    name: string;

    /**
     * If this flag is set to true, no content will be shown in the CMS
     * until the plugin is fully loaded.
     */
    loading?: boolean;

    collections?: {

        /**
         * Use this method to inject collections to the CMS.
         * You receive the current collections as a parameter, and you can return
         * a new list of collections.
         * @see {@link joinCollectionLists}
         * @param collections
         */
        injectCollections?: (collections: EntityCollection[]) => EntityCollection[];

        /**
         * Use this component to add custom actions to the entity collections
         * toolbar.
         */
        CollectionActions?: React.ComponentType<CollectionActionsProps> | React.ComponentType<CollectionActionsProps>[];

    }

    form?: {
        provider?: {
            Component: React.ComponentType<PropsWithChildren<FORM_PROPS & { context: FireCMSContext }>>;
            props?: FORM_PROPS;
        }
        fieldBuilder?: <T extends CMSType = CMSType>(id: FieldConfigId, Field?: React.ComponentType<FieldProps<T>>) => React.ComponentType<FieldProps<T>> | null;
    }

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
        Component: React.ComponentType<PropsWithChildren<PROPS & EntityFormProps<any>>>;
        props?: PROPS;
    };

    homePage?: {
        /**
         * Use this component to add custom actions to the navigation card
         * in the home page.
         */
        CollectionActions?: React.ComponentType<HomePageActionsProps>;

        /**
         * Add additional cards to each collection group in the home page.
         */
        AdditionalCards?: React.ComponentType<HomePageAdditionalCardsProps> | React.ComponentType<HomePageAdditionalCardsProps>[];

        /**
         * Include a section in the home page with a custom component and title.
         * @param props
         */
        includeSection?: (props: GenericPluginProps) => {
            title: string;
            children: React.ReactNode;
        }
    }

}

/**
 * Props passed to the {@link FireCMSPlugin.homePage.CollectionActions} method.
 * You can use it to add custom actions to the navigation card of each collection.
 *
 * @category Models
 */
export interface HomePageActionsProps<M extends Record<string, any> = any, UserType extends User = User, EC extends EntityCollection<M> = EntityCollection<M>> {
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

}

export interface GenericPluginProps<UserType extends User = User> {
    context: FireCMSContext<UserType>;
}

export interface HomePageAdditionalCardsProps<UserType extends User = User> {
    group?: string;
    context: FireCMSContext<UserType>;
}
