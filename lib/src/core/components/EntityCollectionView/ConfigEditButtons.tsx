import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import { Settings } from "@mui/icons-material";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

export function ConfigEditButtons({
                                      onSchemaEditClicked,
                                      onCollectionEditClicked
                                  }: {
    onSchemaEditClicked: () => void;
    onCollectionEditClicked?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    return (
        <Box
            sx={{
                zIndex: 2
            }}>
            <ButtonGroup variant="outlined"
                         ref={anchorRef}>
                <Tooltip title={"Edit schema"}>
                    <Button
                        // size="small"
                        onClick={onSchemaEditClicked}>
                        <Settings/>
                    </Button>
                </Tooltip>
                {onCollectionEditClicked && <Button
                    // size="small"
                    aria-controls={open ? "edit-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon/>
                </Button>}
            </ButtonGroup>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom" ? "right top" : "right bottom"
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="edit-menu">
                                    <MenuItem
                                        onClick={(event) => onSchemaEditClicked()}>
                                        <AccountTreeIcon fontSize={"small"} sx={{mr:1}}/>
                                        Edit schema
                                    </MenuItem>
                                    {onCollectionEditClicked && <MenuItem
                                        onClick={(event) => onCollectionEditClicked()}>
                                        <PlaylistPlayIcon fontSize={"small"}
                                                          sx={{ mr: 1 }}/>
                                        Edit collection
                                    </MenuItem>}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
}
