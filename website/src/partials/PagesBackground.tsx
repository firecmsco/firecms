import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useEffect } from "react";

const LazyThreeJSAnimationShader = React.lazy(() => import("../shape/ThreeJSAnimationShader"));

export function PagesBackground() {

    const [showAnimation, setShowAnimation] = React.useState(false);
    useEffect(() => {
        console.log(window.location);
        if (ExecutionEnvironment.canUseDOM
            && (window.location.pathname === "/"
             || window.location.pathname.startsWith("/features"))) {
            setShowAnimation(true);
        }
    }, [ExecutionEnvironment.canUseDOM]);

    return <>
        <BrowserOnly
            fallback={<div/>}>
            {() => (
                <Suspense fallback={<div/>}>
                    {showAnimation && <LazyThreeJSAnimationShader/>}
                </Suspense>
            )}
        </BrowserOnly>
    </>
}
