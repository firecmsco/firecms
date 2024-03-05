import React from "react";
import { Panel } from "../general/Panel";
// @ts-ignore
import pixelGeniusLogin from "@site/static/img/pixel_genius_login.mp4";
// @ts-ignore
import overlay from "@site/static/img/overlay.webp";
import { BrowserFrame } from "../BrowserFrame";


export function PublicFacingApps() {
    return <Panel color={"light"} className={"overflow-hidden"}>

        {/* Two column layout*/}
        <div className="">
            <div>
                <h2 className={"h2 mb-3 uppercase font-mono"}>
                    Public Facing Applications
                </h2>
                <p className="text-xl md:text-2xl">
                    If you are building a CRUD public facing application based on Firebase, FireCMS PRO is the perfect
                    solution for you. Define exactly what each user can do and customize the experience for each role.
                </p>
                <p className="text-xl md:text-2xl">
                    Use all the internal components of FireCMS, including the schema editor, data inference, advanced
                    data import and export, default roles and more.
                </p>
                <p className={"text-xl md:text-2xl"}>
                    With your FireCMS PRO license, you can build projects with <span className={"gradient-text"}>unlimited users</span>.
                </p>
            </div>
            <div className={"relative p-16 "}>
                <BrowserFrame
                    style={{
                        marginBottom: "20%"
                    }}
                    className={
                        "md:w-[800px] bg-gray-900"
                    }>

                    <img loading="lazy"
                         src={overlay}
                         className={"rounded-xl"}
                         alt="Overlay"/>
                </BrowserFrame>
                <video
                    className={"absolute z-10 rounded-xl"}
                    style={{
                        bottom: 0,
                        right: "5%",
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

            <div className={"text-sm text-center p-8 text-gray-700"}>
                Pixel Genius is a public facing application that allows users to manage their augmented reality
                experiences. It is built on top of Firebase and uses FireCMS PRO, and it integrated the three.js
                editor.
            </div>
        </div>
    </Panel>
}
