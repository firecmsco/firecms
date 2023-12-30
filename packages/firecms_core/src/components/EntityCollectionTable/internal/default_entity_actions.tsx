import { EntityAction } from "../../../types";
import { DeleteEntityDialog } from "./DeleteEntityDialog";
import { ArchiveIcon, DeleteIcon, FileCopyIcon, KeyboardTabIcon } from "@firecms/ui";

export const editEntityAction: EntityAction = {
    icon: <KeyboardTabIcon/>,
    name: "Edit",
    collapsed: false,
    onClick({
                entity,
                collection,
                context,
                highlightEntity,
                unhighlightEntity
            }): Promise<void> {
        highlightEntity?.(entity);
        context.onAnalyticsEvent?.("entity_click", {
            path: entity.path,
            entityId: entity.id
        });
        context.sideEntityController.open({
            entityId: entity.id,
            path: entity.path,
            collection,
            updateUrl: true,
            onClose: () => unhighlightEntity?.(entity)
        });
        return Promise.resolve(undefined);
    }
}

export const copyEntityAction: EntityAction = {
    icon: <FileCopyIcon/>,
    name: "Copy",
    onClick({
                entity,
                collection,
                context,
                highlightEntity,
                unhighlightEntity
            }): Promise<void> {
        highlightEntity?.(entity);
        context.onAnalyticsEvent?.("copy_entity_click", {
            path: entity.path,
            entityId: entity.id
        });
        context.sideEntityController.open({
            entityId: entity.id,
            path: entity.path,
            copy: true,
            collection,
            updateUrl: true,
            onClose: () => unhighlightEntity?.(entity)
        });
        return Promise.resolve(undefined);
    }
}
export const archiveEntityAction: EntityAction = {
    icon: <ArchiveIcon/>,
    name: "Archive",
    onClick({
                entity,
                collection,
                context,
            }): Promise<void> {
        // Add your code here
        return Promise.resolve(undefined);
    }
}

export const deleteEntityAction: EntityAction = {
    icon: <DeleteIcon/>,
    name: "Delete",
    onClick({
                entity,
                fullPath,
                collection,
                context,
                selectionController,
                onCollectionChange,
                sideEntityController
            }): Promise<void> {
        const { closeDialog } = context.dialogsController.open({
            key: "delete_entity_dialog_" + entity.id,
            Component: ({ open }) => {
                if (!collection || !fullPath)
                    throw new Error("deleteEntityAction: Collection is undefined");
                return <DeleteEntityDialog
                    entityOrEntitiesToDelete={entity}
                    path={fullPath}
                    collection={collection}
                    callbacks={collection.callbacks}
                    open={open}
                    onEntityDelete={() => {
                        context.onAnalyticsEvent?.("single_entity_deleted", {
                            path: fullPath
                        });
                        selectionController?.setSelectedEntities(selectionController.selectedEntities.filter(e => e.id !== entity.id));
                        onCollectionChange?.();
                        sideEntityController?.close();
                    }}
                    onClose={closeDialog}/>;
            }
        })
        return Promise.resolve(undefined);
    }
}
