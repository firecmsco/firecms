import React from "react";

import { Panel } from "../general/Panel";
import { CTACaret, CTAOutlinedButtonWhiteMixin } from "../styles";
import { AnimatedGradientBackground } from "../AnimatedGradientBackground";

function ProTeaser() {

    return (
        <div className={"w-full relative bg-gray-900 overflow-hidden mt-16"}>
            <AnimatedGradientBackground translateY={-600}/>
            <Panel className={"relative"}>


                <h3 className={"mb-3 uppercase font-mono"}>
                    Go Pro for a completely customizable experience
                </h3>
                <p className="text-xl md:text-2xl">
                    If you want a self-hosted solution, with a completely customizable experience, FireCMS PRO is the
                    way to go.
                </p>
                <p className="text-xl md:text-2xl">
                    Customizable, extensible and with a strong focus on developer experience, FireCMS PRO is the perfect
                    solution for your next project.
                </p>
                <a
                    className={CTAOutlinedButtonWhiteMixin}
                    href={"/pro"}
                >
                    More details
                    <CTACaret/>
                </a>
            </Panel>
        </div>

        // <Panel includeMargin={false} color={"light_gray"}>
        //     <p className={"h2"}>
        //         FireCMS is used by companies of all sizes
        //     </p>
        //     <p className={"text-xl md:text-2xl"}>
        //         <b>Boost</b> your app development speed with a suite of helpful
        //         features.
        //
        //     </p>
        //     <p className={"text-xl"}>
        //         FireCMS enables users to efficiently manage and publish content
        //         for their websites or applications. Additionally, it can be
        //         utilized internally by teams for streamlined data management and
        //         workflow organization. With FireCMS, users can effortlessly <b>create
        //         and edit documents, upload and manage media files, and
        //         oversee users and permissions.</b>
        //     </p>
        //
        // </Panel>
    );
}

export default ProTeaser;
