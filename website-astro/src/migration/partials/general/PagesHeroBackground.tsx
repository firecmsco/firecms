import React, { Suspense } from "react";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));

// const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HeroNeatGradient"));

export function PagesHeroBackground() {

    return <>
        <Suspense fallback={<div/>}>
            <LazyHomeHeroNeatGradient/>
        </Suspense>
    </>
}
