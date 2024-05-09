import React from "react";
import HeroButtons from "./HeroButtons";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
import { Panel } from "../general/Panel";

function GetStarted() {
    return (
        <Panel color={"light"}>

            <div
                className="max-w-3xl mx-auto text-center pb-8">
                <h2 className="h2 mb-4 gradient-text mx-auto"
                    data-aos="zoom-y-out">
                    Ready to start using real AI?
                </h2>

                <HeroButtons/>
            </div>


        </Panel>
    );
}

export default GetStarted;
