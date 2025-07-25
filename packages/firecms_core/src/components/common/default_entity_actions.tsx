import { DeleteIcon, EditIcon, FileCopyIcon } from "@firecms/ui";
import { EntityAction } from "../../types";
import { DeleteEntityDialog } from "../DeleteEntityDialog";
import { addRecentId } from "../EntityCollectionView/utils";
import { navigateToEntity, resolveDefaultSelectedView } from "../../util";

export const editEntityAction: EntityAction = {
    icon: <EditIcon size={"small"}/>,
    key: "edit",
    name: "Edit",
    collapsed: false,
    isEnabled: ({ entity }) => Boolean(entity),
    onClick({
                entity,
                collection,
                fullPath,
                fullIdPath,
                context,
                highlightEntity,
                unhighlightEntity,
                openEntityMode
            }): Promise<void> {

        if (!entity) {
            throw new Error("INTERNAL: editEntityAction: Entity is undefined");
        }

        highlightEntity?.(entity);

        context.analyticsController?.onAnalyticsEvent?.("entity_click", {
            path: entity.path,
            entityId: entity.id
        });

        if (collection) {
            addRecentId(collection.id, entity.id);
        }

        const path = collection?.collectionGroup ? entity.path : (fullPath ?? collection?.path ?? entity.path);
        const newFullIdPath = collection?.collectionGroup ? collection.id : (fullIdPath ?? collection?.id ?? entity.path);
        const defaultSelectedView = resolveDefaultSelectedView(
            collection ? collection.defaultSelectedView : undefined,
            {
                status: "existing",
                entityId: entity.id,
            }
        );
        navigateToEntity({
            openEntityMode,
            collection,
            entityId: entity.id,
            path,
            fullIdPath: newFullIdPath,
            sideEntityController: context.sideEntityController,
            onClose: () => unhighlightEntity?.(entity),
            navigation: context.navigation,
            selectedTab: defaultSelectedView
        });

        return Promise.resolve(undefined);
    }
}

export const copyEntityAction: EntityAction = {
    icon: <FileCopyIcon size={"small"}/>,
    name: "Copy",
    key: "copy",
    isEnabled: ({ entity }) => Boolean(entity),
    onClick({
                entity,
                collection,
                context,
                fullPath,
                highlightEntity,
                unhighlightEntity,
                openEntityMode
            }): Promise<void> {
        if (!entity) {
            throw new Error("INTERNAL: copyEntityAction: Entity is undefined");
        }
        highlightEntity?.(entity);
        context.analyticsController?.onAnalyticsEvent?.("copy_entity_click", {
            path: entity.path,
            entityId: entity.id
        });

        const path = collection?.collectionGroup ? collection.path : (fullPath ?? collection?.path ?? entity.path);
        const fullIdPath = collection?.collectionGroup ? collection.id : (fullPath ?? collection?.id ?? entity.path);
        navigateToEntity({
            openEntityMode,
            collection,
            entityId: entity.id,
            path,
            fullIdPath,
            copy: true,
            sideEntityController: context.sideEntityController,
            onClose: () => unhighlightEntity?.(entity),
            navigation: context.navigation
        });

        return Promise.resolve(undefined);
    }
}

export const deleteEntityAction: EntityAction = {
    icon: <DeleteIcon size={"small"}/>,
    name: "Delete",
    key: "delete",
    isEnabled: ({ entity }) => Boolean(entity),
    onClick({
                entity,
                fullPath,
                collection,
                context,
                selectionController,
                onCollectionChange,
                navigateBack
            }): Promise<void> {
        if (!entity) {
            throw new Error("INTERNAL: deleteEntityAction: Entity is undefined");
        }
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
                        navigateBack?.();
                    }}
                    onClose={closeDialog}/>;
            }
        })
        return Promise.resolve(undefined);
    }
}
