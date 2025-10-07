import React from "react";
import Marquee from "react-fast-marquee";

// Startup Logos
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

// Agency Logos
// @ts-ignore
import SomnioLogoLight from "@site/static/img/logos/logo_somnio.webp";
// @ts-ignore
import ICodeLabsLogo from "@site/static/img/logos/icodelabs.png";
// @ts-ignore
import RiverstoneLogo from "@site/static/img/logos/riverstone.png";
import ViscapLogo from "@site/static/img/logos/viscap.svg";
import KodeCreatorsLogo from "@site/static/img/logos/kodecreators.svg";
import BitForgeLogo from "@site/static/img/logos/bitforge.svg";
import FycLogo from "@site/static/img/logos/fyc.svg";
import NFQLogo from "@site/static/img/logos/nfq.svg";
import AbacusLogo from "@site/static/img/logos/abacus.svg";
import { Panel } from "./general/Panel";

export function ClientLogos() {

    const startupLogos = [
        <a
            key="deardoc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="DearDoc"
            href={"https://www.getdeardoc.com"}>
            <img loading="lazy" src={DearDocLogo}
                 alt="DearDoc Logo"
                 className="w-44 m-4"/>
        </a>,
        <a
            key="medicalmotion"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MedicalMotion"
            href={"https://medicalmotion.com"}>
            <img loading="lazy" src={MMLogo}
                 alt="MedicalMotion Logo"
                 className="w-44 m-4"/>
        </a>,
        <a
            key="proton"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Proton Health"
            href={"https://www.proton-health.com"}>
            <img loading="lazy" src={ProtonLogo}
                 alt="Proton Health"
                 className="w-48 m-4"/>
        </a>,
        <a
            key="withu"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WithU training"
            href={"https://www.withuapp.com//"}>
            <img loading="lazy" src={WithULogo}
                 alt="WithU"
                 className="w-48 m-4"/>
        </a>,
        <a
            key="planetapp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="The Planet App"
            href={"https://theplanetapp.com"}>
            <TPALogo className="w-56 m-4"/>
        </a>,
        <a key="claimgem" className="flex h-min transition-colors text-gray-700 !no-underline rounded-button-md px-1 m-4 font-serif text-2xl font-extrabold !hover:no-underline hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-900"
           href="https://claimgem.com/">ClaimGem</a>,
        <a
            key="socialincome"
            target="_blank"
            aria-label="Social Income"
            rel="noopener noreferrer"
            href={"https://socialincome.org"}>
            <SocialIncomeLogo className="w-48 h-auto m-4"/>
        </a>,
        <a
            key="oikos"
            target="_blank"
            aria-label="Oikosbrain"
            rel="noopener noreferrer"
            href={"https://oikosbrain.com"}>
            <OikosLogo className="w-48 m-4"/>
        </a>,
        <a
            key="clario"
            target="_blank"
            aria-label="Clario"
            rel="noopener noreferrer"
            href={"https://clario.co/"}>
            <ClarIoLogo
                className="w-52 m-4"/>
        </a>,
        <a
            key="gearfocus"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GearFocus"
            href={"https://www.gearfocus.com/"}>
            <GearFocusLogo
                className="w-52 m-4"/>
        </a>,
        <a
            key="mindswitch"
            target="_blank"
            aria-label="Mindswitch"
            rel="noopener noreferrer"
            href={"https://www.mindswitch.me/"}>
            <MindSwitchLogo
                className="w-48 m-4"/>
        </a>
    ];

    const agencyLogos = [
        <a
            key="bitforge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="BitForge"
            href={"https://bitforge.ch/"}>
            <BitForgeLogo
                className="w-48 m-4"/>
        </a>,
        <a
            key="somnio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Somnio Software"
            href={"https://www.somniosoftware.com/"}>
            <img loading="lazy" src={SomnioLogoLight}
                 alt="Somnio Logo"
                 className="w-48 m-4"/>
        </a>,
        <a
            key="riverstone"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Riverstone"
            href={"https://www.riverstonetech.com/"}>
            <img loading="lazy" src={RiverstoneLogo}
                 alt="Riverstone Logo"
                 className="w-48 m-4"/>
        </a>,
        <a
            key="icodelabs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ICode Labs"
            href={"https://icodelabs.co/"}>
            <img loading="lazy" src={ICodeLabsLogo}
                 alt="ICode Labs Logo"
                 className="w-48 m-4"/>
        </a>,
        <a
            key="nfq"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="NFQ"
            href={"https://www.nfq.com/"}>
            <NFQLogo
                className="w-44 m-4"/>
        </a>,
        <a
            key="fyc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FYC Labs"
            href={"https://fyclabs.com/"}>
            <FycLogo
                className="w-52 m-4"/>
        </a>,
        <a
            key="kodecreators"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kode Creators"
            href={"https://kodecreators.com/"}>
            <KodeCreatorsLogo
                className="w-52 m-4"/>
        </a>,
        <a
            key="viscap"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Viscap"
            href={"https://www.viscapmedia.com/"}>
            <ViscapLogo
                className="w-52 m-4"/>
        </a>,
        <a
            key="abacus"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abacus"
            href={"https://abacusplus.ba/"}>
            <AbacusLogo
                className="w-48 m-4"/>
        </a>
    ];

    const combinedLogos = [];
    const maxLength = Math.max(startupLogos.length, agencyLogos.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < startupLogos.length) {
            combinedLogos.push(startupLogos[i]);
        }
        if (i < agencyLogos.length) {
            combinedLogos.push(agencyLogos[i]);
        }
    }

    return <Panel color={"light"} container={false}>
        <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true}
                 gradientColor={"rgb(237 237 237)"}>
            {combinedLogos}
        </Marquee>
    </Panel>;
}

export default ClientLogos;
