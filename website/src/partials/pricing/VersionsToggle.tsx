import React from "react";


import CloudIcon from "@site/static/img/icons/cloud.svg";
import ServerIcon from "@site/static/img/icons/server.svg";

export function VersionsToggle({ value, onSelect }: {
    value: "self-hosted" | "cloud",
    onSelect: (value: "self-hosted" | "cloud") => void
}) {

    return <div className={"flex flex-row gap-8 justify-center"}>
        <ToggleButton title={"Self-hosted"}
                      icon={<ServerIcon/>}
                      subtitle={"Free and open source"}
                      selected={value === "self-hosted"}
                      onClick={() => onSelect("self-hosted")}
        />
        <ToggleButton title={"Cloud"}
                      icon={<CloudIcon/>}
                      subtitle={"No-code, full-service"}
                      selected={value === "cloud"}
                      onClick={() => onSelect("cloud")}
        />
    </div>
}


export function ToggleButton({ title, subtitle, icon, selected, onClick }: {
    title: string,
    icon: React.ReactNode,
    subtitle: string,
    selected?: boolean,
    onClick?: () => void
}) {

    return (
        <div
            onClick={onClick}
            className={"cursor-pointer max-w-sm p-6 border border-solid rounded-lg flex flex-row gap-4 items-center "
                + (selected
                    ? "border-primary shadow-xl text-gray-700 dark:text-gray-300"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400")}
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
