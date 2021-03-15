import {
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema
} from "../models";
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
import { useSideEntityController } from "../contexts";
import { Skeleton } from "@material-ui/lab";

export function CollectionRowActions<S extends EntitySchema<Key>,
    Key extends string = Extract<keyof S["properties"], string>>({
                                                                     entity,
                                                                     isSelected,
                                                                     collectionPath,
                                                                     createEnabled,
                                                                     editEnabled,
                                                                     deleteEnabled,
                                                                     selectionEnabled,
                                                                     size,
                                                                     toggleEntitySelection,
                                                                     onDeleteClicked,
                                                                     schema,
                                                                     subcollections
                                                                 }:
                                                                     {
                                                                         entity: Entity<S, Key>,
                                                                         collectionPath: string,
                                                                         size: CollectionSize,
                                                                         isSelected?: boolean,
                                                                         createEnabled?: boolean,
                                                                         editEnabled?: boolean,
                                                                         deleteEnabled?: boolean,
                                                                         selectionEnabled?: boolean,
                                                                         toggleEntitySelection?: (entity: Entity<S, Key>) => void
                                                                         onDeleteClicked?: (entity: Entity<S, Key>) => void,
                                                                         schema: EntitySchema<any>;
                                                                         subcollections?: EntityCollection[];
                                                                     }) {

    const sideEntityController = useSideEntityController();
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
        sideEntityController.open({
            entityId: entity.id,
            collectionPath,
            copy: true,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema,
            subcollections,
            overrideSchemaResolver: false
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
                            sideEntityController.open({
                                entityId: entity.id,
                                collectionPath,
                                permissions: {
                                    edit: editEnabled,
                                    create: createEnabled,
                                    delete: deleteEnabled
                                },
                                schema: schema,
                                subcollections: subcollections,
                                overrideSchemaResolver: false
                            });
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
                        <Skeleton variant="text"/>
                    }
                </div>
            )}

        </div>
    );

}
