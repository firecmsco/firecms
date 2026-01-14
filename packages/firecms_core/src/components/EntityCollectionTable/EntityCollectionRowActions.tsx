import React, { MouseEvent, useCallback } from "react";

import { CollectionSize, Entity, EntityAction, EntityCollection, SelectionController } from "../../types";
import { Badge, Checkbox, cls, IconButton, Menu, MenuItem, MoreVertIcon, Skeleton, Tooltip } from "@firecms/ui";
import { useFireCMSContext, useLargeLayout } from "../../hooks";
import { getEntityFromCache } from "../../util/entity_cache";
import { getLocalChangesBackup } from "../../util";

/**
 *
 * @param entity
 * @param width
 * @param frozen
 * @param isSelected
 * @param selectionEnabled
 * @param size
 * @param toggleEntitySelection
 * @param hideId
 *
 * @group Collection components
 */
export const EntityCollectionRowActions = function EntityCollectionRowActions({
                                                                                  entity,
                                                                                  collection,
                                                                                  fullPath,
                                                                                  fullIdPath,
                                                                                  width,
                                                                                  frozen,
                                                                                  isSelected,
                                                                                  selectionEnabled,
                                                                                  size,
                                                                                  highlightEntity,
                                                                                  onCollectionChange,
                                                                                  unhighlightEntity,
                                                                                  actions = [],
                                                                                  hideId,
                                                                                  selectionController,
                                                                                  openEntityMode
                                                                              }:
                                                                              {
                                                                                  entity: Entity<any>,
                                                                                  collection?: EntityCollection<any>,
                                                                                  fullPath?: string,
                                                                                  fullIdPath?: string,
                                                                                  width: number,
                                                                                  frozen?: boolean,
                                                                                  size: CollectionSize,
                                                                                  isSelected?: boolean,
                                                                                  selectionEnabled?: boolean,
                                                                                  actions?: EntityAction[],
                                                                                  hideId?: boolean,
                                                                                  onCollectionChange?: () => void,
                                                                                  selectionController?: SelectionController;
                                                                                  highlightEntity?: (entity: Entity<any>) => void;
                                                                                  unhighlightEntity?: (entity: Entity<any>) => void;
                                                                                  openEntityMode: "side_panel" | "full_screen";
                                                                              }) {

    const largeLayout = useLargeLayout();

    const context = useFireCMSContext();

    const onCheckedChange = useCallback((checked: boolean) => {
        selectionController?.toggleEntitySelection(entity, checked);
    }, [entity, selectionController?.toggleEntitySelection]);

    const hasActions = actions.length > 0;
    const hasCollapsedActions = actions.some(a => a.collapsed || a.collapsed === undefined);

    const collapsedActions = actions.filter(a => a.collapsed || a.collapsed === undefined);
    const uncollapsedActions = actions.filter(a => a.collapsed === false);
    const enableLocalChangesBackup = collection ? getLocalChangesBackup(collection) : false;
    const hasDraft = enableLocalChangesBackup ? getEntityFromCache(fullPath + "/" + entity.id) : false;
    const iconSize = largeLayout && (size === "m" || size === "l" || size == "xl") ? "medium" : "small";
    return (
        <div
            className={cls(
                "h-full flex items-center justify-center flex-col bg-surface-50 dark:bg-surface-900 bg-opacity-90 bg-surface-50/90 dark:bg-opacity-90 dark:bg-surface-900/90 z-10",
                frozen ? "sticky left-0" : ""
            )}
            onClick={useCallback((event: any) => {
                event.stopPropagation();
            }, [])}
            style={{
                width,
                position: frozen ? "sticky" : "initial",
                left: frozen ? 0 : "initial",
                contain: "strict"
            }}>

            {(hasActions || selectionEnabled) &&
                <div className="w-34 flex justify-center">

                    {uncollapsedActions.map((action, index) => {
                        const isEditAction = action.key === "edit";
                        const tooltip = isEditAction && hasDraft ? "Local unsaved changes" : action.name;

                        let iconButton = <IconButton
                            onClick={(event: MouseEvent) => {
                                event.stopPropagation();
                                action.onClick({
                                    view: "collection",
                                    entity,
                                    fullPath,
                                    fullIdPath,
                                    collection,
                                    context,
                                    selectionController,
                                    highlightEntity,
                                    unhighlightEntity,
                                    onCollectionChange,
                                    openEntityMode: openEntityMode ?? collection?.openEntityMode
                                });
                            }}
                            size={iconSize}>
                            {action.icon}
                        </IconButton>;
                        if (isEditAction && hasDraft) {
                            iconButton = (
                                <Badge color={"warning"}>
                                    {iconButton}
                                </Badge>
                            );
                        }
                        return (
                            <Tooltip key={index}
                                     title={tooltip}
                                     asChild={true}>
                                {iconButton}
                            </Tooltip>
                        );
                    })}

                    {hasCollapsedActions &&
                        <Menu
                            trigger={<IconButton
                                size={iconSize}>
                                <MoreVertIcon/>
                            </IconButton>}>
                            {collapsedActions.map((action, index) => (
                                <MenuItem
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick({
                                            view: "collection",
                                            entity,
                                            fullPath,
                                            fullIdPath,
                                            collection,
                                            context,
                                            selectionController,
                                            highlightEntity,
                                            unhighlightEntity,
                                            onCollectionChange,
                                            openEntityMode: openEntityMode ?? collection?.openEntityMode
                                        });
                                    }}>
                                    {action.icon}
                                    {action.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    }

                    {selectionEnabled &&
                        <Tooltip title={`Select ${entity.id}`}>
                            <Checkbox
                                size={iconSize}
                                checked={Boolean(isSelected)}
                                onCheckedChange={onCheckedChange}
                            />
                        </Tooltip>}

                </div>}

            {!hideId && size !== "xs" && (
                <div
                    className="w-[138px] overflow-hidden truncate font-mono text-xs text-text-secondary dark:text-text-secondary-dark max-w-full text-ellipsis px-2 align-center justify-center flex items-center gap-1"
                    onClick={(event) => {
                        event.stopPropagation();
                    }}>
                    <span className="min-w-0 truncate text-center">
                        {entity
                            ? entity.id
                            : <Skeleton/>
                        }
                    </span>
                </div>
            )}

        </div>
    );

};
