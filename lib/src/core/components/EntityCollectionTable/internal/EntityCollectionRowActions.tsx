import React, { MouseEvent, useCallback } from "react";
import clsx from "clsx";

import { CollectionSize, Entity } from "../../../../types";
import { Skeleton } from "@mui/material";
import { Typography } from "../../../../components/Typography";
import { IconButton } from "../../../../components";
import { useLargeLayout } from "../../../../hooks/useLargeLayout";
import { Checkbox } from "../../../../components/Checkbox";
import { Tooltip } from "../../../../components/Tooltip";
import { KeyboardTabIcon } from "../../../../icons/KeyboardTabIcon";
import { MoreVertIcon } from "../../../../icons/MoreVertIcon";
import { DeleteIcon } from "../../../../icons/DeleteIcon";
import { FileCopyIcon } from "../../../../icons/FileCopyIcon";
import { Menu, MenuItem } from "../../../../components/Menu";

/**
 *
 * @param entity
 * @param width
 * @param frozen
 * @param isSelected
 * @param selectionEnabled
 * @param size
 * @param toggleEntitySelection
 * @param onCopyClicked
 * @param onEditClicked
 * @param onDeleteClicked
 * @param hideId
 * @constructor
 *
 * @category Collection components
 */
export function EntityCollectionRowActions<M extends Record<string, any>>({
                                                                              entity,
                                                                              width,
                                                                              frozen,
                                                                              isSelected,
                                                                              selectionEnabled,
                                                                              size,
                                                                              toggleEntitySelection,
                                                                              onCopyClicked,
                                                                              onEditClicked,
                                                                              onDeleteClicked,
                                                                              hideId
                                                                          }:
                                                                              {
                                                                                  entity: Entity<M>,
                                                                                  width: number,
                                                                                  frozen?: boolean,
                                                                                  size: CollectionSize,
                                                                                  isSelected: boolean,
                                                                                  selectionEnabled?: boolean,
                                                                                  toggleEntitySelection?: (selectedEntity: Entity<M>) => void
                                                                                  onEditClicked?: (selectedEntity: Entity<M>) => void,
                                                                                  onCopyClicked?: (selectedEntity: Entity<M>) => void,
                                                                                  onDeleteClicked?: (selectedEntity: Entity<M>) => void,
                                                                                  hideId?: boolean
                                                                              }) {

    const largeLayout = useLargeLayout();

    const editEnabled = Boolean(onEditClicked);
    const copyEnabled = Boolean(onCopyClicked);
    const deleteEnabled = Boolean(onDeleteClicked);

    const onCheckedChange = useCallback((checked: boolean) => {
        if (toggleEntitySelection)
            toggleEntitySelection(entity);
    }, [entity, toggleEntitySelection]);

    const onDeleteClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        if (onDeleteClicked)
            onDeleteClicked(entity);
    }, [entity, onDeleteClicked]);

    const onCopyClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        if (onCopyClicked)
            onCopyClicked(entity);
    }, [entity, onCopyClicked]);

    const onClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        if (toggleEntitySelection)
            toggleEntitySelection(entity);
    }, [entity, toggleEntitySelection]);

    return (
        <div
            onClick={onClick}
            className={clsx(
                "h-full flex items-center justify-center flex-col bg-gray-50 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-10",
                frozen ? "sticky left-0" : "",
            )}
            style={{
                width,
                position: frozen ? "sticky" : "initial",
                left: frozen ? 0 : "initial",
                contain: "strict"
            }}>

            {(editEnabled || deleteEnabled || selectionEnabled) &&
                <div className="w-34 flex justify-center">
                    {editEnabled &&
                        <Tooltip title={`Edit ${entity.id}`}>
                            <IconButton
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation();
                                    if (onEditClicked)
                                        onEditClicked(entity);
                                }}
                                size={largeLayout ? "medium" : "small"}>
                                <KeyboardTabIcon/>
                            </IconButton>
                        </Tooltip>
                    }

                    {selectionEnabled &&
                        <Tooltip title={`Select ${entity.id}`}>
                            <Checkbox
                                size={largeLayout ? "medium" : "small"}
                                checked={isSelected}
                                onCheckedChange={onCheckedChange}
                            />
                        </Tooltip>}

                    {(copyEnabled || deleteEnabled) &&
                        <Menu trigger={<IconButton
                            size={largeLayout ? "medium" : "small"}>
                            <MoreVertIcon/>
                        </IconButton>}>
                            {deleteEnabled && <MenuItem onClick={onDeleteClick}>
                                <DeleteIcon/>
                                Delete
                            </MenuItem>}

                            {copyEnabled && <MenuItem onClick={onCopyClick}>
                                <FileCopyIcon/>
                                Copy
                            </MenuItem>}
                        </Menu>
                    }

                </div>}

            {!hideId && size !== "xs" && (
                <div className="w-[138px] text-center overflow-hidden truncate">

                    {entity
                        ? <Typography
                            className={"font-mono"}
                            variant={"caption"}
                            color={"secondary"}> {entity.id} </Typography>
                        : <Skeleton variant="text"/>
                    }
                </div>
            )}

        </div>
    );

}
