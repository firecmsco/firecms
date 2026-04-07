import React from "react";
import { RebasePlugin, useAuthController, useCollectionRegistryController, useNavigationStateController, User } from "@rebasepro/core";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { EditorCollectionAction } from "./ui/EditorCollectionAction";
import { HomePageEditorCollectionAction } from "./ui/HomePageEditorCollectionAction";
import { PersistedCollection } from "./types/persisted_collection";
import { CollectionInference } from "./types/collection_inference";
import { CollectionsConfigController } from "./types/config_controller";
import { CollectionGenerationCallback } from "./api/generateCollectionApi";
import { CollectionViewHeaderAction } from "./ui/CollectionViewHeaderAction";
import { PropertyAddColumnComponent } from "./ui/PropertyAddColumnComponent";
import { NewCollectionButton } from "./ui/NewCollectionButton";
import { AddIcon, Button, Paper, Typography } from "@rebasepro/ui";
import { useCollectionEditorController } from "./useCollectionEditorController";
import { EditorCollectionActionStart } from "./ui/EditorCollectionActionStart";
import { NewCollectionCard } from "./ui/NewCollectionCard";
import { EditorEntityAction } from "./ui/EditorEntityAction";
import { KanbanSetupAction } from "./ui/KanbanSetupAction";
import { AddKanbanColumnAction } from "./ui/AddKanbanColumnAction";

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
        icon: React.ReactNode | any
    };

    collectionInference?: CollectionInference;

    pathSuggestions?: string[];

    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;

    getUser?: (uid: string) => USER | null;

    onAnalyticsEvent?: (event: string, params?: object) => void;

    includeIntroView?: boolean;

    /**
     * Callback function for generating/modifying collections.
     * The plugin is API-agnostic - the consumer provides the implementation.
     */
    generateCollection?: CollectionGenerationCallback;

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
        getUser,
        collectionInference,
        getData,
        onAnalyticsEvent,
        includeIntroView = true,
        pathSuggestions,
        generateCollection
    }: CollectionConfigControllerProps<EC, USER>): RebasePlugin {

    return React.useMemo(() => ({
        key: "collection_editor",
        loading: collectionConfigController.loading,
        providers: [
            {
                scope: "root" as const,
                Component: ConfigControllerProvider,
                props: {
                    collectionConfigController,
                    configPermissions,
                    collectionInference,
                    reservedGroups,
                    extraView,
                    getUser,
                    getData,
                    onAnalyticsEvent,
                    pathSuggestions,
                    generateCollection
                }
            }
        ],
        slots: [
            // Home page slots
            {
                slot: "home.actions",
                Component: NewCollectionButton,
                order: 50,
            },
            ...(includeIntroView ? [{
                slot: "home.children.start" as const,
                Component: IntroWidget,
                order: 50,
            }] : []),
            {
                slot: "home.collection.actions",
                Component: HomePageEditorCollectionAction,
                order: 50,
            },
            {
                slot: "home.cards",
                Component: NewCollectionCard,
                order: 50,
            },
            // Collection view slots
            {
                slot: "collection.actions.start",
                Component: EditorCollectionActionStart,
                order: 50,
            },
            {
                slot: "collection.actions",
                Component: EditorCollectionAction,
                order: 50,
            },
            {
                slot: "collection.header.action",
                Component: CollectionViewHeaderAction,
                order: 50,
            },
            {
                slot: "collection.add-column",
                Component: PropertyAddColumnComponent,
                order: 50,
            },
            // Kanban slots
            {
                slot: "kanban.setup",
                Component: KanbanSetupAction,
                order: 50,
            },
            {
                slot: "kanban.add-column",
                Component: AddKanbanColumnAction,
                order: 50,
            },
            // Form slots
            {
                slot: "form.actions.top",
                Component: EditorEntityAction,
                order: 50,
            },
        ],
        hooks: {
            onColumnsReorder: collectionConfigController.updatePropertiesOrder,
            onKanbanColumnsReorder: collectionConfigController.updateKanbanColumnsOrder,
            allowDragAndDrop: true,
            navigationEntries: collectionConfigController.navigationEntries,
            onNavigationEntriesUpdate: collectionConfigController.saveNavigationEntries,
        },
    }), [
        collectionConfigController.loading,
        collectionConfigController,
        configPermissions,
        collectionInference,
        reservedGroups,
        extraView,
        getUser,
        getData,
        onAnalyticsEvent,
        pathSuggestions,
        generateCollection,
        includeIntroView
    ]);
}

export function IntroWidget() {

    const navigationState = useNavigationStateController();
    const collectionRegistry = useCollectionRegistryController();

    if (!navigationState.topLevelNavigation)
        throw Error("Navigation not ready in RebaseHomePage");

    const authController = useAuthController();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
        }).createCollections
        : true;

    if (!collectionRegistry.initialised || (collectionRegistry.collections ?? []).length > 0) {
        return null;
    }

    return (
        <Paper
            className={"my-4 px-4 py-6 flex flex-col  bg-white dark:bg-surface-accent-800 gap-2"}>
            <Typography variant={"subtitle2"} className={"uppercase"}>No collections found</Typography>
            <Typography>
                Start building collections in Rebase easily. Map them to your existing
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
                <AddIcon />Create your first collection
            </Button>}
            <Typography color={"secondary"}>
                You can also define collections programmatically.
            </Typography>
        </Paper>
    );
}
