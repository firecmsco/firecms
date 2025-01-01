import { DeleteIcon, EditIcon, FileCopyIcon } from "@firecms/ui";
import { EntityAction } from "../../types";
import { DeleteEntityDialog } from "../DeleteEntityDialog";
import { addRecentId } from "../EntityCollectionView/utils";
import { navigateToEntity } from "../../util";

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
                openEntityMode
            }): Promise<void> {

        highlightEntity?.(entity);

        context.analyticsController?.onAnalyticsEvent?.("entity_click", {
            path: entity.path,
            entityId: entity.id
        });

        if (collection) {
            addRecentId(collection.id, entity.id);
        }

        const path = collection?.collectionGroup ? entity.path : (fullPath ?? entity.path)
        navigateToEntity({
            openEntityMode,
            collection,
            entityId: entity.id,
            path,
            sideEntityController: context.sideEntityController,
            onClose: () => unhighlightEntity?.(entity),
            navigation: context.navigation
        });

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
                openEntityMode
            }): Promise<void> {
        highlightEntity?.(entity);
        context.analyticsController?.onAnalyticsEvent?.("copy_entity_click", {
            path: entity.path,
            entityId: entity.id
        });
        const path = collection?.collectionGroup ? entity.path : (fullPath ?? entity.path)
        navigateToEntity({
            openEntityMode,
            collection,
            entityId: entity.id,
            path,
            copy: true,
            sideEntityController: context.sideEntityController,
            onClose: () => unhighlightEntity?.(entity),
            navigation: context.navigation
        });

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
