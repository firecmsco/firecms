import React, { Suspense } from "react";
import { Panel } from "../general/Panel";
import { LinedSpace } from "../layout/LinedSpace";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyClientUIComponentsTeaser = React.lazy(() => import("./ClientUIComponentsTeaser"));

export function UITeaser() {
    return <Panel color={"transparent"}
                  className={"dark:bg-gray-900"}
                  includePadding={false}
                  container={false}
                  header={<LinedSpace size={"large"} position={"bottom"}/>}
                  footer={<LinedSpace size={"medium"} position={"top"}/>}>
        <h2 className="container max-w-6xl mx-auto h2 uppercase font-mono mb-4 mt-8 px-8">
            Modern UI components based on tailwindcss
        </h2>
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
