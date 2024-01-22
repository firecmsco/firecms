import equal from "react-fast-compare"

import {
    CollectionActionsProps,
    mergeDeep,
    useAuthController,
    useNavigationController,
    useSnackbarController
} from "@firecms/core";
import { Button, IconButton, SaveIcon, SettingsIcon, Tooltip, } from "@firecms/ui";

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
    const configController = useCollectionsConfigController();
    const snackbarController = useSnackbarController();

    const parentCollection = navigationController.getCollectionFromIds(parentCollectionIds);

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    let saveDefaultFilterButton = null;
    if (!equal(getObjectOrNull(tableController.filterValues), getObjectOrNull(collection.initialFilter)) ||
        !equal(getObjectOrNull(tableController.sortBy), getObjectOrNull(collection.initialSort))) {
        saveDefaultFilterButton = <>
            {collection.initialFilter || collection.initialSort && <Tooltip
                title={"Reset to default filter and sort"}>
                <Button
                    color={"primary"}
                    size={"small"}
                    variant={"text"}
                    onClick={() => {
                        tableController.clearFilter?.();
                        if (collection?.initialFilter)
                            tableController.setFilterValues?.(collection?.initialFilter);
                        if (collection?.initialSort)
                            tableController.setSortBy?.(collection?.initialSort);
                    }}>
                    <SaveIcon/>
                </Button>
            </Tooltip>}

            <Tooltip
                title={tableController.sortBy || tableController.filterValues ? "Save default filter and sort" : "Clear default filter and sort"}>
                <Button
                    color={"primary"}
                    size={"small"}
                    variant={"outlined"}
                    onClick={() => configController
                        ?.saveCollection({
                            id: collection.path,
                            parentCollectionIds,
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
                </Button>
            </Tooltip>
        </>;
    }

    const editorButton = <Tooltip
        title={canEditCollection ? "Edit collection" : "You don't have permissions to edit this collection"}>
        <IconButton
            color={"primary"}
            disabled={!canEditCollection}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({ path: collection.path, fullPath, parentCollectionIds, parentCollection: parentCollection as PersistedCollection })
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
