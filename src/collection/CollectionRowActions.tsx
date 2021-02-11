import { CollectionSize, Entity, EntitySchema } from "../models";
import { renderSkeletonText } from "../preview/components/SkeletonComponent";
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
import { useSideEntityController } from "../contexts/SideEntityPanelsController";

export function CollectionRowActions<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>({
                                                                 entity,
                                                                 isSelected,
                                                                 collectionPath,
                                                                 editEnabled,
                                                                 deleteEnabled,
                                                                 selectionEnabled,
                                                                 size,
                                                                 toggleEntitySelection,
                                                                 onDeleteClicked
                                                             }:
                                                                 {
                                                                     entity: Entity<S, Key>,
                                                                     collectionPath: string,
                                                                     size: CollectionSize,
                                                                     isSelected?: boolean,
                                                                     editEnabled?: boolean,
                                                                     deleteEnabled?: boolean,
                                                                     selectionEnabled?: boolean,
                                                                     toggleEntitySelection?: (entity: Entity<S, Key>) => void
                                                                     onDeleteClicked?: (entity: Entity<S,Key>) => void
                                                                 }) {

    const selectedEntityContext = useSideEntityController();
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
        selectedEntityContext.open({
            entityId: entity.id,
            collectionPath,
            copy: true
        });
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
                            selectedEntityContext.open({
                                entityId: entity.id,
                                collectionPath
                            });
                        }}
                    >
                        <KeyboardTab/>
                    </IconButton>
                </Tooltip>
                }

                {selectionEnabled && <Checkbox
                    checked={isSelected}
                    onChange={onCheckboxChange}
                />}

                {editEnabled &&
                <IconButton
                    onClick={openMenu}
                >
                    <MoreVert/>
                </IconButton>
                }

                {editEnabled && <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    elevation={2}
                >
                    {deleteEnabled &&
                    <MenuItem onClick={onDeleteClick}>
                        <ListItemIcon>
                            <Delete/>
                        </ListItemIcon>
                        <ListItemText primary="Delete"/>
                    </MenuItem>}

                    <MenuItem onClick={onCopyClick}>
                        <ListItemIcon>
                            <FileCopy/>
                        </ListItemIcon>
                        <ListItemText primary="Copy"/>
                    </MenuItem>

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
                        renderSkeletonText()
                    }
                </div>
            )}

        </div>
    );

}
