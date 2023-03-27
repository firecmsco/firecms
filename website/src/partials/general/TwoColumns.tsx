import React from "react";
import { ContainerMixin } from "../utils";

export function TwoColumns({
                               left,
                               right,
                               distribution,
                               reverseSmall,
                               animation = true
                           }: {
    left: React.ReactNode,
    right: React.ReactNode,
    distribution?: "bigLeft" | "bigRight",
    reverseSmall?: boolean,
    animation?: boolean
}) {

    const leftColumn = distribution === "bigLeft" ? "lg:col-span-7" : (distribution === "bigRight" ? "lg:col-span-5" : "lg:col-span-6");
    const rightColumn = distribution === "bigLeft" ? "lg:col-span-5" : (distribution === "bigRight" ? "lg:col-span-7" : "lg:col-span-6");
    const flexDirection = reverseSmall ? "flex-col-reverse" : "flex-col";

    return (
        <div
            className={ContainerMixin + " relative mx-auto my-8 md:my-12"}>
            <div
                className={"max-w-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-10 " + flexDirection}>
                <div
                    className={"max-w-7xl lg:max-w-none lg:w-full mx-auto flex justify-center flex-col h-full my-8 lg:my-0 " + leftColumn}
                    data-aos={animation ? "fade-right" : undefined}
                >
                    {left}
                </div>

                <div
                    className={"max-w-7xl lg:max-w-none lg:w-full mx-auto lg:order-1 flex justify-center flex-col h-full my-8 lg:my-0 " + rightColumn}
                    data-aos={animation ? "fade-left" : undefined}
                >
                    {right}
                </div>
            </div>
        </div>
    )
}
