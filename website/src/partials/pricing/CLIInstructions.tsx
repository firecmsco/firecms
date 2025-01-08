import React from "react";
import { CTACaret, CTAOutlinedButtonMixin } from "../styles";
import { Panel } from "../general/Panel";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function CLIInstructions() {

    return <Panel color={"light"}
                  includeMargin={false}
        // centered={false}
                  includePadding={true}>

        <h2 className={"mb-3 uppercase font-mono"}>
            Start hacking today
        </h2>

        <p className={"text-lg"}>
            Use our <b>CLI</b> to get started right away.
        </p>

        <p className={"text-lg"}>
            By using the CLI to initialize
            your project, you can customize your CMS in multiple ways, including <b>custom form
            fields</b>, <b>actions</b>, <b>views</b>, <b>custom business logic</b> and <b>authentication</b>.
        </p>

        <p className={"text-lg"}>
            This way you can create a CMS tailored to your needs.
        </p>

        {/*<p className={"font-mono uppercase font-bold mb-2 mt-6"}>FireCMS Cloud</p>*/}
        <div className={"flex gap-4 items-center flex-col md:flex-row"}>

            <div
                className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                npx create-firecms-app
            </div>
            or
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
        {/*<p className={"font-mono uppercase font-bold mb-2 mt-6"}>FireCMS PRO</p>*/}
        {/*<div className={"flex gap-4 items-center flex-col md:flex-row"}>*/}

        {/*    <div*/}
        {/*        className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>*/}
        {/*        npx create-firecms-app --pro*/}
        {/*    </div>*/}
        {/*    or*/}
        {/*    <div*/}
        {/*        className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-200 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>*/}
        {/*        yarn create firecms-app --pro*/}
        {/*    </div>*/}

        {/*    <a*/}
        {/*        className={CTAOutlinedButtonMixin}*/}
        {/*        href={useBaseUrl("docs/pro")}*/}
        {/*    >*/}
        {/*        Docs*/}
        {/*        <CTACaret/>*/}
        {/*    </a>*/}
        {/*    /!*<a*!/*/}
        {/*    /!*    className={CTAOutlinedButtonMixin}*!/*/}
        {/*    /!*    href={"https://demo.firecms.co"}*!/*/}
        {/*    /!*>*!/*/}
        {/*    /!*    See self-hosted demo*!/*/}
        {/*    /!*    <CTACaret/>*!/*/}
        {/*    /!*</a>*!/*/}
        {/*</div>*/}
    </Panel>;

}
