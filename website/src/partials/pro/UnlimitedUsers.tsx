import React from "react";
import { Panel } from "../general/Panel";

export function UnlimitedUsers() {
    return <Panel color={"light"}>
        <h2 className={"h2 mb-3 uppercase font-mono"}>
            Unlimited Users
        </h2>
        <p className="text-xl md:text-2xl">
            Use all the internal components of FireCMS, including the schema editor, data inference, advanced data import
            and export, default roles and more, with unlimited users.
        </p>
    </Panel>
}
