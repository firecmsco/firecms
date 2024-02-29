import React from "react";

import { Panel } from "../general/Panel";
import { CTACaret, CTAOutlinedButtonMixin } from "../styles";
import useBaseUrl from "@docusaurus/useBaseUrl";

function ProTeaser() {

    return (
        <Panel>
            <h2 className={"h2 mb-3 uppercase font-mono"}>
                Go Pro for a completely customizable experience
            </h2>
            <p className="text-xl md:text-2xl">
                If you want a self-hosted solution, with a completely customizable experience, FireCMS PRO is the
                way to go.
            </p>
            <p className="text-xl md:text-2xl">
                Customizable, extensible and with a strong focus on developer experience, FireCMS PRO is the perfect
                solution for your next project.
            </p>
            <a
                className={CTAOutlinedButtonMixin}
                href={useBaseUrl("pro/")}
            >
                More details
                <CTACaret/>
            </a>
        </Panel>

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
