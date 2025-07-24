import React from "react";
import HeroButtons from "./HeroButtons";

// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/landing_1080.webm";
import { defaultBorderMixin } from "../styles";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { LinedSpace } from "../layout/LinedSpace";
import { AnimatedGradientBackground } from "../AnimatedGradientBackground";

function HeroHome({}) {

    return (
        <>

            <div
                className={clsx("w-full relative border-0 -mt-20 bg-gradient-to-br from-950 to-gray-900", defaultBorderMixin)}>

                <AnimatedGradientBackground/>

                <Panel includeMargin={false}
                       includePadding={false}
                       container={false}
                       color={"transparent"}
                       className={"border-t-0"}>
                    <div className={"h-20"}/>
                    <div className="flex flex-wrap w-full">
                        <div className={clsx("w-full border-0 border-r", defaultBorderMixin)}>
                            <LinedSpace/>

                            <h1 className={clsx("m-0 mt-16 md:mt-24 text-center block text-5xl md:text-6xl font-bold tracking-tight leading-none uppercase text-white",
                                "px-16 md:px-24 py-4 md:py-8")}>

                                <span className={"block"}>
                                   Your CMS
                                </span>
                                <span className={"block md:inline"}>based on </span>
                                <span className={"relative"}>
                                     <span
                                         className={"text-6xl md:text-7xl"}
                                         style={{ color: "#FFA000" }}>Firebase</span>
                                      <span
                                          className={"absolute -translate-x-20 translate-y-12 md:translate-y-14 -rotate-12 text-sm md:text-lg"}
                                          style={{
                                              whiteSpace: "nowrap",
                                              color: "#001E2B",
                                              background: "#00ed64",
                                              // color: "white",
                                              // background: "#00684A",
                                              borderRadius: "4px",
                                              padding: "4px 8px",
                                              // fontSize: "large",
                                              position: "absolute",
                                              // transform: "translateX(-78px) translateY(3.9vw) rotate(-13deg)"
                                          }}>or MongoDB</span>
                                </span>


                            </h1>

                            <h2 className={clsx("font-mono text-center uppercase m-0 text-2xl px-8 md:px-16 pb-16 border-0 border-b text-white", defaultBorderMixin)}>
                                Instantly create a flexible admin panel on top of your data
                            </h2>

                            <HeroButtons/>


                        </div>
                        <div className="w-full px-8 md:px-24 lg:px-48 my-16 flex items-center justify-center">
                            <div
                                className={"flex flex-col items-center content-center justify-center -m-px "}>
                                <video
                                    style={{
                                        pointerEvents: "none",
                                        // aspectRatio: 1,
                                        // padding: "1px",
                                    }}
                                    className={clsx("rounded-2xl border", defaultBorderMixin)}
                                    width="100%"
                                    loop autoPlay muted playsInline>
                                    <source
                                        src={editingDemoDarkVideo}
                                        type="video/mp4"/>
                                </video>
                                <div
                                    className={"flex flex-col items-center content-center justify-center text-center mt-4 text-gray-600"}>
                                    Inline editing, customizable UI, and real-time updates. A delightful editing
                                    experience
                                </div>
                            </div>
                        </div>
                    </div>
                    <LinedSpace position={"top"}/>
                </Panel>
            </div>
        </>
    );
}

export default HeroHome;
