import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { easeInOut } from "./styles";

import { BrowserFrame } from "./BrowserFrame";
import { PhoneFrame } from "./PhoneFrame";
import { LinedSpace } from "./layout/LinedSpace";

export function UsageExamples() {

    const ref = useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = useState(0);

    useEffect(() => {
        const listener = () => {
            if (typeof window !== "undefined") {
                setScroll(window?.scrollY ?? 0)
            }
        };
        listener();
        if (typeof window !== "undefined")
            window.addEventListener("scroll", listener);
        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("scroll", listener);
        };
    }, []);

    const offsetHeight = ref.current?.offsetHeight ?? 0;
    const currentTop = ref.current?.getBoundingClientRect().top ?? 0;
    const parallaxOffset = easeInOut(Math.max(0, Math.min(1, (400 + currentTop / 2) / offsetHeight))) * 2 - 1;

    return <div ref={ref}
                  className={clsx("relative flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-200")}>

        <LinedSpace position={"bottom"} size={"larger"}/>

        <div className={"relative max-w-full w-[84rem] mx-auto"}
             style={{ height: 900 }}>

            {/* MM CMS */}
            <BrowserFrame
                style={{
                    left: -50 - 50 * parallaxOffset,
                    top: 120 - 20 * parallaxOffset,
                }}
                className={
                    "absolute z-20 w-[360px] md:w-[540px] bg-gray-900 max-w-[80vw]"
                }>
                <video
                    style={{
                        pointerEvents: "none",
                        aspectRatio: 540 / 515
                    }}
                    width="100%"
                    loop autoPlay muted>
                    <source
                        src="/img/custom_fields_dark.mp4"
                        type="video/mp4"/>
                </video>
            </BrowserFrame>

            {/* Overlay */}
            <BrowserFrame
                style={{
                    right: -30 + 20 * parallaxOffset,
                    top: -50 - 50 * parallaxOffset,
                }}
                className={
                    "absolute z-10 md:w-[800px] bg-gray-900"
                }>

                <img loading="lazy" src="/img/overlay.webp"
                     className={"rounded-xl"}
                     alt="Overlay"/>
            </BrowserFrame>

            {/* MM APP */}
            <div className="absolute z-20"
                 style={{
                     right: 500,
                     top: 180 + 40 * parallaxOffset,
                 }}>
                <PhoneFrame>
                    <img loading="lazy"
                         src="/img/mm_app.webp"
                         style={{
                             aspectRatio: 654 / 1336,
                         }}
                         alt="MedicalMotion App"
                         className=""/>
                </PhoneFrame>
            </div>

            {/* COURSES INLINE EDITING */}
            <BrowserFrame
                mode={"light"}
                style={{
                    top: 750 + 150 * (parallaxOffset),
                    left: 100
                }}
                className={
                    "absolute z-30 w-96 md:w-[720px] bg-gray-100"
                }>

                <img loading="lazy" src="/img/editor_white.png"
                     className={"rounded-xl"}
                     style={{
                         aspectRatio: 1280 / 700,
                     }}
                     alt="Editor"/>
                {/*<video*/}
                {/*    className={"rounded-xl"}*/}
                {/*    style={{*/}
                {/*        aspectRatio: 1968 / 1006*/}
                {/*    }}*/}
                {/*    width="100%"*/}
                {/*    loop autoPlay muted>*/}
                {/*    <source*/}
                {/*        src={inlineEditing}*/}
                {/*        type="video/mp4"/>*/}
                {/*</video>*/}
            </BrowserFrame>

            {/* TPA APP */}
            <div className="absolute top-64 z-30"
                 style={{
                     top: 400,
                     right: 100 - 100 * parallaxOffset,
                 }}>
                <PhoneFrame>
                    <video
                        style={{
                            pointerEvents: "none",
                            aspectRatio: 272 / 570,
                            background: "white"
                        }}
                        className={"max-w-sm rounded-xl"}
                        width="100%" loop autoPlay
                        muted>
                        <source src="/img/tpa_app.mp4"
                                type="video/mp4"/>
                    </video>
                </PhoneFrame>
            </div>
        </div>
        <div style={{ height: 300 }}></div>
    </div>;
}
