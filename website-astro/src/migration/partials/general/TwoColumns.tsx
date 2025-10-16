import React from "react";
import { ContainerMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export function TwoColumns({
                               left,
                               right,
                               distribution,
                               reverseSmall,
                               animation = true,
                               includeBorder,
                               className
                           }: {
    includeBorder?: boolean,
    left: React.ReactNode,
    right: React.ReactNode,
    distribution?: "bigLeft" | "bigRight",
    reverseSmall?: boolean,
    animation?: boolean,
    className?: string
}) {

    const leftColumn = distribution === "bigLeft" ? "lg:col-span-7" : (distribution === "bigRight" ? "lg:col-span-5" : "lg:col-span-6");
    const rightColumn = distribution === "bigLeft" ? "lg:col-span-5" : (distribution === "bigRight" ? "lg:col-span-7" : "lg:col-span-6");
    const flexDirection = reverseSmall ? "flex-col-reverse" : "flex-col";

    return (
        <div
            className={clsx(ContainerMixin,
                "relative mx-auto",
                includeBorder ? defaultBorderMixin : "",
                includeBorder ? "border-x border-y-0 border-solid" : "",
                className
                )}>
            <div
                className={"max-w-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-10 " + flexDirection}>
                <div
                    className={"lg:max-w-7xl max-w-full lg:w-full mx-auto flex justify-center flex-col h-full py-6 " + leftColumn}
                >
                    {left}
                </div>

                <div
                    className={"lg:max-w-7xl max-w-full lg:w-full mx-auto lg:order-1 flex justify-center flex-col h-full py-6 " + rightColumn}
                >
                    {right}
                </div>
            </div>
        </div>
    )
}
