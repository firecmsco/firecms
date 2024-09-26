import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));

// const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HeroNeatGradient"));

export function PagesHeroBackground() {

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
