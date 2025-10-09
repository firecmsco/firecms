import React from "react";
import { Panel } from "../general/Panel";
import Marquee from "react-fast-marquee";

// @ts-ignore
const MMLogo = "/img/logos/mm_logo.webp";
// @ts-ignore
const ProtonLogo = "/img/logos/proton_logo.webp";
// @ts-ignore
const WithULogo = "/img/logos/withu.png";
// @ts-ignore
const DearDocLogo = "/img/logos/deardoc.png";

// @ts-ignore
const TPALogo = "/img/logos/the_planet_app_logo.svg";
// @ts-ignore
const SocialIncomeLogo = "/img/logos/social_income_logo.svg";
// @ts-ignore
const MindSwitchLogo = "/img/logos/mindswitch_logo.svg";
// @ts-ignore
const OikosLogo = "/img/logos/oikos_logo.svg";
// @ts-ignore
const GearFocusLogo = "/img/logos/gearfocus_logo.svg";
// @ts-ignore
const ClarIoLogo = "/img/logos/clario.svg";

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

            <a className="flex h-min transition-colors text-gray-700 !no-underline rounded-button-md px-1 m-4 font-serif text-2xl font-extrabold !hover:no-underline hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-900"
               href="https://claimgem.com/">ClaimGem</a>

            <a
                target="_blank"
                aria-label="Social Income"
                rel="noopener noreferrer"
                href={"https://socialincome.org"}>
                <img loading="lazy" src={SocialIncomeLogo} className="w-48 h-auto m-4" alt="Social Income"/>
            </a>
            <a
                target="_blank"
                aria-label="Clario"
                rel="noopener noreferrer"
                href={"https://clario.co/"}>
                <img loading="lazy" src={ClarIoLogo} className="w-52 m-4" alt="Clario"/>
            </a>
            <a
                target="_blank"
                aria-label="GearFocus"
                href={"https://www.gearfocus.com/"}>
                <img loading="lazy" src={GearFocusLogo} className="w-52 m-4" alt="GearFocus"/>
            </a>
            <a
                target="_blank"
                aria-label="Mindswitch"
                rel="noopener noreferrer"
                href={"https://www.mindswitch.me/"}>
                <img loading="lazy" src={MindSwitchLogo} className="w-48 m-4" alt="Mindswitch"/>
            </a>
        </Marquee>
    </Panel>;

}
