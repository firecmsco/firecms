import React from "react";

import CloudIcon from "@site/static/img/icons/cloud.svg";
import ServerIcon from "@site/static/img/icons/server.svg";
import { Panel } from "../general/Panel";

export function VersionsToggle({
                                   value,
                                   onSelect
                               }: {
    value: "self-hosted" | "cloud",
    onSelect: (value: "self-hosted" | "cloud") => void
}) {

    return <Panel color={"white"} innerClassName={"flex flex-row gap-8 justify-center"}>
        <ToggleButton title={"Self-hosted"}
                      icon={<ServerIcon/>}
                      subtitle={<><b>FREE</b> and open source</>}
                      selected={value === "self-hosted"}
                      onClick={() => onSelect("self-hosted")}
        />
        <ToggleButton title={"Cloud"}
                      icon={<CloudIcon/>}
                      subtitle={"No-code, full-service"}
                      selected={value === "cloud"}
                      onClick={() => onSelect("cloud")}
        />
    </Panel>
}

export function ToggleButton({
                                 title,
                                 subtitle,
                                 icon,
                                 selected,
                                 onClick
                             }: {
    title: string,
    icon: React.ReactNode,
    subtitle: React.ReactNode,
    selected?: boolean,
    onClick?: () => void
}) {

    return (
        <div
            onClick={onClick}
            className={"cursor-pointer max-w-sm p-6 border border-solid rounded-lg flex flex-row gap-4 items-center bg-gray-50 "
                + (selected
                    ? "border-transparent shadow-xl text-gray-700  outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent"
                    : "border-gray-200 text-gray-600")}
        >
            {icon}
            <div
                className={"flex flex-col"}
            >

                <h3 className={"text-xl md:text-2xl font-bold mb-0"}>
                    {title}
                </h3>
                <p className={"text-lg mb-0"}>
                    {subtitle}
                </p>

            </div>
        </div>
    );

}
