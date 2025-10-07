import React, { Suspense } from "react";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));

export function MainHeroBackground() {

    return <>
        <Suspense fallback={<div/>}>
            <LazyHomeHeroNeatGradient/>
        </Suspense>
    </>
}
