import React from "react";
import { ContainerMixin } from "../styles";

export function ThreeColumns({
                                 left,
                                 center,
                                 right,
                                 reverseSmall,
                                 animation = true
                             }: {
    left: React.ReactNode,
    center: React.ReactNode,
    right: React.ReactNode,
    reverseSmall?: boolean,
    animation?: boolean
}) {

    const flexDirection = reverseSmall ? "flex-col-reverse" : "flex-col";

    return (
        <div
            className={ContainerMixin + " relative mx-auto my-8 "}>
            <div
                className={"max-w-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 " + flexDirection}>
                <div
                    className={"max-w-7xl lg:max-w-none lg:w-full mx-auto flex justify-center flex-col h-full my-8 lg:my-0 lg:col-span-4"}
                >
                    {left}
                </div>

                <div
                    className={"max-w-7xl lg:max-w-none lg:w-full mx-auto  flex justify-center flex-col h-full my-8 lg:my-0 lg:col-span-4"}
                >
                    {center}
                </div>
                <div
                    className={"max-w-7xl lg:max-w-none lg:w-full mx-auto  flex justify-center flex-col h-full my-8 lg:my-0 lg:col-span-4"}
                >
                    {right}
                </div>
            </div>
        </div>
    )
}
