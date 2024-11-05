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
                "hover:bg-slate-300 hover:bg-opacity-75 dark:hover:bg-slate-800 dark:hover:bg-opacity-75 text-text-secondary dark:text-gray-200 hover:text-gray-900 hover:dark:text-white",
                "flex flex-row items-center mr-8",
                // "transition-all ease-in-out delay-100 duration-300",
                // drawerOpen ? "w-full" : "w-18",
                drawerOpen ? "pl-4 h-12" : "pl-4 h-11",
                "font-medium text-sm",
                isActive ? "bg-slate-200 bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-50" : ""
            )}
            to={url}
        >

            {iconWrap}

            <div
                className={cls(
                    drawerOpen ? "opacity-100" : "opacity-0 hidden",
                    "ml-4 font-inherit text-inherit"
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
