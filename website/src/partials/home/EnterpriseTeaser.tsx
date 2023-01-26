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
            <p className={"text-xl"}>
                It comes with a
                set of features that will help you build your
                application <strong>faster</strong>.
            </p>
            <p className={"text-base"}>
                FireCMS allows users to
                manage and publish content to their websites or
                applications. But not only... it can be used
                internally in teams to manage data and workflows.
                With FireCMS, users can create and edit documents,
                upload and manage media files, and manage users and
                permissions.
            </p>
            <p className={"text-base"}>
                FireCMS does not enforce any data structure on your
                side, and works out of the box with any project.
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
