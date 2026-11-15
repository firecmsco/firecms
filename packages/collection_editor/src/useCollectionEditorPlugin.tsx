import React from "react";
import { FireCMSPlugin, useAuthController, useNavigationController, User, useTranslation } from "@firecms/core";
import { ConfigControllerProvider } from "./ConfigControllerProvider.js";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions.js";
import { EditorCollectionAction } from "./ui/EditorCollectionAction.js";
import { HomePageEditorCollectionAction } from "./ui/HomePageEditorCollectionAction.js";
import { PersistedCollection } from "./types/persisted_collection.js";
import { CollectionInference } from "./types/collection_inference.js";
import { CollectionsConfigController } from "./types/config_controller.js";
import { CollectionGenerationCallback } from "./api/generateCollectionApi.js";
import { CollectionViewHeaderAction } from "./ui/CollectionViewHeaderAction.js";
import { PropertyAddColumnComponent } from "./ui/PropertyAddColumnComponent.js";
import { NewCollectionButton } from "./ui/NewCollectionButton.js";
import { AddIcon, Button, Paper, Typography } from "@firecms/ui";
import { useCollectionEditorController } from "./useCollectionEditorController.js";
import { EditorCollectionActionStart } from "./ui/EditorCollectionActionStart.js";
import { NewCollectionCard } from "./ui/NewCollectionCard.js";
import { EditorEntityAction } from "./ui/EditorEntityAction.js";
import { KanbanSetupAction } from "./ui/KanbanSetupAction.js";
import { AddKanbanColumnAction } from "./ui/AddKanbanColumnAction.js";
import { collectionEditorTranslationsEn } from "./locales/en.js";

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
                getUser,
                getData,
                onAnalyticsEvent,
                pathSuggestions,
                generateCollection
            }
        },
        homePage: {
            additionalActions: <NewCollectionButton />,
            additionalChildrenStart: includeIntroView ? <IntroWidget /> : undefined,
            CollectionActions: HomePageEditorCollectionAction,
            AdditionalCards: NewCollectionCard,
            allowDragAndDrop: true,
            navigationEntries: collectionConfigController.navigationEntries,
            onNavigationEntriesUpdate: collectionConfigController.saveNavigationEntries,
        },
        collectionView: {
            CollectionActionsStart: EditorCollectionActionStart,
            CollectionActions: EditorCollectionAction,
            HeaderAction: CollectionViewHeaderAction,
            AddColumnComponent: PropertyAddColumnComponent,
            onColumnsReorder: collectionConfigController.updatePropertiesOrder,
            onKanbanColumnsReorder: collectionConfigController.updateKanbanColumnsOrder,
            KanbanSetupComponent: KanbanSetupAction,
            AddKanbanColumnComponent: AddKanbanColumnAction
        },
        form: {
            ActionsTop: EditorEntityAction,
        },
        i18n: {
        // Only English is bundled; the rest load when that language is selected.
        // Seven languages of strings in every plugin bundle is dead weight for
        // the six nobody is reading.
            en: collectionEditorTranslationsEn,
            es: () => import("./locales/es.js").then((m) => m.collectionEditorTranslationsEs),
            de: () => import("./locales/de.js").then((m) => m.collectionEditorTranslationsDe),
            fr: () => import("./locales/fr.js").then((m) => m.collectionEditorTranslationsFr),
            it: () => import("./locales/it.js").then((m) => m.collectionEditorTranslationsIt),
            hi: () => import("./locales/hi.js").then((m) => m.collectionEditorTranslationsHi),
            pt: () => import("./locales/pt.js").then((m) => m.collectionEditorTranslationsPt)
        }
    };
}

export function IntroWidget() {

    const navigation = useNavigationController();
    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const authController = useAuthController();
    const { t } = useTranslation();

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
            <Typography variant={"subtitle2"} className={"uppercase"}>{t("no_collections_found")}</Typography>
            <Typography>
                {t("start_building_collections")}
            </Typography>
            {canCreateCollections && <Button
                onClick={collectionEditorController && canCreateCollections
                    ? () => collectionEditorController.createCollection({
                        parentCollectionIds: [],
                        redirect: true,
                        sourceClick: "new_collection_card"
                    })
                    : undefined}>
                <AddIcon />{t("create_first_collection")}
            </Button>}
            <Typography color={"secondary"}>
                {t("define_collections_programmatically")}
            </Typography>
        </Paper>
    );
}
