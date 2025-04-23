import React from "react";

// @ts-ignore
import MMLogo from "@site/static/img/logos/mm_logo.webp";
// @ts-ignore
import ProtonLogo from "@site/static/img/logos/proton_logo.webp";
// @ts-ignore
import WithULogo from "@site/static/img/logos/withu.png";
// @ts-ignore
import DearDocLogo from "@site/static/img/logos/deardoc.png";

import TPALogo from "@site/static/img/logos/the_planet_app_logo.svg";
import SocialIncomeLogo from "@site/static/img/logos/social_income_logo.svg";
import MindSwitchLogo from "@site/static/img/logos/mindswitch_logo.svg";
import OikosLogo from "@site/static/img/logos/oikos_logo.svg";
import GearFocusLogo from "@site/static/img/logos/gearfocus_logo.svg";
import ClarIoLogo from "@site/static/img/logos/clario.svg";

import { Panel } from "../general/Panel";
import Marquee from "react-fast-marquee";

export function StartupLogos() {

    return <Panel color={"light"} container={false}>

        <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true}
                 gradientColor={"rgb(237 237 237)"}>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DearDoc"
                href={"https://www.getdeardoc.com"}>
                <img loading="lazy" src={DearDocLogo}
                     alt="DearDoc Logo"
                     className="w-44 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MedicalMotion"
                href={"https://medicalmotion.com"}>
                <img loading="lazy" src={MMLogo}
                     alt="MedicalMotion Logo"
                     className="w-44 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Proton Health"
                href={"https://www.proton-health.com"}>
                <img loading="lazy" src={ProtonLogo}
                     alt="Proton Health"
                     className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WithU training"
                href={"https://www.withuapp.com//"}>

                <img loading="lazy" src={WithULogo}
                     alt="WithU"
                     className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Planet App"
                href={"https://theplanetapp.com"}>
                <TPALogo className="w-56 m-4"/>
            </a>

            <a className="flex h-min transition-colors text-gray-700 !no-underline rounded-button-md px-1 m-4 font-serif text-2xl font-extrabold !hover:no-underline hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-900"
               href="https://claimgem.com/">ClaimGem</a>

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
                aria-label="Clario"
                rel="noopener noreferrer"
                href={"https://clario.co/"}>
                <ClarIoLogo
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
            <a
                target="_blank"
                aria-label="Mindswitch"
                rel="noopener noreferrer"
                href={"https://www.mindswitch.me/"}>
                <MindSwitchLogo
                    className="w-48 m-4"/>
            </a>
        </Marquee>
    </Panel>;

}
