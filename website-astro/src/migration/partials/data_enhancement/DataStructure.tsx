import React from "react";
// Removed useColorMode and translation image imports since not used
import { Panel } from "../general/Panel";

export function DataStructure() {
    return (
        <Panel color={"primary"}>
            <h2 className="mb-4">
                Harness AI for Your Structured Data
            </h2>
            <p className="text-2xl">
                FireCMS intelligently comprehends your data structure, enabling
                seamless adaption
                of ChatGPT-generated outcomes. Enhance your data input
                effortlessly with a single click.
                FireCMS grasps the context of your data, generating highly
                relevant content.
            </p>
            <p className="text-xl">
                It&#39;s proficient in handling <b>strings, numbers,
                enumerations, arrays, objects, and more.</b>
            </p>
        </Panel>
    );
}
