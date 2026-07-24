import React from "react";
import { IconForView, useApp, useTranslation } from "@firecms/core";
import { cls, Menu, MenuItem, MoreVertIcon, Tooltip, } from "@firecms/ui";
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
        drawerOpen
    } = useApp();

    const { t } = useTranslation();

    const navigate = useNavigate();

    const drawerVisuallyOpen = drawerOpen || drawerHovered;
    const tooltipsOpen = drawerHovered && !drawerOpen && !menuOpen;

    return <Menu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        trigger={
            <div
                role="button"
                tabIndex={0}
                className={cls(
                    "flex flex-row items-center rounded-lg cursor-pointer group/nav h-[30px]",
                    "hover:bg-primary/5 dark:hover:bg-primary/5 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white",
                    "font-medium text-[13px]"
                )}>
                <Tooltip title={"Admin"}
                         open={drawerVisuallyOpen || menuOpen ? false : tooltipsOpen}
                         side={"right"} sideOffset={28}>
                    <div
                        className={"shrink-0 flex items-center justify-center w-[44px] h-[30px] text-surface-500 dark:text-text-secondary-dark group-hover/nav:text-primary transition-colors duration-150"}>
                        <MoreVertIcon size={"small"}/>
                    </div>
                </Tooltip>
                <div className={cls(
                    drawerVisuallyOpen ? "opacity-100" : "opacity-0 hidden",
                    "font-inherit truncate"
                )}>
                    {t("admin")}
                </div>
            </div>}
    >
        {ADMIN_VIEWS_CONFIG.map((view, index) => <MenuItem
            onClick={(event) => {
                event.preventDefault();
                navigate(view.path);
            }}
            key={`navigation_${index}`}>
            {<IconForView collectionOrView={view}/>}
            {t(view.name as any)}
        </MenuItem>)}

    </Menu>;
}
