import React from "react";
import { Panel } from "../general/Panel";
import { PagesHeroBackground } from "../general/PagesHeroBackground";
import clsx from "clsx";
import { Button, EventIcon } from "@firecms/ui";

export function HeroPro({
                            color,
                            height = "300px",
                        }: {
    color: "primary" | "secondary" | "dark",
    height?: number | string,
}) {

    let bgColor: string;
    if (color === "primary") {
        bgColor = "bg-blue-600";
    } else if (color === "secondary") {
        bgColor = "bg-rose-500";
    } else if (color === "dark") {
        bgColor = "bg-gray-900";
    } else {
        bgColor = "bg-transparent";
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
                    <div style={{ height }}/>
                    <div
                        style={{
                            fontSize: "7rem",
                        }}
                        className="text-white">
                        <h1
                            className={clsx("m-0 block tracking-tight leading-none uppercase text-white")}>
                            <div className={"block"}>
                                <span>FireCMS </span>
                                <span
                                    style={{
                                        // mixBlendMode: "color-dodge",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        backgroundImage: "linear-gradient(to right, #EC4C51, #FA5574, #9543C1, #9543C1)"
                                    }}
                                    className="font-extrabold text-transparent bg-clip-text text-7xl md:text-8xl">PRO</span>
                            </div>

                        </h1>
                    </div>
                </Panel>
            </div>

            <div className={"relative"}>
                <div className="h-full w-full mix-blend-multiply"
                     style={{
                         // filter: "blur(148.1px)",
                         opacity: .8,
                         width: "100vw",
                         height: "100%",
                         position: "absolute",
                         top: 0,
                         left: 0,
                         right: 0,
                         background: "linear-gradient(90deg, rgba(196,0,134,1) 0%, rgba(0,212,255,1) 47%, rgba(5,74,250,1) 99%)"

                     }}></div>
                <Panel color={"transparent"} includePadding={false}
                       innerClassName={"py-8 md:py-12 p-4 md:p-8"}>
                    <div className="font-mono uppercase m-0 text-xl md:text-2xl">
                        <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight text-white"
                           style={{
                               lineHeight: 1.35,
                           }}>
                            The most customizable headless CMS. Ever.
                        </p>
                        <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight text-white"
                           style={{
                               lineHeight: 1.35,
                           }}>
                            The perfect solution for your team or public facing applications, built on top of Firebase.
                        </p>
                    </div>
                    <div className={"space-x-4"}>
                        <Button size={"large"}>See demo</Button>
                        <Button size={"large"} variant={"outlined"}>Book a meeting <EventIcon/></Button>
                    </div>
                </Panel>
            </div>

        </div>
    );
}
