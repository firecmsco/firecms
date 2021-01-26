import { CollectionSize, Entity, EntitySchema } from "../models";
import { renderSkeletonText } from "../preview/components/SkeletonComponent";
import { useTableStyles } from "./styles";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";

import React, { MouseEvent } from "react";
import "react-base-table/styles.css";
import {
    Checkbox,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography
} from "@material-ui/core";
import { Delete, FileCopy, KeyboardTab, MoreVert } from "@material-ui/icons";

export function CollectionRowActions<S extends EntitySchema>({
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
                                                                     entity: Entity<S>,
                                                                     isSelected: boolean,
                                                                     collectionPath: string,
                                                                     editEnabled: boolean,
                                                                     deleteEnabled: boolean,
                                                                     selectionEnabled: boolean,
                                                                     size: CollectionSize,
                                                                     toggleEntitySelection: (entity: Entity<S>) => void
                                                                     onDeleteClicked: (entity: Entity<S>) => void
                                                                 }) {


    const selectedEntityContext = useSelectedEntityContext();
    const classes = useTableStyles({ size });

    const [anchorEl, setAnchorEl] = React.useState<any | null>(null);

    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
        event.stopPropagation();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onCheckboxChange = (event: React.ChangeEvent) => {
        toggleEntitySelection(entity);
        event.stopPropagation();
    };

    const onDeleteClick = (event: MouseEvent) => {
        event.stopPropagation();
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

    const onDivClick = selectionEnabled ?
        (event: MouseEvent) => {
            toggleEntitySelection(entity);
            event.stopPropagation();
        } : undefined;

    return (
        <div onClick={onDivClick}
             className={classes.cellButtonsWrap}>

            {(editEnabled || deleteEnabled) &&
            <div className={classes.cellButtons}
            >
                {editEnabled &&
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
                }

                {selectionEnabled && <Checkbox
                    checked={isSelected}
                    onChange={onCheckboxChange}
                />}

                {editEnabled &&
                <IconButton
                    onClick={handleClick}
                >
                    <MoreVert/>
                </IconButton>
                }

                {editEnabled && <Menu
                    anchorEl={anchorEl}
                    // keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
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
