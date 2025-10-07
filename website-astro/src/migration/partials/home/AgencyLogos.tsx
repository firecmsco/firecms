import React from "react";

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

import { Panel } from "../general/Panel";
import Marquee from "react-fast-marquee";

export function AgencyLogos() {

    return <Panel color={"light"} container={false}>

        <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true}
                 gradientColor={"rgb(237 237 237)"}>

            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BitForge"
                href={"https://bitforge.ch/"}>
                <BitForgeLogo
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
                aria-label="Riverstone"
                href={"https://www.riverstonetech.com/"}>

                <img loading="lazy" src={RiverstoneLogo}
                     alt="Riverstone Logo"
                     className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ICode Labs"
                href={"https://icodelabs.co/"}>

                <img loading="lazy" src={ICodeLabsLogo}
                     alt="ICode Labs Logo"
                     className="w-48 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NFQ"
                href={"https://www.nfq.com/"}>
                <NFQLogo
                    className="w-44 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FYC Labs"
                href={"https://fyclabs.com/"}>
                <FycLogo
                    className="w-52 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kode Creators"
                href={"https://kodecreators.com/"}>
                <KodeCreatorsLogo
                    className="w-52 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Viscap"
                href={"https://www.viscapmedia.com/"}>
                <ViscapLogo
                    className="w-52 m-4"/>
            </a>
            <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abacus"
                href={"https://abacusplus.ba/"}>
                <AbacusLogo
                    className="w-48 m-4"/>
            </a>
        </Marquee>
    </Panel>;

}
