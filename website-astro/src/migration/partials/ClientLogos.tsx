import React from "react";
import Marquee from "react-fast-marquee";
import { Panel } from "./general/Panel";

// Define path constants for logos
const logos = {
    deardoc: "/img/logos/deardoc.png",
    mm: "/img/logos/mm_logo.webp",
    proton: "/img/logos/proton_logo.webp",
    withu: "/img/logos/withu.png",
    tpa: "/img/logos/the_planet_app_logo.svg",
    socialIncome: "/img/logos/social_income_logo.svg",
    mindswitch: "/img/logos/mindswitch_logo.svg",
    oikos: "/img/logos/oikos_logo.svg",
    gearfocus: "/img/logos/gearfocus_logo.svg",
    clario: "/img/logos/clario.svg",
    bitforge: "/img/logos/bitforge.svg",
    somnio: "/img/logos/logo_somnio.webp",
    riverstone: "/img/logos/riverstone.png",
    icodelabs: "/img/logos/icodelabs.png",
    viscap: "/img/logos/viscap.svg",
    kodecreators: "/img/logos/kodecreators.svg",
    fyc: "/img/logos/fyc.svg",
    nfq: "/img/logos/nfq.svg",
    abacus: "/img/logos/abacus.svg"
};

export function ClientLogos() {
    const startupLogos = [
        <a key="deardoc" target="_blank" rel="noopener noreferrer" aria-label="DearDoc" href="https://www.getdeardoc.com">
            <img loading="lazy" src={logos.deardoc} alt="DearDoc Logo" className="w-44 m-4"/>
        </a>,
        <a key="medicalmotion" target="_blank" rel="noopener noreferrer" aria-label="MedicalMotion" href="https://medicalmotion.com">
            <img loading="lazy" src={logos.mm} alt="MedicalMotion Logo" className="w-44 m-4"/>
        </a>,
        <a key="proton" target="_blank" rel="noopener noreferrer" aria-label="Proton Health" href="https://www.proton-health.com">
            <img loading="lazy" src={logos.proton} alt="Proton Health" className="w-48 m-4"/>
        </a>,
        <a key="withu" target="_blank" rel="noopener noreferrer" aria-label="WithU training" href="https://www.withuapp.com//">
            <img loading="lazy" src={logos.withu} alt="WithU" className="w-48 m-4"/>
        </a>,
        <a key="planetapp" target="_blank" rel="noopener noreferrer" aria-label="The Planet App" href="https://theplanetapp.com">
            <img loading="lazy" src={logos.tpa} alt="Planet App Logo" className="w-56 m-4"/>
        </a>,
        <a key="claimgem" className="flex h-min transition-colors text-gray-700 !no-underline rounded-button-md px-1 m-4 font-serif text-2xl font-extrabold !hover:no-underline hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-900" href="https://claimgem.com/">ClaimGem</a>,
        <a key="socialincome" target="_blank" aria-label="Social Income" rel="noopener noreferrer" href="https://socialincome.org">
            <img loading="lazy" src={logos.socialIncome} alt="Social Income" className="w-48 h-auto m-4"/>
        </a>,
        <a key="oikos" target="_blank" aria-label="Oikosbrain" rel="noopener noreferrer" href="https://oikosbrain.com">
            <img loading="lazy" src={logos.oikos} alt="OikosBrain" className="w-48 m-4"/>
        </a>,
        <a key="clario" target="_blank" aria-label="Clario" rel="noopener noreferrer" href="https://clario.co/">
            <img loading="lazy" src={logos.clario} alt="Clario" className="w-52 m-4"/>
        </a>,
        <a key="gearfocus" target="_blank" rel="noopener noreferrer" aria-label="GearFocus" href="https://www.gearfocus.com/">
            <img loading="lazy" src={logos.gearfocus} alt="GearFocus" className="w-52 m-4"/>
        </a>,
        <a key="mindswitch" target="_blank" aria-label="Mindswitch" rel="noopener noreferrer" href="https://www.mindswitch.me/">
            <img loading="lazy" src={logos.mindswitch} alt="Mindswitch" className="w-48 m-4"/>
        </a>
    ];
    const agencyLogos = [
        <a key="bitforge" target="_blank" rel="noopener noreferrer" aria-label="BitForge" href="https://bitforge.ch/">
            <img loading="lazy" src={logos.bitforge} alt="BitForge" className="w-48 m-4"/>
        </a>,
        <a key="somnio" target="_blank" rel="noopener noreferrer" aria-label="Somnio Software" href="https://www.somniosoftware.com/">
            <img loading="lazy" src={logos.somnio} alt="Somnio Logo" className="w-48 m-4"/>
        </a>,
        <a key="riverstone" target="_blank" rel="noopener noreferrer" aria-label="Riverstone" href="https://www.riverstonetech.com/">
            <img loading="lazy" src={logos.riverstone} alt="Riverstone Logo" className="w-48 m-4"/>
        </a>,
        <a key="icodelabs" target="_blank" rel="noopener noreferrer" aria-label="ICode Labs" href="https://icodelabs.co/">
            <img loading="lazy" src={logos.icodelabs} alt="ICode Labs Logo" className="w-48 m-4"/>
        </a>,
        <a key="nfq" target="_blank" rel="noopener noreferrer" aria-label="NFQ" href="https://www.nfq.com/">
            <img loading="lazy" src={logos.nfq} alt="NFQ" className="w-44 m-4"/>
        </a>,
        <a key="fyc" target="_blank" rel="noopener noreferrer" aria-label="FYC Labs" href="https://fyclabs.com/">
            <img loading="lazy" src={logos.fyc} alt="FYC" className="w-52 m-4"/>
        </a>,
        <a key="kodecreators" target="_blank" rel="noopener noreferrer" aria-label="Kode Creators" href="https://kodecreators.com/">
            <img loading="lazy" src={logos.kodecreators} alt="Kode Creators" className="w-52 m-4"/>
        </a>,
        <a key="viscap" target="_blank" rel="noopener noreferrer" aria-label="Viscap" href="https://www.viscapmedia.com/">
            <img loading="lazy" src={logos.viscap} alt="Viscap" className="w-52 m-4"/>
        </a>,
        <a key="abacus" target="_blank" rel="noopener noreferrer" aria-label="Abacus" href="https://abacusplus.ba/">
            <img loading="lazy" src={logos.abacus} alt="Abacus" className="w-48 m-4"/>
        </a>
    ];
    const combinedLogos = [] as any[];
    const maxLength = Math.max(startupLogos.length, agencyLogos.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < startupLogos.length) combinedLogos.push(startupLogos[i]);
        if (i < agencyLogos.length) combinedLogos.push(agencyLogos[i]);
    }
    return <Panel color={"light"} container={false}>
        <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true} gradientColor={"rgb(237 237 237)"}>
            {combinedLogos}
        </Marquee>
    </Panel>;
}

export default ClientLogos;
