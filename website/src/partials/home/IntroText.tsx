import React from "react";
import { Panel } from "../general/Panel";

export function IntroText() {
    return (

        <Panel color={"secondary"}>
            <p className="max-w-7xl text-2xl md:text-5xl font-bold tracking-tight"
               style={{ lineHeight: 1.35 }}>
                FireCMS is a versatile and user-friendly content management
                system built on Firebase, empowering users to effectively manage
                and organize their data with a comprehensive suite of tools,
                while seamlessly integrating with various web applications and
                services to enhance their digital experiences.
            </p>
        </Panel>
    );
}
