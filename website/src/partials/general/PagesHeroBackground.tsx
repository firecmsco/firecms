import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));
const LazyHeroNeatGradient = React.lazy(() => import("../../shape/HeroNeatGradient"));

export function PagesHeroBackground({ color = "primary" }: { color?: "primary" | "secondary" }) {

    return <>
        <BrowserOnly
            fallback={<div className={"absolute"}/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    <LazyHeroNeatGradient color={color}/>
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
