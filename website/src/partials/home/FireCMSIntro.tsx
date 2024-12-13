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

function FireCMSIntro() {
    return (
        <Panel color={"light-to-white"}
               container={false}
               includePadding={false}
               includeMargin={false}>

            <LinedSpace size={"larger"}/>

            <div className={clsx("relative flex justify-center mb-8 border-b border-0", defaultBorderMixin)}>
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
                className="max-w-5xl mx-auto text-center mb-12 px-8 py-8 md:px-8">
                <h1 className="mb-4 gradient-text uppercase m-auto">
                    Much more than a CMS
                </h1>
                <p className="text-xl md:text-2xl">
                    <b>FireCMS</b> is a platform upon which thousands of companies build their <b>back-office
                    applications</b>.
                    Open-source, headless, extensible, and fully customizable.
                    <br/>
                </p>
            </div>

            <LinedSpace size={"larger"} position={"top"}/>
        </Panel>
    );
}

export default FireCMSIntro;
