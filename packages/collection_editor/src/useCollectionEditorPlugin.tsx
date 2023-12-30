import React, { useCallback } from "react";
import {
    EntityCollection,
    FireCMSPlugin,
    joinCollectionLists,
    makePropertiesEditable,
    ModifyCollectionProps,
    Properties,
    User
} from "@firecms/core";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { EditorCollectionAction } from "./ui/EditorCollectionAction";
import { HomePageEditorCollectionAction } from "./ui/HomePageEditorCollectionAction";
import { NewCollectionCard } from "./ui/NewCollectionCard";
import { PersistedCollection } from "./types/persisted_collection";
import { CollectionInference } from "./types/collection_inference";
import { CollectionsConfigController } from "./types/config_controller";
import { RootCollectionSuggestions } from "./ui/RootCollectionSuggestions";
import { CollectionViewHeaderAction } from "./ui/CollectionViewHeaderAction";
import { PropertyAddColumnComponent } from "./ui/PropertyAddColumnComponent";

export interface CollectionConfigControllerProps<EC extends PersistedCollection = PersistedCollection, UserType extends User = User> {

    /**
     * Firebase app where the configuration is saved.
     */
    collectionConfigController: CollectionsConfigController;

    modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void;

    /**
     * Define what actions can be performed on the configuration.
     */
    configPermissions?: CollectionEditorPermissionsBuilder<UserType, EC>;

    /**
     * The words you define here will not be allowed to be used as group
     * names when creating collections.
     * e.g. ["admin"]
     */
    reservedGroups: string[];

    extraView?: {
        View: React.ComponentType<{
            path: string
        }>,
        icon: React.ReactNode
    };

    pathSuggestions?: (path: string) => Promise<string[]>;

    collectionInference?: CollectionInference;

    getData?: (path: string) => Promise<object[]>;

    getUser: (uid: string) => UserType | null;

    onAnalyticsEvent?: (event: string, params?: object) => void;

}

/**
 * Use this hook to initialise the Collection Editor plugin.
 * This is likely the only hook you will need to use.
 * @param firebaseApp Firebase app where your project data lives.
 * @param configPermissions
 * @param reservedGroups
 * @param extraView
 * @param pathSuggestions
 * @param getUser
 * @param collectionInference
 */
export function useCollectionEditorPlugin<EC extends PersistedCollection = PersistedCollection, UserType extends User = User>
({
     collectionConfigController,
     modifyCollection,
     configPermissions,
     reservedGroups,
     extraView,
     pathSuggestions,
     getUser,
     collectionInference,
     getData,
     onAnalyticsEvent
 }: CollectionConfigControllerProps<EC, UserType>): FireCMSPlugin<any, any, PersistedCollection> {

    const injectCollections = useCallback(
        (collections: EntityCollection[]) => {
            const markAsEditable = (c: PersistedCollection) => {
                makePropertiesEditable(c.properties as Properties);
                c.subcollections?.forEach(markAsEditable);
            };
            const storedCollections = collectionConfigController.collections ?? [];
            storedCollections.forEach(markAsEditable);
            return joinCollectionLists(collections, storedCollections, [], modifyCollection);
        },
        [collectionConfigController.collections, modifyCollection]);

    return {
        name: "Collection Editor",
        loading: collectionConfigController.loading,
        collections: {
            injectCollections,
            CollectionActions: EditorCollectionAction
        },
        provider: {
            Component: ConfigControllerProvider,
            props: {
                collectionConfigController,
                configPermissions,
                collectionInference,
                reservedGroups,
                extraView,
                pathSuggestions,
                getUser,
                getData,
                onAnalyticsEvent
            }
        },
        homePage: {
            additionalChildrenEnd: <RootCollectionSuggestions/>,
            CollectionActions: HomePageEditorCollectionAction,
            AdditionalCards: NewCollectionCard,
        },
        collectionView: {
            HeaderAction: CollectionViewHeaderAction,
            AddColumnComponent: PropertyAddColumnComponent
        }
    };
}
