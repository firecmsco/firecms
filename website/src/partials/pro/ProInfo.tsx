import React from "react";
import { Panel } from "../general/Panel";
import { Slideshow } from "./SlideShow";
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
        <h2 className={"h2 mb-3 uppercase gradient-text"}>
            BUILD BETTER BACK-OFFICE APPS FASTER
        </h2>
        <p className="text-xl md:text-2xl">
            FireCMS PRO allows you to use all the internal components and features of FireCMS, but also provides
            additional tools and components to help you build better back-office applications faster.
        </p>
        <p className="text-xl md:text-2xl">
            Customizable, extensible and with a strong focus on developer experience, FireCMS PRO is the perfect
            solution for your next project.
        </p>
        <Slideshow
            images={[
                MMApp,
                overlay,
                primeUm,
                mmDark,
                oikosAviationDemo
            ]}/>
    </Panel>
}
