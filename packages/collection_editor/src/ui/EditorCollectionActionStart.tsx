import equal from "react-fast-compare"

import { CollectionActionsProps, mergeDeep, useAuthController, useSnackbarController } from "@firecms/core";
import { Button, SaveIcon, Tooltip, UndoIcon, } from "@firecms/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { useCollectionsConfigController } from "../useCollectionsConfigController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorCollectionActionStart({
                                           path: fullPath,
                                           parentCollectionIds,
                                           collection,
                                           tableController
                                       }: CollectionActionsProps) {

    const authController = useAuthController();
    const collectionEditorController = useCollectionEditorController();
    const configController = useCollectionsConfigController();
    const snackbarController = useSnackbarController();

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
            <Tooltip
                asChild={true}
                title={tableController.sortBy || tableController.filterValues ? "Save default filter and sort" : "Clear default filter and sort"}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => configController
                        ?.saveCollection({
                            id: collection.id,
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

            {(collection.initialFilter || collection.initialSort) && <Tooltip
                title={"Reset to default filter and sort"}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => {
                        tableController.clearFilter?.();
                        if (collection?.initialFilter)
                            tableController.setFilterValues?.(collection?.initialFilter);
                        if (collection?.initialSort)
                            tableController.setSortBy?.(collection?.initialSort);
                    }}>
                    <UndoIcon/>
                </Button>
            </Tooltip>}
        </>;
    }

    return <>
        {canEditCollection && saveDefaultFilterButton}
    </>

}

function getObjectOrNull(o?: object): object | null {
    if (o && Object.keys(o).length === 0)
        return o
    return o ?? null;
}
