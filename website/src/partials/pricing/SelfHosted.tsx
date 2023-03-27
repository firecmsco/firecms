import React from "react";
import { ThreeColumns } from "../general/ThreeColumns";
import {
    ContainerMixin,
    CTAButtonMixin,
    CTACaret,
    CTAOutlinedButtonMixin
} from "../utils";
import { Panel } from "../general/Panel";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function SelfHosted() {

    return <Panel includeMargin={true} centered={false}>

        <h2 className={"text-3xl md:text-4xl font-bold my-2"}>
            Self-hosted mode
        </h2>

        <p className={"text-lg"}>
            With our self-hosted option, you'll have
            access to all of our open-source core features at <b>no cost</b>.
            Simply download and install on your own infrastructure,
            and enjoy complete control and customization.
        </p>

        <p className={"text-lg"}>
            Self-hosted mode is perfect for developers who want to
            build <b>custom features</b>.
        </p>

        <a
            className={CTAOutlinedButtonMixin}
            href={useBaseUrl("docs/")}
        >
            Go to docs
            <CTACaret/>
        </a>
    </Panel>;

}
