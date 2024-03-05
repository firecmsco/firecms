import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import MMLogo from "@site/static/img/logos/mm_logo.webp";
// @ts-ignore
import ProtonLogo from "@site/static/img/logos/proton_logo.webp";

import SomnioLogoLight from "@site/static/img/logos/logo_somnio.svg";
// @ts-ignore
import MMLogoDark from "@site/static/img/logos/mm_logo_white.webp";
import TPALogo from "@site/static/img/logos/the_planet_app_logo.svg";
import SocialIncomeLogo from "@site/static/img/logos/social_income_logo.svg";
import MindSwitchLogo from "@site/static/img/logos/mindswitch_logo.svg";
import OikosLogo from "@site/static/img/logos/oikos_logo.svg";
import GearFocusLogo from "@site/static/img/logos/gearfocus_logo.svg";

import { Panel } from "../general/Panel";
import Marquee from "react-fast-marquee";

export function Companies() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";

    return <Panel color={"light"}>

        <h2 className={"text-2xl text-center text-gray-600 dark:text-gray-400"}>
            Trusted by
        </h2>

        <Marquee className={"rounded-xl space-x-4"} pauseOnHover={true} gradient={true} gradientColor={"#e7e7eb"}>

            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MedicalMotion"
                href={"https://medicalmotion.com"}>
                <img loading="lazy" src={MMLogo}
                     alt="MedicalMotion Logo"
                     className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Proton Health"
                href={"https://www.proton-health.com"}>
                <img loading="lazy" src={ProtonLogo}
                     alt="MedicalMotion Logo"
                     className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Somnio Software"
                href={"https://www.somniosoftware.com/"}>
                <SomnioLogoLight className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Planet App"
                href={"https://theplanetapp.com"}>
                <TPALogo className="w-56 m-4"/>
            </a>
            <a
                target="_blank"
                aria-label="Social Income"
                rel="noopener noreferrer"
                href={"https://socialincome.org"}>
                <SocialIncomeLogo className="w-48 h-auto m-4"/>
            </a>
            <a
                target="_blank"
                aria-label="Oikosbrain"
                rel="noopener noreferrer"
                href={"https://oikosbrain.com"}>
                <OikosLogo className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                aria-label="Mindswitch"
                rel="noopener noreferrer"
                href={"https://www.mindswitch.me/"}>
                <MindSwitchLogo
                    className="w-52 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GearFocus"
                href={"https://www.gearfocus.com/"}>
                <GearFocusLogo
                    className="w-52 m-4"/>
            </a>
        </Marquee>
        <p className={"text-sm text-center font-bold text-gray-600"}>...and thousands more!</p>
    </Panel>;

}
