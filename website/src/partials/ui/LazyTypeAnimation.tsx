import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyTypeAnimationWrap = React.lazy(() => import("./TypeAnimationWrap"));

export function LazyTypeAnimation() {

    return <BrowserOnly
        fallback={<div style={{ height: 71 }}/>}>
        {() => (

            <Suspense fallback={<div style={{ height: 71 }}/>}>
                <LazyTypeAnimationWrap/>
            </Suspense>
        )}
    </BrowserOnly>;
}
