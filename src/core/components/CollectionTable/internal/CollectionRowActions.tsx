import { CollectionSize, Entity } from "../../../../models";

import { styled } from '@mui/material/styles';

import React, { MouseEvent, useCallback } from "react";
import {
    alpha,
    Checkbox,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Skeleton,
    Theme,
    Tooltip,
    Typography
} from "@mui/material";
import { Delete, FileCopy, KeyboardTab, MoreVert } from "@mui/icons-material";
const PREFIX = 'CollectionRowActions';

const classes = {
    tableContainer: `${PREFIX}-tableContainer`,
    headerTypography: `${PREFIX}-headerTypography`,
    header: `${PREFIX}-header`,
    tableRow: `${PREFIX}-tableRow`,
    tableRowClickable: `${PREFIX}-tableRowClickable`,
    column: `${PREFIX}-column`,
    cellButtonsWrap: `${PREFIX}-cellButtonsWrap`,
    cellButtons: `${PREFIX}-cellButtons`,
    cellButtonsId: `${PREFIX}-cellButtonsId`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.tableContainer}`]: {
        width: "100%",
        height: "100%",
        flexGrow: 1
    },

    [`& .${classes.headerTypography}`]: {
        fontSize: "0.750rem",
        fontWeight: 600,
        textTransform: "uppercase"
    },

    [`& .${classes.header}`]: {
        width: "calc(100% + 24px)",
        margin: "0px -12px",
        padding: "0px 12px",
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        height: "100%",
        fontSize: "0.750rem",
        textTransform: "uppercase",
        fontWeight: 600
    },

    [`& .${classes.tableRow}`]: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        fontSize: "0.875rem"
    },

    [`& .${classes.tableRowClickable}`]: {
        "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.background.default, 0.5)
        }
    },

    [`& .${classes.column}`]: {
        padding: "0px !important"
    },

    [`&.${classes.cellButtonsWrap}`]: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.8) : alpha(theme.palette.background.default, 0.8)
    },

    [`& .${classes.cellButtons}`]: {
        minWidth: 138
    },

    [`& .${classes.cellButtonsId}`]: {
        width: 138,
        textAlign: "center",
        textOverflow: "ellipsis",
        overflow: "hidden"
    }
}));


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
        <Root className={classes.cellButtonsWrap}>

            {(editEnabled || deleteEnabled || selectionEnabled) &&
            <div className={classes.cellButtons}
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
                    elevation={2}
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

            {size !== "xs" && (
                <div className={classes.cellButtonsId}>

                    {entity
                        ? <Typography
                            className={"mono"}
                            variant={"caption"}
                            color={"textSecondary"}> {entity.id} </Typography>
                        : <Skeleton variant="text"/>
                    }
                </div>
            )}

        </Root>
    );

}
