import React, { MouseEvent, useCallback } from "react";

import { CollectionSize, Entity, EntityAction, EntityCollection, SelectionController } from "../../types";
import { Checkbox, cls, IconButton, Menu, MenuItem, MoreVertIcon, Skeleton, Tooltip } from "@firecms/ui";
import { useFireCMSContext, useLargeLayout } from "../../hooks";

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
                                                                              }:
                                                                                  {
                                                                                      entity: Entity<any>,
                                                                                      collection?: EntityCollection<any>,
                                                                                      fullPath?: string,
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
    return (
        <div
            className={cls(
                "h-full flex items-center justify-center flex-col bg-surface-50 dark:bg-surface-900 bg-opacity-90 dark:bg-opacity-90 z-10",
                frozen ? "sticky left-0" : ""
            )}
            style={{
                width,
                position: frozen ? "sticky" : "initial",
                left: frozen ? 0 : "initial",
                contain: "strict"
            }}>

            {(hasActions || selectionEnabled) &&
                <div className="w-34 flex justify-center">

                    {uncollapsedActions.map((action, index) => (
                        <Tooltip key={index}
                                 title={action.name}
                                 asChild={true}>
                            <IconButton
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation();
                                    action.onClick({
                                        entity,
                                        fullPath,
                                        collection,
                                        context,
                                        selectionController,
                                        highlightEntity,
                                        unhighlightEntity,
                                        onCollectionChange,
                                    });
                                }}
                                size={largeLayout ? "medium" : "small"}>
                                {action.icon}
                            </IconButton>
                        </Tooltip>
                    ))}

                    {hasCollapsedActions &&
                        <Menu
                            trigger={<IconButton
                                size={largeLayout ? "medium" : "small"}>
                                <MoreVertIcon/>
                            </IconButton>}>
                            {collapsedActions.map((action, index) => (
                                <MenuItem
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick({
                                            entity,
                                            fullPath,
                                            collection,
                                            context,
                                            selectionController,
                                            highlightEntity,
                                            unhighlightEntity,
                                            onCollectionChange,
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
                                size={largeLayout ? "medium" : "small"}
                                checked={Boolean(isSelected)}
                                onCheckedChange={onCheckedChange}
                            />
                        </Tooltip>}

                </div>}

            {!hideId && size !== "xs" && (
                <div
                    className="w-[138px] text-center overflow-hidden truncate font-mono text-xs text-text-secondary dark:text-text-secondary-dark max-w-full text-ellipsis px-2"
                    onClick={(event) => {
                        event.stopPropagation();
                    }}>

                    {entity
                        ? entity.id
                        : <Skeleton/>
                    }
                </div>
            )}

        </div>
    );

};
