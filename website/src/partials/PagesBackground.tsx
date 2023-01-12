import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));

export function PagesBackground({darkMode}:{darkMode: boolean}) {

    const { pathname } = useLocation();
    const [showAnimation, setShowAnimation] = React.useState(ExecutionEnvironment.canUseDOM ? document.documentElement.classList.contains("dark") : true);

    useEffect(() => {
        if (ExecutionEnvironment.canUseDOM
            && (pathname === "/"
                || pathname.startsWith("/features"))) {
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
