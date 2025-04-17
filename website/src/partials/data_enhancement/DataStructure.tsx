import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import translationLight from "@site/static/img/data/translations_light.png";
// @ts-ignore
import translationDark from "@site/static/img/data/translations_dark.png";
import { Panel } from "../general/Panel";
import { CTACaret, CTAOutlinedButtonWhiteMixin } from "../styles";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function DataStructure() {

    const { colorMode } = useColorMode();
    return (

        <Panel color={"primary"}>
            <h2 className="mb-4">
                Harness AI for Your Structured Data
            </h2>
            <p className="text-2xl">
                FireCMS intelligently comprehends your data structure, enabling
                seamless adaption
                of ChatGPT-generated outcomes. Enhance your data input
                effortlessly with a single click.
                FireCMS grasps the context of your data, generating highly
                relevant content.
            </p>
            <p className="text-xl">
                It&#39;s proficient in handling <b>strings, numbers,
                enumerations, arrays, objects, and more.</b>
            </p>
        </Panel>
    );
}
