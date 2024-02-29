import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyHeroNeatGradient = React.lazy(() => import("../../shape/HeroNeatGradient"));

export function PagesHeroBackground({ color }: {
    color: "primary" | "secondary" | "dark" | "transparent",
}) {

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
