import React from "react";
import { NavLink } from "react-router-dom";

import { useApp, useNavigationController } from "@firecms/core";
import { useDataTalk } from "../DataTalkProvider";
import { cls, ManageSearchIcon, Typography } from "@firecms/ui";

export function DataTalkDrawer() {

    const {
        drawerHovered,
        drawerOpen,
        openDrawer,
        closeDrawer
    } = useApp();

    const navigation = useNavigationController();

    const { sessions } = useDataTalk();
    return (

        <>
            <div className={"grow overflow-scroll no-scrollbar my-8"}>
                {!drawerOpen && <div className={"flex justify-center p-4 h-full cursor-pointer"} onClick={openDrawer}>
                    <ManageSearchIcon/>
                </div>}
                {sessions?.map((session, index) => {
                    const firstMessage = session.messages[0];
                    const charsLimit = 30;
                    const firstChars = firstMessage?.text.slice(0, charsLimit) ?? "DataTalk session started";
                    return (
                        <NavLink
                            key={index}
                            // onClick={onClick}
                            style={{
                                width: !drawerOpen ? "72px" : "280px",
                                transition: drawerOpen ? "width 150ms ease-in" : undefined
                            }}
                            className={({ isActive }: any) => cls("transition-opacity flex flex-col justify-between p-4",
                                !drawerOpen ? "opacity-0" : "opacity-1",
                                "rounded-r-lg truncate",
                                "hover:bg-surface-accent-300/60 dark:hover:bg-surface-700/60 text-surface-800 dark:text-surface-200 hover:text-surface-900 dark:hover:text-white",
                                "mr-8",
                                "font-medium text-sm",
                                isActive ? "bg-surface-accent-200/60 dark:bg-surface-800/30" : ""
                            )}
                            to={navigation.homeUrl + "/datatalk/" + session.id}
                        >
                            <Typography variant={"label"}
                                        className={"whitespace-nowrap"}>{firstChars}{(firstMessage?.text ?? "").length > charsLimit ? "..." : ""}</Typography>
                            <Typography variant={"caption"}
                                        color={"secondary"}
                                        className={"whitespace-nowrap"}>{session.created_at.toLocaleString()}</Typography>
                        </NavLink>
                    );
                })}

            </div>
        </>
    );
}
