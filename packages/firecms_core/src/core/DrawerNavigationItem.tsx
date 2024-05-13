import React from "react";

import { NavLink } from "react-router-dom";
import { cn, Tooltip } from "@firecms/ui";

export function DrawerNavigationItem({
                                         name,
                                         icon,
                                         drawerOpen,
                                         tooltipsOpen,
                                         url,
                                         onClick
                                     }: {
    icon: React.ReactElement,
    name: string,
    tooltipsOpen: boolean,
    drawerOpen: boolean,
    url: string,
    onClick?: () => void,
}) {

    const iconWrap = <div
        className={"text-gray-600 dark:text-gray-500"}>
        {icon}
    </div>;

    const listItem = <NavLink
        onClick={onClick}
        style={{
            width: !drawerOpen ? "72px" : "280px",
            transition: drawerOpen ? "width 150ms ease-in" : undefined
        }}
        className={({ isActive }: any) => cn("rounded-r-lg truncate",
            "hover:bg-slate-300 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75 text-gray-800 dark:text-gray-200 hover:text-gray-900 hover:dark:text-white",
            "flex flex-row items-center mr-8",
            // "transition-all ease-in-out delay-100 duration-300",
            // drawerOpen ? "w-full" : "w-18",
            drawerOpen ? "pl-8 h-12" : "pl-6 h-11",
            "font-medium text-sm",
            isActive ? "bg-slate-200 bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-30" : ""
        )}
        to={url}
    >

        {iconWrap}

        <div
            className={cn(
                drawerOpen ? "opacity-100" : "opacity-0 hidden",
                "ml-4 font-inherit text-inherit"
            )}>
            {name.toUpperCase()}
        </div>
    </NavLink>;

    return <Tooltip
        open={drawerOpen ? false : tooltipsOpen}
        side="right"
        title={name}>
        {listItem}
    </Tooltip>;
}
