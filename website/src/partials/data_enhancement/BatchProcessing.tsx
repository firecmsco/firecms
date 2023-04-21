import React from "react";
import { BrowserFrame } from "../BrowserFrame";
import { TwoColumns } from "../general/TwoColumns";
import { useColorMode } from "@docusaurus/theme-common";

import { Panel } from "../general/Panel";
import { CTAOutlinedButtonMixin, CTAOutlinedButtonWhiteMixin } from "../utils";

export function BatchProcessing() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <Panel color={"gray"}>
            <p className="text-secondary uppercase font-bold ">
                Work smarter, not harder
            </p>
            <p className={"h2"}>
                Do you need to create a lot of content?
            </p>
            <p className={"text-xl"}>
                If you either need to create a lot of new content or you need to
                enhance the content you already have, we can help you.
            </p>
            <p className={"text-xl"}>
                Get in touch with us and we will help you build a custom solution
                that will save you time and money.
            </p>
            <a href="mailto:hello@firecms.co?subject=OpenAI%20Batch%20processing"
               rel="noopener noreferrer"
               target="_blank"
               className={CTAOutlinedButtonMixin + " mb-8"}>
                Get in touch
            </a>
        </Panel>
    );
}
