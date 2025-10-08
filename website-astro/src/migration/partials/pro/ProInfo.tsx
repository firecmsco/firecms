import React from "react";
import Marquee from "react-fast-marquee";
import { Panel } from "../general/Panel";

// @ts-ignore
const MMApp = "/img/mm_app.webp";
// @ts-ignore
const editorWhite = "/img/editor_white.png";
// @ts-ignore
const overlay = "/img/overlay.webp";

// @ts-ignore
const primeUm = "/img/prime_um.png";
// @ts-ignore
const mmDark = "/img/mm_dark.png";
// @ts-ignore
const oikosAviationDemo = "/img/oikos_aviation_demo.png";

export function ProInfo() {
    return <Panel color={"white"} container={false}>
        <div className={"max-w-6xl mx-auto my-16"}>
            <h2 className={"mb-3 uppercase font-mono"}>
                Build better applications faster
            </h2>
            <p className="text-xl md:text-2xl">
                FireCMS PRO allows you to use all the internal components and features of FireCMS, but also provides
                additional tools and components to help you build better <strong className={"text-primary"}>back-office
                applications</strong> and <strong className={"text-primary"}>admin panels</strong> faster.
            </p>
            <p className="text-xl md:text-2xl mb-16">
                <strong className={"text-primary"}>Customizable, extensible</strong> and with a strong focus on
                developer
                experience, <strong>FireCMS PRO</strong> is the perfect
                solution for your next project.
            </p>
        </div>
        <ScreenshotsMarquee/>
    </Panel>
}

export function ScreenshotsMarquee() {
    return <Marquee className={"rounded-xl"}>
        {[
            MMApp,
            overlay,
            primeUm,
            mmDark,
            oikosAviationDemo
        ].map((image, index) => <img key={index} src={image} alt={`Slide ${index}`}
                                     className="mx-4 rounded-xl w-auto h-full max-h-72 object-cover inline-block"/>)}
    </Marquee>;
}
