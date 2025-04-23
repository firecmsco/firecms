import React, { Suspense } from "react";
import { Panel } from "../general/Panel";
import { LinedSpace } from "../layout/LinedSpace";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyClientUIComponentsTeaser = React.lazy(() => import("./ClientUIComponentsTeaser"));

export function UITeaser() {
    return <Panel
        // color={"gray"}
        color={"lighter"}
        className={"dark:bg-gray-800 text-gray-900 dark:text-white"}
        includePadding={false}
        container={false}
        header={<LinedSpace size={"large"} position={"bottom"}/>}
        footer={<LinedSpace size={"medium"} position={"top"}/>}>
        <h2 className="max-w-6xl mx-auto h2 uppercase font-mono mb-4 mt-8 px-10">
            Modern UI components based on tailwindcss
        </h2>

        <p className="max-w-6xl mx-auto text-lg mb-4 px-10">
            If you need to create custom views or components, you can use our
            battle-tested <b> FireCMS UI components</b>.
        </p>
        <BrowserOnly
            fallback={<div/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    <LazyClientUIComponentsTeaser/>
                </Suspense>
            )}
        </BrowserOnly>

    </Panel>;
}
