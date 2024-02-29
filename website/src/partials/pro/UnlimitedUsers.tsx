import React from "react";
import { Panel } from "../general/Panel";

export function UnlimitedUsers() {
    return <Panel color={"gray"}>
        <h2 className={"h2 mb-3 uppercase font-mono"}>
            All the Features of FireCMS, and more
        </h2>
        <p className="text-xl md:text-2xl">
            Use all the features of FireCMS, including the schema editor, data inference, advanced data import and
            export, default roles and more, with unlimited users.
        </p>
        <p className="text-xl md:text-2xl">
            FireCMS PRO is perfect for teams and organizations that need to manage their data with a larger number of
            users and roles...
        </p>
        <p className="text-xl md:text-2xl">
            ...or public facing applications with a large number of users. Define exactly what each user can do and
            customize the experience for each role.
        </p>
    </Panel>
}
