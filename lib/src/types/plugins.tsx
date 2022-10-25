import { FireCMSContext } from "./firecms_context";
import {
    CollectionActionsProps,
    EntityCollection,
    SelectionController
} from "./collections";
import { User } from "./user";

/**
 * Interface used to define plugins for FireCMS.
 * NOTE: This is a work in progress and the API is not stable yet.
 * @category Core
 */
export type FireCMSPlugin = {
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
     * Use this method to inject collections to the CMS.
     * You receive the current collections as a parameter, and you can return
     * a new list of collections.
     * @see {@link joinCollectionLists}
     * @param collections
     */
    injectCollections?: (collections: EntityCollection[]) => EntityCollection[];

    /**
     * You can use this method to add higher order components to the CMS.
     * The components will be added to the root of the CMS, so any component
     * rendered underneath by this plugin will have access to the context
     * provided by this HOC.
     * @param props
     */
    wrapContent?: (props: { children: React.ReactNode, context: FireCMSContext }) => React.ReactNode;

    /**
     * Use this component to add custom actions to the entity collections.
     */
    collectionActions?: React.ComponentType<CollectionActionsProps> | React.ComponentType<CollectionActionsProps>[];

    /**
     * Use this component to add custom actions to the navigation card
     * in the home page.
     */
    homePageCollectionActions?: React.ComponentType<HomePageActionsProps>;

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
export interface HomePageActionsProps<M extends Record<string, any> = any, UserType extends User = User> {
    /**
     * Collection path of this entity. This is the full path, like
     * `users/1234/addresses`
     */
    path: string;

    /**
     * The collection configuration
     */
    collection: EntityCollection<M>;

    /**
     * Context of the app status
     */
    context: FireCMSContext<UserType>;

}
