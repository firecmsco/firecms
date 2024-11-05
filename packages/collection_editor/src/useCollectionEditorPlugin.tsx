import React from "react";
import { FireCMSPlugin, useAuthController, useNavigationController, User } from "@firecms/core";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { EditorCollectionAction } from "./ui/EditorCollectionAction";
import { HomePageEditorCollectionAction } from "./ui/HomePageEditorCollectionAction";
import { PersistedCollection } from "./types/persisted_collection";
import { CollectionInference } from "./types/collection_inference";
import { CollectionsConfigController } from "./types/config_controller";
import { CollectionViewHeaderAction } from "./ui/CollectionViewHeaderAction";
import { PropertyAddColumnComponent } from "./ui/PropertyAddColumnComponent";
import { NewCollectionButton } from "./ui/NewCollectionButton";
import { AddIcon, Button, Paper, Typography } from "@firecms/ui";
import { useCollectionEditorController } from "./useCollectionEditorController";
import { EditorCollectionActionStart } from "./ui/EditorCollectionActionStart";
import { NewCollectionCard } from "./ui/NewCollectionCard";

export interface CollectionConfigControllerProps<EC extends PersistedCollection = PersistedCollection, USER extends User = User> {

    /**
     * Firebase app where the configuration is saved.
     */
    collectionConfigController: CollectionsConfigController;

    /**
     * Define what actions can be performed on the configuration.
     */
    configPermissions?: CollectionEditorPermissionsBuilder<USER, EC>;

    /**
     * The words you define here will not be allowed to be used as group
     * names when creating collections.
     * e.g. ["admin"]
     */
    reservedGroups?: string[];

    extraView?: {
        View: React.ComponentType<{
            path: string
        }>,
        icon: React.ReactNode
    };

    getPathSuggestions?: (path?: string) => Promise<string[]>;

    collectionInference?: CollectionInference;

    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;

    getUser?: (uid: string) => USER | null;

    onAnalyticsEvent?: (event: string, params?: object) => void;

    components?: {
        /**
         * Custom component to render the database field
         */
        DatabaseField?: React.ComponentType<{ databaseId?: string, onDatabaseIdUpdate: (databaseId:string) => void }>;
    };

}

/**
 * Use this hook to initialise the Collection Editor plugin.
 * This is likely the only hook you will need to use.
 * @param firebaseApp Firebase app where your project data lives.
 * @param configPermissions
 * @param reservedGroups
 * @param extraView
 * @param getData
 * @param getUser
 * @param collectionInference
 */
export function useCollectionEditorPlugin<EC extends PersistedCollection = PersistedCollection, USER extends User = User>
({
     collectionConfigController,
     configPermissions,
     reservedGroups,
     extraView,
     getPathSuggestions,
     getUser,
     collectionInference,
     getData,
     onAnalyticsEvent,
     components
 }: CollectionConfigControllerProps<EC, USER>): FireCMSPlugin<any, any, PersistedCollection> {

    return {
        key: "collection_editor",
        loading: collectionConfigController.loading,
        provider: {
            Component: ConfigControllerProvider,
            props: {
                collectionConfigController,
                configPermissions,
                collectionInference,
                reservedGroups,
                extraView,
                getPathSuggestions,
                getUser,
                getData,
                onAnalyticsEvent,
                components
            }
        },
        homePage: {
            additionalActions: <NewCollectionButton/>,
            additionalChildrenStart: <IntroWidget/>,
            // additionalChildrenEnd: <RootCollectionSuggestions introMode={introMode}/>,
            CollectionActions: HomePageEditorCollectionAction,
            AdditionalCards: NewCollectionCard,
        },
        collectionView: {
            CollectionActionsStart: EditorCollectionActionStart,
            CollectionActions: EditorCollectionAction,
            HeaderAction: CollectionViewHeaderAction,
            AddColumnComponent: PropertyAddColumnComponent
        }
    };
}

export function IntroWidget({}: {}) {

    const navigation = useNavigationController();
    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const authController = useAuthController();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
        }).createCollections
        : true;

    if (!navigation.initialised || (navigation.collections ?? []).length > 0) {
        return null;
    }

    return (
        <Paper
            className={"my-4 px-4 py-6 flex flex-col  bg-white dark:bg-surface-accent-800 gap-2"}>
            <Typography variant={"subtitle2"} className={"uppercase"}>No collections found</Typography>
            <Typography>
                Start building collections in FireCMS easily. Map them to your existing
                database data, import from files, or use our templates.
            </Typography>
            {canCreateCollections && <Button
                onClick={collectionEditorController && canCreateCollections
                    ? () => collectionEditorController.createCollection({
                        parentCollectionIds: [],
                        redirect: true,
                        sourceClick: "new_collection_card"
                    })
                    : undefined}>
                <AddIcon/>Create your first collection
            </Button>}
            <Typography color={"secondary"}>
                You can also define collections programmatically.
            </Typography>
        </Paper>
    );
}
