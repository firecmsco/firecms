import { DeleteIcon, EditIcon, FileCopyIcon } from "@firecms/ui";
import { EntityAction } from "../../types";
import { DeleteEntityDialog } from "../DeleteEntityDialog";
import { addRecentId } from "../EntityCollectionView/utils";

export const editEntityAction: EntityAction = {
    icon: <EditIcon/>,
    key: "edit",
    name: "Edit",
    collapsed: false,
    onClick({
                entity,
                collection,
                fullPath,
                context,
                highlightEntity,
                unhighlightEntity,
            }): Promise<void> {

        console.debug("Edit entity action", fullPath, entity?.id);

        highlightEntity?.(entity);
        context.analyticsController?.onAnalyticsEvent?.("entity_click", {
            path: entity.path,
            entityId: entity.id
        });

        if (collection?.openEntityMode === "side_panel") {

            if (collection) {
                addRecentId(collection.id, entity.id);
            }
            const path = collection?.collectionGroup ? entity.path : (fullPath ?? entity.path);
            context.sideEntityController.open({
                entityId: entity.id,
                path,
                collection,
                updateUrl: true,
                onClose: () => unhighlightEntity?.(entity),
            });

        } else {
            const path = collection?.collectionGroup ? entity.path : (fullPath ?? entity.path);
            context.navigation.navigate(context.navigation.buildUrlCollectionPath(`${path}/${entity.id}`));
        }

        return Promise.resolve(undefined);
    }
}

export const copyEntityAction: EntityAction = {
    icon: <FileCopyIcon/>,
    name: "Copy",
    key: "copy",
    onClick({
                entity,
                collection,
                context,
                fullPath,
                highlightEntity,
                unhighlightEntity,
            }): Promise<void> {
        highlightEntity?.(entity);
        context.analyticsController?.onAnalyticsEvent?.("copy_entity_click", {
            path: entity.path,
            entityId: entity.id
        });

        if (collection?.openEntityMode === "side_panel") {
            context.sideEntityController.open({
                entityId: entity.id,
                path: entity.path,
                copy: true,
                collection,
                updateUrl: true,
                onClose: () => unhighlightEntity?.(entity),
            });
        } else {
            const path = collection?.collectionGroup ? entity.path : (fullPath ?? entity.path);
            context.navigation.navigate(context.navigation.buildUrlCollectionPath(`${path}/${entity.id}#copy`));

        }
        return Promise.resolve(undefined);
    }
}

export const deleteEntityAction: EntityAction = {
    icon: <DeleteIcon/>,
    name: "Delete",
    key: "delete",
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
                        context.analyticsController?.onAnalyticsEvent?.("single_entity_deleted", {
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
