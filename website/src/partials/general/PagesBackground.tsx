import React, { Suspense, useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const LazyNewNeatGradient = React.lazy(() => import("../../shape/NewNeatGradient"));

function shouldShowAnimation(pathname) {
    return ExecutionEnvironment.canUseDOM
        && animationPaths.some((p) => pathname === "/" || pathname.startsWith(p));
}

const animationPaths = [
    "/features",
    "/enterprise",
    "/pricing",
    "/openai",
    "/f/"
];

export function PagesBackground() {

    const { pathname } = useLocation();
    const [showAnimation, setShowAnimation] = React.useState(shouldShowAnimation(pathname));

    useEffect(() => {
        if (shouldShowAnimation(pathname)) {
            setShowAnimation(true);
        }
    }, [ExecutionEnvironment.canUseDOM]);

    return <>
        <BrowserOnly
            fallback={<div className={"absolute"}/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    {showAnimation && <LazyNewNeatGradient/>}
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
