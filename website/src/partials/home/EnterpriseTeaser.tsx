import React from "react";

// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";
// @ts-ignore
import pricePreview from "@site/static/img/price.png";

// @ts-ignore
import editingDemoVideo from "@site/static/img/editing_demo.mp4";
// @ts-ignore
import editingDemoDarkVideo from "@site/static/img/editing_demo_dark.mp4";
// @ts-ignore
import customFieldVideo from "@site/static/img/custom_fields.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";
import { Panel } from "../general/Panel";
import { CTACaret, CTAOutlinedButtonMixin } from "../utils";
import useBaseUrl from "@docusaurus/useBaseUrl";

function EnterpriseTeaser() {

    return (
        <Panel includeMargin={true} color={"gray"}>
            <p className={"h2"}>
                FireCMS is used by companies of all sizes
            </p>
            <p className={"text-xl md:text-2xl"}>
                <b>Boost</b> your app development speed with a suite of helpful
                features.

            </p>
            <p className={"text-xl"}>
                FireCMS enables users to efficiently manage and publish content
                for their websites or applications. Additionally, it can be
                utilized internally by teams for streamlined data management and
                workflow organization. With FireCMS, users can effortlessly <b>create
                and edit documents, upload and manage media files, and
                oversee users and permissions.</b>
            </p>
            <p className={"text-xl"}>
                FireCMS imposes no data structure restrictions, allowing
                seamless integration with any project right from the start.
            </p>
            <a
                className={CTAOutlinedButtonMixin}
                href={useBaseUrl("enterprise/")}
            >
                More details
                <CTACaret/>
            </a>

        </Panel>
    );
}

export default EnterpriseTeaser;
