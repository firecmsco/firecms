// Note: entity action 'name' fields (Edit, Copy, Delete) are plain strings defined
// at module level. They cannot use hooks. Consumers who need to translate these
// should override the action name by creating their own EntityAction objects or
// by using the entityActions prop with custom names for their locale.
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
                pathSegments,
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
        // In a collection group `path` is the entity's own, so the entity's segments describe
        // it. Otherwise the caller's segments win, falling back to the ones the entity was
        // loaded with — both describe the same collection. Never derived from `path`.
        const resolvedPathSegments = collection?.collectionGroup
            ? entity.pathSegments
            : (pathSegments ?? entity.pathSegments);
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
            pathSegments: resolvedPathSegments,
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
                pathSegments,
                fullIdPath,
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
        // In a collection group `path` is the group's own root, which the entity's segments
        // (its real nested location) do not describe — so they are deliberately not reused,
        // and no substitute is invented.
        const resolvedPathSegments = collection?.collectionGroup
            ? undefined
            : (pathSegments ?? entity.pathSegments);
        // `fullIdPath` is the ESCAPED chain and is what becomes the URL; `fullPath` is the raw
        // datasource path, whose parent ids may contain "/". Using the latter here wrote a URL
        // that read back as a different entity. Mirrors editEntityAction.
        const newFullIdPath = collection?.collectionGroup ? collection.id : (fullIdPath ?? collection?.id);
        navigateToEntity({
            openEntityMode,
            collection,
            entityId: entity.id,
            path,
            pathSegments: resolvedPathSegments,
            fullIdPath: newFullIdPath,
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
