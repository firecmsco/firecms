import { AddIcon, getDefaultPropertiesOrder, Tooltip, useAuthController } from "@firecms/core";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function PropertyAddColumnComponent({
                                               fullPath,
                                               parentCollectionIds,
                                               collection
                                           }: {
    fullPath: string,
    parentCollectionIds: string[],
    collection: PersistedCollection;
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
        <Tooltip title={canEditCollection ? "Add new property" : "You don't have permission to add new properties"}>
            <div
                className={"p-0.5 w-20 h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-950"}
                // className={onHover ? "bg-white dark:bg-gray-950" : undefined}
                onClick={() => {
                    collectionEditorController.editProperty({
                        editedCollectionPath: fullPath,
                        parentCollectionIds,
                        currentPropertiesOrder: getDefaultPropertiesOrder(collection),
                        collection
                    });
                }}>
                <AddIcon color={"inherit"}/>
            </div>
        </Tooltip>
    )
}
