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
        className={"shrink-0 flex items-center justify-center w-[44px] h-[30px] text-surface-500 dark:text-text-secondary-dark group-hover/nav:text-primary transition-colors duration-150"}>
        {icon}
    </div>;

    const listItem = <div>
        <NavLink
            onClick={onClick}
            style={{
                width: "100%",
                transition: drawerOpen ? "width 150ms ease-in" : undefined
            }}
            className={({ isActive }: { isActive: boolean }) => cls("rounded-lg truncate group/nav",
                "hover:bg-primary/5 dark:hover:bg-primary/5 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white",
                "flex flex-row items-center",
                drawerOpen ? "pr-4 h-[30px]" : "h-[30px]",
                "font-medium text-[13px]",
                isActive ? "bg-primary/8 dark:bg-primary/10 text-primary dark:text-primary [&_div]:text-primary" : ""
            )}
            to={url}
        >

            {iconWrap}

            <div
                className={cls(
                    "text-surface-700 dark:text-surface-300",
                    drawerOpen ? "opacity-100" : "opacity-0 hidden",
                    "font-inherit truncate space-x-2"
                )}>
                {name}
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
