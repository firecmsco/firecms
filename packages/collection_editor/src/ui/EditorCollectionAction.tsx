import equal from "react-fast-compare"

import {
    CollectionActionsProps,
    mergeDeep,
    useAuthController,
    useNavigationController,
    useSnackbarController
} from "@firecms/core";
import { Button, IconButton, SaveIcon, SettingsIcon, Tooltip, UndoIcon, } from "@firecms/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { useCollectionsConfigController } from "../useCollectionsConfigController";
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

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    const editorButton = <Tooltip
        title={canEditCollection ? "Edit collection" : "You don't have permissions to edit this collection"}>
        <IconButton
            color={"primary"}
            disabled={!canEditCollection}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({ id: collection.id, fullPath, parentCollectionIds, parentCollection: parentCollection as PersistedCollection })
                : undefined}>
            <SettingsIcon/>
        </IconButton>
    </Tooltip>;

    return <>
        {editorButton}
    </>

}

function getObjectOrNull(o?: object): object | null {
    if (o && Object.keys(o).length === 0)
        return o
    return o ?? null;
}
