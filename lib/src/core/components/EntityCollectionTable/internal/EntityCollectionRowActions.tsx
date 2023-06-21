import { CollectionSize, Entity } from "../../../../types";

import React, { MouseEvent, useCallback } from "react";
import {
    alpha,
    Checkbox,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Skeleton,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Delete, FileCopy, KeyboardTab, MoreVert } from "@mui/icons-material";
import Typography from "../../../../components/Typography";
import { IconButton } from "../../../../components";

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
                                                                                  isSelected?: boolean,
                                                                                  selectionEnabled?: boolean,
                                                                                  toggleEntitySelection?: (selectedEntity: Entity<M>) => void
                                                                                  onEditClicked?: (selectedEntity: Entity<M>) => void,
                                                                                  onCopyClicked?: (selectedEntity: Entity<M>) => void,
                                                                                  onDeleteClicked?: (selectedEntity: Entity<M>) => void,
                                                                                  hideId?: boolean
                                                                              }) {

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const editEnabled = Boolean(onEditClicked);
    const copyEnabled = Boolean(onCopyClicked);
    const deleteEnabled = Boolean(onDeleteClicked);

    const [anchorEl, setAnchorEl] = React.useState<any | null>(null);

    const openMenu = useCallback((event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
        event.stopPropagation();
    }, [setAnchorEl]);

    const closeMenu = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);

    const onCheckboxChange = useCallback((event: React.ChangeEvent) => {
        if (toggleEntitySelection)
            toggleEntitySelection(entity);
        event.preventDefault();
        event.stopPropagation();
    }, [entity, toggleEntitySelection]);

    const onDeleteClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        if (onDeleteClicked)
            onDeleteClicked(entity);
        setAnchorEl(null);
    }, [entity, onDeleteClicked, setAnchorEl]);

    const onCopyClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        if (onCopyClicked)
            onCopyClicked(entity);
        setAnchorEl(null);
    }, [entity, onCopyClicked, setAnchorEl]);

    const onClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        if (toggleEntitySelection)
            toggleEntitySelection(entity);
    }, [entity, toggleEntitySelection]);

    return (
        <div
            onClick={onClick}
            className={`h-full flex items-center justify-center flex-col ${frozen ? "sticky" : ""} ${frozen ? "left-0" : ""} bg-opacity-96 z-10`}
            style={{
                width,
                background: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.96) : alpha(theme.palette.background.default, 0.96),
                position: frozen ? "sticky" : "initial",
                left: frozen ? 0 : "initial",
                contain: "strict"
                // backdropFilter: frozen ? "blur(8px)" : undefined,
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
                                <KeyboardTab/>
                            </IconButton>
                        </Tooltip>
                    }

                    {selectionEnabled &&
                        <Tooltip title={`Select ${entity.id}`}>
                            <Checkbox
                                size={largeLayout ? "medium" : "small"}
                                checked={isSelected}
                                onChange={onCheckboxChange}
                            />
                        </Tooltip>}

                    {(copyEnabled || deleteEnabled) &&
                        <IconButton onClick={openMenu}
                                    size={largeLayout ? "medium" : "small"}>
                            <MoreVert/>
                        </IconButton>
                    }

                    {(copyEnabled || deleteEnabled) && <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeMenu}
                        elevation={3}
                    >
                        {deleteEnabled && <MenuItem onClick={onDeleteClick}>
                            <ListItemIcon>
                                <Delete/>
                            </ListItemIcon>
                            <ListItemText primary={"Delete"}/>
                        </MenuItem>}

                        {copyEnabled && <MenuItem onClick={onCopyClick}>
                            <ListItemIcon>
                                <FileCopy/>
                            </ListItemIcon>
                            <ListItemText primary="Copy"/>
                        </MenuItem>}

                    </Menu>}

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
