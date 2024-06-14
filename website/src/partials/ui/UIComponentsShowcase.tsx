import React, { Suspense } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

const LazyClientUIComponentsShowcase = React.lazy(() => import("./ClientUIComponentsShowcase"));

export function UIComponentsShowcase() {

    return <BrowserOnly
        fallback={<div/>}>
        {() => (

            <Suspense fallback={<div/>}>
                <LazyClientUIComponentsShowcase/>
            </Suspense>
        )}
    </BrowserOnly>;
}
