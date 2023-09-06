import React from "react";
import { CTACaret, CTAOutlinedButtonMixin } from "../utils";
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

        <div className={"flex gap-4"}>

            <div
                className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                yarn create firecms-app
            </div>

            <a
                className={CTAOutlinedButtonMixin}
                href={useBaseUrl("docs/")}
            >
                Docs
                <CTACaret/>
            </a>
            <a
                className={CTAOutlinedButtonMixin}
                href={"https://demo.firecms.co"}
            >
                See self-hosted demo
                <CTACaret/>
            </a>
        </div>
    </Panel>;

}
