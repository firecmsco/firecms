import { CollectionActionsProps, useAuthController, useCollectionRegistryController } from "@firecms/core";
import { IconButton, SettingsIcon, Tooltip, } from "@firecms/ui";

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

    const parentCollection = parentCollectionIds.length > 0 ? collectionRegistry.getCollection(parentCollectionIds[parentCollectionIds.length - 1]) : undefined;

    const canEditCollection = !collectionEditorController.configController?.readOnly && (collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true);

    const tooltipTitle = collectionEditorController.configController?.readOnly
        ? (collectionEditorController.configController.readOnlyReason || "Collection editing is disabled")
        : (canEditCollection ? "Edit collection" : "You don't have permissions to edit this collection");

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
