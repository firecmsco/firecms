import React from "react";
import { Panel } from "./Panel";
import { PagesHeroBackground } from "./PagesHeroBackground";
import clsx from "clsx";
import { defaultBorderMixin } from "../styles";

export function HeroCenter({
                               title,
                               subtitle,
                               cta,
                               color,
                               height = "300px",
                               subtitleColor = "lighter",
                           }: {
    title: React.ReactNode,
    subtitle?: React.ReactNode,
    cta?: React.ReactNode,
    color: "primary" | "secondary" | "dark",
    height?: number | string,
    subtitleColor?: "gray" | "light_gray" | "white" | "primary" | "secondary" | "light" | "lighter" | "transparent",
}) {
    let bgColor: string;
    if (color === "primary") {
        bgColor = "bg-blue-600";
    } else if (color === "secondary") {
        bgColor = "bg-rose-500";
    } else {
        bgColor = "bg-gray-900";
    }

    return (
        <div className={"w-full relative -mt-20 " + bgColor}>

            <PagesHeroBackground color={color}/>
            <div>
                <Panel includeMargin={false}
                       includePadding={false}
                       color={"transparent"}
                       innerClassName={"py-8 md:py-12 p-4 md:p-8"}
                       className={"border-t-0"}>
                    <div className={"h-20"}/>
                    <div
                        style={{ height }}
                        className="text-white">
                        <h1 className={clsx("m-0 text-center block text-5xl md:text-6xl font-extrabold tracking-tight leading-none uppercase text-white",
                            "px-16 md:px-24 py-8 md:py-16",
                            "border-0 border-b",
                            defaultBorderMixin)}>
                            <div className={"block"}>
                                <p>FireCMS </p>
                                <p
                                    style={{
                                        // mixBlendMode: "color-dodge",
                                        fontSize: "8rem",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        backgroundImage: "linear-gradient(to right, #EC4C51, #FA5574, #9543C1, #9543C1)"
                                    }}
                                    className="font-extrabold text-transparent bg-clip-text text-7xl md:text-8xl">PRO</p>
                            </div>

                        </h1>
                    </div>
                </Panel>
            </div>
            <div className={"relative"}>
                <div className="h-full w-full"
                     style={{
                         filter: "blur(148.1px)",
                            opacity: .8,
                            width: "100vw",
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            background: "linear-gradient(90deg, rgba(196,0,134,1) 0%, rgba(0,212,255,1) 47%, rgba(5,74,250,1) 99%)"

                     }}></div>
                <Panel color={subtitleColor} includePadding={false}
                       className={"mix-blend-color-burn"}
                       innerClassName={"py-8 md:py-12 p-4 md:p-8"}>
                    {subtitle &&
                        <div className="font-mono uppercase m-0 text-xl md:text-2xl">
                            {subtitle}
                        </div>}
                    {cta && <div
                        className="mt-5 sm:mt-8">
                        {cta}
                    </div>}
                </Panel>
            </div>
        </div>
    );
}
