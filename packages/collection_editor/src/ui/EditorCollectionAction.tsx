import { CollectionActionsProps, useAuthController, useNavigationController } from "@firecms/core";
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
    const navigationController = useNavigationController();
    const collectionEditorController = useCollectionEditorController();

    const parentCollection = navigationController.getCollectionFromIds(parentCollectionIds);

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    const editorButton = <Tooltip
        asChild={true}
        title={canEditCollection ? "Edit collection" : "You don't have permissions to edit this collection"}>
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
            <SettingsIcon size={"small"}/>
        </IconButton>
    </Tooltip>;

    return <>
        {editorButton}
    </>

}
