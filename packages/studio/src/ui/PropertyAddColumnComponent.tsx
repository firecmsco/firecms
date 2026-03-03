import { EntityTableController, getDefaultPropertiesOrder, useAuthController } from "@firecms/core";
import { AddIcon, Tooltip } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function PropertyAddColumnComponent({
                                               path,
                                               parentCollectionIds,
                                               collection,
                                               tableController
                                           }: {
    path: string,
    parentCollectionIds: string[],
    collection: PersistedCollection;
    tableController: EntityTableController;
}) {

    const authController = useAuthController();
    const collectionEditorController = useCollectionEditorController();
    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    return (
        <Tooltip
            asChild={true}
            title={canEditCollection ? "Add new property" : "You don't have permission to add new properties"}>
            <div
                className={"p-0.5 w-20 h-full flex items-center justify-center cursor-pointer bg-surface-100/40 bg-surface-100/40 hover:bg-surface-100 dark:bg-surface-950 dark:bg-opacity-40 dark:bg-surface-950/40 dark:hover:bg-surface-950"}
                // className={onHover ? "bg-white dark:bg-surface-950" : undefined}
                onClick={() => {
                    collectionEditorController.editProperty({
                        editedCollectionId: collection.slug,
                        parentCollectionIds,
                        currentPropertiesOrder: getDefaultPropertiesOrder(collection),
                        collection,
                        existingEntities: tableController.data
                    });
                }}>
                <AddIcon color={"inherit"}/>
            </div>
        </Tooltip>
    )
}
