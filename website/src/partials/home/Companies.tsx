import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import MMLogo from "@site/static/img/logos/mm_logo.webp";
// @ts-ignore
import MMLogoDark from "@site/static/img/logos/mm_logo_white.webp";
import TPALogo from "@site/static/img/logos/the_planet_app_logo.svg";
import TPALogoDark from "@site/static/img/logos/the_planet_app_logo_dark.svg";
import SocialIncomeLogo from "@site/static/img/logos/social_income_logo.svg";
import MindSwitchLogo from "@site/static/img/logos/mindswitch_logo.svg";
import MindSwitchLogoDark
    from "@site/static/img/logos/mindswitch_logo_white.svg";
import { Panel } from "../general/Panel";

export function Companies() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return <Panel color={"gray"}>

        <h2 className={"text-2xl text-center p-1 text-gray-500 dark:text-gray-400"}>
            Trusted by
        </h2>
        <div
            className={"mx-auto px-4 sm:px-6 mb-8 flex items-center flex-wrap justify-center"}>
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={"https://medicalmotion.com"}>
                <img src={isDarkTheme ? MMLogoDark : MMLogo}
                     alt="MedicalMotion Logo"
                     className="w-48 h-min aspect-auto m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={"https://theplanetapp.com"}>
                {isDarkTheme ?
                    <TPALogoDark className="w-56 h-min aspect-auto m-4"/> :
                    <TPALogo
                        className="w-56 h-min aspect-auto m-4"/>}
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={"https://socialincome.org"}>
                <SocialIncomeLogo className="w-48 h-min aspect-auto m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={"https://www.mindswitch.me/"}>
                {isDarkTheme ?
                    <MindSwitchLogoDark
                        className="w-52 h-min aspect-auto m-4"/> :
                    <MindSwitchLogo
                        className="w-52 h-min aspect-auto m-4"/>}
            </a>
        </div>
        <div
            className={" text-gray-500 dark:text-gray-400 text-center text-sm"}>
            To get your project featured here, please contact us at <a
            className={"font-bold text-gray-500 dark:text-gray-400"}
            href="mailto:hello@firecms.co?subject=FireCMS%20feature%20project"
            rel="noopener noreferrer"
            target="_blank"
        >
            hello@firecms.co
        </a>
        </div>
    </Panel>;

}
