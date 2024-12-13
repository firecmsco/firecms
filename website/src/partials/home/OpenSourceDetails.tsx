import React from "react";
import HeroButtons from "./HeroButtons";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
import { Panel } from "../general/Panel";

function OpenSourceDetails() {
    return (
        <Panel color={"light"}>

            <div
                className="max-w-4xl mx-auto text-center pb-8">
                <h2 className="mb-4 font-mono mx-auto uppercase"
                    data-aos="zoom-y-out">
                    All the power of <span style={{ color: "#FF9100" }}>Firebase</span>/<span
                    style={{ color: "#00684A" }}>MongoDB</span><br/>
                    and open source
                </h2>
                <p className="text-xl md:text-2xl"
                   data-aos="zoom-y-out">
                    Extend the functionality of your admin panel and
                    your complete project with all the capabilities of
                    Firebase and Google Cloud, or MongoDB Atlas.
                </p>
                <HeroButtons/>
            </div>


        </Panel>
    );
}

export default OpenSourceDetails;
