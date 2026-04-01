import { CollectionActionsProps, useAuthController, useCollectionRegistryController, useTranslation } from "@rebasepro/core";
import { IconButton, SettingsIcon, Tooltip, } from "@rebasepro/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorCollectionAction({
    path,
    parentCollectionIds,
    collection,
    tableController
}: CollectionActionsProps) {

    const authController = useAuthController();
    const collectionRegistry = useCollectionRegistryController();
    const collectionEditorController = useCollectionEditorController();
    const { t } = useTranslation();

    const parentCollection = parentCollectionIds.length > 0 ? collectionRegistry.getCollection(parentCollectionIds[parentCollectionIds.length - 1]) : undefined;

    const canEditCollection = !collectionEditorController.configController?.readOnly && (collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true);

    const tooltipTitle = collectionEditorController.configController?.readOnly
        ? (collectionEditorController.configController.readOnlyReason || t("studio_editor_collection_disabled"))
        : (canEditCollection ? t("studio_editor_collection_edit") : t("studio_editor_collection_no_permission"));

    const editorButton = <Tooltip
        asChild={true}
        title={tooltipTitle}>
        <IconButton
            size={"small"}
            color={"primary"}
            disabled={!canEditCollection}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({
                    id: collection.slug,
                    path,
                    parentCollectionIds,
                    parentCollection: parentCollection as PersistedCollection,
                    existingEntities: tableController?.data ?? []
                })
                : undefined}>
            <SettingsIcon size={"small"} />
        </IconButton>
    </Tooltip>;

    return <>
        {editorButton}
    </>

}
