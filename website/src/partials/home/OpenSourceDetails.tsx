import React from "react";
import HeroButtons from "./HeroButtons";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
import { ContainerMixin, ContainerPaddingMixin } from "../styles";
import clsx from "clsx";
import { Panel } from "../general/Panel";

function OpenSourceDetails() {
    return (
        <Panel color={"lighter"}>

                <div className="text-text-primary">
                    <div
                        className="max-w-3xl mx-auto text-center pb-8">
                        <h2 className="h2 mb-4"
                            data-aos="zoom-y-out">
                            All the power of Firebase and open source
                        </h2>
                        <p className="text-xl md:text-2xltext-text-primary"
                           data-aos="zoom-y-out">
                            Extend the functionality of your admin panel and
                            your complete project with all the capabilities of
                            Firebase and Google Cloud.
                        </p>
                        <HeroButtons/>
                    </div>


                </div>
        </Panel>
    );
}

export default OpenSourceDetails;
