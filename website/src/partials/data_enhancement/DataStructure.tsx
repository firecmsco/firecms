import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import translationLight from "@site/static/img/data/translations_light.png";
// @ts-ignore
import translationDark from "@site/static/img/data/translations_dark.png";
import { Panel } from "../general/Panel";
import {
    CTAButtonMixin,
    CTACaret,
    CTAOutlinedButtonWhiteMixin
} from "../utils";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function DataStructure() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (

        <Panel color={"secondary"}>
            <h2 className="h2 mb-4">
                AI for your structured data
            </h2>
            <p className="text-2xl">
                FireCMS understands your data structure and is able to adapt
                the outcome of ChatGPT. Improve your data entry with the click
                of a button. FireCMS will understand the context of your data
                and will be able to generate the most relevant content.
            </p>
            <p className="text-xl">
                It can handle <b>strings, numbers,
                enumerations, arrays, objects, and more.</b>
            </p>

            <a
                className={CTAOutlinedButtonWhiteMixin + "  sm:mb-0 w-full sm:w-auto rounded"}
                href={useBaseUrl("docs/openai")}
            >
                Get started
                <CTACaret/>
            </a>
            <p
                className={"mt-4"}>
                <a
                    className={" text-white"}
                    rel="noopener noreferrer"
                    target="_blank"
                    href={"https://app.firecms.co/subscriptions"}
                >
                    Go to subscriptions management
                </a>
            </p>
        </Panel>
    );
}
