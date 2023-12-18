import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

import { Panel } from "../general/Panel";
import { CTAOutlinedButtonMixin } from "../styles";

export function BatchProcessing() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <Panel color={"light"}>
            <p className="text-secondary uppercase font-mono font-bold ">
                Work smarter, not harder
            </p>
            <p className={"h2"}>
                Do you need to create a lot of content?
            </p>
            <p className={"text-xl"}>
                Whether you need to create new content or enhance your existing
                material, we've got you covered.
            </p>
            <p className={"text-xl"}>
                Reach out to us for a tailor-made solution that saves you time
                and money.
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
