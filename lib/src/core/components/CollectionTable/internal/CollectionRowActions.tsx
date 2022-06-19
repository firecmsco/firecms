import { CollectionSize, Entity } from "../../../../models";

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
    Typography
} from "@mui/material";
import { Delete, FileCopy, KeyboardTab, MoreVert } from "@mui/icons-material";

/**
 *
 * @param entity
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
export function CollectionRowActions<M extends { [Key: string]: any }>({
                                                                           entity,
                                                                           width,
                                                                           frozen,
                                                                           isSelected,
                                                                           selectionEnabled,
                                                                           size,
                                                                           toggleEntitySelection,
                                                                           onCopyClicked,
                                                                           onEditClicked,
                                                                           onDeleteClicked
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
                                                                           }) {

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

    const onCheckboxChange = (event: React.ChangeEvent) => {
        if (toggleEntitySelection)
            toggleEntitySelection(entity);
        event.stopPropagation();
    };

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

    return (
        <Box
            style={{
                width
            }}
            sx={theme => ({
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                background: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.8) : alpha(theme.palette.background.default, 0.8),
                position: frozen ? "sticky" : "initial",
                left: frozen ? 0 : "initial",
                backdropFilter: frozen ? "blur(4px)" : undefined,
                zIndex: 1
        })}>

            {(editEnabled || deleteEnabled || selectionEnabled) &&
            <Box sx={{
                minWidth: 138,
                display: "flex",
                justifyContent: "center"
            }}
            >
                {editEnabled &&
                <Tooltip title={`Edit ${entity.id}`}>
                    <IconButton
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            if (onEditClicked)
                                onEditClicked(entity);
                        }}
                        size="large">
                        <KeyboardTab/>
                    </IconButton>
                </Tooltip>
                }

                {selectionEnabled &&
                <Tooltip title={`Select ${entity.id}`}>
                    <Checkbox
                        checked={isSelected}
                        onChange={onCheckboxChange}
                    />
                </Tooltip>}

                {(copyEnabled || deleteEnabled) &&
                <IconButton onClick={openMenu} size="large">
                    <MoreVert/>
                </IconButton>
                }

                {(copyEnabled || deleteEnabled) && <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    elevation={1}
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

            {size !== "xs" && (
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
