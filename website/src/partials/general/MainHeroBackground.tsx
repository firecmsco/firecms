import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));

export function MainHeroBackground() {

    return <>
        <BrowserOnly
            fallback={<div className={"absolute"}/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    <LazyHomeHeroNeatGradient/>
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
