import { deepEqual as equal } from "fast-equals"

import {
    useAuthController,
    useSnackbarController,
    useTranslation
} from "@rebasepro/core";
import { CollectionActionsProps } from "@rebasepro/types";
import { mergeDeep } from "@rebasepro/common";
import { Button, SaveIcon, Tooltip, UndoIcon, } from "@rebasepro/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { useCollectionsConfigController } from "../useCollectionsConfigController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorCollectionActionStart({
    path,
    parentCollectionIds,
    collection,
    tableController
}: CollectionActionsProps) {

    const authController = useAuthController();
    const collectionEditorController = useCollectionEditorController();
    const configController = useCollectionsConfigController();
    const snackbarController = useSnackbarController();
    const { t } = useTranslation();

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    let saveDefaultFilterButton = null;
    if (!equal(getObjectOrNull(tableController.filterValues), getObjectOrNull(collection.filter)) ||
        !equal(getObjectOrNull(tableController.sortBy), getObjectOrNull(collection.sort))) {
        saveDefaultFilterButton = <>
            <Tooltip
                asChild={true}
                title={tableController.sortBy || tableController.filterValues ? t("studio_editor_collection_start_save_filter") : t("studio_editor_collection_start_clear_filter")}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => configController
                        ?.saveCollection({
                            id: collection.slug,
                            parentCollectionIds,
                            collectionData: mergeDeep(collection as PersistedCollection,
                                {
                                    filter: tableController.filterValues ?? null,
                                    sort: tableController.sortBy ?? null
                                })
                        }).then(() => {
                            snackbarController.open({
                                type: "success",
                                message: t("studio_editor_collection_start_saved")
                            });
                        })}>
                    <SaveIcon />
                </Button>
            </Tooltip>

            {(collection.filter || collection.sort) && <Tooltip
                title={t("studio_editor_collection_start_reset_filter")}>
                <Button
                    size={"small"}
                    variant={"text"}
                    onClick={() => {
                        tableController.clearFilter?.();
                        if (collection?.filter)
                            tableController.setFilterValues?.(collection?.filter);
                        if (collection?.sort)
                            tableController.setSortBy?.(collection?.sort);
                    }}>
                    <UndoIcon />
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
