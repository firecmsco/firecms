import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazySampleProDemo = React.lazy(() => import("./pro_sample/pro_sample"));

export function SampleProDemo() {
    return <div className={"flex flex-col gap-4 w-full h-96"}>
        <BrowserOnly
            fallback={<div/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    <LazySampleProDemo/>
                </Suspense>
            )}
        </BrowserOnly>
    </div>;
}
