import React from "react";
import { Panel } from "../general/Panel";

export function IntroText() {
    return (

        <Panel color={"primary"}>
            <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight uppercase"
               style={{ lineHeight: 1.35 }}>
                FireCMS, powered by Firebase, offers unbeatable UX and performance for your CMS needs.
            </p>
        </Panel>
    );
}
