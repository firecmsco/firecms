import React from "react";
import Marquee from "react-fast-marquee";

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

interface LogoData {
    key: string;
    href: string;
    ariaLabel: string;
    src?: string;
    alt?: string;
    text?: string;
    className: string;
}

export function ClientLogos() {
    const startupLogosData: LogoData[] = [
        { key: "deardoc", href: "https://www.getdeardoc.com", ariaLabel: "DearDoc", src: logos.deardoc, alt: "DearDoc Logo", className: "w-44 m-4" },
        { key: "medicalmotion", href: "https://medicalmotion.com", ariaLabel: "MedicalMotion", src: logos.mm, alt: "MedicalMotion Logo", className: "w-44 m-4" },
        { key: "proton", href: "https://www.proton-health.com", ariaLabel: "Proton Health", src: logos.proton, alt: "Proton Health", className: "w-48 m-4" },
        { key: "withu", href: "https://www.withuapp.com//", ariaLabel: "WithU training", src: logos.withu, alt: "WithU", className: "w-48 m-4" },
        { key: "planetapp", href: "https://theplanetapp.com", ariaLabel: "The Planet App", src: logos.tpa, alt: "Planet App Logo", className: "w-56 m-4" },
        { key: "claimgem", href: "https://claimgem.com/", ariaLabel: "ClaimGem", text: "ClaimGem", className: "flex h-min transition-colors text-gray-700 !no-underline rounded-button-md px-1 m-4 font-serif text-2xl font-extrabold !hover:no-underline hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-900" },
        { key: "socialincome", href: "https://socialincome.org", ariaLabel: "Social Income", src: logos.socialIncome, alt: "Social Income", className: "w-48 h-auto m-4" },
        { key: "oikos", href: "https://oikosbrain.com", ariaLabel: "Oikosbrain", src: logos.oikos, alt: "OikosBrain", className: "w-48 m-4" },
        { key: "clario", href: "https://clario.co/", ariaLabel: "Clario", src: logos.clario, alt: "Clario", className: "w-52 m-4" },
        { key: "gearfocus", href: "https://www.gearfocus.com/", ariaLabel: "GearFocus", src: logos.gearfocus, alt: "GearFocus", className: "w-52 m-4" },
        { key: "mindswitch", href: "https://www.mindswitch.me/", ariaLabel: "Mindswitch", src: logos.mindswitch, alt: "Mindswitch", className: "w-48 m-4" }
    ];

    const agencyLogosData: LogoData[] = [
        { key: "bitforge", href: "https://bitforge.ch/", ariaLabel: "BitForge", src: logos.bitforge, alt: "BitForge", className: "w-48 m-4" },
        { key: "somnio", href: "https://www.somniosoftware.com/", ariaLabel: "Somnio Software", src: logos.somnio, alt: "Somnio Logo", className: "w-48 m-4" },
        { key: "riverstone", href: "https://www.riverstonetech.com/", ariaLabel: "Riverstone", src: logos.riverstone, alt: "Riverstone Logo", className: "w-48 m-4" },
        { key: "icodelabs", href: "https://icodelabs.co/", ariaLabel: "ICode Labs", src: logos.icodelabs, alt: "ICode Labs Logo", className: "w-48 m-4" },
        { key: "nfq", href: "https://www.nfq.com/", ariaLabel: "NFQ", src: logos.nfq, alt: "NFQ", className: "w-44 m-4" },
        { key: "fyc", href: "https://fyclabs.com/", ariaLabel: "FYC Labs", src: logos.fyc, alt: "FYC", className: "w-52 m-4" },
        { key: "kodecreators", href: "https://kodecreators.com/", ariaLabel: "Kode Creators", src: logos.kodecreators, alt: "Kode Creators", className: "w-52 m-4" },
        { key: "viscap", href: "https://www.viscapmedia.com/", ariaLabel: "Viscap", src: logos.viscap, alt: "Viscap", className: "w-52 m-4" },
        { key: "abacus", href: "https://abacusplus.ba/", ariaLabel: "Abacus", src: logos.abacus, alt: "Abacus", className: "w-48 m-4" }
    ];

    const combinedLogosData: LogoData[] = [];
    const maxLength = Math.max(startupLogosData.length, agencyLogosData.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < startupLogosData.length) combinedLogosData.push(startupLogosData[i]);
        if (i < agencyLogosData.length) combinedLogosData.push(agencyLogosData[i]);
    }

    return <Marquee className={"grayscale rounded-xl space-x-4"} pauseOnHover={false} gradient={true} gradientColor={"rgb(237 237 237)"}>
        {combinedLogosData.map((logo) => (
            <a key={logo.key} target="_blank" rel="noopener noreferrer" aria-label={logo.ariaLabel} href={logo.href} className={logo.src ? undefined : logo.className}>
                {logo.src ? (
                    <img loading="lazy" src={logo.src} alt={logo.alt} className={logo.className}/>
                ) : (
                    logo.text
                )}
            </a>
        ))}
    </Marquee>;
}

export default ClientLogos;
