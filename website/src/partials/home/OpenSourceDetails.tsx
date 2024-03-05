import React from "react";
import HeroButtons from "./HeroButtons";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
import { Panel } from "../general/Panel";

function OpenSourceDetails() {
    return (
        <Panel color={"light"}>

            <div
                className="max-w-3xl mx-auto text-center pb-8">
                <h2 className="h2 mb-4 gradient-text mx-auto"
                    data-aos="zoom-y-out">
                    All the power of Firebase and open source
                </h2>
                <p className="text-xl md:text-2xl"
                   data-aos="zoom-y-out">
                    Extend the functionality of your admin panel and
                    your complete project with all the capabilities of
                    Firebase and Google Cloud.
                </p>
                <HeroButtons/>
            </div>


        </Panel>
    );
}

export default OpenSourceDetails;
