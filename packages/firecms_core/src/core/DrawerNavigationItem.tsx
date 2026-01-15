import React from "react";

import { NavLink } from "react-router-dom";
import { cls, Tooltip } from "@firecms/ui";

export function DrawerNavigationItem({
                                         name,
                                         icon,
                                         drawerOpen,
                                         adminMenuOpen,
                                         tooltipsOpen,
                                         url,
                                         onClick
                                     }: {
    icon: React.ReactElement,
    name: string,
    tooltipsOpen: boolean,
    drawerOpen: boolean,
    adminMenuOpen?: boolean,
    url: string,
    onClick?: () => void,
}) {

    const iconWrap = <div
        className={"text-text-secondary dark:text-text-secondary-dark"}>
        {icon}
    </div>;

    const listItem = <div>
        <NavLink
            onClick={onClick}
            style={{
                width: "100%",
                transition: drawerOpen ? "width 150ms ease-in" : undefined
            }}
            className={({ isActive }: any) => cls("rounded-lg truncate",
                "hover:bg-surface-accent-300/75 hover:bg-surface-accent-300/75 dark:hover:bg-surface-accent-800/75 dark:hover:bg-surface-accent-800/75 text-text-primary dark:text-surface-200 hover:text-surface-900 dark:hover:text-white hover:bg-surface-accent-300/75 dark:hover:bg-surface-accent-800/75",
                "flex flex-row items-center mr-8",
                // "transition-all ease-in-out delay-100 duration-300",
                // drawerOpen ? "w-full" : "w-18",
                drawerOpen ? "pl-4 h-10" : "pl-4 h-9",
                "font-semibold text-xs",
                isActive ? "bg-surface-accent-200/60 dark:bg-surface-800 dark:bg-opacity-50 bg-surface-accent-200/60 dark:bg-surface-800/50" : ""
            )}
            to={url}
        >

            {iconWrap}

            <div
                className={cls(
                    "text-text-primary dark:text-surface-200",
                    drawerOpen ? "opacity-100" : "opacity-0 hidden",
                    "ml-4 font-inherit"
                )}>
                {name.toUpperCase()}
            </div>
        </NavLink>
    </div>;

    return <Tooltip
        open={drawerOpen || adminMenuOpen ? false : tooltipsOpen}
        side="right"
        title={name}>
        {listItem}
    </Tooltip>;
}
