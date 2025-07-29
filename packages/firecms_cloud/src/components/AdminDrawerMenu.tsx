import React from "react";
import { IconForView, useApp } from "@firecms/core";
import { cls, IconButton, Menu, MenuItem, MoreVertIcon, Tooltip, } from "@firecms/ui";
import { useNavigate } from "react-router-dom";
import { ADMIN_VIEWS_CONFIG } from "../utils";

export function AdminDrawerMenu({
                                    menuOpen,
                                    setMenuOpen,
                                }: {
    menuOpen: boolean,
    setMenuOpen: (open: boolean) => void,
}) {

    const {
        drawerHovered,
        drawerOpen,
        closeDrawer
    } = useApp();

    const navigate = useNavigate();

    const tooltipsOpen = drawerHovered && !drawerOpen && !menuOpen;

    return <Menu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        trigger={
            <IconButton
                shape={"square"}
                className={"m-4 text-surface-900 dark:text-white w-fit"}>
                <Tooltip title={"Admin"}
                         open={tooltipsOpen}
                         side={"right"} sideOffset={28}>
                    <MoreVertIcon/>
                </Tooltip>
                {drawerOpen && <div
                    className={cls(
                        drawerOpen ? "opacity-100" : "opacity-0 hidden",
                        "mx-4 font-inherit text-inherit"
                    )}>
                    ADMIN
                </div>}
            </IconButton>}
    >
        {ADMIN_VIEWS_CONFIG.map((view, index) => <MenuItem
            onClick={(event) => {
                event.preventDefault();
                navigate(view.slug);
            }}
            key={`navigation_${index}`}>
            {<IconForView collectionOrView={view}/>}
            {view.name}
        </MenuItem>)}

    </Menu>;
}
