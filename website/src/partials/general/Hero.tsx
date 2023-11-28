import React from "react";
import { Panel } from "./Panel";
import { PagesBackground } from "./PagesBackground";

export function Hero({
                         title,
                         subtitle,
                         cta
                     }: {
    title: React.ReactNode,
    subtitle?: React.ReactNode,
    cta?: React.ReactNode,
}) {
    return (
        <>
            <div className={"w-full relative"}>
                <PagesBackground color={"blue"}/>
                <div className={"h-20 "}/>
                <Panel includeMargin={false}
                       includePadding={false}
                       color={"transparent"}
                       innerClassName={"py-8 md:py-12 p-4 md:p-8"}
                       className={"border-t-0"}>
                    <div style={{ height: "200px" }}/>
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

            <Panel color={"secondary"} includePadding={false} innerClassName={"py-8 md:py-12 p-4 md:p-8"}>
                {subtitle &&
                    <div className="text-xl  md:text-2xl">
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
