import React from "react";
import { CTACaret, CTAOutlinedButtonMixin } from "../styles";
import { Panel } from "../general/Panel";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function CLIInstructions() {

    return <Panel color={"gray"} includeMargin={false} centered={false}>

        <h2 className={"text-3xl md:text-4xl font-bold my-2"}>
            Start hacking today
        </h2>

        <p className={"text-lg"}>
            Use our <b>CLI</b> to create a new project and start
            hacking right away.
        </p>

        <p className={"text-lg"}>
            If you are on paying plan you can use the CLI to initialize
            your project with <b>custom fields</b> and <b>custom views</b>.
            This way you can create a CMS tailored to your needs.
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
            {/*<a*/}
            {/*    className={CTAOutlinedButtonMixin}*/}
            {/*    href={"https://demo.firecms.co"}*/}
            {/*>*/}
            {/*    See self-hosted demo*/}
            {/*    <CTACaret/>*/}
            {/*</a>*/}
        </div>
    </Panel>;

}
