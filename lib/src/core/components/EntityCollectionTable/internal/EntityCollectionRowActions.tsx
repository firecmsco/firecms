import { CollectionSize, Entity } from "../../../../types";

import React, { MouseEvent, useCallback } from "react";
import {
    alpha,
    Box,
    Checkbox,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Skeleton,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Delete, FileCopy, KeyboardTab, MoreVert } from "@mui/icons-material";

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
        <Box
            style={{
                width
            }}
            onClick={onClick}
            sx={theme => ({
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                position: frozen ? "sticky" : "initial",
                left: frozen ? 0 : "initial",
                background: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.96) : alpha(theme.palette.background.default, 0.96),
                // backdropFilter: frozen ? "blur(8px)" : undefined,
                contain: "strict",
                zIndex: 1
            })}>

            {(editEnabled || deleteEnabled || selectionEnabled) &&
                <Box sx={{
                    minWidth: 138,
                    display: "flex",
                    justifyContent: "center"
                }}>
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

                </Box>}

            {!hideId && size !== "xs" && (
                <Box sx={{
                    width: 138,
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                }}>

                    {entity
                        ? <Typography
                            className={"mono"}
                            variant={"caption"}
                            color={"textSecondary"}> {entity.id} </Typography>
                        : <Skeleton variant="text"/>
                    }
                </Box>
            )}

        </Box>
    );

}
