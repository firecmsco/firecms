import React from "react";
// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";
// @ts-ignore
import TailwindLogo from "@site/static/img/tailwind_logo.svg";
// @ts-ignore
import TypescriptLogo from "@site/static/img/typescript_logo.svg";
import { defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { Panel } from "../general/Panel";
import { LinedSpace } from "../layout/LinedSpace";

function FireCMSIntro() {
    return (
        <Panel color={"dark_gray"}
               container={false}
               innerClassName={"flex flex-col"}
               includePadding={false}
               includeMargin={false}>

            <a href="/llms.txt"
               target={"_blank"}
               rel={"noreferrer"}
               className="mx-auto justify-center uppercase mt-16 inline-flex items-center text-white bg-gray-950 hover:bg-gray-800 focus:ring-4 font-semibold rounded-lg text-sm px-5 py-2.5 text-center focus:ring-primary-900 hover:no-underline">
                ✨ AI docs ready!
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                     xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"></path>
                </svg>
            </a>

            <LinedSpace size={"medium"}/>

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
                    <TypescriptLogo
                        style={{
                            width: 130,
                            height: 130,
                            maxWidth: "30%"
                        }}/>
                    {/*<FireCMSLogo/>*/}
                </div>
            </div>

            <div
                className="max-w-5xl mx-auto text-center mb-12 px-8 py-4 md:px-8">
                <h2 className="mb-4 gradient-text uppercase m-auto">
                    Much more than a CMS
                </h2>
                <p className="text-xl md:text-2xl">
                    <b>FireCMS</b> is a platform upon which thousands of companies build their <b>back-office
                    applications</b> and <b>admin panels</b>.
                    Open-source, headless, extensible, and fully customizable.
                    <br/>
                </p>
            </div>

            <LinedSpace size={"larger"} position={"top"}/>
        </Panel>
    );
}

export default FireCMSIntro;
