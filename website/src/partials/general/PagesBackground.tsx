import React, { Suspense, useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useLocation } from "@docusaurus/router";

const LazyHomeHeroNeatGradient = React.lazy(() => import("../../shape/HomeHeroNeatGradient"));
const LazyBlueNeatGradient = React.lazy(() => import("../../shape/BlueNeatGradient"));

// function shouldShowAnimation(pathname:string) {
//     return ExecutionEnvironment.canUseDOM
//         && animationPaths.some((p) => pathname === "/" || pathname.startsWith(p));
// }
//
// const animationPaths = [
//     "/features",
//     "/enterprise",
//     "/pricing",
//     "/openai",
//     "/f/"
// ];

export function PagesBackground({ color = "grey" }: { color?: "grey" | "blue" }) {

    // const { pathname } = useLocation();
    // const [showAnimation, setShowAnimation] = React.useState(shouldShowAnimation(pathname));
    //
    // useEffect(() => {
    //     if (shouldShowAnimation(pathname)) {
    //         setShowAnimation(true);
    //     }
    // }, [ExecutionEnvironment.canUseDOM]);

    return <>
        <BrowserOnly
            fallback={<div className={"absolute"}/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    {color === "grey"  && <LazyHomeHeroNeatGradient/>}
                    {color === "blue"  && <LazyBlueNeatGradient/>}
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
