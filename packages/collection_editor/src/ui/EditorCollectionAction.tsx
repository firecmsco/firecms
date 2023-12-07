import equal from "react-fast-compare"

import {
    Button,
    CollectionActionsProps,
    IconButton,
    mergeDeep,
    SaveIcon,
    SettingsIcon,
    Tooltip,
    useAuthController,
    useNavigationContext,
    useSnackbarController
} from "@firecms/core";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { useCollectionsConfigController } from "../useCollectionsConfigController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorCollectionAction({
                                           path: fullPath,
                                           parentPathSegments,
                                           collection,
                                           tableController
                                       }: CollectionActionsProps) {

    const authController = useAuthController();
    const navigationController = useNavigationContext();
    const collectionEditorController = useCollectionEditorController();
    const configController = useCollectionsConfigController();
    const snackbarController = useSnackbarController();

    const parentCollection = navigationController.getCollectionFromPaths(parentPathSegments);

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    let saveDefaultFilterButton = null;
    if (!equal(getObjectOrNull(tableController.filterValues), getObjectOrNull(collection.initialFilter)) ||
        !equal(getObjectOrNull(tableController.sortBy), getObjectOrNull(collection.initialSort))) {
        saveDefaultFilterButton = <Tooltip
            title={tableController.sortBy || tableController.filterValues ? "Save default filter and sort" : "Clear default filter and sort"}>
            <Button
                color={"primary"}
                size={"small"}
                variant={"outlined"}
                onClick={() => configController
                    ?.saveCollection({
                        path: collection.path,
                        parentPathSegments,
                        collectionData: mergeDeep(collection as PersistedCollection,
                            {
                                initialFilter: tableController.filterValues ?? null,
                                initialSort: tableController.sortBy ?? null
                            })
                    }).then(() => {
                        snackbarController.open({
                            type: "success",
                            message: "Default config saved"
                        });
                    })}>
                <SaveIcon/>
                {/*{tableController.sortBy || tableController.filterValues ? "Save default filter and sort" : "Clear default filter and sort"}*/}
            </Button>
        </Tooltip>;
    }

    const editorButton = <Tooltip
        title={canEditCollection ? "Edit collection" : "You don't have permissions to edit this collection"}>
        <IconButton
            color={"primary"}
            disabled={!canEditCollection}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({ path: collection.path, fullPath, parentPathSegments, parentCollection: parentCollection as PersistedCollection })
                : undefined}>
            <SettingsIcon/>
        </IconButton>
    </Tooltip>;

    return <>
        {canEditCollection && saveDefaultFilterButton}
        {editorButton}
    </>

}

function getObjectOrNull(o?: object): object | null {
    if (o && Object.keys(o).length === 0)
        return o
    return o ?? null;
}
