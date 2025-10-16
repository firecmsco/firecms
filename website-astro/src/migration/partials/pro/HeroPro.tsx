import React from "react";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { CTAButtonDarkMixin, CTAButtonMixin, CTACaret } from "../styles";
import { AnimatedGradientBackground } from "../AnimatedGradientBackground";
import { AppLink } from "../../AppLink";

export function HeroPro({
                            height = "300px",
                        }: {
    height?: number | string,
}) {

    return (
        <div className={"w-full relative -mt-20 bg-gray-900"}>

            <AnimatedGradientBackground translateY={150}/>
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
                                    className="font-medium text-transparent bg-clip-text text-7xl md:text-8xl">PRO</span>
                            </div>

                        </h1>
                    </div>
                </Panel>
            </div>
            <Panel color={"secondary"}>
                <p className={"text-gray-900 uppercase font-mono font-bold"}>
                    No more limits. One month completely free.
                </p>
                <h2 className={"mt-0 uppercase font-mono"}>
                    The Comprehensive Self-Hosted CMS for Professional-Grade Projects
                </h2>
                <div className={"flex flex-row gap-4 mt-8"}>
                    <div className={"flex flex-row items-center justify-center gap-4"}>
                        <div
                            className={"items-center select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                            yarn create firecms-app --pro
                        </div>
                        or
                        <div
                            className={"items-center select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                            npx create-firecms-app --pro
                        </div>
                    </div>
                    <a
                        className={CTAButtonDarkMixin + " w-full lg:w-auto "}
                        href={"docs/pro"}
                    >
                        See the docs
                    </a>
                </div>
                <p className={"block"}>Access your <AppLink className={"text-white font-semibold"}
                                                            href={"https://app.firecms.co/subscriptions"}
                > subscriptions here</AppLink></p>
            </Panel>
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
                       innerClassName={"py-16 md:py-24 p-4 md:p-8"}>
                    <div className="font-mono uppercase m-0 text-xl md:text-2xl">
                        <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight text-white">
                            The most customizable headless CMS. Ever.
                        </p>
                        <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight text-white">
                            The perfect solution for your team or clients, built on top of Firebase,
                            MongoDB or any other backend.
                        </p>
                    </div>
                    <div className={"mt-8 flex flex-row flex-wrap gap-4"}>

                        <a
                            className={CTAButtonMixin + "  "}
                            href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true"}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Book a meeting
                        </a>

                        <a
                            className={CTAButtonDarkMixin + " "}
                            href={"https://demo.firecms.co"}
                        >
                            Check the demo
                            <CTACaret/>
                        </a>

                        {/*<div*/}
                        {/*    className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>*/}
                        {/*    yarn create firecms-app --pro*/}
                        {/*</div>*/}

                    </div>
                </Panel>
            </div>

        </div>
    );
}
