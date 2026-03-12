import { CollectionActionsProps, useAuthController, useNavigationController, useTranslation } from "@firecms/core";
import { IconButton, SettingsIcon, Tooltip, } from "@firecms/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorCollectionAction({
                                           path: fullPath,
                                           parentCollectionIds,
                                           collection,
                                           tableController
                                       }: CollectionActionsProps) {

    const authController = useAuthController();
    const navigationController = useNavigationController();
    const collectionEditorController = useCollectionEditorController();

    const parentCollection = navigationController.getCollectionFromIds(parentCollectionIds);
    const { t } = useTranslation();
    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    const editorButton = <Tooltip
        asChild={true}
        title={canEditCollection ? t("edit_collection") : t("no_permissions_edit_collection")}>
        <IconButton
            size={"small"}
            color={"primary"}
            disabled={!canEditCollection}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({
                    id: collection.id,
                    fullPath,
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
