import React from "react";
import { Panel } from "./Panel";
import { PagesHeroBackground } from "./PagesHeroBackground";

export function Hero({
                         title,
                         subtitle,
                         cta,
                         color,
                         subtitleColor = "lighter",
                     }: {
    title: React.ReactNode,
    subtitle?: React.ReactNode,
    cta?: React.ReactNode,
    color: "primary" | "secondary",
    subtitleColor?: "gray" | "light_gray" | "white" | "primary" | "secondary" | "light" | "lighter" | "transparent",
}) {
    return (
        <>
            <div className={"w-full relative bg-blue-800 -mt-20"}>
                <PagesHeroBackground color={color}/>
                <Panel includeMargin={false}
                       includePadding={false}
                       color={"transparent"}
                       innerClassName={"py-8 md:py-12 p-4 md:p-8"}
                       className={"border-t-0"}>
                    <div className={"h-20"}/>
                    <div style={{ height: "300px" }}/>
                    <div
                        className="mt-10 text-white">
                        <div className="lg:text-left">
                            <h1 className="tracking-tight font-extrabold text-6xl">
                                {title}
                            </h1>
                        </div>
                    </div>
                </Panel>
            </div>

            <Panel color={subtitleColor} includePadding={false} innerClassName={"py-8 md:py-12 p-4 md:p-8"}>
                {subtitle &&
                    <div className="font-mono uppercase m-0 text-xl md:text-2xl">
                        {subtitle}
                    </div>}
                {cta && <div
                    className="mt-5 sm:mt-8">
                    {cta}
                </div>}
            </Panel>
        </>
    );
}
