import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import MMLogo from "@site/static/img/logos/mm_logo.webp";
// @ts-ignore
import ProtonLogo from "@site/static/img/logos/proton_logo.webp";
// @ts-ignore
import SomnioLogoLight from "@site/static/img/logos/logo_somnio.webp";

import TPALogo from "@site/static/img/logos/the_planet_app_logo.svg";
import SocialIncomeLogo from "@site/static/img/logos/social_income_logo.svg";
import MindSwitchLogo from "@site/static/img/logos/mindswitch_logo.svg";
import OikosLogo from "@site/static/img/logos/oikos_logo.svg";
import GearFocusLogo from "@site/static/img/logos/gearfocus_logo.svg";

import { Panel } from "../general/Panel";
import Marquee from "react-fast-marquee";

export function Companies() {

    return <Panel color={"light"} container={false}>

        <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true} gradientColor={"#f3f4f6"}>

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

                <img loading="lazy" src={SomnioLogoLight}
                     alt="Somnio Logo"
                     className="w-48 m-4"/>
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
    </Panel>;

}
