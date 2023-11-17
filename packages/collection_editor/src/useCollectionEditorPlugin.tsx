import React, { useCallback } from "react";
import {
    EntityCollection,
    FireCMSPlugin,
    makePropertiesEditable,
    makePropertiesNonEditable,
    User
} from "@firecms/core";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { EditorCollectionAction } from "./components/EditorCollectionAction";
import { HomePageEditorCollectionAction } from "./components/HomePageEditorCollectionAction";
import { NewCollectionCard } from "./components/NewCollectionCard";
import { PersistedCollection } from "./types/persisted_collection";
import { CollectionInference } from "./types/collection_inference";
import { CollectionsConfigController } from "./types/config_controller";
import { RootCollectionSuggestions } from "./components/RootCollectionSuggestions";
import { joinCollectionLists } from "./utils/join_collections";
import { CollectionViewHeaderAction } from "./components/CollectionViewHeaderAction";
import { PropertyAddColumnComponent } from "./components/PropertyAddColumnComponent";

export interface CollectionConfigControllerProps<EC extends PersistedCollection = PersistedCollection, UserType extends User = User> {

    /**
     * Firebase app where the configuration is saved.
     */
    collectionConfigController: CollectionsConfigController;

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
     configPermissions,
     reservedGroups,
     extraView,
     pathSuggestions,
     getUser,
     collectionInference,
     getData
 }: CollectionConfigControllerProps<EC, UserType>): FireCMSPlugin {

    const injectCollections = useCallback(
        (collections: EntityCollection[]) => {
            const markAsEditable = (c: PersistedCollection) => {
                makePropertiesEditable(c.properties);
                c.subcollections?.forEach(markAsEditable);
            };
            const editableCollections = collectionConfigController.collections ?? [];
            editableCollections.forEach(markAsEditable);
            return joinCollectionLists(editableCollections, collections);
        },
        [collectionConfigController.collections]);

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
                getData
            }
        },
        homePage: {
            additionalChildrenStart: <RootCollectionSuggestions/>,
            CollectionActions: HomePageEditorCollectionAction,
            AdditionalCards: NewCollectionCard,
        },
        collectionView: {
            HeaderAction: CollectionViewHeaderAction,
            AddColumnComponent: PropertyAddColumnComponent
        }
    };
}
