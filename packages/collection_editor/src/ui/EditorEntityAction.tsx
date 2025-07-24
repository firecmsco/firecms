import { PluginFormActionProps, useAuthController, useNavigationController } from "@firecms/core";
import { IconButton, SettingsIcon, Tooltip, } from "@firecms/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorEntityAction({
                                       path: fullPath,
                                       parentCollectionIds,
                                       collection,
                                       formContext
                                   }: PluginFormActionProps) {

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

    const isDirty = formContext?.formex.dirty ?? false;

    const editorButton = <Tooltip
        asChild={true}
        title={canEditCollection ? (isDirty ? "You need to save the document before changing the schema" : "Edit schema for this form") : "You don't have permissions to edit this collection"}>
        <IconButton
            color={"primary"}
            disabled={!canEditCollection || isDirty}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({
                    id: collection.id,
                    fullPath,
                    parentCollectionIds,
                    parentCollection: parentCollection as PersistedCollection,
                })
                : undefined}>
            <SettingsIcon size={"small"}/>
        </IconButton>
    </Tooltip>;

    return <>
        {editorButton}
    </>

}
