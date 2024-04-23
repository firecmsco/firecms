import React from "react";
import Marquee from "react-fast-marquee";
import { Panel } from "../general/Panel";

// @ts-ignore
import MMApp from "@site/static/img/mm_app.webp";
// @ts-ignore
import editorWhite from "@site/static/img/editor_white.png";
// @ts-ignore
import overlay from "@site/static/img/overlay.webp";

// @ts-ignore
import primeUm from "@site/static/img/prime_um.png";
// @ts-ignore
import mmDark from "@site/static/img/mm_dark.png";
// @ts-ignore
import oikosAviationDemo from "@site/static/img/oikos_aviation_demo.png";

export function ProInfo() {
    return <Panel color={"white"}>
        <h2 className={"h2 mb-3 uppercase font-mono"}>
            Build better applications faster
        </h2>
        <p className="text-xl md:text-2xl">
            FireCMS PRO allows you to use all the internal components and features of FireCMS, but also provides
            additional tools and components to help you build better <strong className={"gradient-text"}>back-office
            applications</strong> faster.
        </p>
        <p className="text-xl md:text-2xl mb-16">
            <strong className={"gradient-text"}>Customizable, extensible</strong> and with a strong focus on developer
            experience, <strong>FireCMS PRO</strong> is the perfect
            solution for your next project.
        </p>
        <Marquee className={"rounded-xl"}>
            {[
                MMApp,
                overlay,
                primeUm,
                mmDark,
                oikosAviationDemo
            ].map((image, index) => <img key={index} src={image} alt={`Slide ${index}`}
                                         className="mx-4 rounded-xl w-auto h-full max-h-72 object-cover inline-block"/>)}
        </Marquee>
    </Panel>
}
