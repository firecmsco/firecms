import React from "react";
import { Panel } from "../general/Panel";
// @ts-ignore
import pixelGeniusLogin from "@site/static/img/pixel_genius_login.mp4";
// @ts-ignore
import overlay from "@site/static/img/overlay.webp";
import { BrowserFrame } from "../BrowserFrame";


export function PublicFacingApps() {
    return <Panel color={"light"}>

        {/* Two column layout*/}
        <div className="">
            <div>
                <h2 className={"h2 mb-3 uppercase font-mono"}>
                    Public Facing Applications
                </h2>
                <p className="text-xl md:text-2xl">
                    If you are building a public facing application based on Firebase, FireCMS PRO is the perfect
                    solution for you. Define exactly what each user can do and customize the experience for each role.
                </p>
                <p className="text-xl md:text-2xl">
                    Use all the internal components of FireCMS, including the schema editor, data inference, advanced
                    data import and export, default roles and more.
                </p>
            </div>
            <div className={"relative p-16 mb-32"}>
                <BrowserFrame
                    className={
                        " md:w-[800px] bg-gray-900"
                    }>

                    <img loading="lazy"
                         src={overlay}
                         className={"rounded-xl"}
                         alt="Overlay"/>
                </BrowserFrame>
                <video
                    className={"absolute z-10"}
                    style={{
                        top: "50%",
                        right: 0,
                        maxWidth: "900px",
                        aspectRatio: 631 / 337.828
                    }}
                    width="100%"
                    loop autoPlay muted>
                    <source
                        src={pixelGeniusLogin}
                        type="video/mp4"/>
                </video>

            </div>
        </div>
    </Panel>
}
