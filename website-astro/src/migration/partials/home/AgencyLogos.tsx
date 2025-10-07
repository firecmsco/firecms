import React from "react";
import { Panel } from "../general/Panel";
import Marquee from "react-fast-marquee";

const logos = {
    somnio: "/img/logos/logo_somnio.webp",
    icodelabs: "/img/logos/icodelabs.png",
    riverstone: "/img/logos/riverstone.png",
    viscap: "/img/logos/viscap.svg",
    kodecreators: "/img/logos/kodecreators.svg",
    bitforge: "/img/logos/bitforge.svg",
    fyc: "/img/logos/fyc.svg",
    nfq: "/img/logos/nfq.svg",
    abacus: "/img/logos/abacus.svg"
};

export function AgencyLogos() {
    return <Panel color={"light"} container={false}>
        <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true}
                 gradientColor={"rgb(237 237 237)"}>
            <a target="_blank" rel="noopener noreferrer" aria-label="BitForge" href="https://bitforge.ch/">
                <img src={logos.bitforge} alt="BitForge" className="w-48 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="Somnio Software" href="https://www.somniosoftware.com/">
                <img src={logos.somnio} alt="Somnio Logo" className="w-48 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="Riverstone" href="https://www.riverstonetech.com/">
                <img src={logos.riverstone} alt="Riverstone Logo" className="w-48 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="ICode Labs" href="https://icodelabs.co/">
                <img src={logos.icodelabs} alt="ICode Labs Logo" className="w-48 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="NFQ" href="https://www.nfq.com/">
                <img src={logos.nfq} alt="NFQ" className="w-44 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="FYC Labs" href="https://fyclabs.com/">
                <img src={logos.fyc} alt="FYC Labs" className="w-52 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="Kode Creators" href="https://kodecreators.com/">
                <img src={logos.kodecreators} alt="Kode Creators" className="w-52 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="Viscap" href="https://www.viscapmedia.com/">
                <img src={logos.viscap} alt="Viscap" className="w-52 m-4" loading="lazy"/>
            </a>
            <a target="_blank" rel="noopener noreferrer" aria-label="Abacus" href="https://abacusplus.ba/">
                <img src={logos.abacus} alt="Abacus" className="w-48 m-4" loading="lazy"/>
            </a>
        </Marquee>
    </Panel>;
}
