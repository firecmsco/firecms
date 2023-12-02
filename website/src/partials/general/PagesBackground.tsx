import React, { Suspense, useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useLocation } from "@docusaurus/router";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));
const LazyHeroNeatGradient = React.lazy(() => import("../../shape/HeroNeatGradient"));

export function PagesBackground({ color = "grey" }: { color?: "grey" | "primary" | "secondary" }) {

    return <>
        <BrowserOnly
            fallback={<div className={"absolute"}/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    {color === "grey"  && <LazyHomeHeroNeatGradient/>}
                    {color !== "grey"  && <LazyHeroNeatGradient color={color}/>}
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
