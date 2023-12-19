import React from "react";
import { Panel } from "../general/Panel";

export function TechSplash() {
    return <Panel color={"primary"}>
        <div
            className="relative flex flex-col items-center">
            <h2 className="h1 my-1 text-white uppercase font-mono">
                Typescript
            </h2>
            <h2 className="h1 my-1 text-white uppercase font-mono">
                React
            </h2>
            <h2 className="h1 my-1 text-white uppercase font-mono">
                Tailwind CSS
            </h2>
            <h2 className="h1 my-1 text-white uppercase font-mono">
                Firebase
            </h2>
            <h2 className="h1 my-1 text-white uppercase font-mono">
                ️ Open-source
            </h2>
        </div>
    </Panel>;
}
