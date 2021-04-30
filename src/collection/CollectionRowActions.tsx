import { CollectionSize, Entity, EntitySchema } from "../models";
import { useTableStyles } from "./styles";

import React, { MouseEvent } from "react";
import "react-base-table/styles.css";
import {
    Checkbox,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography
} from "@material-ui/core";
import { Delete, FileCopy, KeyboardTab, MoreVert } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";

export function CollectionRowActions<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>({
                                                                     entity,
                                                                     isSelected,
                                                                     selectionEnabled,
                                                                     size,
                                                                     toggleEntitySelection,
                                                                     onCopyClicked,
                                                                     onEditClicked,
                                                                     onDeleteClicked
                                                                 }:
                                                                     {
                                                                         entity: Entity<S, Key>,
                                                                         size: CollectionSize,
                                                                         isSelected?: boolean,
                                                                         selectionEnabled?: boolean,
                                                                         toggleEntitySelection?: (entity: Entity<S, Key>) => void
                                                                         onEditClicked?: (entity: Entity<S, Key>) => void,
                                                                         onCopyClicked?: (entity: Entity<S, Key>) => void,
                                                                         onDeleteClicked?: (entity: Entity<S, Key>) => void,
                                                                     }) {

    const editEnabled = Boolean(onEditClicked);
    const deleteEnabled = Boolean(onDeleteClicked);

    const classes = useTableStyles({ size });

    const [anchorEl, setAnchorEl] = React.useState<any | null>(null);

    const openMenu = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
        event.stopPropagation();
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const onCheckboxChange = (event: React.ChangeEvent) => {
        if (toggleEntitySelection)
            toggleEntitySelection(entity);
        event.stopPropagation();
    };

    const onDeleteClick = (event: MouseEvent) => {
        event.stopPropagation();
        if (onDeleteClicked)
            onDeleteClicked(entity);
        setAnchorEl(null);
    };

    const onCopyClick = (event: MouseEvent) => {
        event.stopPropagation();
        if (onCopyClicked)
            onCopyClicked(entity);
        setAnchorEl(null);
    };

    const onContainerClick = selectionEnabled ?
        (event: MouseEvent) => {
            if (toggleEntitySelection)
                toggleEntitySelection(entity);
            event.stopPropagation();
        } : undefined;

    return (
        <div onClick={onContainerClick}
             className={classes.cellButtonsWrap}>

            {(editEnabled || deleteEnabled || selectionEnabled) &&
            <div className={classes.cellButtons}
            >
                {editEnabled &&
                <Tooltip title={"Edit"}>
                    <IconButton
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            if (onEditClicked)
                                onEditClicked(entity);
                        }}
                    >
                        <KeyboardTab/>
                    </IconButton>
                </Tooltip>
                }

                {selectionEnabled &&
                <Tooltip title={"Select"}>
                    <Checkbox
                        checked={isSelected}
                        onChange={onCheckboxChange}
                    />
                </Tooltip>}

                {editEnabled &&
                <IconButton
                    onClick={openMenu}
                >
                    <MoreVert/>
                </IconButton>
                }

                {editEnabled || deleteEnabled && <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    elevation={2}
                >
                    {deleteEnabled && <MenuItem onClick={onDeleteClick}>
                        <ListItemIcon>
                            <Delete/>
                        </ListItemIcon>
                        <ListItemText primary="Delete"/>
                    </MenuItem>}

                    {editEnabled && <MenuItem onClick={onCopyClick}>
                        <ListItemIcon>
                            <FileCopy/>
                        </ListItemIcon>
                        <ListItemText primary="Copy"/>
                    </MenuItem>}

                </Menu>}


            </div>}

            {size !== "xs" && (
                <div className={classes.cellButtonsId}>

                    {entity ?
                        <Typography
                            className={"mono"}
                            variant={"caption"}
                            color={"textSecondary"}> {entity.id} </Typography>
                        :
                        <Skeleton variant="text"/>
                    }
                </div>
            )}

        </div>
    );

}
