import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));

function shouldShowAnimation(pathname) {
    return ExecutionEnvironment.canUseDOM
        && animationPaths.some((p) => pathname === "/" || pathname.startsWith(p));
}

const animationPaths = [
    "/features",
    "/f/"
];

export function PagesBackground({ darkMode }: { darkMode: boolean }) {

    const { pathname } = useLocation();
    const [showAnimation, setShowAnimation] = React.useState(shouldShowAnimation(pathname));

    useEffect(() => {
        if (shouldShowAnimation(pathname)) {
            setShowAnimation(true);
        }
    }, [ExecutionEnvironment.canUseDOM]);

    return <>
        <BrowserOnly
            fallback={<div/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    {showAnimation && <LazyThreeJSAnimationShader
                        opacity={darkMode ? 0.7 : 0.4}
                        darkMode={darkMode}/>}
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
