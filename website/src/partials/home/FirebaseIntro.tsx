import React from "react";
// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";
// @ts-ignore
import TailwindLogo from "@site/static/img/tailwind_logo.svg";
import { FireCMSLogo } from "../FireCMSLogo";
import { defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { Panel } from "../general/Panel";
import { LinedSpace } from "../layout/LinedSpace";

function FirebaseIntro() {
    return (
        <Panel color={"white"}
               includePadding={false}
               includeMargin={false}>

            <LinedSpace size={"large"}/>

            <div className={clsx("relative flex justify-center mb-12 border-b border-0", defaultBorderMixin)}
                 data-aos="fade-up">
                <div
                    className="flex flex-row gap-8 md:gap-12 justify-center items-center p-4">

                    <FirebaseLogo
                        style={{
                            width: 130,
                            height: 150,
                            maxWidth: "30%"
                        }}/>
                    <ReactLogo
                        style={{
                            width: 150,
                            height: 150,
                            maxWidth: "35%"
                        }}/>
                    <TailwindLogo
                        style={{
                            width: 140,
                            height: 150,
                            maxWidth: "30%"
                        }}/>
                    <FireCMSLogo/>
                </div>
            </div>

            <div
                data-aos="fade-up"
                data-aos-delay="50"
                className="max-w-5xl mx-auto text-center mb-12">
                <h2 className="h1 mb-4 mt-4 gradient-text uppercase m-auto">
                    Much more than a CMS
                </h2>
                <p className="text-xl md:text-2xl">
                    <b>FireCMS</b> is an open source headless admin panel built by <b>developers
                    for developers</b>.
                    <br/>
                    Get a back-office app/dashboard for your Firebase project in
                    <b> no time</b>.
                </p>
            </div>

            <LinedSpace size={"larger"} position={"top"}/>
        </Panel>
    );
}

export default FirebaseIntro;
