import React from "react";
import { Panel } from "./Panel";
import { AnimatedGradientBackground } from "../AnimatedGradientBackground";

export function Hero({
                         title,
                         subtitle,
                         cta,
                         height = "100px",
                         subtitleColor = "lighter",
                     }: {
    title: React.ReactNode,
    subtitle?: React.ReactNode,
    cta?: React.ReactNode,
    height?: number | string,
    subtitleColor?: "gray" | "dark_gray" | "light_gray" | "white" | "primary" | "secondary" | "light" | "lighter" | "transparent",
}) {

    return (
        <>

            <div className={"w-full relative bg-gray-950 -mt-20"}>

                <AnimatedGradientBackground translateY={280}/>

                <Panel includeMargin={false}
                       includePadding={false}
                       color={"transparent"}
                       innerClassName={"py-8 md:py-12 p-4 md:p-8"}
                       className={"border-t-0"}>
                    <div className={"h-48"}/>
                    <div style={{ height }}/>
                    <div
                        className={"mt-10 text-white"}>
                        <div className="lg:text-left">
                            <h1 className="tracking-tight font-medium text-6xl uppercase">
                                {title}
                            </h1>
                        </div>
                    </div>
                </Panel>
            </div>

            {(subtitle || cta) &&
                <Panel color={subtitleColor} includePadding={false} innerClassName={"py-8 md:py-12 p-4 md:p-8"}>
                    {subtitle &&
                        <div className="font-mono uppercase m-0 text-xl md:text-2xl">
                            {subtitle}
                        </div>}
                    {cta && <div
                        className="mt-5 sm:mt-8">
                        {cta}
                    </div>}
                </Panel>}
        </>
    );
}
