import React from "react";
import { Panel } from "../general/Panel";

export function TechSplash() {
    return <Panel color={"primary"}>
        <div
            className="relative flex flex-col items-center font-bold">
            <p className="text-5xl my-1 text-white uppercase font-mono">
                Typescript
            </p>
            <p className="text-5xl my-1 text-white uppercase font-mono">
                React
            </p>
            <p className="text-5xl my-1 text-white uppercase font-mono">
                Tailwind CSS
            </p>
            <p className="text-5xl my-1 text-white uppercase font-mono">
                Firebase/MongoDB
            </p>
            <p className="text-5xl my-1 text-white uppercase font-mono">
                ️ Open-source
            </p>
        </div>
    </Panel>;
}
